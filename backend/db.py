from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
import inspect
import os
import certifi
import logging
from dotenv import load_dotenv
# Setup production logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("db_service")

try:
    import mongomock
    MONGOMOCK_AVAILABLE = True
except ImportError:
    MONGOMOCK_AVAILABLE = False

# Load from root directory .env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
print("MONGO_URL =", os.getenv("MONGO_URL"))
print("DB_NAME =", os.getenv("DB_NAME"))

class AsyncMockCursor:
    def __init__(self, cursor):
        self._cursor = cursor
        self._iterator = None

    async def to_list(self, length=None):
        results = list(self._cursor)
        if length is None:
            return results
        return results[:length]

    def sort(self, *args, **kwargs):
        try:
            self._cursor = self._cursor.sort(*args, **kwargs)
        except Exception:
            pass
        return self

    def limit(self, n):
        try:
            self._cursor = self._cursor.limit(n)
        except Exception:
            pass
        return self

    def skip(self, n):
        try:
            self._cursor = self._cursor.skip(n)
        except Exception:
            pass
        return self

    def __aiter__(self):
        self._iterator = iter(self._cursor)
        return self

    async def __anext__(self):
        try:
            return next(self._iterator)
        except StopIteration:
            raise StopAsyncIteration

    def __iter__(self):
        return iter(self._cursor)

class AsyncMockCollection:
    def __init__(self, collection):
        self._collection = collection

    def __getattr__(self, name):
        attr = getattr(self._collection, name)
        if not callable(attr):
            return attr

        if name in {"find", "aggregate"}:
            def wrapper(*args, **kwargs):
                return AsyncMockCursor(attr(*args, **kwargs))
            return wrapper

        async def async_wrapper(*args, **kwargs):
            result = attr(*args, **kwargs)
            if inspect.isawaitable(result):
                result = await result
            else:
                result = result

            # Auto-save changes in development mock database
            if name in {"insert_one", "insert_many", "update_one", "update_many", "delete_one", "delete_many", "replace_one", "find_one_and_update", "find_one_and_delete"}:
                try:
                    db.save_mock_data()
                except Exception:
                    pass

            return result

        return async_wrapper


class AsyncMockDatabase:
    def __init__(self, database):
        self._database = database

    def __getitem__(self, name: str):
        return AsyncMockCollection(self._database[name])

    def __getattr__(self, name: str):
        return self.__getitem__(name)

    async def command(self, command_name, *args, **kwargs):
        return self._database.command(command_name, *args, **kwargs)

    def list_collection_names(self, *args, **kwargs):
        return self._database.list_collection_names(*args, **kwargs)

    def __repr__(self):
        return f"<AsyncMockDatabase {self._database.name}>"

class CollectionProxy:
    def __init__(self, manager, collection_name: str):
        self._manager = manager
        self._name = collection_name

    def _resolve(self):
        if self._manager.db is None:
            raise RuntimeError(
                f"MongoDB is not configured. Cannot use collection '{self._name}' in development mode."
            )

        collection = self._manager.db[self._name]
        if getattr(self._manager, 'is_mock', False):
            return AsyncMockCollection(collection)
        return collection

    def __getattr__(self, item: str):
        return getattr(self._resolve(), item)

    def __repr__(self) -> str:
        return f"<CollectionProxy {self._name}>"

class DatabaseManager:
    """
    Production-Grade Database Manager.
    Renamed instance to 'db' for compatibility.
    """
    def __init__(self):
        self.url = os.getenv("MONGO_URL")
        self.db_name = os.getenv("DB_NAME", "studlyf_db")
        self.environment = os.getenv("ENVIRONMENT", "development").lower()
        self.is_mock = False

        if not self.url:
            if self.environment == "development":
                if MONGOMOCK_AVAILABLE:
                    logger.warning("MONGO_URL is not set. Using in-memory MongoDB mock in development mode.")
                    self.client = mongomock.MongoClient()
                    self.db = AsyncMockDatabase(self.client[self.db_name])
                    self.is_mock = True
                    self.load_mock_data()
                    return
                logger.warning("MONGO_URL is not set. Starting without MongoDB in development mode.")
                self.client = None
                self.db = None
                return
            raise RuntimeError("MONGO_URL is not set. Refusing to start without a real database connection.")

        try:
            self.client = AsyncIOMotorClient(
                self.url,
                serverSelectionTimeoutMS=5000,
                tlsCAFile=certifi.where() if self.url.lower().startswith("mongodb+srv://") else None
            )
            self.db = self.client[self.db_name]
        except Exception as e:
            logger.error(f"Failed to initialize Motor Client: {e}")
            self.client = None
            self.db = None

    def save_mock_data(self):
        if not getattr(self, 'is_mock', False) or self.client is None:
            return
        try:
            import json
            from bson import json_util
            file_path = os.path.join(os.path.dirname(__file__), ".mock_db_dump.json")
            data = {}
            mock_db = self.client[self.db_name]
            for col_name in mock_db.list_collection_names():
                col = mock_db[col_name]
                docs = list(col.find({}))
                if docs:
                    data[col_name] = json.loads(json_util.dumps(docs))
            
            with open(file_path, "w") as f:
                json.dump(data, f)
        except Exception as e:
            logger.error(f"Failed to save mock DB data: {e}")

    def load_mock_data(self):
        if not getattr(self, 'is_mock', False) or self.client is None:
            return
        try:
            import json
            from bson import json_util
            file_path = os.path.join(os.path.dirname(__file__), ".mock_db_dump.json")
            if not os.path.exists(file_path):
                return
            with open(file_path, "r") as f:
                data = json.load(f)
            mock_db = self.client[self.db_name]
            for col_name, docs_data in data.items():
                col = mock_db[col_name]
                col.delete_many({})
                docs = json_util.loads(json.dumps(docs_data))
                if docs:
                    col.insert_many(docs)
            logger.info("Restored mock MongoDB data from disk.")
        except Exception as e:
            logger.error(f"Failed to load mock DB data: {e}")

    async def _ensure_connected(self):
        """Test connection on startup."""
        if self.client is not None:
            try:
                # Test connection
                await self.client.admin.command('ping')
                logger.info(f"Connected to MongoDB: {self.db_name}")
            except Exception as e:
                err_str = str(e).lower()
                # Retry with direct connection if SRV DNS resolution fails
                if "dns" in err_str or "resolution" in err_str or "srv" in err_str:
                    logger.warning("DNS resolution failed, retrying with direct connection...")
                    direct_url = self.url.replace("mongodb+srv://", "mongodb://")
                    if "?" in direct_url:
                        direct_url += "&directConnection=true&ssl=true"
                    else:
                        direct_url += "?directConnection=true&ssl=true"
                    try:
                        self.client = AsyncIOMotorClient(
                            direct_url,
                            serverSelectionTimeoutMS=15000,
                            tlsCAFile=certifi.where()
                        )
                        self.db = self.client[self.db_name]
                        await self.client.admin.command('ping')
                        logger.info(f"Connected to MongoDB via direct connection: {self.db_name}")
                        return
                    except Exception as e2:
                        logger.error(f"Direct connection also failed: {e2}")
                        self.client = None
                        self.db = None
                        raise RuntimeError("Database connection failed") from e2
                logger.error(f"Database Connection Failed: {e}")
                self.client = None
                self.db = None
                raise RuntimeError("Database connection failed") from e

    async def connect(self):
        """Verify connectivity and run health checks."""
        if getattr(self, 'is_mock', False):
            logger.info("Using in-memory mock MongoDB for development")
            try:
                await self.ensure_indexes()
                logger.info("Mock database indexes ensured")
            except Exception as e:
                logger.warning(f"Mock index creation warning: {e}")
            return

        if self.db is None:
            if self.environment == "development" and MONGOMOCK_AVAILABLE:
                logger.warning("MongoDB is unavailable. Falling back to in-memory mock MongoDB in development mode.")
                self.client = mongomock.MongoClient()
                self.db = AsyncMockDatabase(self.client[self.db_name])
                self.is_mock = True
                self.load_mock_data()
                try:
                    await self.ensure_indexes()
                    logger.info("Mock database indexes ensured")
                except Exception as e:
                    logger.warning(f"Mock index creation warning: {e}")
                return
            raise RuntimeError("No database connection is available.")

        try:
            await self._ensure_connected()
            if self.db is not None:
                try:
                    # Initialize core indexes
                    await self.ensure_indexes()
                    logger.info("Database connected and indexes ensured")
                except Exception as e:
                    logger.warning(f"Index creation warning: {e}")
        except Exception as e:
            if self.environment == "development" and MONGOMOCK_AVAILABLE:
                logger.warning("Database connection failed. Using in-memory mock MongoDB fallback for development.")
                self.client = mongomock.MongoClient()
                self.db = AsyncMockDatabase(self.client[self.db_name])
                self.is_mock = True
                self.load_mock_data()
                try:
                    await self.ensure_indexes()
                    logger.info("Mock database indexes ensured")
                except Exception as index_err:
                    logger.warning(f"Mock index creation warning: {index_err}")
                return
            raise


    async def disconnect(self):
        """Graceful shutdown."""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")

    async def ensure_indexes(self):
        """Enforces performance and data integrity for production scale (1M+ records)."""
        if self.db is None:
            return
        try:
            # Clean up duplicates in institutions collection to prevent E11000 duplicate key errors
            for field in ["name", "institution_id", "email"]:
                try:
                    pipeline = [
                        {"$match": {field: {"$ne": None}}},
                        {"$group": {"_id": f"${field}", "ids": {"$push": "$_id"}, "count": {"$sum": 1}}},
                        {"$match": {"count": {"$gt": 1}}}
                    ]
                    async for doc in self.db.institutions.aggregate(pipeline):
                        # Keep the first document, delete the duplicates
                        ids_to_delete = doc["ids"][1:]
                        logger.info(f"Removing duplicate institutions for {field} '{doc['_id']}': {ids_to_delete}")
                        await self.db.institutions.delete_many({"_id": {"$in": ids_to_delete}})
                except Exception as clean_err:
                    logger.error(f"Cleanup of duplicate institution {field} failed: {clean_err}")

            # ── Users ──
            await self.db.users.create_index("user_id", unique=True)
            await self.db.users.create_index("email", unique=True)
            
            # ── User Profiles ──
            await self.db.user_profiles.create_index("user_id", unique=True)
            
            # ── Event Registrations ──
            await self.db.registrations.create_index([("event_id", 1), ("user_id", 1)], unique=True)
            await self.db.registrations.create_index([("event_id", 1), ("status", 1)])
            
            # ── Institutions ──
            await self.db.institutions.create_index("name", unique=True)
            await self.db.institutions.create_index("institution_id", unique=True)
            await self.db.institutions.create_index("email", unique=True, sparse=True)
            
            # ── Startups ──
            await self.db.startups.create_index("institution_id", unique=True)
            
            # ── Events (supports institution dashboard queries) ──
            try:
                await self.db.events.drop_index("event_id_1")
            except:
                pass
            await self.db.events.create_index("event_id", unique=True, sparse=True)
            await self.db.events.create_index([("institution_id", 1), ("status", 1)])
            await self.db.events.create_index([("institution_id", 1), ("created_at", -1)])
            await self.db.events.create_index("status")
            
            # ── Participants (critical for 1M+ scale: event+user lookup, stage filtering) ──
            await self.db.participants.create_index(
                [("event_id", 1), ("user_id", 1)], unique=True
            )
            await self.db.participants.create_index("event_id")
            await self.db.participants.create_index("team_id")
            await self.db.participants.create_index(
                [("institution_id", 1), ("event_id", 1)]
            )
            await self.db.participants.create_index(
                [("event_id", 1), ("current_stage", 1)])
            await self.db.participants.create_index(
                [("event_id", 1), ("status", 1)])
            await self.db.participants.create_index(
                [("user_id", 1), ("event_id", 1)])
            
            # ── Quizzes ──
            await self.db.quizzes.create_index([("event_id", 1)])

            # ── Teams ──
            await self.db.teams.create_index([("event_id", 1), ("team_name", 1)], unique=True)
            await self.db.teams.create_index([("event_id", 1)])
            await self.db.teams.create_index("team_leader_id")
            await self.db.teams.create_index([("invite_code", 1)], sparse=True, unique=True)
            
            # ── Submissions (stage-level lookups) ──
            await self.db.submission_data.create_index(
                [("event_id", 1), ("stage_id", 1), ("user_id", 1)],
                unique=True, sparse=True
            )
            await self.db.submission_data.create_index(
                [("event_id", 1), ("stage_id", 1), ("team_id", 1)],
                unique=True, sparse=True
            )
            await self.db.submission_data.create_index([("event_id", 1), ("stage_id", 1)])
            
            # ── Submissions & Scores Indexes ──
            await self.db.submissions.create_index("event_id")
            await self.db.submissions.create_index([("event_id", 1), ("status", 1)])
            await self.db.scores.create_index("event_id")
            await self.db.scores.create_index("submission_id")
            await self.db.scores.create_index([("event_id", 1), ("submission_id", 1)])
            await self.db.scores.create_index([("event_id", 1), ("team_id", 1)])
            await self.db.scores.create_index([("event_id", 1), ("stage_id", 1)])
            
            # ── Notifications ──
            await self.db.notifications.create_index([("user_id", 1), ("is_read", 1)])
            await self.db.notifications.create_index([("event_id", 1)])
            
            # ── Email Templates ──
            await self.db.email_templates.create_index([("event_id", 1), ("type", 1)])
            await self.db.email_templates.create_index([("institution_id", 1), ("type", 1)])
            
            # ── Leaderboard ──
            await self.db.leaderboard.create_index([("event_id", 1), ("score", -1)])
            # Compound index for sorted leaderboard queries (filter by event, sort by rank)
            await self.db.leaderboard.create_index([("event_id", 1), ("rank", 1)])
            
            # ── Opportunities (student-facing dashboard) ──
            await self.db.opportunities.create_index([("institution_id", 1), ("status", 1)])
            await self.db.opportunities.create_index("status")
            await self.db.opportunities.create_index("createdBy")
            await self.db.opportunities.create_index("event_link_id")
            await self.db.opportunities.create_index([("status", 1), ("createdAt", -1)])
            
            # ── Opportunity Applications ──
            await self.db.opportunity_applications.create_index("opportunity_id")
            await self.db.opportunity_applications.create_index("user_id")
            await self.db.opportunity_applications.create_index([("opportunity_id", 1), ("user_id", 1)])

            
            # ── Messages ──
            await self.db.messages.create_index([("user_id", 1), ("is_read", 1)])
            await self.db.messages.create_index([("event_id", 1)])
            
            # ── Reports ──
            await self.db.reports.create_index([("event_id", 1), ("type", 1)])
            await self.db.reports.create_index([("institution_id", 1), ("type", 1)])
            
            # ── Achievements ──
            await self.db.achievements.create_index([("user_id", 1), ("type", 1)])
            await self.db.achievements.create_index([("event_id", 1), ("type", 1)])
            
            # ── Badges ──
            await self.db.badges.create_index([("user_id", 1), ("type", 1)])
            await self.db.badges.create_index([("event_id", 1), ("type", 1)])
            
            # ── Opportunity Emails Log ──
            await self.db.opportunity_emails_log.create_index([("user_id", 1), ("event_id", 1)])
            await self.db.opportunity_emails_log.create_index([("event_id", 1)])
            
            # ── Gamification & Simulations ──
            await self.db.job_simulations.create_index([("user_id", 1), ("event_id", 1)])
            await self.db.badges.create_index([("user_id", 1), ("type", 1)])
            
            # ── Email Queue & Delivery Logs ──
            await self.db.email_queue.create_index([("status", 1), ("attempts", 1)])
            await self.db.email_queue.create_index("idempotency_key", sparse=True)
            await self.db.email_delivery_logs.create_index([("recipient", 1), ("status", 1)])
            await self.db.email_delivery_logs.create_index("created_at", expireAfterSeconds=90*24*60*60)
            # ── Learner Profiles (eligibility checks) ──
            await self.db.learner_profiles.create_index("user_id", unique=True)

            # ── Announcements & Audit ──
            await self.db.announcements.create_index([("event_id", 1), ("created_at", -1)])
            await self.db.announcement_audit.create_index([("announcement_id", 1), ("recipient", 1)])

            # ── Opportunity Reviews (Performance) ──
            await self.db.opportunity_reviews.create_index("opportunity_id")
            await self.db.opportunity_reviews.create_index([("opportunity_id", 1), ("created_at", -1)])

            # ── Hackathon Management (Problem Statements & Team Selection) ──
            await self.db.hackathon_problems.create_index([("institution_id", 1), ("status", 1)])
            await self.db.hackathon_problems.create_index("problem_id", unique=True)
            await self.db.hackathon_selections.create_index([("institution_id", 1)])
            await self.db.hackathon_selections.create_index([("event_id", 1)])
            await self.db.hackathon_submissions.create_index([("hackathonId", 1)])
            await self.db.hackathon_submissions.create_index([("event_id", 1)])
            await self.db.hackathon_submissions.create_index([("submittedBy", 1)])
            await self.db.hackathon_submissions.create_index([("teamId", 1)])
            
            # ── Hackathon Event Config (Critical for Plan Rules N+1) ──
            await self.db.hackathon_event_config.create_index([("institution_id", 1), ("key", 1)])
            
            logger.info("All production indexes ensured successfully")
        except Exception as e:
            logger.warning(f"Index creation warning: {e}")

    def __getitem__(self, collection_name: str):
        """Allows db['collection'] access with lazy connection."""
        return CollectionProxy(self, collection_name)

    def __getattr__(self, name: str):
        """Allows db.collection access."""
        return self.__getitem__(name)

# --- Global Instance renamed to 'db' as requested ---
db = DatabaseManager()

async def ensure_indexes():
    """Ensure database indexes on startup."""
    await db.ensure_indexes()

# ─── COLLECTION REGISTRY ──────────────────────────────────────────────────────
# Academic Core
courses_col = db["courses"]
modules_col = db["modules"]
theories_col = db["theories"]
videos_col = db["videos"]
quizzes_col = db["quizzes"]
projects_col = db["projects"]
progress_col = db["progress"]

# Marketplace & Identity
cart_col = db["cart"]
enrollments_col = db["enrollments"]
users_col = db["users"]
user_profiles_col = db["user_profiles"]
registrations_col = db["registrations"]
resumes_col = db["resumes"]
certificates_col = db["certificates"]
event_certificates_col = db["event_certificates"]
certificate_jobs_col = db["certificate_jobs"]

# Career & Operations
interviews_col = db["interviews"]
mentors_col = db["mentors"]
companies_col = db["companies"]
skill_assessments_col = db["skill_assessments"]
ads_col = db["advertisements"]
payments_col = db["payments"]
audit_logs_col = db["audit_logs"]
reports_col = db["reports"]

# System Deconstruction Lab (SDL)
sdl_projects_col = db["sdl_projects"]
sdl_members_col = db["sdl_project_members"]
sdl_tasks_col = db["sdl_tasks"]
sdl_comments_col = db["sdl_comments"]
sdl_join_requests_col = db["sdl_join_requests"]

# Institution Dashboard Ecosystem (High-End Modular Architecture)
institutions_col = db["institutions"]
startups_col = db["startups"]
events_col = db["events"]
faqs_col = db["event_faqs"]
rounds_col = db["rounds"]                # Dynamic Phases (Assessment, Submission, etc.)
form_fields_col = db["form_fields"]      # Form Builder Layer
participants_col = db["participants"]
teams_col = db["teams"]
submissions_col = db["submissions"]
submission_data_col = db["submission_data"] # Flexibility Layer (Key-Value for PPT, GitHub)
judges_col = db["judges"]
scores_col = db["scores"]
evaluation_criteria_col = db["evaluation_criteria"] # Evaluation System
rubrics_col = db["rubrics"]             # Hackathon Rubrics
submission_scores_col = db["submission_scores"] # Detailed rubric scores
notifications_col = db["notifications"]
messages_col = db["messages"]
hackathon_submissions_col = db["hackathon_submissions"]
leaderboard_col = db["leaderboard"]
results_col = db["results"]
event_judges_col = db["event_judges"]
workflow_states_col = db["workflow_states"] # State Machine (Applied, Shortlisted, etc.)
achievements_col = db["achievements"]

# Career & Recruitment (High-Fidelity Tracking)
jobs_col = db["jobs"]
internships_col = db["internships"]
applications_col = db["applications"] # Tracks Selections, Rejections, and Status
opportunities_col = db["opportunities"]
opportunity_applications_col = db["opportunity_applications"]
opportunity_reviews_col = db["opportunity_reviews"]

# Career Assessment & Goals
career_assessments_col = db["career_assessments"]
career_goals_col = db["career_goals"]
assessment_questions_col = db["assessment_questions"]
career_assessment_templates_col = db["career_assessment_templates"]
skill_assessments_col = db.skill_assessments
# Content & Community
blogs_col = db["blogs"]
learning_tracks_col = db["learning_tracks"]

# Company & Partner Ecosystem
company_questions_col = db["company_questions"]
partners_col = db["partners"]
partner_talent_pool_col = db["partner_talent_pool"]

# Gamification & Simulations
job_simulations_col = db["job_simulations"]
badges_col = db["badges"]

# Email Templates (admin-configurable, event or institution level)
email_templates_col = db["email_templates"]
opportunity_emails_log_col = db["opportunity_emails_log"]
email_queue_col = db["email_queue"]
email_delivery_logs_col = db["email_delivery_logs"]
gd_topics_col = db["gd_topics"]
gamification_col = db["gamification"]
user_gamification_col = db["user_gamification"]
user_stats_col = db["user_stats"]

# Announcements (institution / event level announcement jobs)
announcements_col = db["announcements"]
# Per-recipient audit for announcement enqueues and status
announcement_audit_col = db["announcement_audit"]

# Hackathon Management (Problem Statements & Team Selection)
hackathon_problems_col = db["hackathon_problems"]
hackathon_selections_col = db["hackathon_selections"]
hackathon_event_config_col = db["hackathon_event_config"]
# Institution Event Packages (dynamic event-package feature)
institution_event_packages_col = db["institution_event_packages"]

# Avatar Management
avatars_col = db["avatars"]

# Certificate Management
cert_templates_col = db["cert_templates"]

# ─── GRIDFS BUCKET (persistent file storage, survives Render restarts) ────────
# Usage: await gridfs_bucket.upload_from_stream(filename, data) → ObjectId
#        await gridfs_bucket.open_download_stream(file_id) → stream
def _get_gridfs_bucket():
    """Lazy GridFS bucket — only created once db.db is available."""
    if db.db is not None:
        try:
            return AsyncIOMotorGridFSBucket(db.db, bucket_name="stage_files")
        except Exception as e:
            logger.error(f"Failed to create GridFS bucket: {e}")
            return None
    return None

# Remove global initialization - will be created lazily when needed
gridfs_bucket = None

# Team invite acceptances (audit trail for invite lifecycle)
team_invite_acceptances_col = db["team_invite_acceptances"]

import os
import shutil
import uuid
import urllib.request
import xml.etree.ElementTree as ET
import html
import re
import email.utils
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Header, Query, Request, UploadFile, File, Form
from pydantic import BaseModel
from bson import ObjectId

from ..db import db
from .auth import get_current_user

router = APIRouter(prefix="/api/resources", tags=["Startup Resources"])

# Helper function to get admin emails
def _super_admin_email_set() -> set:
    raw = os.getenv("SUPER_ADMIN_EMAILS", "")
    return {x.strip().lower() for x in raw.split(",") if x.strip()}

# Dependency to require admin authentication
async def admin_required(x_admin_email: str = Header(None)):
    allowed = _super_admin_email_set()
    em = (x_admin_email or "").strip().lower()
    if not em or em not in allowed:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: invalid super-admin header.",
        )
    return x_admin_email

# Helper to format ObjectID and clean up DB objects
def fix_db_id(doc):
    if doc:
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
            doc["id"] = doc["_id"]
        return doc
    return None

DEFAULT_CATEGORIES = [
    "Startup Guides", "Fundraising", "Investors", "Founder Stories", "Pitch Decks",
    "Financial Models", "Product Development", "Marketing", "Sales", "Hiring",
    "AI Startups", "Startup India", "Government Schemes", "Incubators",
    "Accelerators", "Business Strategy", "Legal & Compliance"
]

# Pre-seeded official startup metadata records (with original logos)
PRE_SEEDED_RESOURCES = [
    {
        "title": "Startup India DPIIT Recognition & Tax Exemption Guide",
        "link": "https://www.startupindia.gov.in/content/sih/en/startup-scheme.html",
        "cover_image": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600",
        "category": "Startup India",
        "author": "DPIIT Board",
        "source_name": "Startup India Portal",
        "source_logo": "https://www.startupindia.gov.in/content/dam/invest-india/newhomepage/Logo.png",
        "publish_date": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "reading_time": "15 mins",
        "resource_type": "guide",
        "tags": ["dpiit", "startupindia", "taxholiday", "compliance"],
        "short_summary": "Official framework for registering as a recognized startup under DPIIT to avail income tax holiday under Section 80-IAC and capital gains exceptions.",
        "full_content": """# DPIIT Recognition & Tax Exemption

Availing tax benefits in India requires formal registration as a recognized startup by the Department for Promotion of Industry and Internal Trade.

## Main Benefits:
1. **Income Tax Holiday (Section 80-IAC)**: Tax exemption for 3 consecutive years in a block of 10 years.
2. **Capital Gains Exemption (Section 56(2)(viib))**: Exemption from the 'Angel Tax' rule.
3. **Patent and IP Rebates**: 80% rebate in patent filing costs.

## Direct Application:
Visit the official Startup India hub to register your incorporation details, self-certification forms, and business profile directly.""",
        "attachments": [],
        "related_resources": [],
        "featured": True,
        "pinned": True,
        "status": "published",
        "view_count": 521,
        "download_count": 210,
        "comments": []
    },
    {
        "title": "Startup India Seed Fund Scheme (SISFS) Application Portal",
        "link": "https://seedfund.startupindia.gov.in/",
        "cover_image": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600",
        "category": "Government Schemes",
        "author": "SISFS Board",
        "source_name": "Startup India Seed Fund",
        "source_logo": "https://www.startupindia.gov.in/content/dam/invest-india/newhomepage/Logo.png",
        "publish_date": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "reading_time": "10 mins",
        "resource_type": "guide",
        "tags": ["seedfund", "governmentgrant", "sisfs", "funding"],
        "short_summary": "Government seed grant scheme providing up to ₹20 Lakhs for validation of Proof of Concept and prototype trials, and up to ₹50 Lakhs for commercial scale-up.",
        "full_content": """# Startup India Seed Fund Scheme (SISFS)

This scheme supports early-stage startups that need capital for prototype trials, product development, or initial market entry.

## Eligibility Checklist:
1. DPIIT recognition certificate.
2. Incorporated less than 2 years ago at the time of application.
3. Product or idea has commercial potential.

## How to Apply:
Register and select eligible incubators on the official portal to review and present your pitch deck.""",
        "attachments": [],
        "related_resources": [],
        "featured": True,
        "pinned": False,
        "status": "published",
        "view_count": 312,
        "download_count": 145,
        "comments": []
    },
    {
        "title": "MSME Idea Hackathon 3.0 Guidelines & Registration",
        "link": "https://my.msme.gov.in/MyMsme/Reg/COM_IdeaHackathon3.aspx",
        "cover_image": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600",
        "category": "Government Schemes",
        "author": "MSME Ministry",
        "source_name": "MSME Ministry",
        "source_logo": "https://msme.gov.in/themes/msme/images/logo.png",
        "publish_date": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "reading_time": "12 mins",
        "resource_type": "guide",
        "tags": ["msme", "hackathon", "innovation", "grants"],
        "short_summary": "Grants of up to ₹15 Lakhs per approved idea for developing prototypes, launched by the Ministry of Micro, Small and Medium Enterprises.",
        "full_content": """# MSME Idea Hackathon

Support program managed by the Ministry of MSME to fund innovative ideas in smart agriculture, green energy, healthcare, and waste management.

## Support:
* Development funding of up to ₹15 Lakhs for building working prototypes.
* Access to MSME business incubators across India.
* Special mentorship for student and female entrepreneurs.""",
        "attachments": [],
        "related_resources": [],
        "featured": False,
        "pinned": True,
        "status": "published",
        "view_count": 284,
        "download_count": 92,
        "comments": []
    },
    {
        "title": "Invest India Sector Investment Opportunities Hub",
        "link": "https://www.investindia.gov.in/",
        "cover_image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600",
        "category": "Investors",
        "author": "Invest India",
        "source_name": "Invest India",
        "source_logo": "https://www.investindia.gov.in/themes/custom/investindia/logo.png",
        "publish_date": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "reading_time": "8 mins",
        "resource_type": "article",
        "tags": ["investindia", "marketinsights", "foreigninvestment", "fdi"],
        "short_summary": "Comprehensive sector analysis, FDI policies, growth indicators, and investment avenues in India curated by the National Investment Promotion & Facilitation Agency.",
        "full_content": """# Invest India Hub

Invest India is the national investment facilitation agency. It provides strategic business advisory and sector research reports to international and local venture funds.

## Key Sectors Covered:
* Renewable Energy & Sustainability
* Electronic Manufacturing & Semiconductors
* Fintech & Digital Finance
* Healthcare & Biotech""",
        "attachments": [],
        "related_resources": [],
        "featured": False,
        "pinned": False,
        "status": "published",
        "view_count": 195,
        "download_count": 0,
        "comments": []
    },
    {
        "title": "Google for Startups Accelerator: AI First Program Guidelines",
        "link": "https://startup.google/",
        "cover_image": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600",
        "category": "Accelerators",
        "author": "Google for Startups Team",
        "source_name": "Google for Startups",
        "source_logo": "https://www.google.com/favicon.ico",
        "publish_date": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "reading_time": "7 mins",
        "resource_type": "guide",
        "tags": ["google", "accelerator", "ai", "mentorship"],
        "short_summary": "Equity-free accelerator program offering Google cloud credits, dedicated technical support, and product engineering guides for AI startups.",
        "full_content": """# Google for Startups Accelerator

google's flagships accelerator program helps early-stage builders leverage AI models, TPU networks, and cloud architecture frameworks to build robust technology moats.

## Benefits:
* Up to $100,000 in Google Cloud credits.
* 1-on-1 mentorship from Google engineers.
* Direct access to Google product managers.""",
        "attachments": [],
        "related_resources": [],
        "featured": False,
        "pinned": False,
        "status": "published",
        "view_count": 120,
        "download_count": 0,
        "comments": []
    }
]

# Ensure categories exist in MongoDB
async def ensure_categories():
    count = await db.resource_categories.count_documents({})
    if count == 0:
        for cat in DEFAULT_CATEGORIES:
            await db.resource_categories.update_one(
                {"name": cat},
                {"$set": {"name": cat, "created_at": datetime.now(timezone.utc).isoformat()}},
                upsert=True
            )

# Pre-seed resources if database is empty
async def ensure_seeded_resources():
    count = await db.resources.count_documents({})
    if count == 0:
        for res in PRE_SEEDED_RESOURCES:
            await db.resources.insert_one(res)

# RSS Feed Sync Function (Y Combinator, TechCrunch, HN, OpenAI, Product Hunt, Wellfound, Microsoft Startups)
async def sync_rss_feeds():
    feeds = [
        {
            "url": "https://www.ycombinator.com/blog/rss",
            "source_name": "Y Combinator Blog",
            "source_logo": "https://news.ycombinator.com/y18.svg",
            "default_category": "Startup Guides"
        },
        {
            "url": "https://hnrss.org/frontpage?q=startup",
            "source_name": "Hacker News",
            "source_logo": "https://news.ycombinator.com/y18.svg",
            "default_category": "Business Strategy"
        },
        {
            "url": "https://techcrunch.com/category/startups/feed/",
            "source_name": "TechCrunch Startups",
            "source_logo": "https://techcrunch.com/wp-content/uploads/2015/02/cropped-tc-logo-2.png",
            "default_category": "Founder Stories"
        },
        {
            "url": "https://openai.com/news/rss.xml",
            "source_name": "OpenAI Blog",
            "source_logo": "https://openai.com/favicon.ico",
            "default_category": "AI Startups"
        },
        {
            "url": "https://www.producthunt.com/feed",
            "source_name": "Product Hunt",
            "source_logo": "https://www.producthunt.com/favicon.ico",
            "default_category": "Product Development"
        },
        {
            "url": "https://angel.co/blog/feed",
            "source_name": "Wellfound Blog",
            "source_logo": "https://wellfound.com/images/favicon.ico",
            "default_category": "Hiring"
        },
        {
            "url": "https://startups.microsoft.com/blog/feed/",
            "source_name": "Microsoft for Startups",
            "source_logo": "https://startups.microsoft.com/favicon.ico",
            "default_category": "Startup Guides"
        }
    ]
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    added_count = 0

    for feed in feeds:
        try:
            req = urllib.request.Request(feed["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=12) as response:
                xml_data = response.read()
            
            root = ET.fromstring(xml_data)
            items = root.findall('.//item')
            
            for item in items:
                title_el = item.find('title')
                link_el = item.find('link')
                desc_el = item.find('description')
                date_el = item.find('pubDate')
                author_el = item.find('{http://purl.org/dc/elements/1.1/}creator') or item.find('author')
                
                title = title_el.text.strip() if title_el is not None and title_el.text else ""
                link = link_el.text.strip() if link_el is not None and link_el.text else ""
                
                if not title or not link:
                    continue
                    
                # Avoid duplicates
                existing = await db.resources.find_one({"link": link})
                if existing:
                    continue
                
                desc = desc_el.text if desc_el is not None and desc_el.text else ""
                desc_clean = re.sub(r'<[^>]*>', '', html.unescape(desc)).strip()
                summary = desc_clean[:220] + "..." if len(desc_clean) > 220 else desc_clean
                
                # Determine category dynamically
                category = feed["default_category"]
                title_lower = title.lower()
                desc_lower = desc_clean.lower()
                
                if any(x in title_lower or x in desc_lower for x in ["fund", "raise", "invest", "venture", "capital", "angel", "series", "equity", "seed"]):
                    category = "Fundraising"
                elif any(x in title_lower or x in desc_lower for x in ["pitch", "deck", "presentation", "slide"]):
                    category = "Pitch Decks"
                elif any(x in title_lower or x in desc_lower for x in ["legal", "contract", "agreement", "incorporat", "term sheet", "cliff", "vesting", "compliance"]):
                    category = "Legal & Compliance"
                elif any(x in title_lower or x in desc_lower for x in ["hiring", "recruit", "talent", "team", "hire", "compensation", "salary"]):
                    category = "Hiring"
                elif any(x in title_lower or x in desc_lower for x in ["marketing", "sales", "growth", "cac", "cohort", "seo", "brand"]):
                    category = "Marketing"
                elif any(x in title_lower or x in desc_lower for x in ["ai", "artificial", "intelligence", "llm", "gpt", "chatbot", "openai", "neural"]):
                    category = "AI Startups"
                elif any(x in title_lower or x in desc_lower for x in ["india", "government", "scheme", "grant", "sisfs", "msme", "dpiit"]):
                    category = "Government Schemes"
                elif any(x in title_lower or x in desc_lower for x in ["story", "founder", "journey", "milestone", "exit"]):
                    category = "Founder Stories"
                elif any(x in title_lower or x in desc_lower for x in ["code", "software", "product", "architecture", "dev", "design", "ux"]):
                    category = "Product Development"
                
                pub_date = datetime.now(timezone.utc).isoformat()
                if date_el is not None and date_el.text:
                    try:
                        parsed_date = email.utils.parsedate_to_datetime(date_el.text)
                        pub_date = parsed_date.isoformat()
                    except Exception:
                        pass
                
                author = author_el.text.strip() if author_el is not None and author_el.text else feed["source_name"]
                
                # Dynamic Cover Images
                cover_url = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600"
                if category == "AI Startups":
                    cover_url = "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=600"
                elif category == "Fundraising" or category == "Pitch Decks":
                    cover_url = "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600"
                elif category == "Government Schemes":
                    cover_url = "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&q=80&w=600"
                elif category == "Product Development" or category == "Marketing":
                    cover_url = "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600"
                
                new_resource = {
                    "title": title,
                    "link": link,
                    "cover_image": cover_url,
                    "category": category,
                    "author": author,
                    "source_name": feed["source_name"],
                    "source_logo": feed["source_logo"],
                    "publish_date": pub_date,
                    "last_updated": datetime.now(timezone.utc).isoformat(),
                    "reading_time": "5 mins",
                    "resource_type": "article",
                    "tags": [category.lower().replace(" ", ""), feed["source_name"].lower().replace(" ", ""), "startup"],
                    "short_summary": summary,
                    "full_content": f"""# {title}

This article is fetched in real-time from **{feed['source_name']}**.

To respect content copyrights, we do not republish the full body of external publications. You can access the original text, diagrams, and full community debates at:
[{link}]({link})

## Key Operational Takeaways:
* Dynamic startup ecosystem updates.
* Actionable building advice for early-stage founders and product engineering teams.
""",
                    "attachments": [],
                    "related_resources": [],
                    "featured": False,
                    "pinned": False,
                    "status": "published",
                    "view_count": 0,
                    "download_count": 0,
                    "comments": []
                }
                
                await db.resources.insert_one(new_resource)
                added_count += 1
        except Exception as e:
            print(f"Error syncing feed {feed['url']}: {e}")
            
    return added_count

# Pydantic models for request bodies
class CommentRequest(BaseModel):
    comment_text: str
    rating: int

class CategoryRequest(BaseModel):
    name: str

# ─── PUBLIC ENDPOINTS ───

@router.post("/sync-feeds")
async def trigger_sync_feeds(x_admin_email: Optional[str] = Header(None)):
    """Trigger manual or programmatic crawling of startup blog feeds."""
    added = await sync_rss_feeds()
    return {"status": "success", "articles_added": added}

@router.get("")
async def get_resources(
    request: Request,
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    sort: Optional[str] = Query("latest"),
    featured: Optional[bool] = Query(None),
    pinned: Optional[bool] = Query(None),
    limit: int = Query(80, ge=1, le=160),
    skip: int = Query(0, ge=0),
    x_admin_email: Optional[str] = Header(None)
):
    """Retrieve list of startup resources with search and filters."""
    await ensure_categories()
    await ensure_seeded_resources()
    
    # 6-Hour Cache Sync Scheduler
    sync_log = await db.metadata_sync_logs.find_one({"sync_type": "rss_feeds"})
    now = datetime.now(timezone.utc)
    should_sync = False
    
    if not sync_log:
        should_sync = True
    else:
        try:
            last_synced = datetime.fromisoformat(sync_log["last_synced_at"])
            # 6 hours in seconds is 21600
            if (now - last_synced).total_seconds() > 21600:
                should_sync = True
        except Exception:
            should_sync = True

    # Double check if database is empty
    count = await db.resources.count_documents({"status": "published"})
    if count <= len(PRE_SEEDED_RESOURCES) + 2:
        should_sync = True

    if should_sync:
        try:
            await sync_rss_feeds()
            await db.metadata_sync_logs.update_one(
                {"sync_type": "rss_feeds"},
                {"$set": {
                    "sync_type": "rss_feeds",
                    "last_synced_at": now.isoformat(),
                    "status": "success"
                }},
                upsert=True
            )
        except Exception as e:
            print(f"Auto-sync failed: {e}")

    # 1. Determine if admin
    is_admin = False
    if x_admin_email:
        allowed = _super_admin_email_set()
        if x_admin_email.strip().lower() in allowed:
            is_admin = True

    # 2. Build filter query
    query_filter = {}

    if not is_admin:
        query_filter["status"] = "published"
        now_str = datetime.now(timezone.utc).isoformat()
        query_filter["$and"] = [
            {"$or": [
                {"schedule_publish": {"$exists": False}},
                {"schedule_publish": None},
                {"schedule_publish": {"$lte": now_str}}
            ]}
        ]

    if category:
        query_filter["category"] = category
    if tag:
        query_filter["tags"] = tag
    if resource_type:
        query_filter["resource_type"] = resource_type
    if featured is not None:
        query_filter["featured"] = featured
    if pinned is not None:
        query_filter["pinned"] = pinned

    # Search filter
    if search:
        regex_search = {"$regex": search, "$options": "i"}
        search_conditions = [
            {"title": regex_search},
            {"short_summary": regex_search},
            {"full_content": regex_search},
            {"author": regex_search},
            {"tags": regex_search},
            {"category": regex_search},
            {"source_name": regex_search}
        ]
        if "$and" in query_filter:
            query_filter["$and"].append({"$or": search_conditions})
        else:
            query_filter["$or"] = search_conditions

    # 3. Handle sorting
    sort_query = [("publish_date", -1)]
    if sort == "latest":
        sort_query = [("publish_date", -1)]
    elif sort == "popular":
        sort_query = [("view_count", -1)]
    elif sort == "trending":
        sort_query = [("view_count", -1), ("download_count", -1)]
    elif sort == "downloads":
        sort_query = [("download_count", -1)]

    # 4. Fetch from MongoDB
    cursor = db.resources.find(query_filter).sort(sort_query).skip(skip).limit(limit)
    resources = []
    async for doc in cursor:
        resources.append(fix_db_id(doc))

    total = await db.resources.count_documents(query_filter)

    # Fetch unique tags and list of categories
    categories = []
    async for cat in db.resource_categories.find().sort("name", 1):
        categories.append(cat["name"])

    tags_cursor = db.resources.aggregate([
        {"$match": {"status": "published"}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags"}},
        {"$limit": 50}
    ])
    tags = []
    async for tag_doc in tags_cursor:
        if tag_doc.get("_id"):
            tags.append(tag_doc["_id"])

    return {
        "resources": resources,
        "total": total,
        "categories": categories,
        "tags": tags
    }

@router.get("/categories")
async def get_categories():
    """Fetch all resource categories."""
    await ensure_categories()
    categories = []
    async for cat in db.resource_categories.find().sort("name", 1):
        categories.append(fix_db_id(cat))
    return categories

@router.get("/trending-searches")
async def get_trending_searches():
    """Return list of popular search topics."""
    return [
        "y combinator",
        "wellfound",
        "pitch deck",
        "seed fund",
        "legal templates",
        "AI startups",
        "hiring agreement",
        "founder vesting",
        "grants",
        "Startup India",
        "msme schemes"
    ]

@router.get("/{resource_id}")
async def get_resource_detail(resource_id: str, request: Request):
    """Retrieve detail of a resource and increment view count."""
    try:
        query = {"_id": ObjectId(resource_id)}
    except Exception:
        query = {"_id": resource_id}

    resource = await db.resources.find_one(query)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    await db.resources.update_one(query, {"$inc": {"view_count": 1}})
    resource["view_count"] = resource.get("view_count", 0) + 1

    is_bookmarked = False
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            from auth_utils import decode_access_token
            token = auth_header.split(" ")[1]
            payload = decode_access_token(token)
            if payload and payload.get("user_id"):
                user_id = payload["user_id"]
                bookmark = await db.resource_bookmarks.find_one({"user_id": user_id, "resource_id": resource_id})
                if bookmark:
                    is_bookmarked = True
    except Exception:
        pass

    resource = fix_db_id(resource)
    resource["is_bookmarked"] = is_bookmarked

    related_filter = {
        "_id": {"$ne": query["_id"]},
        "status": "published",
        "$or": [
            {"category": resource.get("category")},
            {"tags": {"$in": resource.get("tags", [])}}
        ]
    }
    related = []
    cursor = db.resources.find(related_filter).limit(3)
    async for r in cursor:
        related.append(fix_db_id(r))
    resource["related"] = related

    return resource

# ─── AUTHENTICATED USER ENDPOINTS ───

@router.post("/{resource_id}/bookmark")
async def toggle_bookmark(resource_id: str, current_user: dict = Depends(get_current_user)):
    """Toggle bookmark on/off for a resource."""
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    existing = await db.resource_bookmarks.find_one({"user_id": user_id, "resource_id": resource_id})
    if existing:
        await db.resource_bookmarks.delete_one({"user_id": user_id, "resource_id": resource_id})
        return {"status": "unbookmarked"}
    else:
        await db.resource_bookmarks.insert_one({
            "user_id": user_id,
            "resource_id": resource_id,
            "bookmarked_at": datetime.now(timezone.utc).isoformat()
        })
        return {"status": "bookmarked"}

@router.get("/{resource_id}/download")
async def download_resource(resource_id: str, current_user: dict = Depends(get_current_user)):
    """Download resource files and increment download count."""
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        query = {"_id": ObjectId(resource_id)}
    except Exception:
        query = {"_id": resource_id}

    resource = await db.resources.find_one(query)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    await db.resources.update_one(query, {"$inc": {"download_count": 1}})
    return {
        "status": "success",
        "attachments": resource.get("attachments", []),
        "download_count": resource.get("download_count", 0) + 1
    }

@router.post("/{resource_id}/comment")
async def post_comment(
    resource_id: str,
    payload: CommentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Post comment and rating on a resource."""
    user_id = current_user.get("user_id")
    user_name = current_user.get("full_name") or current_user.get("email", "Anonymous User")
    user_email = current_user.get("email")

    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        query = {"_id": ObjectId(resource_id)}
    except Exception:
        query = {"_id": resource_id}

    resource = await db.resources.find_one(query)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    new_comment = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "user_name": user_name,
        "user_email": user_email,
        "comment_text": payload.comment_text,
        "rating": payload.rating,
        "date": datetime.now(timezone.utc).isoformat()
    }

    await db.resources.update_one(query, {"$push": {"comments": new_comment}})
    return {"status": "success", "comment": new_comment}

# ─── ADMIN CMS ENDPOINTS ───

RESOURCE_UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "resources")
os.makedirs(RESOURCE_UPLOADS_DIR, exist_ok=True)

@router.post("/admin/upload", dependencies=[Depends(admin_required)])
async def upload_resource_file(file: UploadFile = File(...)):
    """Upload resource files to CMS storage."""
    try:
        ext = os.path.splitext(file.filename)[1] or ""
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(RESOURCE_UPLOADS_DIR, filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        base_url = os.getenv("BASE_URL", "").rstrip("/")
        if not base_url:
            base_url = "http://localhost:8000"
            
        file_url = f"{base_url}/uploads/resources/{filename}"
        
        return {
            "status": "success",
            "name": file.filename,
            "url": file_url,
            "size": os.path.getsize(filepath)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/admin", dependencies=[Depends(admin_required)])
async def create_resource(payload: Dict[str, Any]):
    """Create a new resource in the database."""
    resource = {
        "title": payload.get("title", ""),
        "cover_image": payload.get("cover_image", ""),
        "category": payload.get("category", "Startup Guides"),
        "author": payload.get("author", "Studlyf Admin"),
        "source_name": payload.get("source_name", "CMS Resource Library"),
        "source_logo": payload.get("source_logo", ""),
        "publish_date": payload.get("publish_date") or datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "reading_time": payload.get("reading_time", "5 mins"),
        "resource_type": payload.get("resource_type", "article"),
        "tags": payload.get("tags", []),
        "short_summary": payload.get("short_summary", ""),
        "full_content": payload.get("full_content", ""),
        "attachments": payload.get("attachments", []),
        "related_resources": payload.get("related_resources", []),
        "featured": payload.get("featured", False),
        "pinned": payload.get("pinned", False),
        "status": payload.get("status", "draft"),
        "schedule_publish": payload.get("schedule_publish"),
        "view_count": 0,
        "download_count": 0,
        "comments": []
    }

    result = await db.resources.insert_one(resource)
    resource["_id"] = str(result.inserted_id)
    resource["id"] = resource["_id"]
    return resource

@router.put("/admin/{resource_id}", dependencies=[Depends(admin_required)])
async def update_resource(resource_id: str, payload: Dict[str, Any]):
    """Update an existing resource details."""
    try:
        query = {"_id": ObjectId(resource_id)}
    except Exception:
        query = {"_id": resource_id}

    existing = await db.resources.find_one(query)
    if not existing:
        raise HTTPException(status_code=404, detail="Resource not found")

    update_fields = {
        "title": payload.get("title", existing.get("title")),
        "cover_image": payload.get("cover_image", existing.get("cover_image")),
        "category": payload.get("category", existing.get("category")),
        "author": payload.get("author", existing.get("author")),
        "source_name": payload.get("source_name", existing.get("source_name", "CMS Resource Library")),
        "source_logo": payload.get("source_logo", existing.get("source_logo", "")),
        "reading_time": payload.get("reading_time", existing.get("reading_time")),
        "resource_type": payload.get("resource_type", existing.get("resource_type")),
        "tags": payload.get("tags", existing.get("tags")),
        "short_summary": payload.get("short_summary", existing.get("short_summary")),
        "full_content": payload.get("full_content", existing.get("full_content")),
        "attachments": payload.get("attachments", existing.get("attachments")),
        "featured": payload.get("featured", existing.get("featured")),
        "pinned": payload.get("pinned", existing.get("pinned")),
        "status": payload.get("status", existing.get("status")),
        "schedule_publish": payload.get("schedule_publish", existing.get("schedule_publish")),
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

    if payload.get("publish_date"):
        update_fields["publish_date"] = payload["publish_date"]

    await db.resources.update_one(query, {"$set": update_fields})
    return {"status": "success", "id": resource_id}

@router.delete("/admin/{resource_id}", dependencies=[Depends(admin_required)])
async def delete_resource(resource_id: str):
    """Delete a resource from database."""
    try:
        query = {"_id": ObjectId(resource_id)}
    except Exception:
        query = {"_id": resource_id}

    result = await db.resources.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"status": "success"}

@router.post("/admin/categories", dependencies=[Depends(admin_required)])
async def add_category(payload: CategoryRequest):
    """Add a new custom resource category."""
    name_clean = payload.name.strip()
    if not name_clean:
        raise HTTPException(status_code=400, detail="Category name cannot be empty")

    existing = await db.resource_categories.find_one({"name": name_clean})
    if existing:
        return {"status": "exists", "name": name_clean}

    await db.resource_categories.insert_one({
        "name": name_clean,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"status": "success", "name": name_clean}

@router.delete("/admin/categories/{category_name}", dependencies=[Depends(admin_required)])
async def delete_category(category_name: str):
    """Delete a custom category from category lists."""
    result = await db.resource_categories.delete_one({"name": category_name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"status": "success"}

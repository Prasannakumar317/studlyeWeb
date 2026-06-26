from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
import uuid
import os
import httpx
import json
import re
from typing import List, Dict, Any, Optional
from db import db
from routes.auth import get_current_user

router = APIRouter(prefix="/api/v1/startup", tags=["startup"])

# Help helper to clean MongoDB object IDs
def clean_id(doc):
    if not doc:
        return doc
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# Seed helper for mock database collections if they are empty
async def ensure_seeded_data():
    # 1. Seed Startup Feed
    feed_count = await db.startup_feed.count_documents({})
    if feed_count == 0:
        default_posts = [
            {
                "id": "post-1",
                "author_name": "Acme Corp",
                "author_logo": "/api/v1/institution/profile/placeholder/media/logo",
                "content": "Excited to launch our new AI-powered platform for career development! Check out our new product details in the profile section. 🚀 #startup #launch",
                "likes": ["user-123", "user-456"],
                "comments": [
                    {"id": "c-1", "user_name": "Rohan Sharma", "text": "This looks incredible! Congrats team!"}
                ],
                "type": "Product Launch",
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": "post-2",
                "author_name": "Acme Corp",
                "author_logo": "/api/v1/institution/profile/placeholder/media/logo",
                "content": "We are actively hiring Frontend Developers and AI Engineers! Check our Opportunities tab to apply. 💼",
                "likes": ["user-789"],
                "comments": [],
                "type": "Hiring",
                "created_at": datetime.utcnow().isoformat()
            }
        ]
        await db.startup_feed.insert_many(default_posts)

    # 2. Seed Investors
    investor_count = await db.startup_investors.count_documents({})
    if investor_count == 0:
        default_investors = [
            {
                "id": "inv-1",
                "name": "Sequoia Capital (India)",
                "representative": "Sandeep Singhal",
                "stage_interest": "Seed / Series A",
                "investment_range": "₹50L - ₹2Cr",
                "message": "Interested in your EdTech solution. Would love to schedule a demo chat.",
                "status": "Pending",
                "logo": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120"
            },
            {
                "id": "inv-2",
                "name": "Kalaari Capital",
                "representative": "Vani Kola",
                "stage_interest": "Pre-Seed",
                "investment_range": "₹20L - ₹50L",
                "message": "Impressive growth trajectory. Let us discuss collaboration prospects.",
                "status": "Accepted",
                "logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120"
            }
        ]
        await db.startup_investors.insert_many(default_investors)

    # 3. Seed Mentors
    mentor_count = await db.startup_mentors.count_documents({})
    if mentor_count == 0:
        default_mentors = [
            {
                "id": "men-1",
                "name": "Ankur Warikoo",
                "experience": "15+ Years (Ex-Nearbuy, Angel Investor)",
                "skills": ["Brand Building", "Growth Strategy", "Fundraising"],
                "industry": "Consumer Tech & Edtech",
                "status": "Connected",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120"
            },
            {
                "id": "men-2",
                "name": "Kunal Shah",
                "experience": "12+ Years (Founder CRED)",
                "skills": ["Product Strategy", "Growth Hacking", "Fintech"],
                "industry": "Fintech & SaaS",
                "status": "Pending",
                "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120"
            }
        ]
        await db.startup_mentors.insert_many(default_mentors)

    # 4. Seed Collaborations
    collab_count = await db.startup_collaborations.count_documents({})
    if collab_count == 0:
        default_collabs = [
            {
                "id": "col-1",
                "name": "Aman Verma",
                "role": "Full Stack Developer",
                "skills": ["React", "FastAPI", "MongoDB"],
                "details": "Would like to build an open-source visualizer widget for your platform.",
                "type": "Developer",
                "status": "Pending",
                "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120"
            },
            {
                "id": "col-2",
                "name": "Preeti Sen",
                "role": "UI/UX Designer",
                "skills": ["Figma", "Design Systems", "Prototyping"],
                "details": "Interested in redesigning the landing page and introducing dark mode variants.",
                "type": "Designer",
                "status": "Shortlisted",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
            }
        ]
        await db.startup_collaborations.insert_many(default_collabs)

    # 5. Seed Messages
    message_count = await db.startup_messages.count_documents({})
    if message_count == 0:
        default_messages = [
            {
                "id": "msg-1",
                "sender_id": "inv-1",
                "sender_name": "Sandeep (Sequoia)",
                "sender_role": "Investor",
                "receiver_id": "startup-1",
                "text": "Hi team, we reviewed your pitch. Can we meet this Thursday at 4 PM?",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "id": "msg-2",
                "sender_id": "startup-1",
                "sender_name": "Acme Corp (You)",
                "sender_role": "Startup",
                "receiver_id": "inv-1",
                "text": "Thursday works perfectly for us! We will send a calendar invite.",
                "timestamp": datetime.utcnow().isoformat()
            }
        ]
        await db.startup_messages.insert_many(default_messages)

# ─── FEED ENDPOINTS ───
@router.get("/feed")
async def get_feed(user: dict = Depends(get_current_user)):
    await ensure_seeded_data()
    posts = []
    async for p in db.startup_feed.find():
        posts.append(clean_id(p))
    return sorted(posts, key=lambda x: x.get("created_at", ""), reverse=True)

@router.post("/feed")
async def create_feed_post(data: dict, user: dict = Depends(get_current_user)):
    await ensure_seeded_data()
    content = data.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    
    post = {
        "id": f"post-{str(uuid.uuid4())[:8]}",
        "author_name": user.get("institution_name") or user.get("full_name") or "Startup User",
        "author_logo": "/api/v1/institution/profile/placeholder/media/logo",
        "content": content,
        "likes": [],
        "comments": [],
        "type": data.get("type", "Update"),
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.startup_feed.insert_one(post)
    return clean_id(post)

@router.post("/feed/{post_id}/like")
async def like_feed_post(post_id: str, user: dict = Depends(get_current_user)):
    user_id = user.get("user_id") or "anonymous"
    post = await db.startup_feed.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    likes = post.get("likes", [])
    if user_id in likes:
        likes.remove(user_id)
    else:
        likes.append(user_id)
        
    await db.startup_feed.update_one({"id": post_id}, {"$set": {"likes": likes}})
    return {"status": "success", "likes": likes}

@router.post("/feed/{post_id}/comment")
async def comment_feed_post(post_id: str, data: dict, user: dict = Depends(get_current_user)):
    text = data.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Comment cannot be empty")
        
    post = await db.startup_feed.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    comments = post.get("comments", [])
    new_comment = {
        "id": f"comment-{str(uuid.uuid4())[:8]}",
        "user_name": user.get("full_name") or "Startup User",
        "text": text,
        "created_at": datetime.utcnow().isoformat()
    }
    comments.append(new_comment)
    
    await db.startup_feed.update_one({"id": post_id}, {"$set": {"comments": comments}})
    return {"status": "success", "comment": new_comment}


# ─── INVESTOR ENDPOINTS ───
@router.get("/investors")
async def get_investors(user: dict = Depends(get_current_user)):
    await ensure_seeded_data()
    investors = []
    async for i in db.startup_investors.find():
        investors.append(clean_id(i))
    return investors

@router.post("/investors/{id}/respond")
async def respond_to_investor(id: str, data: dict, user: dict = Depends(get_current_user)):
    status_val = data.get("status", "Accepted")
    res = await db.startup_investors.update_one({"id": id}, {"$set": {"status": status_val}})
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Investor connection not found")
    return {"status": "success"}


# ─── MENTOR ENDPOINTS ───
@router.get("/mentors")
async def get_mentors(user: dict = Depends(get_current_user)):
    await ensure_seeded_data()
    mentors = []
    async for m in db.startup_mentors.find():
        mentors.append(clean_id(m))
    return mentors

@router.post("/mentors/{id}/respond")
async def respond_to_mentor(id: str, data: dict, user: dict = Depends(get_current_user)):
    status_val = data.get("status", "Connected")
    res = await db.startup_mentors.update_one({"id": id}, {"$set": {"status": status_val}})
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Mentor connection not found")
    return {"status": "success"}


# ─── COLLABORATION ENDPOINTS ───
@router.get("/collaborations")
async def get_collaborations(user: dict = Depends(get_current_user)):
    await ensure_seeded_data()
    collabs = []
    async for c in db.startup_collaborations.find():
        collabs.append(clean_id(c))
    return collabs

@router.post("/collaborations/{id}/respond")
async def respond_to_collaboration(id: str, data: dict, user: dict = Depends(get_current_user)):
    status_val = data.get("status", "Accepted")
    res = await db.startup_collaborations.update_one({"id": id}, {"$set": {"status": status_val}})
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Collaboration request not found")
    return {"status": "success"}


# ─── MESSAGING ENDPOINTS ───
@router.get("/messages")
async def get_messages(user: dict = Depends(get_current_user)):
    await ensure_seeded_data()
    msgs = []
    async for m in db.startup_messages.find():
        msgs.append(clean_id(m))
    return sorted(msgs, key=lambda x: x.get("timestamp", ""))

@router.post("/messages/send")
async def send_message(data: dict, user: dict = Depends(get_current_user)):
    await ensure_seeded_data()
    text = data.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    msg = {
        "id": f"msg-{str(uuid.uuid4())[:8]}",
        "sender_id": "startup-1",
        "sender_name": user.get("institution_name") or user.get("full_name") or "Startup User",
        "sender_role": "Startup",
        "receiver_id": data.get("receiver_id", "inv-1"),
        "text": text,
        "timestamp": datetime.utcnow().isoformat()
    }
    await db.startup_messages.insert_one(msg)
    return clean_id(msg)


# ─── ANALYTICS ENDPOINTS ───
@router.get("/analytics/{institution_id}")
async def get_analytics(institution_id: str, user: dict = Depends(get_current_user)):
    # Standard metrics
    # Fetch actual opportunities published by this startup
    opp_count = await db.opportunities.count_documents({"institution_id": institution_id})
    app_count = await db.opportunity_applications.count_documents({"opportunity_id": {"$exists": True}})
    
    # Connection requests count
    inv_count = await db.startup_investors.count_documents({})
    men_count = await db.startup_mentors.count_documents({})
    col_count = await db.startup_collaborations.count_documents({})
    
    return {
        "profile_views": 184,
        "opportunity_views": 420,
        "opportunities_published": opp_count,
        "applications_received": app_count,
        "investor_interest": inv_count,
        "mentor_interest": men_count,
        "collaboration_requests": col_count,
        "monthly_growth": [
            {"month": "Jan", "views": 40, "applications": 12},
            {"month": "Feb", "views": 85, "applications": 28},
            {"month": "Mar", "views": 130, "applications": 54},
            {"month": "Apr", "views": 150, "applications": 76},
            {"month": "May", "views": 165, "applications": 88},
            {"month": "Jun", "views": 184, "applications": 92}
        ]
    }


# ─── NOTIFICATION ENDPOINTS ───
@router.get("/notifications")
async def get_notifications(user: dict = Depends(get_current_user)):
    # Startup-specific logs and events
    return [
        {
            "id": "not-1",
            "title": "New Investor Interest",
            "description": "Vani Kola from Kalaari Capital sent an investment request.",
            "created_at": datetime.utcnow().isoformat(),
            "unread": True
        },
        {
            "id": "not-2",
            "title": "New Application",
            "description": "Rahul Verma applied for the AI Engineer role.",
            "created_at": datetime.utcnow().isoformat(),
            "unread": True
        },
        {
            "id": "not-3",
            "title": "Collaboration Request",
            "description": "Preeti Sen requested to collaborate on UI/UX redesign.",
            "created_at": datetime.utcnow().isoformat(),
            "unread": False
        }
    ]


def generate_simulated_report(idea: str, problem_statement: str, customer_segment: str, geography: str) -> dict:
    idea_lower = idea.lower()
    geography_lower = geography.lower()
    segment_lower = customer_segment.lower()

    demand = 72
    competition = 60
    scalability = 65
    revenue_potential = 68

    if "ai" in idea_lower or "intelligent" in idea_lower or "automated" in idea_lower or "copilot" in idea_lower:
        scalability += 15
        revenue_potential += 10
    if "sustainable" in idea_lower or "eco" in idea_lower or "green" in idea_lower or "solar" in idea_lower:
        demand += 12
        competition += 5
    if len(problem_statement) > 80:
        demand += 8
    if "freelance" in segment_lower or "creator" in segment_lower or "solo" in segment_lower or "developer" in segment_lower:
        scalability += 8
        competition -= 5

    demand = min(96, max(45, demand))
    competition = min(94, max(35, competition))
    scalability = min(98, max(40, scalability))
    revenue_potential = min(95, max(35, revenue_potential))

    overall = round((demand + competition + scalability + revenue_potential) / 4)

    verdict = "Pivot"
    if overall >= 78:
        verdict = "Go"
    elif overall < 58:
        verdict = "No-Go"

    keyword = "Nexus"
    words = [w for w in idea.split() if len(w) > 4]
    if words:
        keyword = re.sub(r'[^a-zA-Z]', '', words[0])
        if keyword:
            keyword = keyword.capitalize()
        else:
            keyword = "Nexus"

    competitors = [
        {
            "name": f"{keyword}Flow",
            "type": "Direct",
            "description": f"A well-funded platform specializing in automated workflows specifically for {customer_segment} segment.",
            "fundingHistory": "Series A - $4.5M (Led by Index Ventures)",
            "pricing": "$29 - $129/month",
            "strength": "First-mover advantage, deep integration hooks, and elegant design.",
            "weakness": "Complex user onboarding; pricing is prohibitive for early stage operators."
        },
        {
            "name": "LegacyCorp Global",
            "type": "Indirect",
            "description": "Traditional consulting agencies, legacy Excel models, and manual spreadsheets currently serving this problem space.",
            "fundingHistory": "Public / Bootstrapped & Profitable",
            "pricing": "Custom quote ($500+ standard startup fee)",
            "strength": "Deep historical customer relationships and extensive high-touch credibility.",
            "weakness": "Extremely manual process, zero real-time insights, and lacks modern automated logic."
        },
        {
            "name": f"SaaS{keyword}",
            "type": "Direct",
            "description": f"A lightweight, modern workspace offering simplified widgets tailored to {geography}.",
            "fundingHistory": "Seed - $750k (Y-Combinator)",
            "pricing": "$9/month per user flat-rate",
            "strength": "Very simple dashboard and immediate self-serve utility.",
            "weakness": "Lacks custom reporting templates, localized APIs, and deep performance scale."
        }
    ]

    avatar_name = "Founder Frank"
    avatar_description = "Constantly on the lookout for specialized automation to bypass standard spreadsheet bottlenecks."
    if "freelance" in segment_lower or "designer" in segment_lower or "creative" in segment_lower or "writer" in segment_lower:
        avatar_name = "Creative Chloe"
        avatar_description = "A busy freelance professional balancing client creative briefs with tedious tax, booking, and administrative chores."
    elif "developer" in segment_lower or "engineer" in segment_lower or "tech" in segment_lower or "solo" in segment_lower:
        avatar_name = "Developer Dan"
        avatar_description = "A systems-focused builder who demands fast programmatic automations rather than manual dashboard operations."
    elif "agency" in segment_lower or "marketing" in segment_lower or "corporate" in segment_lower:
        avatar_name = "Director Diane"
        avatar_description = "Coordinates multiple client deliverables and needs high-level performance data to report back immediately."

    customer_persona = {
        "avatarName": avatar_name,
        "avatarDescription": avatar_description,
        "idealCustomerProfile": f"Independent operators and teams within the {customer_segment} group operating across {geography}.",
        "painPoints": [
            problem_statement[:85] + "..." if len(problem_statement) > 50 else "Loss of productive weekly hours dealing with administrative overhead.",
            "Generic enterprise tools are too complex and expensive for their specific scope.",
            "Fragmented status reporting and general stress around financial and workflow management."
        ],
        "behavior": [
            "Relies heavily on recommendation channels, Reddit reviews, and Product Hunt launches.",
            "Prefers quick, transparent, self-serve subscription models with no credit card upfront.",
            "Maintains active desktop and mobile integration needs for high-frequency workflows."
        ]
    }

    tam = "$2.5 Billion TAM in the United States and global hubs."
    if "germany" in geography_lower or "france" in geography_lower or "europe" in geography_lower or "eu" in geography_lower:
        tam = "€1.9 Billion TAM across European Union digital transformation zones."
    elif "australia" in geography_lower or "oceania" in geography_lower:
        tam = "A$480 Million TAM with highly concentrated regional solar and startup hubs."
    elif geography != "United States":
        tam = f"Estimated $750 Million addressable market size within {geography} and neighboring markets."

    market_research = {
        "marketSize": tam,
        "growthTrends": "Experiencing an active 13.4% CAGR over the forecast period, driven by post-pandemic independent labor trends and localized compliance standards.",
        "industryOverview": f"The industry within {geography} is undergoing rapid decentralization. Businesses are actively phasing out monolithic enterprise suites in favor of modular, AI-powered specialized workflows."
    }

    validation_scores = {
        "demand": demand,
        "competition": competition,
        "scalability": scalability,
        "revenuePotential": revenue_potential,
        "overall": overall,
        "rationale": {
            "demand": f"Strong market pull. The problem statement: \"{problem_statement[:60]}...\" represents a high-priority friction for {customer_segment}.",
            "competition": f"The competitive landscape is favorable. While alternatives exist, few specialize directly in {geography} with a targeted \"{idea[:25]}...\" positioning.",
            "scalability": f"High recurring SaaS margin potential. Digital distribution permits near-zero marginal cost service once the core application template is built.",
            "revenuePotential": f"SaaS tiers ($15-$49/mo) fit comfortably within the spending thresholds of {customer_segment} if hours saved exceed 4 hours/month."
        }
    }

    summary_and_next_steps = {
        "verdict": verdict,
        "reasoning": f"Your proposal for \"{idea[:65]}...\" addresses a genuine, high-frequency paint point for {customer_segment}. Launching in the {geography} market is a strong strategic decision, where targeted value delivery will carve a profitable competitive wedge against broader, legacy solutions.",
        "suggestedNextSteps": [
            f"Build a lightweight single-purpose landing page showcasing the core \"{idea[:30]}...\" value proposition.",
            f"Conduct 5 structured customer discovery calls targeting active {customer_segment} profiles in {geography}.",
            f"Design an interactive low-fidelity wireframe focused on solving their highest friction point.",
            f"Create an early-access waitlist with a target of 100 signups before starting heavy development."
        ]
    }

    return {
        "marketResearch": market_research,
        "competitorDiscovery": competitors,
        "customerPersona": customer_persona,
        "validationScores": validation_scores,
        "summaryAndNextSteps": summary_and_next_steps
    }


@router.post("/validate-idea")
async def validate_idea(data: dict, user: dict = Depends(get_current_user)):
    idea = data.get("idea")
    problem_statement = data.get("problemStatement")
    customer_segment = data.get("customerSegment")
    geography = data.get("geography")
    simulate = data.get("simulate", False)

    if not all([idea, problem_statement, customer_segment, geography]):
        raise HTTPException(status_code=400, detail="Missing required inputs.")

    api_key = os.getenv("GEMINI_API_KEY")

    if simulate or not api_key:
        simulated_data = generate_simulated_report(idea, problem_statement, customer_segment, geography)
        return {
            "success": True,
            "data": simulated_data,
            "sources": [
                { "title": "Crunchbase - Startup Financial Analytics", "url": "https://www.crunchbase.com" },
                { "title": "Gartner - Decentralized Industry Trends", "url": "https://www.gartner.com" },
                { "title": "McKinsey - Specialized Workflow Insights", "url": "https://www.mckinsey.com" }
            ],
            "isSimulated": True
        }

    # Google Grounding Call via Gemini REST API
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"

    system_instruction = (
        "You are an elite startup research partner, venture capital analyst, and market intelligence system similar to Crunchbase, Gartner, and McKinsey.\n"
        f"Your task is to validate a startup idea based on the founder's inputs:\n"
        f"- Startup Idea: {idea}\n"
        f"- Problem Statement: {problem_statement}\n"
        f"- Customer Segment: {customer_segment}\n"
        f"- Geography: {geography}\n\n"
        "Use Google Search grounding to perform live, real-time market research, find active direct and indirect competitors, check their pricing, funding history, and general market developments. Do not use outdated or simulated data.\n\n"
        "Produce a strictly valid JSON response matching this schema:\n"
        "{\n"
        "  \"marketResearch\": {\n"
        "    \"marketSize\": \"Estimated market size (TAM, SAM, SOM where applicable) for the target geography.\",\n"
        "    \"growthTrends\": \"Current CAGR, recent market trends, and direction.\",\n"
        "    \"industryOverview\": \"Brief overview of the industry and macroeconomic factors.\"\n"
        "  },\n"
        "  \"competitorDiscovery\": [\n"
        "    {\n"
        "      \"name\": \"Name of competitor\",\n"
        "      \"type\": \"Direct\" or \"Indirect\",\n"
        "      \"description\": \"What they do.\",\n"
        "      \"fundingHistory\": \"Funding details (e.g. 'Series B - $15M', 'Seed', 'Bootstrapped', 'Unknown'). Check recent news or Crunchbase.\",\n"
        "      \"pricing\": \"Estimated pricing details (e.g., '$10-$50/month', 'Freemium', 'Enterprise-only').\",\n"
        "      \"strength\": \"Key strength of this competitor.\",\n"
        "      \"weakness\": \"Key weakness or gap they leave in the market.\"\n"
        "    }\n"
        "  ],\n"
        "  \"customerPersona\": {\n"
        "    \"avatarName\": \"E.g., Developer Dan or Marketing Mary\",\n"
        "    \"avatarDescription\": \"Brief bio of this ideal customer profile (ICP).\",\n"
        "    \"idealCustomerProfile\": \"Who they are, demographics, and company size.\",\n"
        "    \"painPoints\": [\"Pain point 1\", \"Pain point 2\", \"Pain point 3\"],\n"
        "    \"behavior\": [\"Behavior/buying pattern 1\", \"Behavior/buying pattern 2\"]\n"
        "  },\n"
        "  \"validationScores\": {\n"
        "    \"demand\": 85,\n"
        "    \"competition\": 70,\n"
        "    \"scalability\": 90,\n"
        "    \"revenuePotential\": 80,\n"
        "    \"overall\": 81,\n"
        "    \"rationale\": {\n"
        "      \"demand\": \"Brief rationale for the demand score.\",\n"
        "      \"competition\": \"Brief rationale for the competition score.\",\n"
        "      \"scalability\": \"Brief rationale for the scalability score.\",\n"
        "      \"revenuePotential\": \"Brief rationale for the revenue potential score.\"\n"
        "    }\n"
        "  },\n"
        "  \"summaryAndNextSteps\": {\n"
        "    \"verdict\": \"Go\" or \"Pivot\" or \"No-Go\",\n"
        "    \"reasoning\": \"A concise expert analysis justifying the verdict.\",\n"
        "    \"suggestedNextSteps\": [\"Specific, actionable next step 1\", \"Specific next step 2\", \"Specific next step 3\"]\n"
        "  }\n"
        "}\n\n"
        "Do not include any formatting text, other than the JSON itself. Respond ONLY with a valid JSON block."
    )

    response_schema = {
        "type": "OBJECT",
        "properties": {
            "marketResearch": {
                "type": "OBJECT",
                "properties": {
                    "marketSize": {"type": "STRING"},
                    "growthTrends": {"type": "STRING"},
                    "industryOverview": {"type": "STRING"}
                },
                "required": ["marketSize", "growthTrends", "industryOverview"]
            },
            "competitorDiscovery": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "name": {"type": "STRING"},
                        "type": {"type": "STRING"},
                        "description": {"type": "STRING"},
                        "fundingHistory": {"type": "STRING"},
                        "pricing": {"type": "STRING"},
                        "strength": {"type": "STRING"},
                        "weakness": {"type": "STRING"}
                    },
                    "required": ["name", "type", "description", "fundingHistory", "pricing", "strength", "weakness"]
                }
            },
            "customerPersona": {
                "type": "OBJECT",
                "properties": {
                    "avatarName": {"type": "STRING"},
                    "avatarDescription": {"type": "STRING"},
                    "idealCustomerProfile": {"type": "STRING"},
                    "painPoints": {"type": "ARRAY", "items": {"type": "STRING"}},
                    "behavior": {"type": "ARRAY", "items": {"type": "STRING"}}
                },
                "required": ["avatarName", "avatarDescription", "idealCustomerProfile", "painPoints", "behavior"]
            },
            "validationScores": {
                "type": "OBJECT",
                "properties": {
                    "demand": {"type": "INTEGER"},
                    "competition": {"type": "INTEGER"},
                    "scalability": {"type": "INTEGER"},
                    "revenuePotential": {"type": "INTEGER"},
                    "overall": {"type": "INTEGER"},
                    "rationale": {
                        "type": "OBJECT",
                        "properties": {
                            "demand": {"type": "STRING"},
                            "competition": {"type": "STRING"},
                            "scalability": {"type": "STRING"},
                            "revenuePotential": {"type": "STRING"}
                        },
                        "required": ["demand", "competition", "scalability", "revenuePotential"]
                    }
                },
                "required": ["demand", "competition", "scalability", "revenuePotential", "overall", "rationale"]
            },
            "summaryAndNextSteps": {
                "type": "OBJECT",
                "properties": {
                    "verdict": {"type": "STRING"},
                    "reasoning": {"type": "STRING"},
                    "suggestedNextSteps": {"type": "ARRAY", "items": {"type": "STRING"}}
                },
                "required": ["verdict", "reasoning", "suggestedNextSteps"]
            }
        },
        "required": ["marketResearch", "competitorDiscovery", "customerPersona", "validationScores", "summaryAndNextSteps"]
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            f"Validate the following startup idea. You MUST use Google Search grounding to discover accurate and actual real-world competitors, real-world market size, and funding histories from databases or recent news (Crunchbase-style details).\n"
                            f"Idea: {idea}\n"
                            f"Problem: {problem_statement}\n"
                            f"Customer Segment: {customer_segment}\n"
                            f"Geography: {geography}"
                        )
                    }
                ]
            }
        ],
        "systemInstruction": {
            "parts": [
                {
                    "text": system_instruction
                }
            ]
        },
        "tools": [
            {
                "google_search": {}
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": response_schema
        }
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 429:
                return {
                    "success": False,
                    "isQuotaError": True,
                    "error": "Google AI Studio Gemini API Quota Exceeded (429). The real-time web-grounding engine is currently rate-limited by the server's quota rules. Would you like to bypass the API and run in simulated sandbox mode?"
                }
            elif response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Gemini API returned error: {response.text}")

            res_json = response.json()
            candidates = res_json.get("candidates", [])
            if not candidates:
                raise HTTPException(status_code=500, detail="No response candidates generated by the model.")

            text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            try:
                report_data = json.loads(text_content)
            except json.JSONDecodeError:
                json_match = re.search(r"\{[\s\S]*\}", text_content)
                if json_match:
                    report_data = json.loads(json_match.group(0))
                else:
                    raise HTTPException(status_code=500, detail="Failed to parse valid JSON from Gemini response.")

            sources = []
            grounding_metadata = candidates[0].get("groundingMetadata", {})
            grounding_chunks = grounding_metadata.get("groundingChunks", [])
            for chunk in grounding_chunks:
                web = chunk.get("web")
                if web and web.get("uri") and web.get("title"):
                    sources.append({
                        "title": web.get("title"),
                        "url": web.get("uri")
                    })

            unique_sources = []
            seen_urls = set()
            for src in sources:
                if src["url"] not in seen_urls:
                    seen_urls.add(src["url"])
                    unique_sources.append(src)

            return {
                "success": True,
                "data": report_data,
                "sources": unique_sources,
                "isSimulated": False
            }

    except Exception as e:
        err_msg = str(e).lower()
        if "429" in err_msg or "quota" in err_msg or "rate_limit" in err_msg:
            return {
                "success": False,
                "isQuotaError": True,
                "error": "Google AI Studio Gemini API Quota Exceeded (429). The real-time web-grounding engine is currently rate-limited by the server's quota rules. Would you like to bypass the API and run in simulated sandbox mode?"
            }
        raise HTTPException(status_code=500, detail=str(e))


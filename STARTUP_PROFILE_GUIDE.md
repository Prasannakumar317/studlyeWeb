# Startup Profile Feature - Developer Quick Start

## What Was Implemented

A complete **Startup Profile** module allowing institutions to:
- **Create & manage** startup information (company details, founders, funding stage)
- **Share publicly** via unique URL: `/startup/{institutionId}`
- **Upload media** (logo, hero banner)
- **Showcase founders** with roles and contact info
- **Add social links** (LinkedIn, Twitter, Instagram)

## Frontend Components

### 1. StartupProfile.tsx (Settings Editor)
Location: `frontend/pages/institution-dashboard/StartupProfile.tsx`

**Purpose**: Form component for creating/editing startup profiles within institution dashboard

**Key Features**:
```tsx
- Company basics (name, tagline, description, pitch)
- Funding info (stage, team size, founded year)
- Contact details (website, email, phone)
- Media upload (logo, hero banner)
- Founder management (CRUD operations)
- Social links configuration
- Real-time form validation
```

**Usage**:
```tsx
<StartupProfile 
  institutionId={institutionId} 
  onProfileUpdate={handleProfileUpdate} 
/>
```

### 2. PublicStartupProfile.tsx (Public View)
Location: `frontend/pages/PublicStartupProfile.tsx`

**Purpose**: Public-facing profile page (no auth required)

**Key Features**:
```tsx
- Beautiful profile display with hero/logo
- Founding team showcase
- Contact information links
- Social media buttons
- Shareable URL with copy function
- Stats dashboard
```

**URL Pattern**: `/startup/:institutionId`

### 3. SettingsPage Integration
Location: `frontend/pages/institution-dashboard/SettingsPage.tsx`

**Changes**:
- Added "Startup Profile" tab to sections array
- Imported `StartupProfile` component
- Added case in `renderSectionContent()` switch statement

## Backend Endpoints

All endpoints use base path: `/api/v1/institution/`

### Create/Update Startup Profile
```
POST /startup-profile
Headers: { Authorization: Bearer {token}, Content-Type: application/json }
Body: {
  company_name: string,
  tagline: string,
  description: string,
  pitch: string,
  logo_url: string,
  hero_image_url: string,
  website: string,
  email: string,
  phone: string,
  founded_year: number,
  team_size: string,
  stage: 'Seed' | 'Series A' | 'Series B' | etc,
  industry: string,
  founders: [{ name, role, email }],
  social: { linkedin, twitter, instagram }
}
Response: { status: "success" }
```

### Get Startup Profile (Authenticated)
```
GET /startup-profile/{institution_id}
Headers: { Authorization: Bearer {token} }
Response: { ...profile data }
```

### Get Startup Profile (Public)
```
GET /startup-profile-public/{institution_id}
Response: { ...profile data }
(No authentication required)
```

## Database Schema

Collection: `startups`

```javascript
{
  _id: ObjectId,
  institution_id: String (unique key),
  company_name: String,
  tagline: String,
  description: String,
  pitch: String,
  logo_url: String,
  hero_image_url: String,
  website: String,
  email: String,
  phone: String,
  founded_year: Number,
  team_size: String,
  stage: String,
  industry: String,
  founders: [
    {
      name: String,
      role: String,
      email: String
    }
  ],
  social: {
    linkedin: String,
    twitter: String,
    instagram: String
  },
  updated_at: Date
}
```

## Routes

### Frontend Routes
| Path | Component | Auth | Purpose |
|------|-----------|------|---------|
| `/institution-dashboard/settings?section=startup` | SettingsPage | Required | Edit startup profile |
| `/startup/:institutionId` | PublicStartupProfile | None | View startup profile publicly |

### Backend Routes
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/v1/institution/startup-profile` | Required | Create/update profile |
| GET | `/api/v1/institution/startup-profile/{id}` | Required | Get profile (authenticated) |
| GET | `/api/v1/institution/startup-profile-public/{id}` | None | Get profile (public) |

## Code Examples

### Save Startup Profile (Frontend)
```tsx
const handleSave = async () => {
  const res = await fetch(`${API_BASE_URL}/api/v1/institution/startup-profile`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      ...authHeaders() 
    },
    body: JSON.stringify({
      ...profile,
      institution_id: institutionId
    })
  });
  
  if (res.ok) {
    // Show success message
  }
};
```

### Load Startup Profile (Frontend)
```tsx
const fetchProfile = async () => {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/institution/startup-profile/${institutionId}`,
    { headers: authHeaders() }
  );
  
  if (res.ok) {
    const data = await res.json();
    setProfile(data);
  }
};
```

### Create/Update via Backend
```python
@router.post("/startup-profile")
async def create_startup_profile(profile: dict, user: dict = Depends(get_auth_user)):
    inst_id = str(user.get("institution_id") or "").strip()
    
    # Validation and save logic...
    profile["institution_id"] = inst_id
    profile["updated_at"] = datetime.utcnow()
    
    await startups_col.update_one(
        {"institution_id": inst_id},
        {"$set": profile},
        upsert=True
    )
```

## Media Upload

Startup profiles use the existing media upload endpoint:

```
POST /api/v1/institution/upload-media
FormData: {
  file: File,
  field: 'logo_url' | 'hero_image_url'
}
Response: { url: "/api/v1/institution/profile/{id}/media/logo" }
```

The StartupProfile component handles this automatically.

## Testing

### Manual Test Flow

1. **Create Profile**
   - Go to Institution Dashboard → Settings → Startup Profile
   - Fill in company details
   - Upload logo and banner
   - Add founders
   - Click Save

2. **View Public Profile**
   - Navigate to `/startup/{institutionId}`
   - Verify all data displays correctly
   - Test social media links
   - Test share functionality

3. **Edit Profile**
   - Go back to settings
   - Modify information
   - Verify existing images are preserved
   - Save changes

4. **API Testing**
   ```bash
   # Create/Update
   curl -X POST http://localhost:5000/api/v1/institution/startup-profile \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{...profile data...}'
   
   # Get (authenticated)
   curl -X GET http://localhost:5000/api/v1/institution/startup-profile/{institutionId} \
     -H "Authorization: Bearer {token}"
   
   # Get (public)
   curl -X GET http://localhost:5000/api/v1/institution/startup-profile-public/{institutionId}
   ```

## Common Tasks

### Add a New Startup Field

1. **Frontend** - Add to StartupProfile.tsx state:
   ```tsx
   const [profile, setProfile] = useState<StartupProfileState>({
     // ... existing fields
     new_field: ''
   });
   ```

2. **Frontend** - Add form input:
   ```tsx
   <input 
     id="new_field"
     value={profile.new_field}
     onChange={handleInputChange}
   />
   ```

3. **Backend** - Field is automatically handled (no code change needed)

4. **Database** - Schema is flexible (MongoDB), field is auto-created

### Customize Styling

Color scheme uses `#6C3BFF` (purple accent) - change in:
- `StartupProfile.tsx` - className bg-[#6C3BFF]
- `PublicStartupProfile.tsx` - className bg-[#7C3AED]

### Hide/Show Sections

In `StartupProfile.tsx` - comment out sections:
```tsx
{/* Founders Section */}
<div className="mt-12 space-y-8 border-t border-slate-100 pt-8">
```

## Environment Variables

No new environment variables needed. Uses existing:
- `API_BASE_URL` - Backend API address
- `authHeaders()` - From apiConfig.ts for auth tokens

## Dependencies

- No new dependencies added
- Uses existing: React, React Router, Framer Motion, Lucide Icons
- MongoDB schema is flexible

## Performance Notes

- Lazy loaded component in SettingsPage
- Public endpoint is public (no auth overhead)
- Media URLs are cached on update
- Uses single database query per profile

## Security Notes

- Authenticated endpoint validates `institution_id` from JWT
- Public endpoint has no sensitive data
- Images stored as URLs (not base64 blobs)
- Email/phone visible only in authenticated view

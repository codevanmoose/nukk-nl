# Supabase Setup for nukk.nl

## ✅ Project Created
- **Project Name**: nukk-nl
- **Project URL**: https://supabase.com/dashboard/project/yahsiojkdmrhfifhicgr
- **Database Password**: NukkFact2024!
- **Region**: us-east-1

## Next Steps

### 1. Set up Database Schema
1. Go to https://supabase.com/dashboard/project/yahsiojkdmrhfifhicgr
2. Navigate to "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the entire contents of `database/schema.sql`
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### 2. Get API Keys
1. Go to "Settings" → "API" in the left sidebar
2. Copy these values:

```bash
# For Vercel environment variables:
NEXT_PUBLIC_SUPABASE_URL=https://yahsiojkdmrhfifhicgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Copy from "anon public" key]
SUPABASE_SERVICE_ROLE_KEY=[Copy from "service_role secret" key]
```

### 3. Update Vercel Environment Variables
Use the update script:

```bash
./update-env.sh NEXT_PUBLIC_SUPABASE_URL "https://yahsiojkdmrhfifhicgr.supabase.co"
./update-env.sh NEXT_PUBLIC_SUPABASE_ANON_KEY "your_anon_key_here"
./update-env.sh SUPABASE_SERVICE_ROLE_KEY "your_service_role_key_here"
```

### 4. Test Database Connection
After setting up the schema, you can test the connection by going to the "Table Editor" tab and verifying these tables exist:
- articles
- analyses  
- annotations
- user_feedback

## Database Schema Location
The complete schema is in: `database/schema.sql`

## Dashboard Access
- **URL**: https://supabase.com/dashboard/project/yahsiojkdmrhfifhicgr
- **Database Password**: NukkFact2024!
# Quick Database Fix

## Problem
- PostgreSQL not connected (localhost:5432 not running)
- Admin panel not accessible due to database errors
- All API endpoints failing

## Solution: Use Neon PostgreSQL (Free)

### 1. Create Neon Database
1. Go to https://neon.tech
2. Sign up with GitHub/Google
3. Create project "thrift-haven"
4. Copy connection string

### 2. Update .env file
Replace DATABASE_URL in your .env file with Neon connection string:

```bash
# Replace this line in .env:
DATABASE_URL="postgresql://your_username:your_password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 3. Apply Schema
```bash
npm run db:push
```

### 4. Create Admin User
```bash
node scripts/make-current-user-admin.js
```

## Alternative: Railway (Also Free)
1. Go to https://railway.app
2. Create project → Add PostgreSQL
3. Copy connection string from Variables tab
4. Use in DATABASE_URL

## After Database Setup
- All 401 errors will be fixed
- Admin panel will be accessible at /admin
- User authentication will work properly

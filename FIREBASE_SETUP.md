# Firebase Admin SDK Setup for Vercel

## Problem
The upload endpoint returns 401 Unauthorized because Firebase Admin SDK cannot initialize on Vercel due to missing credentials file.

## Solution Steps

### 1. Get Firebase Admin SDK JSON Content
1. Open your local file: `thrifting-ecommerce-firebase-adminsdk-fbsvc-d9f4bfdff5.json`
2. Copy the entire content (from opening `{` to closing `}`)

### 2. Add to Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Create a new variable:
   - **Name**: `FIREBASE_ADMIN_SDK_JSON`
   - **Value**: Paste the entire JSON content from step 1
   - **Environments**: Check Production, Preview, and Development
4. Click Save

### 3. Deploy Changes
1. The firebase-admin.ts file has been updated to use environment variables
2. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Fix Firebase Admin SDK for Vercel deployment"
   git push
   ```
3. Vercel will automatically redeploy

### 4. Test
After deployment, the upload functionality should work properly as the admin authentication will be successful.

## Code Changes Made
- Updated `src/lib/firebase-admin.ts` to read credentials from `FIREBASE_ADMIN_SDK_JSON` environment variable
- Added fallback to local file for development environment

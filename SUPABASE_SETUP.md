# Supabase Storage Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your account
3. Click "New Project"
4. Fill in project details:
   - Name: `thrift-haven-storage`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users

## 2. Setup Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Bucket name: `product-images`
4. Set bucket to **Public** (for product images)
5. Click "Create bucket"

## 3. Configure Bucket Policies

### Step-by-Step Policy Creation:

1. **Go to Storage Policies**
   - In Supabase Dashboard, click **Storage** in sidebar
   - Click **Policies** tab
   - You'll see your `product-images` bucket listed

2. **Create Policy 1: Public Read Access**
   - Click **New Policy** button
   - Select **For full customization** 
   - Fill in the form:
     - **Policy name**: `Public read access`
     - **Allowed operation**: Check **SELECT** only
     - **Target roles**: Leave as "Defaults to all (public) roles if none selected"
     - **Policy definition**: 
       ```sql
       (bucket_id = 'product-images')
       ```
   - Click **Review** then **Save policy**

3. **Create Policy 2: Allow Upload**
   - Click **New Policy** button again
   - Select **For full customization**
   - Fill in the form:
     - **Policy name**: `Allow authenticated upload`
     - **Allowed operation**: Check **INSERT** only
     - **Target roles**: Leave default (public)
     - **Policy definition**:
       ```sql
       (bucket_id = 'product-images')
       ```
   - Click **Review** then **Save policy**

4. **Create Policy 3: Allow Delete**
   - Click **New Policy** button again
   - Select **For full customization**
   - Fill in the form:
     - **Policy name**: `Allow authenticated delete`
     - **Allowed operation**: Check **DELETE** only
     - **Target roles**: Leave default (public)
     - **Policy definition**:
       ```sql
       (bucket_id = 'product-images')
       ```
   - Click **Review** then **Save policy**

### Alternative: Quick Setup Policies
If you want to use SQL directly, go to **SQL Editor** and run:

```sql
-- Policy 1: Public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Policy 2: Allow upload
CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Policy 3: Allow delete
CREATE POLICY "Allow authenticated delete" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');
```

## 4. Get API Keys

1. Go to **Settings > API**
2. Copy these values:
   - Project URL
   - Project API Keys > `anon` `public`

## 5. Update Environment Variables

Add to your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

## 6. Test Upload

After setup, test image upload in admin panel:
1. Login as admin
2. Go to Products page
3. Add new product
4. Upload images
5. Images should now be stored in Supabase Storage

## Benefits of Supabase Storage

✅ **No CORS Issues** - Built-in CORS support
✅ **Better Performance** - CDN-backed storage
✅ **Cost Effective** - Generous free tier
✅ **Easy Integration** - Simple API
✅ **Automatic Optimization** - Image transformations available

# Deployment Guide untuk Vercel

## 1. Setup Cloud Database

### Option A: Neon (Recommended)
1. Daftar di https://neon.tech (gratis)
2. Buat database baru
3. Copy connection string

### Option B: Supabase
1. Daftar di https://supabase.com (gratis)
2. Buat project baru
3. Copy PostgreSQL URL dari Settings > Database

## 2. Update Database Schema

```bash
# Update schema untuk PostgreSQL
# Ganti di prisma/schema.prisma:

datasource db {
  provider = "postgresql"  # Ganti dari "sqlite"
  url      = env("DATABASE_URL")
}
```

## 3. Environment Variables untuk Vercel

Tambahkan di Vercel Dashboard > Settings > Environment Variables:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-key
FIREBASE_CLIENT_EMAIL=your-firebase-email
```

## 4. Migration Commands

```bash
# 1. Install PostgreSQL adapter
npm install @prisma/adapter-neon

# 2. Generate new client
npx prisma generate

# 3. Deploy schema ke cloud database
npx prisma db push

# 4. Seed data (optional)
npx prisma db seed
```

## 5. Deploy ke Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

## 6. Post-Deploy Steps

1. Buat admin user pertama
2. Upload beberapa produk test
3. Test semua fitur

## Database Differences

**Local (Development):**
- SQLite file di komputer Anda
- Data hilang jika file dihapus

**Vercel (Production):**
- PostgreSQL di cloud
- Data persistent dan aman
- Bisa diakses dari mana saja

## Troubleshooting

### Error: "Database not found"
- Pastikan DATABASE_URL benar
- Check connection string format

### Error: "Prisma client not generated"
- Run `npx prisma generate`
- Restart Vercel build

### Error: "Migration failed"
- Check PostgreSQL permissions
- Ensure database is accessible

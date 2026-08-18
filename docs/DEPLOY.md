# WhoIsDésir® Media — Firebase Deployment Guide

## Prerequisites
- Firebase project: `widmediaagency`
- Google Cloud Console access: https://console.cloud.google.com

---

## Step 1: Create Cloud SQL PostgreSQL Database

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select your project `widmediaagency`
3. Go to **SQL** (left menu or search "Cloud SQL")
4. Click **+ Create Instance** → Choose **PostgreSQL**
5. Set:
   - Instance ID: `whodesir-media-db`
   - Password: (save this — you'll need it)
   - Region: `us-central1` (or closest to you)
   - Edition: **Enterprise**
   - Machine type: **db-f1-micro** (free tier eligible)
6. Click **Create Instance** (takes 2-5 minutes)
7. Once ready, go to **Databases** tab → Click **Create Database**
   - Database name: `whodesir_media`
8. Go to **Users** tab → Make sure `postgres` user exists with the password you set
9. Go to **Overview** → Copy the **Connection name** (looks like: `widmediaagency:us-central1:whodesir-media-db`)

---

## Step 2: Set Firebase Environment Variables

Run these commands from the project directory:

```bash
# Login to Firebase
npx firebase-tools login

# Set environment variables
npx firebase-tools secrets:set DATABASE_URL "postgresql://postgres:YOUR_PASSWORD@//cloudsql/widmediaagency:us-central1:whodesir-media-db:whodesir_media"
npx firebase-tools secrets:set NEXTAUTH_SECRET "whodesir-media-prod-secret-$(openssl rand -hex 16)"
npx firebase-tools secrets:set NEXTAUTH_URL "https://widmediaagency.web.app"
```

Replace `YOUR_PASSWORD` with your Cloud SQL password.

---

## Step 3: Enable Firebase App Hosting

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select project `widmediaagency`
3. Go to **Hosting** (left menu)
4. Click **Get started** if prompted
5. Go to **App Hosting** (left menu)
6. Click **Create backend**
7. Choose **Import an existing project** → Select this project directory
8. Or deploy via CLI (Step 4)

---

## Step 4: Deploy

```bash
# From project directory
cd "/Users/jeanfils/Desktop/vibe-coding/Vibe Coding Mastery/whoisdesir-media"

# Generate Prisma client for PostgreSQL
npx prisma generate

# Login to Firebase (if not already)
npx firebase-tools login

# Deploy to Firebase App Hosting
npx firebase-tools deploy
```

---

## Step 5: Seed the Production Database

After first deploy, seed the database:

```bash
# Set DATABASE_URL locally to point to Cloud SQL
# Then run seed
npx tsx prisma/seed.ts
```

Or create a seed script that runs on first deploy.

---

## Step 6: Access Your Live App

Once deployed, your app will be available at:
- **Firebase URL**: `https://widmediaagency.web.app`
- **Custom domain** (optional): Configure in Firebase Hosting settings

---

## Important Notes

1. **SQLite → PostgreSQL**: The schema is now PostgreSQL. Local dev needs PostgreSQL too.
   - Install PostgreSQL locally: `brew install postgresql@16 && brew services start postgresql@16`
   - Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:16`

2. **Local Development**: Update `.env` with your local PostgreSQL URL:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/whodesir_media"
   ```

3. **Seed after schema changes**: Always run `npx prisma db push` after schema changes.

4. **Secrets**: Never commit `.env.production` or actual passwords to git.

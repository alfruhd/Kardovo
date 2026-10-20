# Deployment Guide: Luxury Web Invitations (Vercel + Supabase)

This guide walks through deploying the Luxury Web Invitation platform to production using **Vercel** for hosting the Next.js application and **Supabase** for the backend database, storage, authentication, and Row Level Security (RLS).

---

## 1. Prerequisites

- A [Vercel](https://vercel.com) account.
- A [Supabase](https://supabase.com) account and active project.
- A custom domain (optional, e.g., `invitations.yourdomain.com`).

---

## 2. Supabase Backend Setup

### 2.1 Database Migrations
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Run the migration file located at [`supabase/migrations/001_init.sql`](./supabase/migrations/001_init.sql).
3. Verify that the following tables exist with Row Level Security (RLS) enabled:
   - `invitations`
   - `rsvp_responses`
   - `assets`
   - `guests`
   - `invitation_versions`

### 2.2 Storage Buckets
1. In the Supabase Dashboard, navigate to **Storage**.
2. Ensure the public bucket `invitation-assets` exists:
   - Make the bucket **Public**.
   - Allowed MIME types: `image/*`, `video/*`, `audio/*`, `font/*`.
   - File size limits: 50MB (video), 15MB (audio), 10MB (images/fonts).

### 2.3 Supabase API Keys
Obtain the following credentials from **Project Settings -> API**:
- **Project URL** (`https://[PROJECT_ID].supabase.co`)
- **Anon Public Key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **Service Role Secret Key** (`SUPABASE_SERVICE_ROLE_KEY`)

---

## 3. Environment Variables Configuration

Configure the following environment variables in your Vercel Project Settings (**Settings -> Environment Variables**):

| Variable Name | Environment | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Public client anon key for queries & auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Secret service key for admin migrations/seeds |
| `NEXT_PUBLIC_APP_URL` | Production, Preview | Fully qualified URL (e.g., `https://yourdomain.com`) |

---

## 4. Vercel Project Deployment

### 4.1 Git Repository Integration
1. Push your repository to GitHub / GitLab / Bitbucket.
2. In Vercel, click **Add New -> Project** and import the repository.
3. Configure the build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 4.2 Deploy
1. Click **Deploy**.
2. Vercel will build the application, optimize serverless functions, compile the dynamic OpenGraph Edge route (`/api/og`), and assign a production URL.

---

## 5. Custom Domain Configuration

To connect a custom domain or subdomain (e.g. `wedding.example.com` or `example.com`):

1. In Vercel, navigate to **Settings -> Domains**.
2. Enter your custom domain and click **Add**.
3. Update your DNS records with your registrar:
   - **For Apex Domain (`example.com`)**:
     - Type: `A`
     - Name: `@`
     - Value: `76.76.21.21`
   - **For Subdomain (`invite.example.com`)**:
     - Type: `CNAME`
     - Name: `invite`
     - Value: `cname.vercel-dns.com.`
4. Wait for SSL certificate generation (usually < 2 minutes).

---

## 6. Post-Deployment Verification

1. **Seed Reference Template**:
   Run the seed script against your remote Supabase instance:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
   npx ts-node scripts/seed.ts
   ```
2. **Verify Public Route**:
   Visit `https://yourdomain.com/thesacredgarden`.
   - Verify wax seal tap opens the gate.
   - Verify background audio starts seamlessly on tap.
   - Test RSVP submission and confirm data appears in `/dashboard`.
3. **Verify Social Previews (OpenGraph)**:
   - Test via WhatsApp, iMessage, or Twitter Card Validator.
   - Confirm dynamic OG cards generate with couple names and wax seal graphic at `https://yourdomain.com/api/og?slug=thesacredgarden`.

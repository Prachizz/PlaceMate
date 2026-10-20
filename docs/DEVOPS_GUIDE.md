# PlaceMate: Complete DevOps & Deployment Engineering Guide

This guide provides end-to-end instructions for running, configuring, testing, and deploying **PlaceMate** locally on Windows PowerShell and across cloud infrastructure (Neon, Vercel, GitHub Actions, and Grafana Cloud).

---

## 1. Local Setup on Windows (PowerShell)

### Prerequisites
- **Node.js:** v20.x or v22+ (tested on Node v24.12.0)
- **Git:** 2.40+
- **PowerShell:** 5.1 or PowerShell Core 7+

### Step-by-Step Execution Commands

```powershell
# 1. Navigate to the project directory
Set-Location "C:\Users\Prachi\Projects\PlaceMate"

# 2. Check Node and npm versions
node -v
npm -v

# 3. Create local environment configuration from template
Copy-Item .env.example .env.local

# 4. Install dependencies deterministically
npm ci

# 5. Generate Prisma Client bindings
npx prisma generate

# 6. Execute automated code quality checks
npm run lint
npm run typecheck

# 7. Execute automated Vitest test suite
npm run test

# 8. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 2. Database Setup: Neon Serverless PostgreSQL

### Step 1: Create a Free Neon Database
1. Go to [https://console.neon.tech/](https://console.neon.tech/) and sign in.
2. Click **Create Project** -> Name it `placemate-db` -> Region: choose closest to your users (e.g., `AWS us-east-2` or `ap-southeast-1`).
3. Neon will present your connection string in the dashboard:
   ```text
   postgresql://placemate_owner:YOUR_PASSWORD@ep-random-123456.us-east-2.aws.neon.tech/placemate?sslmode=require
   ```

### Step 2: Configure Environment Variables
Open your `.env.local` (and later Vercel project environment variables) and set:
```ini
DATABASE_URL="postgresql://placemate_owner:YOUR_PASSWORD@ep-random-123456.us-east-2.aws.neon.tech/placemate?sslmode=require"
JWT_SECRET="your_custom_32_character_super_secure_jwt_secret"
```

### Step 3: Push Schema & Seed Initial Records
```powershell
# Push the Prisma schema directly to Neon
npx prisma db push

# Seed the database with campus demo accounts (Admin, Recruiters, Students, Jobs)
node scripts/seed.mjs
```

---

## 3. GitHub Actions CI/CD Setup

### Pipeline Files
- **CI Workflow:** `.github/workflows/placemate-ci.yml` (Runs on PRs and feature pushes)
- **CD Workflow:** `.github/workflows/placemate-cd.yml` (Deploys to Vercel on push to `main`)

### Adding Repository Secrets in GitHub
In your GitHub repository, navigate to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**:

| Secret Name | Description | Example / Source |
|---|---|---|
| `VERCEL_TOKEN` | Personal Access Token from Vercel Account Settings | `vercel.com/account/tokens` |
| `VERCEL_ORG_ID` | Vercel Team/User ID | Found in `.vercel/project.json` or project settings |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Found in `.vercel/project.json` or project settings |
| `DATABASE_URL` | Neon PostgreSQL pooled connection string | Neon Dashboard |
| `JWT_SECRET` | Secret key for JWT cookie signing (>= 32 chars) | Any secure string |

---

## 4. Vercel Production Deployment

### Option A: Automatic Git Integration (Recommended for Viva)
1. Push your repository to GitHub.
2. In Vercel ([vercel.com](https://vercel.com)), click **Add New...** -> **Project**.
3. Import your `PlaceMate` repository.
4. Set Framework Preset: **Next.js**.
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `JWT_SECRET`: 32+ character signing key.
6. Click **Deploy**. Vercel will build and assign a production URL (e.g. `https://placemate.vercel.app`).

### Option B: Controlled CLI Deployment via GitHub Actions
Run the Vercel linkage locally once to generate project IDs:
```powershell
# Install Vercel CLI globally
npm install -g vercel

# Link project to Vercel
vercel link
```
The generated `.vercel/project.json` contains `orgId` and `projectId`, which you copy to your GitHub Repository Secrets.

---

## 5. Grafana Cloud Telemetry & Observability

### Understanding Serverless Monitoring
In standard serverless runtime (Vercel / AWS Lambda), the runtime scales to zero when idle, meaning there is no persistent port for an internal Prometheus scraper to dial.

### Configuration
1. **Public Prometheus Endpoint:** PlaceMate exposes `/api/metrics` adhering to OpenMetrics / Prometheus text standard.
2. **Grafana Synthetic Monitoring:**
   - In Grafana Cloud, navigate to **Testing & Synthetics** -> **Synthetic Monitoring**.
   - Click **Add Check** -> **HTTP**.
   - URL: `https://<your-vercel-domain>/api/metrics`.
   - Frequency: `30s` (pings the endpoint, ingests metrics, and keeps functions responsive).
3. **Import Dashboard:**
   - In Grafana Cloud, click **Dashboards** -> **New** -> **Import**.
   - Upload `grafana/dashboard.json` from the PlaceMate repository.
   - Select your default Prometheus data source.
   - Click **Import**.

The imported dashboard monitors:
- HTTP Request Rate by status group (`2xx`, `4xx`, `5xx`)
- Active error percentage
- Request duration latency (p50, p95, average)
- Business KPIs: Total registered students, active placement drives, total applications submitted, and campus placement rate (%)
- V8 heap memory usage

---

## 6. Comprehensive Troubleshooting Guide

### Issue 1: `DATABASE_URL` Connection Timeout or SSL Error
- **Symptom:** `Can't reach database server at ...` or `SSL connection required`.
- **Cause:** Neon requires SSL mode.
- **Fix:** Ensure `?sslmode=require` is appended to the connection string. If using pooled connection, ensure you are connecting to `-pooler` hostname or port `6543`.

### Issue 2: PowerShell Script Execution Policy Error
- **Symptom:** `... cannot be loaded because running scripts is disabled on this system.`
- **Fix:** In PowerShell as Administrator, execute:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### Issue 3: JWT Verification Fails After Server Restart
- **Symptom:** Session is lost or returns HTTP 401.
- **Cause:** If `JWT_SECRET` was not provided in `.env.local`, a dynamic fallback secret is used which resets on reload.
- **Fix:** Define an explicit `JWT_SECRET` in `.env.local` and `.env.production`.

### Issue 4: Duplicate Application Submission
- **Symptom:** HTTP 409 Conflict.
- **Explanation:** This is by design! PlaceMate strictly enforces single application per student per job posting at both the database level (`@@unique([studentId, jobId])`) and application level.

### Issue 5: Port 3000 Already in Use
- **Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`.
- **Fix:** Find and terminate the blocking process or start Next.js on port 3001:
  ```powershell
  # Find process using port 3000
  Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

  # Or run on alternate port
  npx next dev -p 3001
  ```

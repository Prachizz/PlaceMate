# PlaceMate — Full-Stack Campus Placement Portal with DevOps

[![PlaceMate CI](https://github.com/placeholder-org/placemate/actions/workflows/placemate-ci.yml/badge.svg)](https://github.com)
[![PlaceMate CD](https://github.com/placeholder-org/placemate/actions/workflows/placemate-cd.yml/badge.svg)](https://github.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat&logo=postgresql)](https://neon.tech)
[![Prisma ORM](https://img.shields.io/badge/Prisma-v6.6-2D3748?style=flat&logo=prisma)](https://prisma.io)
[![Vitest](https://img.shields.io/badge/Vitest-20_Passed-6E9F18?style=flat&logo=vitest)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**PlaceMate** is a production-grade, full-stack campus placement management platform built with Next.js 15, TypeScript, Tailwind CSS, PostgreSQL (Neon), and Prisma ORM. Designed for university Training and Placement Cells (TPO), PlaceMate automates the end-to-end placement workflow—from multi-criteria student eligibility verification and application tracking to corporate recruiter candidate pipelines and real-time observability telemetry.

---

## 📑 Quick Navigation & Documentation

- [System Architecture & Specifications](docs/ARCHITECTURE.md)
- [DevOps, CI/CD, Neon & Cloud Setup Guide](docs/DEVOPS_GUIDE.md)
- [30 Comprehensive Viva Questions with Answers](docs/VIVA_QUESTIONS.md)
- [Grafana Cloud Observability & Dashboard](grafana/README.md)

---

## 🌟 Key Application Roles & Functionality

### 1. 🎓 Student Portal
- **Secure Authentication:** Register and authenticate via salted bcrypt password hashing and JWT sessions stored in `HttpOnly` cookies.
- **Academic & Placement Profile:** Maintain verified branch, graduation year (e.g. 2026), CGPA (out of 10.0), active backlogs, skills tags, phone number, and resume document URL.
- **Automated Eligibility Engine:** Browse placement opportunities with dynamic, client-and-server evaluated eligibility badges (`Eligible` vs. `Ineligible`).
- **Explainability Modal ("Why Ineligible?"):** Transparent breakdown of every criteria (Branch Match, CGPA cutoff, Active Backlogs limit, Batch year, and Deadline status) explaining why a candidate qualifies or fails.
- **Application Pipeline Tracker:** Step-by-step visual tracker for application statuses: `APPLIED` → `SHORTLISTED` → `INTERVIEW` → `SELECTED` (or `REJECTED`).
- **Duplicate Prevention:** Strict server-side and database-level (`@@unique([studentId, jobId])`) prevention of duplicate submissions.

### 2. 💼 Corporate Recruiter Portal
- **Company Profile Management:** Configure company overview, industry sector, website, and campus hiring philosophy.
- **Job Drive Management:** Create, modify, and close placement drives. Specify eligible engineering branches, minimum CGPA cutoff, maximum active backlogs, graduation batch, and application deadlines.
- **Candidate Review Pipeline:** Filter applicants by status, branch, or CGPA. Review candidate skills, academic scores, and resumes.
- **Status Transitions & Feedback:** Move candidates across hiring stages (`SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`) with recruiter feedback and strict ownership authorization checks.

### 3. 🛡️ Training & Placement Officer (TPO Administrator)
- **Platform Analytics & KPIs:** Track total registered students, active placement drives, total submissions, and live placement conversion percentage.
- **Branch-wise Distribution:** Real-time progress bars showing placement conversion per department (Computer Engineering, IT, ENTC, Mechanical, Civil).
- **Application Status Funnel:** Instant breakdown of candidates across each recruitment phase.
- **User & Drive Moderation:** Platform-wide oversight of students, corporate recruiters, and active drives.

---

## 🛠️ Technical Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Full-stack React Server Components and Route Handlers |
| **Language** | TypeScript 5.6 | Strict compile-time type safety across frontend and API |
| **Styling** | Tailwind CSS v4 & Lucide Icons | Responsive, accessible dark-themed campus portal |
| **Database** | PostgreSQL hosted on Neon | Serverless SQL with autoscaling and connection pooling |
| **ORM** | Prisma ORM 6.x | Schema management, typed queries, and automated migrations |
| **Authentication** | JWT (`jsonwebtoken`) & `bcryptjs` | Stateless session authentication with HttpOnly cookies |
| **Validation** | Zod 3.x | Schema validation on API inputs and form submissions |
| **Testing** | Vitest 5.x & React Testing Library | Fast unit and integration tests (20/20 passing) |
| **DevOps CI/CD** | GitHub Actions | Automated linting, typechecking, testing, and production builds |
| **Deployment** | Vercel Serverless | Production hosting with automated preview and edge distribution |
| **Telemetry** | OpenMetrics & Grafana Cloud | `/api/metrics` Prometheus exposition and Grafana dashboards |

---

## ⚡ Quick Start: Windows PowerShell Setup

Run the following commands in Windows PowerShell:

```powershell
# 1. Clone or navigate to the repository
Set-Location "C:\Users\Prachi\Projects\PlaceMate"

# 2. Copy the environment template
Copy-Item .env.example .env.local

# 3. Install dependencies reproducibly
npm ci

# 4. Generate Prisma client
npx prisma generate

# 5. Run automated test suite
npm run test

# 6. Verify production build
npm run build

# 7. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Configured Viva Demo Accounts

For your college faculty demonstration, PlaceMate includes pre-seeded demo accounts with one-click switching buttons in the top navbar:

| Role | Name | Email | Password | Academic / Company Profile |
|---|---|---|---|---|
| **Student** | Prachi Sonawane | `prachi@pccoepune.org` | `Password@123` | Computer Eng, 2026 Batch, CGPA 8.85, 0 Backlogs |
| **Student** | Rahul Verma | `rahul@pccoepune.org` | `Password@123` | Mechanical Eng, 2026 Batch, CGPA 6.90, 1 Backlog |
| **Recruiter** | Priya Nair | `recruiter@google.com` | `Password@123` | Google India (Cloud & SDE Hiring) |
| **Recruiter** | Amit Deshmukh | `recruiter@microsoft.com` | `Password@123` | Microsoft IDC (Cloud & DevOps Hiring) |
| **TPO Admin** | Prof. Suresh Sharma | `admin@placemate.edu` | `Password@123` | Platform Administrator / Head TPO |

---

## 🧪 Automated Test Suite (20 Tests Passing)

PlaceMate includes a comprehensive Vitest automated test suite running in 1.5 seconds:

```text
 ✓ tests/eligibility.test.ts (7 tests)
   ✓ marks fully qualified student as eligible with all criteria passed
   ✓ marks student ineligible if CGPA is below threshold
   ✓ marks student ineligible if active backlogs exceed maximum allowed
   ✓ marks student ineligible if branch does not match allowed branches
   ✓ marks student ineligible if graduation batch year differs
   ✓ marks opening ineligible if application deadline has passed
   ✓ marks opening ineligible if job status is CLOSED

 ✓ tests/applications.test.ts (6 tests)
   ✓ rejects application submission if candidate is not authenticated
   ✓ prevents duplicate applications for the same job and candidate
   ✓ rejects application if student fails server-side eligibility checks
   ✓ allows eligible student to apply successfully
   ✓ allows recruiter to update application status with authorization check
   ✓ prevents recruiter from updating application of another company

 ✓ tests/auth.test.ts (3 tests)
   ✓ hashes password and verifies match correctly
   ✓ signs and verifies JWT token with user claims
   ✓ rejects invalid or tampered JWT tokens gracefully

 ✓ tests/api.test.ts (4 tests)
   ✓ GET /api/health returns operational status and database engine info
   ✓ GET /api/metrics returns Prometheus/OpenMetrics text exposition
   ✓ GET /api/jobs returns active campus placement drives
   ✓ GET /api/admin/stats returns platform KPIs and branch-wise breakdown

 Test Files  4 passed (4)
      Tests  20 passed (20)
```

Run tests locally with:
```powershell
npm run test
```

---

## 📊 Live Observability & Telemetry

PlaceMate exposes production health and Prometheus/OpenMetrics telemetry:
- **Health Check Endpoint:** [`/api/health`](http://localhost:3000/api/health)
  - Returns JSON payload with uptime, memory heap usage, database status, and business KPIs.
- **Prometheus Metrics Endpoint:** [`/api/metrics`](http://localhost:3000/api/metrics)
  - Returns standard OpenMetrics text for scraping by Grafana Cloud Synthetic Monitoring or Prometheus agents.
- **Prebuilt Dashboard:** `grafana/dashboard.json` ready for one-click import into Grafana Cloud.

---

## 📂 Project Directory Structure

```text
PlaceMate/
├── .github/
│   └── workflows/
│       ├── placemate-ci.yml        # CI: Lint, Typecheck, Vitest, Build verification
│       └── placemate-cd.yml        # CD: Automated deployment to Vercel Production
├── app/
│   ├── api/
│   │   ├── admin/stats/route.ts   # Platform KPIs & branch analytics
│   │   ├── applications/          # Application submission & recruiter review
│   │   ├── auth/                  # Login, Register, Logout, Me endpoints
│   │   ├── health/route.ts        # Service operational health check
│   │   ├── jobs/                  # Placement drives CRUD & eligibility
│   │   ├── metrics/route.ts       # OpenMetrics / Prometheus exposition
│   │   └── profile/route.ts       # Student & Recruiter profile updates
│   ├── globals.css                # Global styles & Tailwind utilities
│   ├── layout.tsx                 # Root HTML & metadata layout
│   └── page.tsx                   # Main portal interface (Tabs & Modals)
├── components/
│   ├── AdminAnalyticsDashboard.tsx# TPO Analytics, branch charts & funnel
│   ├── ApplicationTracker.tsx     # Student visual stage tracker
│   ├── AuthModal.tsx              # Sign In & Registration dialog
│   ├── CandidateReviewCard.tsx    # Recruiter candidate review card
│   ├── CreateJobModal.tsx         # Job creation form with criteria gates
│   ├── EditJobModal.tsx           # Drive criteria editor & delete dialog
│   ├── EligibilityModal.tsx       # "Why Ineligible?" criteria breakdown
│   ├── Navbar.tsx                 # Navigation bar & demo role switcher
│   └── ProfileManager.tsx         # Academic & corporate profile manager
├── docs/
│   ├── ARCHITECTURE.md            # Architecture diagrams & security specs
│   ├── DEVOPS_GUIDE.md            # Windows PowerShell, Neon & Vercel guide
│   └── VIVA_QUESTIONS.md          # 30 Comprehensive Viva Questions & Answers
├── grafana/
│   ├── dashboard.json             # Importable Grafana Cloud dashboard JSON
│   └── README.md                  # Telemetry ingestion instructions
├── lib/
│   ├── auth.ts                    # JWT signing, verification & bcrypt hashing
│   ├── db.ts                      # Prisma client singleton & test data store
│   ├── eligibility.ts             # Automated Eligibility Engine algorithms
│   ├── telemetry.ts               # Serverless telemetry & Prometheus exporter
│   └── types.ts                   # Core TypeScript type definitions
├── prisma/
│   └── schema.prisma              # PostgreSQL schema with constraints & indexes
├── scripts/
│   └── seed.mjs                   # Database seeding script for demo data
├── tests/
│   ├── api.test.ts                # API integration test suite
│   ├── applications.test.ts       # Access control & duplicate check tests
│   ├── auth.test.ts               # Cryptography & JWT token tests
│   ├── eligibility.test.ts        # Eligibility criteria evaluation tests
│   └── setup.ts                   # Vitest environment setup
├── .env.example                   # Environment variable template
├── package.json                   # Dependencies, scripts & overrides
├── vercel.json                    # Vercel security headers & API CORS
└── vitest.config.mts              # Vitest test runner configuration
```

---

## 📜 Academic Viva Defense Summary

When demonstrating PlaceMate to your college faculty:
1. **Show the 3 Roles:** Use the navbar demo switcher to switch between Student, Recruiter, and TPO Admin.
2. **Demonstrate Dynamic Eligibility:**
   - As Student (Prachi), open the Google SDE drive → Shows **Eligible** (CGPA 8.85 >= 8.0, 0 Backlogs).
   - Go to **Profile**, change CGPA to `6.5` or Backlogs to `2`, and save.
   - Return to **Drives** → Card instantly switches to **Ineligible**. Click "Why Ineligible?" to display the exact failed criteria.
3. **Demonstrate Duplicate Application Prevention:** Try applying twice for the same drive. The portal prevents it at the UI, API, and database level (`@@unique([studentId, jobId])`).
4. **Demonstrate Recruiter Candidate Review:** Switch to Recruiter, go to **Applicants**, filter by status, review Prachi's skills/resume, and update her status to `INTERVIEW` or `SELECTED` with custom feedback.
5. **Show Live Telemetry:** Open `/api/health` and `/api/metrics` in the browser to show real-time Prometheus metrics.
6. **Explain DevOps:** Point to `.github/workflows/` and describe how automated CI runs on every push and PR to ensure zero broken builds reach production.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

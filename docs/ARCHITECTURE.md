# PlaceMate: System Architecture & Technical Specifications

This document details the architectural design, entity relationships, security controls, and DevOps pipelines of **PlaceMate — Full-Stack Campus Placement Portal with DevOps**.

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients["Client Layer"]
        StudentUI["Student Portal (App / Next.js)"]
        RecruiterUI["Recruiter Dashboard"]
        AdminUI["TPO Administration & Analytics"]
    end

    subgraph CDN["Edge & Security Layer (Vercel Edge Network)"]
        EdgeRouter["Vercel Edge Gateway / DNS / SSL"]
        SecurityHeaders["Security Headers (CSP, X-Frame-Options, HSTS)"]
    end

    subgraph Compute["Application Serverless Layer (Next.js 15)"]
        direction TB
        AppRouter["Next.js App Router (React Server / Client Components)"]
        AuthMiddleware["JWT Authentication & RBAC Middleware"]
        EligibilityEngine["Automated Eligibility Engine (lib/eligibility.ts)"]
        TelemetryService["Serverless Telemetry Collector (lib/telemetry.ts)"]
        APIRoutes["REST API Endpoints (/api/jobs, /api/applications, /api/auth)"]
    end

    subgraph Storage["Database & Persistence Layer"]
        PrismaORM["Prisma Client ORM (v6.x)"]
        PgBouncer["Neon Connection Pooler (PgBouncer)"]
        NeonDB[("Neon Serverless PostgreSQL Database")]
    end

    subgraph Observability["DevOps & Observability Layer"]
        PromMetrics["/api/metrics (OpenMetrics / Prometheus format)"]
        GrafanaCloud["Grafana Cloud / Synthetic Probes / OTLP"]
        GitHubActions["GitHub Actions CI/CD Pipeline"]
    end

    Clients --> EdgeRouter
    EdgeRouter --> SecurityHeaders
    SecurityHeaders --> AppRouter
    AppRouter --> AuthMiddleware
    AuthMiddleware --> APIRoutes
    APIRoutes --> EligibilityEngine
    APIRoutes --> TelemetryService
    APIRoutes --> PrismaORM
    PrismaORM --> PgBouncer
    PgBouncer --> NeonDB

    TelemetryService --> PromMetrics
    PromMetrics --> GrafanaCloud
    GitHubActions --> Compute
```

---

## 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o| StudentProfile : "has (Role: STUDENT)"
    User ||--o| RecruiterProfile : "has (Role: RECRUITER)"
    RecruiterProfile ||--o{ JobPosting : "publishes"
    JobPosting ||--o{ JobApplication : "receives"
    StudentProfile ||--o{ JobApplication : "submits"

    User {
        string id PK "cuid()"
        string name "Full Name"
        string email UK "Unique indexed email"
        string password "bcrypt hash (10 rounds)"
        enum role "STUDENT | RECRUITER | ADMIN"
        datetime createdAt
        datetime updatedAt
    }

    StudentProfile {
        string id PK "cuid()"
        string userId FK "References User.id"
        string branch "Computer Engineering, IT, etc."
        int graduationYear "Batch 2026"
        float cgpa "0.00 to 10.00"
        int backlogs "Active backlog count"
        string skills "Comma-separated skills"
        string resumeUrl "Verified PDF link"
        string phone "Contact number"
        datetime createdAt
    }

    RecruiterProfile {
        string id PK "cuid()"
        string userId FK "References User.id"
        string companyName "Google India, etc."
        string industry "IT, Cloud, etc."
        string website "Company careers portal"
        string description "Overview"
        datetime createdAt
    }

    JobPosting {
        string id PK "cuid()"
        string recruiterId FK "References RecruiterProfile.id"
        string title "Software Development Engineer"
        string role "SDE / DevOps / Analyst"
        string description "Drive requirements"
        string location "Job location"
        string salaryPackage "24 LPA"
        float minCgpa "Minimum cutoff (e.g. 7.5)"
        int maxBacklogs "Allowed backlogs (e.g. 0)"
        string eligibleBranches "CE, IT, DS"
        int eligibleBatch "2026"
        datetime deadline "Cutoff timestamp"
        enum status "OPEN | CLOSED | ARCHIVED"
        datetime createdAt
    }

    JobApplication {
        string id PK "cuid()"
        string studentId FK "References StudentProfile.id"
        string jobId FK "References JobPosting.id"
        enum status "APPLIED | SHORTLISTED | INTERVIEW | SELECTED | REJECTED"
        string feedback "Recruiter evaluation feedback"
        datetime appliedAt
        datetime updatedAt
    }
```

---

## 3. Student Application & Server-Side Eligibility Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Candidate
    participant UI as PlaceMate UI (Next.js)
    participant API as /api/applications (Route Handler)
    participant Auth as Auth & RBAC (JWT)
    participant Engine as Eligibility Engine
    participant DB as Neon PostgreSQL (Prisma)
    participant Telemetry as Telemetry Collector

    Student->>UI: Clicks "Review & Apply" on Job Card
    UI->>UI: Displays Eligibility Breakdown Modal
    Student->>UI: Confirms Application Submission
    UI->>API: POST /api/applications { jobId } (with HttpOnly Cookie)
    API->>Auth: Verify JWT cookie & extract userId
    alt Token Missing or Invalid
        Auth-->>UI: 401 Unauthorized
    else Valid Token
        Auth->>API: SessionUser (role: STUDENT)
        API->>DB: Fetch StudentProfile & JobPosting
        API->>DB: Query existing JobApplication (studentId + jobId)
        alt Duplicate Application Found
            API-->>UI: 409 Conflict (Duplicate Prevented)
        else No Duplicate
            API->>Engine: evaluateEligibility(studentProfile, jobPosting)
            alt Ineligible (CGPA/Branch/Backlogs/Deadline fail)
                Engine-->>API: { isEligible: false, summary, criteria }
                API-->>UI: 403 Forbidden with exact rejection reasons
            else Fully Eligible
                Engine-->>API: { isEligible: true, criteria }
                API->>DB: INSERT INTO JobApplication (status: "APPLIED")
                API->>Telemetry: recordRequest("POST", "/api/applications", 201, duration)
                API-->>UI: 201 Created { success: true, application }
                UI->>Student: Toast: "Application Submitted! Recruiter notified."
            end
        end
    end
```

---

## 4. Automated CI/CD Deployment Flow

```mermaid
flowchart LR
    subgraph Developer["Engineering Workstation"]
        GitCommit["git commit -m 'feat: ...'"]
        GitPush["git push origin main"]
    end

    subgraph GitHub["GitHub Actions CI/CD"]
        direction TB
        Trigger["Webhook: Push on main"]
        Install["Step 1: npm ci & prisma generate"]
        Lint["Step 2: ESLint checks"]
        Typecheck["Step 3: TypeScript tsc --noEmit"]
        Tests["Step 4: Vitest Automated Tests (20/20)"]
        Build["Step 5: Next.js Production Compilation"]
        VercelDeploy["Step 6: Vercel CLI Atomic Deploy"]
    end

    subgraph Production["Production Cloud"]
        VercelLive["Vercel Production URL"]
        NeonProd["Neon Serverless PostgreSQL"]
        GrafanaLive["Grafana Cloud Observability"]
    end

    GitCommit --> GitPush
    GitPush --> Trigger
    Trigger --> Install
    Install --> Lint
    Lint --> Typecheck
    Typecheck --> Tests
    Tests --> Build
    Build --> VercelDeploy
    VercelDeploy --> VercelLive
    VercelLive <--> NeonProd
    VercelLive --> GrafanaLive
```

---

## 5. Security Architecture & Threat Mitigation

| Threat Vector | Mitigation in PlaceMate |
|---|---|
| **SQL Injection** | Prisma ORM parameterizes all queries and prepared statements; zero string concatenation. |
| **Cross-Site Scripting (XSS)** | JWT tokens stored exclusively in `HttpOnly` cookies, preventing client JS access. React escapes output by default. |
| **Cross-Site Request Forgery (CSRF)** | Cookies configured with `SameSite=Lax`. API routes require standard JSON payloads with Content-Type checks. |
| **Client-Side State Tampering** | Eligibility rules and candidate qualification records are strictly re-verified on the server inside Route Handlers. |
| **Unauthorized Status Updates** | Recruiter status modifications verify company ownership: `job.recruiterId === user.recruiterProfileId` or platform `ADMIN`. |
| **Duplicate Applications** | Enforced at the database layer via composite `@@unique([studentId, jobId])` constraint and pre-flight application checks. |

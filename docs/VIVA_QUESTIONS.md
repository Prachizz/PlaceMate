# PlaceMate: Comprehensive Viva Questions & Technical Answers
### Prepared for College Faculty Evaluation & Final-Year Placement Defense

This document provides **30 in-depth viva questions** spanning Full-Stack Web Architecture, Database Systems, Security, Automated DevOps (CI/CD), Serverless Telemetry, and Cloud Deployment.

---

## Part 1: Full-Stack Architecture & Next.js 15

### Q1. Why did you choose Next.js App Router for PlaceMate instead of a traditional separate React SPA + Express.js backend?
**Answer:**
Next.js App Router unifies full-stack development within a single type-safe repository using React Server Components (RSC) and Route Handlers (`app/api/`). Key advantages include:
1. **Server-Side Validation & Security:** Crucial eligibility verification and database queries run strictly server-side, eliminating exposure of backend business logic and database credentials to client bundles.
2. **Reduced Network Hops & Colocation:** APIs and UI share TypeScript interfaces and Zod schemas, preventing contract drift between frontend and backend.
3. **Optimized Bundle Size:** Server-rendered components ship zero client-side JavaScript, improving Initial Server Response and Core Web Vitals.
4. **Serverless Portability:** Next.js Route Handlers naturally compile to serverless edge or regional Lambda functions on Vercel without requiring a dedicated persistent Node.js process.

### Q2. What is the difference between Server Components and Client Components in PlaceMate?
**Answer:**
- **Server Components (Default):** Executed purely on the server. They have direct access to backend resources (database, filesystem, secrets) and emit static HTML/JSON to the browser with zero client JavaScript.
- **Client Components (`'use client'`):** Hydrated on the browser to provide interactivity, reactive state (`useState`, `useEffect`), event listeners, and browser APIs (such as modals, role switches, and dynamic search inputs).
In PlaceMate, interactive dashboard tabs, eligibility dialogs, and forms use `'use client'`, while API endpoints and static layout boundaries execute strictly on the server.

### Q3. How does PlaceMate handle State Management without Redux or external state libraries?
**Answer:**
PlaceMate uses React's native state primitives (`useState`, `useCallback`, `useEffect`) combined with optimistic state updates and centralized server-state synchronization (`fetchData`). For a specialized platform like a campus portal, native hooks avoid bundle bloat and unnecessary boilerplate while maintaining responsive UI updates when students apply or recruiters update applicant statuses.

---

## Part 2: Database Design, PostgreSQL & Prisma ORM

### Q4. Explain the PlaceMate database schema and entity relationships.
**Answer:**
PlaceMate models campus recruitment using 5 core entities:
1. **User:** Central identity entity storing `email`, `password` (bcrypt hash), and `Role` (`STUDENT`, `RECRUITER`, `ADMIN`).
2. **StudentProfile (1-to-1 with User):** Stores academic attributes—`branch`, `graduationYear`, `cgpa`, `backlogs`, `skills`, `resumeUrl`, and `phone`.
3. **RecruiterProfile (1-to-1 with User):** Stores organizational information—`companyName`, `industry`, `website`, and `description`.
4. **JobPosting (1-to-many with RecruiterProfile):** Stores drive parameters—`title`, `salaryPackage`, `location`, `minCgpa`, `maxBacklogs`, `eligibleBranches`, `eligibleBatch`, `deadline`, and `status`.
5. **JobApplication (Many-to-Many junction between StudentProfile and JobPosting):** Captures application state (`APPLIED`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`), reviewer feedback, and timestamps.

### Q5. How does PlaceMate prevent duplicate applications at both the application and database levels?
**Answer:**
- **Database Level:** A composite unique constraint in Prisma schema:
  `@@unique([studentId, jobId])`
  This guarantees that PostgreSQL enforces uniqueness at the storage engine level, returning error `P2002` if concurrent requests attempt duplicate inserts.
- **Application Level:** The `POST /api/applications` route queries existing records before submission. If an application exists, it halts immediately with HTTP `409 Conflict`.
- **UI Level:** Job cards detect applied status and replace the "Apply" CTA with a badge displaying the current stage (e.g., `Applied (SHORTLISTED)`), disabling duplicate submission buttons.

### Q6. Why did you choose Neon Serverless PostgreSQL over a traditional containerized PostgreSQL instance?
**Answer:**
Neon PostgreSQL separates storage from compute:
1. **Autoscaling & Scale-to-Zero:** Compute instances automatically suspend when idle, minimizing cloud costs during inactivity.
2. **Built-in Connection Pooling:** Traditional PostgreSQL allocates a separate OS process per connection (~2-10 MB RAM each). Serverless functions (which spawn hundreds of short-lived instances) quickly exhaust connection limits. Neon provides built-in PgBouncer pooling via WebSockets or port 6543, handling thousands of concurrent serverless queries effortlessly.
3. **Instant Branching:** Neon allows creating instant, copy-on-write database branches for CI/CD test pipelines without copying gigabytes of storage.

### Q7. What are Prisma migrations and how does `prisma db push` differ from `prisma migrate dev`?
**Answer:**
- **`prisma migrate dev`:** Generates chronological SQL migration files (`migrations/YYYYMMDD_name/migration.sql`), tracks history in `_prisma_migrations`, and is recommended for regulated team workflows.
- **`prisma db push`:** Directly synchronizes the PostgreSQL schema with `schema.prisma` without generating migration files. It is faster for rapid prototyping and schema evolution during hackathons or lab sessions.
- In PlaceMate, `prisma generate` creates the strongly typed TypeScript client, ensuring autocomplete and compile-time query safety.

---

## Part 3: Automated Eligibility Engine & Business Logic

### Q8. How does PlaceMate’s Automated Eligibility Engine work?
**Answer:**
The eligibility engine (`lib/eligibility.ts`) executes a multi-dimensional rule evaluation algorithm comparing candidate attributes against job drive constraints:
1. **Branch Match:** Checks if candidate's branch matches the comma-separated or array whitelist (case-insensitive normalization, or wildcard `'ALL'`).
2. **CGPA Threshold:** Verifies `student.cgpa >= job.minCgpa`.
3. **Backlog Gate:** Ensures active backlogs do not exceed allowed limit: `student.backlogs <= job.maxBacklogs`.
4. **Graduation Batch:** Ensures candidate graduation year strictly equals `job.eligibleBatch`.
5. **Application Deadline:** Compares `new Date(job.deadline).getTime() >= Date.now()`.
6. **Drive Status:** Verifies `job.status === "OPEN"`.

The engine returns an atomic boolean `isEligible`, detailed pass/fail status for each criterion, and a human-readable summary explaining exactly why the student qualified or failed.

### Q9. Why must eligibility verification run on the server even if evaluated on the client?
**Answer:**
Client-side validation is purely for user experience (instant feedback and avoiding unnecessary HTTP round-trips). Client code can easily be bypassed using tools like Postman, curl, or browser DevTools. Therefore, `POST /api/applications` independently re-evaluates the full eligibility algorithm on the server before persisting the application record, rejecting ineligible requests with HTTP `403 Forbidden`.

### Q10. What design pattern does the Eligibility Engine implement?
**Answer:**
It implements the **Rules Engine / Specification Pattern**, where business constraints are isolated into discrete, testable rule objects (`EligibilityCriterionResult[]`). Each rule produces an independent boolean verdict and explanation, allowing easy extension (e.g., adding 10th/12th percentage gates or attendance criteria) without altering core workflow code.

---

## Part 4: Authentication, Security & Role-Based Access Control (RBAC)

### Q11. How is user authentication implemented in PlaceMate?
**Answer:**
PlaceMate uses secure, stateless **JWT (JSON Web Token)** authentication stored in **HttpOnly, SameSite=Lax** cookies:
1. **Password Hashing:** Passwords are salted and hashed using `bcryptjs` with 10 salt rounds before storage.
2. **Token Minting:** Upon successful login (`POST /api/auth/login`), a signed JWT is created containing user claims (`id`, `email`, `role`, profile references).
3. **Session Verification:** Route handlers verify the cookie token via `verifyToken(token)` or inspect `Authorization: Bearer <token>` headers.

### Q12. Why are HttpOnly cookies preferred over localStorage for storing JWTs?
**Answer:**
Tokens stored in `localStorage` can be accessed by any client-side JavaScript executing in the window, making them vulnerable to **Cross-Site Scripting (XSS)** attacks. HttpOnly cookies cannot be read by `document.cookie` in JavaScript; the browser automatically attaches them to HTTP requests, mitigating XSS token theft.

### Q13. How does PlaceMate enforce Role-Based Access Control (RBAC)?
**Answer:**
Access control is enforced both hierarchically and contextually:
- **Hierarchical RBAC:** Routes inspect `user.role`:
  - `POST /api/jobs`: Restricted to `RECRUITER` and `ADMIN`.
  - `POST /api/applications`: Restricted to `STUDENT`.
  - `GET /api/admin/stats`: Open to `ADMIN` (and system telemetry).
- **Contextual / Ownership Authorization:** A recruiter cannot modify or close job postings owned by another recruiter, nor can a recruiter update applicant status on other companies' drives (`job.recruiterId !== user.recruiterProfileId`). Only the drive owner or a platform `ADMIN` has modification rights.

### Q14. How does PlaceMate protect against SQL Injection?
**Answer:**
By using Prisma ORM. Prisma parameterizes all queries and uses prepared statements under the hood. User inputs are never concatenated directly into raw SQL strings, neutralizing SQL injection vectors.

---

## Part 5: DevOps, GitHub Actions CI/CD & Deployment

### Q15. Explain your GitHub Actions CI pipeline architecture (`placemate-ci.yml`).
**Answer:**
The CI workflow triggers on pull requests to `main` and pushes to feature branches. It executes a multi-stage validation matrix (Node 20.x and Node 22.x):
1. **Code Checkout:** Uses `actions/checkout@v4`.
2. **Deterministic Dependency Installation:** Runs `npm ci` (verifying `package-lock.json` lockfile integrity).
3. **Prisma Generation:** Generates the typed Prisma Client (`npx prisma generate`).
4. **Static Code Analysis:** Runs `npm run lint` (ESLint Next.js rules).
5. **Strict Type Safety:** Runs `npm run typecheck` (`tsc --noEmit`).
6. **Automated Unit & Integration Testing:** Executes Vitest (`npm run test:ci`).
7. **Production Build Gate:** Runs `npm run build`. If any step fails, the pull request cannot be merged.

### Q16. Why is `npm ci` preferred over `npm install` in automated CI/CD pipelines?
**Answer:**
`npm install` may update minor/patch dependencies dynamically and modify `package-lock.json`. Conversely, `npm ci` strictly adheres to `package-lock.json`, deletes existing `node_modules`, and throws an immediate error if there is any mismatch between `package.json` and the lockfile. This guarantees reproducible, deterministic pipeline builds across all developer environments.

### Q17. How does the Continuous Deployment (CD) workflow deploy to Vercel?
**Answer:**
The CD workflow (`placemate-cd.yml`) triggers automatically on push to the `main` branch:
1. It validates all quality gates (lint, typecheck, Vitest, build).
2. It installs the Vercel CLI.
3. It fetches production project configuration using repository secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).
4. It compiles production prebuilt artifacts (`vercel build --prod`).
5. It deploys the prebuilt build artifacts atomically (`vercel deploy --prebuilt --prod`).
6. Zero downtime deployment is achieved because traffic switches to the new deployment only after successful health checks.

### Q18. How are production secrets managed securely?
**Answer:**
1. Zero secrets are committed to Git. `.gitignore` explicitly ignores `.env`, `.env.local`, and build artifacts.
2. `.env.example` provides documentation templates with empty/mock values.
3. In GitHub Actions, secrets are injected via encrypted GitHub Repository Secrets (`VERCEL_TOKEN`, `DATABASE_URL`, `JWT_SECRET`).
4. In production, environment variables are securely injected via the Vercel Project Dashboard.

---

## Part 6: Observability, Metrics & Grafana Cloud Telemetry

### Q19. Why can’t a standard Prometheus server scrape serverless applications using normal pull mechanisms?
**Answer:**
Traditional Prometheus relies on a pull model: an internal scraper contacts `http://ip:port/metrics` at fixed intervals. In serverless environments (Vercel / AWS Lambda):
1. **Ephemeral Execution & Scale-to-Zero:** Functions spin down when idle. There is no active container or open TCP port to connect to.
2. **Network Isolation:** Serverless functions execute inside ephemeral sandboxes without static public IPs or persistent background daemons.
3. **Cold Starts:** Scrapes during idle periods trigger unnecessary cold starts and cloud compute charges.

### Q20. How does PlaceMate solve the serverless telemetry challenge?
**Answer:**
PlaceMate adopts a hybrid cloud observability strategy:
1. **Public OpenMetrics Exposition (`/api/metrics`):** Generates standardized Prometheus text-format metrics covering HTTP traffic, error rates, p50/p95 latency, and platform business KPIs.
2. **Grafana Synthetic Monitoring / Synthetic Probing:** External probes ping `/api/metrics` at configured 15–30s intervals. This periodically records metrics and keeps serverless instances warm.
3. **OTLP Ingestion Compatibility:** PlaceMate includes configuration for direct HTTP POST pushing to Grafana Cloud OpenTelemetry Gateway (`/otlp/v1/metrics`).

### Q21. Name 5 custom business and operational metrics tracked by PlaceMate.
**Answer:**
1. `placemate_http_requests_total{status_group="2xx|4xx|5xx"}`: Total HTTP requests categorized by HTTP status group.
2. `placemate_error_rate_percent`: Calculated rolling error rate percentage.
3. `placemate_http_request_duration_seconds{quantile="0.5|0.95|avg"}`: Request latency quantiles.
4. `placemate_students_registered_total`: Total candidate profiles registered in system.
5. `placemate_placement_rate_percent`: Live platform campus placement conversion rate (`selected / total students * 100`).

### Q22. What is the difference between a Gauge and a Counter in Prometheus?
**Answer:**
- **Counter:** A cumulative metric that only ever increases or resets to zero upon restart (e.g., `placemate_http_requests_total`, `placemate_applications_total`).
- **Gauge:** A metric that can arbitrarily go up or down, capturing a snapshot value at a specific point in time (e.g., `placemate_error_rate_percent`, `placemate_jobs_active_total`, `placemate_heap_used_bytes`).

---

## Part 7: Testing & Quality Assurance

### Q23. Why was Vitest chosen over Jest for PlaceMate?
**Answer:**
1. **Native ESM & TypeScript Support:** Vitest executes TypeScript files directly via Vite's esbuild transform without requiring complex Babel configurations or `ts-jest` transpilation overhead.
2. **Execution Speed:** Vitest is significantly faster than Jest due to multi-threaded worker pools and smart file caching.
3. **Next.js & Modern Web Compatibility:** Clean integration with modern Node.js 20+ and Web APIs (`fetch`, `Request`, `Response`, `Headers`).

### Q24. What test cases are included in your automated test suite?
**Answer:**
Our 20 automated tests cover 4 critical layers:
1. **Eligibility Engine (`tests/eligibility.test.ts`):** 7 tests verifying branch matching, CGPA thresholds, backlog limits, batch graduation years, expired deadlines, and closed statuses.
2. **Access Control & Applications (`tests/applications.test.ts`):** 6 tests validating authentication requirements, server-side duplicate application prevention, server-side eligibility rejection, and recruiter company authorization checks.
3. **Authentication & Cryptography (`tests/auth.test.ts`):** 3 tests validating bcrypt hashing/salting, JWT token signing/verification, and tampered token rejection.
4. **End-to-End API Routes (`tests/api.test.ts`):** 4 tests validating `/api/health`, `/api/metrics`, `/api/jobs`, and `/api/admin/stats`.

### Q25. What is the difference between Unit Testing and Integration Testing in PlaceMate?
**Answer:**
- **Unit Testing:** Tests isolated functions without external network or storage dependencies (e.g., passing mock student and job objects into `evaluateEligibility()` or checking `hashPassword()`).
- **Integration Testing:** Tests interactions between multiple system subsystems (e.g., simulating a client HTTP Request through Next.js Route Handlers to verify that authentication headers, business validation, data store persistence, and telemetry recording function correctly together).

---

## Part 8: Scalability, Performance & Future Scope

### Q26. How would you scale PlaceMate to support 50,000 concurrent students on placement day?
**Answer:**
1. **Edge Caching & CDN:** Cache public job drive listings (`GET /api/jobs`) using Next.js Incremental Static Regeneration (ISR) or Cloudflare CDN with `stale-while-revalidate` headers.
2. **Read-Replicas:** Use Neon Read Replicas to offload read-heavy job browsing queries from the primary write database.
3. **Asynchronous Application Queueing:** Implement Redis (Upstash) and BullMQ / Celery to buffer high-concurrency application submissions during rush hour, writing to PostgreSQL asynchronously without locking tables.
4. **Blob Storage for Resumes:** Offload candidate resumes to AWS S3 or Cloudflare R2 with pre-signed upload URLs rather than handling raw file buffers on application servers.

### Q27. How does PlaceMate handle database connection pooling in serverless environments?
**Answer:**
In `lib/db.ts`, PlaceMate utilizes a global singleton pattern (`globalThis.prisma`) in development to prevent hot-reloading from creating redundant PrismaClient connections. In production on Neon, database connection strings use Neon’s pooled endpoint with `?sslmode=require&pgbouncer=true`, routing queries through PgBouncer connection multiplexers.

### Q28. What HTTP response status codes are returned by PlaceMate API routes and why?
**Answer:**
- `200 OK`: Successful retrieval or status modification.
- `201 Created`: Resource successfully created (new user registered, job posting created, application submitted).
- `400 Bad Request`: Validation failure (malformed JSON or Zod schema violation).
- `401 Unauthorized`: Missing or invalid JWT session token.
- `403 Forbidden`: Authenticated user lacks permission (student attempting recruiter action, recruiter modifying another company's drive, or ineligible application).
- `404 Not Found`: Requested job, candidate, or application ID does not exist.
- `409 Conflict`: Duplicate application or duplicate email address during registration.
- `500 Internal Server Error`: Unhandled database or server exception.

### Q29. If a student attempts to alter their CGPA in DevTools before submitting an application, what happens?
**Answer:**
The attack fails completely. The client sends only `{ jobId }` in `POST /api/applications`. The server extracts the student’s identity from the cryptographically verified JWT token stored in the HttpOnly cookie, fetches the student's true verified profile from the database, and performs the eligibility evaluation server-side. Tampering with client-side state has zero impact on server validation.

### Q30. What was the most challenging technical aspect of building PlaceMate?
**Answer:**
Designing a robust, serverless-compatible dual database abstraction and telemetry pipeline. Bridging PostgreSQL Neon pooling with an in-memory test store allowed seamless zero-dependency CI pipeline test runs while retaining full PostgreSQL functionality in production. Additionally, structuring Prometheus metrics exposition to work reliably in serverless environments without persistent background scrapers required deep understanding of modern cloud telemetry standards.

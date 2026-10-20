import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Memory fallback store for offline tests and immediate demonstration
export interface InMemoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "STUDENT" | "RECRUITER" | "ADMIN";
  createdAt: Date;
}

export interface InMemoryStudent {
  id: string;
  userId: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  backlogs: number;
  skills: string;
  resumeUrl?: string | null;
  phone?: string | null;
}

export interface InMemoryRecruiter {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  website?: string | null;
  description?: string | null;
}

export interface InMemoryJob {
  id: string;
  recruiterId: string;
  title: string;
  role: string;
  description: string;
  location: string;
  salaryPackage: string;
  minCgpa: number;
  maxBacklogs: number;
  eligibleBranches: string;
  eligibleBatch: number;
  deadline: Date;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  createdAt: Date;
}

export interface InMemoryApplication {
  id: string;
  studentId: string;
  jobId: string;
  status: "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "SELECTED" | "REJECTED";
  feedback?: string | null;
  appliedAt: Date;
  updatedAt: Date;
}

class MemoryDataStore {
  public users: InMemoryUser[] = [];
  public students: InMemoryStudent[] = [];
  public recruiters: InMemoryRecruiter[] = [];
  public jobs: InMemoryJob[] = [];
  public applications: InMemoryApplication[] = [];

  constructor() {
    this.seedDefaultData();
  }

  public seedDefaultData() {
    // Pre-hashed passwords for demo ("Password@123")
    const defaultPasswordHash = "$2a$10$95XvNfxE0O4L0E4x1uH2G.dF7w8sYk9L4mNp6Q1R2S3T4U5V6W7Xe";

    // 1. Admin
    const adminUser: InMemoryUser = {
      id: "usr_admin_1",
      name: "Prof. Suresh Sharma (TPO)",
      email: "admin@placemate.edu",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      createdAt: new Date("2026-01-01")
    };

    // 2. Recruiters
    const recruiterUser1: InMemoryUser = {
      id: "usr_rec_1",
      name: "Priya Nair",
      email: "recruiter@google.com",
      passwordHash: defaultPasswordHash,
      role: "RECRUITER",
      createdAt: new Date("2026-01-05")
    };

    const recruiterProfile1: InMemoryRecruiter = {
      id: "rec_prof_1",
      userId: "usr_rec_1",
      companyName: "Google India",
      industry: "Information Technology & Cloud",
      website: "https://careers.google.com",
      description: "Google's engineering campus recruitment drive for software engineering graduates."
    };

    const recruiterUser2: InMemoryUser = {
      id: "usr_rec_2",
      name: "Amit Deshmukh",
      email: "recruiter@microsoft.com",
      passwordHash: defaultPasswordHash,
      role: "RECRUITER",
      createdAt: new Date("2026-01-10")
    };

    const recruiterProfile2: InMemoryRecruiter = {
      id: "rec_prof_2",
      userId: "usr_rec_2",
      companyName: "Microsoft IDC",
      industry: "Enterprise Software & AI",
      website: "https://careers.microsoft.com",
      description: "Microsoft India Development Center campus hiring."
    };

    // 3. Students
    const studentUser1: InMemoryUser = {
      id: "usr_stud_1",
      name: "Prachi Sonawane",
      email: "prachi@pccoepune.org",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      createdAt: new Date("2026-01-12")
    };

    const studentProfile1: InMemoryStudent = {
      id: "stud_prof_1",
      userId: "usr_stud_1",
      branch: "Computer Engineering",
      graduationYear: 2026,
      cgpa: 8.85,
      backlogs: 0,
      skills: "React, Next.js, TypeScript, PostgreSQL, Docker, DevOps, CI/CD",
      resumeUrl: "https://example.com/resumes/prachi_sonawane.pdf",
      phone: "+91 9876543210"
    };

    const studentUser2: InMemoryUser = {
      id: "usr_stud_2",
      name: "Rahul Verma",
      email: "rahul@pccoepune.org",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      createdAt: new Date("2026-01-15")
    };

    const studentProfile2: InMemoryStudent = {
      id: "stud_prof_2",
      userId: "usr_stud_2",
      branch: "Mechanical Engineering",
      graduationYear: 2026,
      cgpa: 6.9,
      backlogs: 1,
      skills: "CAD, SolidWorks, Python, MATLAB",
      resumeUrl: "https://example.com/resumes/rahul_verma.pdf",
      phone: "+91 9876543211"
    };

    // 4. Job Postings
    const job1: InMemoryJob = {
      id: "job_google_sde",
      recruiterId: "rec_prof_1",
      title: "Associate Software Engineer (Campus 2026)",
      role: "Software Development Engineer",
      description: "Design and implement scalable backend and distributed systems. Proficiency in algorithms, data structures, and cloud architectures required.",
      location: "Bangalore / Hyderabad / Pune",
      salaryPackage: "24 LPA (Base: 16 LPA + RSUs)",
      minCgpa: 8.0,
      maxBacklogs: 0,
      eligibleBranches: "Computer Engineering,Information Technology,Data Science",
      eligibleBatch: 2026,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days ahead
      status: "OPEN",
      createdAt: new Date("2026-01-15")
    };

    const job2: InMemoryJob = {
      id: "job_ms_cloud",
      recruiterId: "rec_prof_2",
      title: "Cloud Support & DevOps Engineer",
      role: "DevOps & SRE Engineer",
      description: "Build robust CI/CD deployment pipelines, manage Azure cloud infrastructure, and ensure high reliability of enterprise systems.",
      location: "Noida / Hyderabad / Remote",
      salaryPackage: "18 LPA",
      minCgpa: 7.5,
      maxBacklogs: 0,
      eligibleBranches: "Computer Engineering,Information Technology,Electronics & Telecommunication",
      eligibleBatch: 2026,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: "OPEN",
      createdAt: new Date("2026-01-20")
    };

    const job3: InMemoryJob = {
      id: "job_tcs_digital",
      recruiterId: "rec_prof_1",
      title: "Systems Engineer - Digital & Analytics",
      role: "Full Stack Engineer",
      description: "Drive digital transformation projects across banking and healthcare domains. Open to core and circuit branches.",
      location: "Pune / Mumbai",
      salaryPackage: "8 LPA",
      minCgpa: 6.5,
      maxBacklogs: 1,
      eligibleBranches: "Computer Engineering,Information Technology,Electronics & Telecommunication,Mechanical Engineering,Civil Engineering",
      eligibleBatch: 2026,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: "OPEN",
      createdAt: new Date("2026-01-25")
    };

    // 5. Job Applications
    const app1: InMemoryApplication = {
      id: "app_1",
      studentId: "stud_prof_1",
      jobId: "job_google_sde",
      status: "SHORTLISTED",
      feedback: "Strong GitHub profile and CGPA. Invited for Technical Round 1.",
      appliedAt: new Date("2026-01-20"),
      updatedAt: new Date("2026-01-22")
    };

    this.users = [adminUser, recruiterUser1, recruiterUser2, studentUser1, studentUser2];
    this.students = [studentProfile1, studentProfile2];
    this.recruiters = [recruiterProfile1, recruiterProfile2];
    this.jobs = [job1, job2, job3];
    this.applications = [app1];
  }
}

const globalForStore = globalThis as unknown as { memoryStore?: MemoryDataStore };
export const dataStore = globalForStore.memoryStore ?? new MemoryDataStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.memoryStore = dataStore;
}

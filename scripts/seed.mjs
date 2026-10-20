import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting PlaceMate PostgreSQL database seeding...");

  const defaultPassword = await bcrypt.hash("Password@123", 10);

  // 1. Create Placement Admin (TPO)
  const admin = await prisma.user.upsert({
    where: { email: "admin@placemate.edu" },
    update: {},
    create: {
      name: "Prof. Suresh Sharma (TPO)",
      email: "admin@placemate.edu",
      password: defaultPassword,
      role: "ADMIN"
    }
  });
  console.log("Seeded Admin:", admin.email);

  // 2. Create Recruiter 1 (Google)
  const recruiterUser1 = await prisma.user.upsert({
    where: { email: "recruiter@google.com" },
    update: {},
    create: {
      name: "Priya Nair",
      email: "recruiter@google.com",
      password: defaultPassword,
      role: "RECRUITER",
      recruiterProfile: {
        create: {
          companyName: "Google India",
          industry: "Cloud & Distributed Systems",
          website: "https://careers.google.com",
          description: "Google Campus Recruitment for Engineering Batch 2026."
        }
      }
    },
    include: { recruiterProfile: true }
  });
  console.log("Seeded Recruiter:", recruiterUser1.email);

  // 3. Create Student (Prachi - Computer Engineering)
  const studentUser1 = await prisma.user.upsert({
    where: { email: "prachi@pccoepune.org" },
    update: {},
    create: {
      name: "Prachi Sonawane",
      email: "prachi@pccoepune.org",
      password: defaultPassword,
      role: "STUDENT",
      studentProfile: {
        create: {
          branch: "Computer Engineering",
          graduationYear: 2026,
          cgpa: 8.85,
          backlogs: 0,
          skills: "React, Next.js, TypeScript, PostgreSQL, Docker, DevOps, CI/CD",
          resumeUrl: "https://example.com/resumes/prachi_sonawane.pdf",
          phone: "+91 9876543210"
        }
      }
    },
    include: { studentProfile: true }
  });
  console.log("Seeded Student:", studentUser1.email);

  // 4. Create Job Posting
  if (recruiterUser1.recruiterProfile) {
    const job = await prisma.jobPosting.create({
      data: {
        recruiterId: recruiterUser1.recruiterProfile.id,
        title: "Associate Software Engineer (Campus 2026)",
        role: "Software Development Engineer",
        description: "Design and implement scalable backend and distributed systems.",
        location: "Bangalore / Hyderabad / Pune",
        salaryPackage: "24 LPA (Base: 16 LPA + RSUs)",
        minCgpa: 8.0,
        maxBacklogs: 0,
        eligibleBranches: "Computer Engineering,Information Technology,Data Science",
        eligibleBatch: 2026,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "OPEN"
      }
    });
    console.log("Seeded Job Posting:", job.title);
  }

  console.log("PlaceMate Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

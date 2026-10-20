"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Building2,
  BookOpen,
  Award,
  AlertTriangle,
  FileText,
  Phone,
  Globe,
  Save,
  CheckCircle2,
  Sparkles,
  Info
} from "lucide-react";
import { SessionUser, StudentProfileData, RecruiterProfileData } from "@/lib/types";

interface ProfileManagerProps {
  currentUser: SessionUser;
  onProfileUpdated: () => void;
}

const AVAILABLE_BRANCHES = [
  "Computer Engineering",
  "Information Technology",
  "Data Science",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering"
];

export function ProfileManager({ currentUser, onProfileUpdated }: ProfileManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Student profile state
  const [branch, setBranch] = useState("Computer Engineering");
  const [graduationYear, setGraduationYear] = useState(2026);
  const [cgpa, setCgpa] = useState("8.85");
  const [backlogs, setBacklogs] = useState("0");
  const [skills, setSkills] = useState("React, Next.js, TypeScript, PostgreSQL, Docker, DevOps, CI/CD");
  const [resumeUrl, setResumeUrl] = useState("https://example.com/resumes/prachi_sonawane.pdf");
  const [phone, setPhone] = useState("+91 9876543210");

  // Recruiter profile state
  const [companyName, setCompanyName] = useState(currentUser.companyName || "Google India");
  const [industry, setIndustry] = useState("Information Technology & Cloud");
  const [website, setWebsite] = useState("https://careers.google.com");
  const [description, setDescription] = useState(
    "Google's campus recruitment drive for software engineering graduates. We hire talent across engineering campuses."
  );

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            if (currentUser.role === "STUDENT") {
              const p = data.profile;
              if (p.branch) setBranch(p.branch);
              if (p.graduationYear) setGraduationYear(p.graduationYear);
              if (p.cgpa !== undefined) setCgpa(String(p.cgpa));
              if (p.backlogs !== undefined) setBacklogs(String(p.backlogs));
              if (p.skills) setSkills(p.skills);
              if (p.resumeUrl) setResumeUrl(p.resumeUrl);
              if (p.phone) setPhone(p.phone);
            } else if (currentUser.role === "RECRUITER") {
              const p = data.profile;
              if (p.companyName) setCompanyName(p.companyName);
              if (p.industry) setIndustry(p.industry);
              if (p.website) setWebsite(p.website);
              if (p.description) setDescription(p.description);
            }
          }
        }
      } catch {
        // Fall back to default state
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload =
        currentUser.role === "STUDENT"
          ? {
              branch,
              graduationYear: Number(graduationYear),
              cgpa: parseFloat(cgpa),
              backlogs: parseInt(backlogs, 10),
              skills,
              resumeUrl,
              phone
            }
          : {
              companyName,
              industry,
              website,
              description
            };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Profile updated successfully! Placement eligibility recalculated.");
        onProfileUpdated();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(data.error || "Failed to save profile");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-400" />
            <span>
              {currentUser.role === "STUDENT"
                ? "Student Academic & Placement Profile"
                : currentUser.role === "RECRUITER"
                ? "Recruiter & Organization Profile"
                : "Administrator Profile"}
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {currentUser.role === "STUDENT"
              ? "Keep your academic records up to date. The Automated Eligibility Engine evaluates these criteria for every drive."
              : "Manage company credentials and branding seen by prospective student candidates."}
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-900 border border-gray-800 text-blue-400">
          Role: {currentUser.role}
        </span>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {currentUser.role === "STUDENT" && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Quick Notice */}
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs text-blue-300 flex items-start space-x-3">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="leading-relaxed">
              <strong>Viva Demonstration Tip:</strong> Modify your CGPA (e.g. drop below 7.5) or add an active backlog,
              save, and return to <em>Placement Drives</em>. You will immediately see the eligibility tags dynamically update to
              <strong> Ineligible</strong> with clear explanations of why criteria were not satisfied.
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl space-y-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Academic Verification Parameters</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Engineering Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {AVAILABLE_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Graduation Batch / Year</label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={2025}>Batch of 2025</option>
                  <option value={2026}>Batch of 2026</option>
                  <option value={2027}>Batch of 2027</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Cumulative CGPA (out of 10.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Active Academic Backlogs</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={backlogs}
                  onChange={(e) => setBacklogs(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Contact Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Candidate Full Name</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full bg-gray-950/60 border border-gray-800/60 rounded-xl px-3 py-2 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Skills & Resume Portfolio</span>
            </h4>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">
                  Technical Skills & Frameworks (Comma-separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Next.js, TypeScript, PostgreSQL, Docker, Kubernetes, Vitest"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">
                  Verified Resume Document Link (PDF / Google Drive / GitHub)
                </label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/your-resume.pdf"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving Academic Profile..." : "Save & Update Profile"}</span>
            </button>
          </div>
        </form>
      )}

      {currentUser.role === "RECRUITER" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl space-y-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Company Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Industry Sector</label>
                <input
                  type="text"
                  required
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Cloud Computing & AI"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 font-semibold mb-1.5">Careers Portal or Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://careers.company.com"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 font-semibold mb-1.5">Company Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Updating Company Profile..." : "Save Company Profile"}</span>
            </button>
          </div>
        </form>
      )}

      {currentUser.role === "ADMIN" && (
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl space-y-4 text-xs">
          <h4 className="text-sm font-bold text-white">Placement Cell Officer Profile</h4>
          <p className="text-gray-400 leading-relaxed">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.email}). You possess platform-wide administrative privileges
            to audit all student candidates, manage all company job postings, oversee placement drives, and monitor real-time
            system telemetry.
          </p>
        </div>
      )}
    </div>
  );
}

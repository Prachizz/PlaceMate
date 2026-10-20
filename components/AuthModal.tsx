"use client";

import React, { useState } from "react";
import { X, LogIn, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { SessionUser, UserRole } from "@/lib/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: SessionUser) => void;
}

const AVAILABLE_BRANCHES = [
  "Computer Engineering",
  "Information Technology",
  "Data Science",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering"
];

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regRole, setRegRole] = useState<"STUDENT" | "RECRUITER">("STUDENT");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regBranch, setRegBranch] = useState("Computer Engineering");
  const [regGradYear, setRegGradYear] = useState(2026);
  const [regCgpa, setRegCgpa] = useState("8.50");
  const [regBacklogs, setRegBacklogs] = useState("0");
  const [regSkills, setRegSkills] = useState("TypeScript, React, Python, PostgreSQL");
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regIndustry, setRegIndustry] = useState("Enterprise Software");

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, any> = {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole
      };

      if (regRole === "STUDENT") {
        payload.branch = regBranch;
        payload.graduationYear = Number(regGradYear);
        payload.cgpa = parseFloat(regCgpa);
        payload.backlogs = parseInt(regBacklogs, 10);
        payload.skills = regSkills;
      } else {
        payload.companyName = regCompanyName || regName + " Corp";
        payload.industry = regIndustry;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <h3 className="text-xl font-bold text-white">
              {mode === "login" ? "PlaceMate Secure Sign In" : "Create PlaceMate Account"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Role-based JWT session authentication with PostgreSQL
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl bg-gray-950 p-1 border border-gray-800 mt-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${
              mode === "login" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-gray-400 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${
              mode === "register" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-gray-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-4 space-y-4 text-xs">
            {/* Demo One-Click Fillers */}
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/50 space-y-2">
              <span className="text-[11px] font-semibold text-blue-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Viva Demo Accounts:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemo("prachi@pccoepune.org", "Password@123")}
                  className="px-2.5 py-1 rounded bg-gray-900 hover:bg-gray-800 border border-gray-700 text-emerald-300 text-[11px] font-medium transition-colors"
                >
                  Student (Prachi)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("recruiter@google.com", "Password@123")}
                  className="px-2.5 py-1 rounded bg-gray-900 hover:bg-gray-800 border border-gray-700 text-amber-300 text-[11px] font-medium transition-colors"
                >
                  Recruiter (Google)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("admin@placemate.edu", "Password@123")}
                  className="px-2.5 py-1 rounded bg-gray-900 hover:bg-gray-800 border border-gray-700 text-purple-300 text-[11px] font-medium transition-colors"
                >
                  TPO Admin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? "Authenticating..." : "Sign In to PlaceMate"}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Select Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole("STUDENT")}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-colors ${
                    regRole === "STUDENT"
                      ? "bg-emerald-950 border-emerald-600 text-emerald-200"
                      : "bg-gray-950 border-gray-800 text-gray-400"
                  }`}
                >
                  Student Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole("RECRUITER")}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-colors ${
                    regRole === "RECRUITER"
                      ? "bg-amber-950 border-amber-600 text-amber-200"
                      : "bg-gray-950 border-gray-800 text-gray-400"
                  }`}
                >
                  Corporate Recruiter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Aditi Kulkarni"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="aditi@pccoepune.org"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {regRole === "STUDENT" ? (
              <div className="space-y-3 p-3.5 rounded-xl bg-gray-950 border border-gray-800">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                  Student Profile Details
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Branch</label>
                    <select
                      value={regBranch}
                      onChange={(e) => setRegBranch(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:outline-none"
                    >
                      {AVAILABLE_BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Graduation Year</label>
                    <input
                      type="number"
                      required
                      value={regGradYear}
                      onChange={(e) => setRegGradYear(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Current CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={regCgpa}
                      onChange={(e) => setRegCgpa(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Active Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      required
                      value={regBacklogs}
                      onChange={(e) => setRegBacklogs(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Key Skills</label>
                  <input
                    type="text"
                    value={regSkills}
                    onChange={(e) => setRegSkills(e.target.value)}
                    placeholder="Java, React, SQL"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3.5 rounded-xl bg-gray-950 border border-gray-800">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                  Recruiter Company Details
                </span>

                <div>
                  <label className="block text-gray-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={regCompanyName}
                    onChange={(e) => setRegCompanyName(e.target.value)}
                    placeholder="e.g. Cisco Systems"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Industry Sector</label>
                  <input
                    type="text"
                    required
                    value={regIndustry}
                    onChange={(e) => setRegIndustry(e.target.value)}
                    placeholder="e.g. Networking & Cybersecurity"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? "Creating Account..." : "Complete Registration"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

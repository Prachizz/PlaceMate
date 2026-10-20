"use client";

import React from "react";
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Terminal,
  UserCheck,
  User,
  LogIn,
  LogOut
} from "lucide-react";
import { SessionUser, UserRole } from "@/lib/types";

interface NavbarProps {
  currentUser: SessionUser | null;
  onSelectRole: (role: UserRole) => void;
  activeTab: "jobs" | "applications" | "analytics" | "profile";
  onSelectTab: (tab: "jobs" | "applications" | "analytics" | "profile") => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export function Navbar({
  currentUser,
  onSelectRole,
  activeTab,
  onSelectTab,
  onOpenAuthModal,
  onLogout
}: NavbarProps) {
  const roleBadgeColor =
    currentUser?.role === "ADMIN"
      ? "bg-purple-950 text-purple-300 border-purple-800"
      : currentUser?.role === "RECRUITER"
      ? "bg-amber-950 text-amber-300 border-amber-800"
      : "bg-emerald-950 text-emerald-300 border-emerald-800";

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 flex-wrap gap-4">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab("jobs")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">PlaceMate</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-semibold">
                  Campus 2026
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Campus Placement & Automated DevOps</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium">
            <button
              onClick={() => onSelectTab("jobs")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === "jobs"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Drives</span>
            </button>

            <button
              onClick={() => onSelectTab("applications")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === "applications"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {currentUser?.role === "RECRUITER"
                  ? "Applicants"
                  : currentUser?.role === "ADMIN"
                  ? "Applications"
                  : "My Applications"}
              </span>
            </button>

            <button
              onClick={() => onSelectTab("profile")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              <span>
                {currentUser?.role === "RECRUITER" ? "Company Profile" : "Profile"}
              </span>
            </button>

            <button
              onClick={() => onSelectTab("analytics")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>TPO Analytics</span>
            </button>
          </div>

          {/* User & Quick Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Demo Switcher */}
            <div className="hidden lg:flex items-center bg-gray-900 border border-gray-800 rounded-lg p-1 text-xs">
              <span className="text-gray-400 px-2 font-medium">Demo:</span>
              <button
                onClick={() => onSelectRole("STUDENT")}
                className={`px-2 py-0.5 rounded transition-colors ${
                  currentUser?.role === "STUDENT"
                    ? "bg-emerald-600 text-white font-semibold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Student
              </button>
              <button
                onClick={() => onSelectRole("RECRUITER")}
                className={`px-2 py-0.5 rounded transition-colors ${
                  currentUser?.role === "RECRUITER"
                    ? "bg-amber-600 text-white font-semibold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Recruiter
              </button>
              <button
                onClick={() => onSelectRole("ADMIN")}
                className={`px-2 py-0.5 rounded transition-colors ${
                  currentUser?.role === "ADMIN"
                    ? "bg-purple-600 text-white font-semibold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Admin
              </button>
            </div>

            {/* Current User Pill */}
            <div className="flex items-center space-x-2 text-xs border border-gray-800 rounded-lg px-2.5 py-1.5 bg-gray-900">
              <div className="text-right hidden sm:block">
                <div className="font-semibold text-gray-200 truncate max-w-[120px]">
                  {currentUser?.name || "Candidate"}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${roleBadgeColor}`}>
                {currentUser?.role}
              </span>
            </div>

            {/* Sign in / Switch Account Modal Trigger */}
            <button
              onClick={onOpenAuthModal}
              title="Sign In / Register / Switch Account"
              className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white text-xs flex items-center space-x-1"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Auth</span>
            </button>

            {/* Metrics Link */}
            <a
              href="/api/metrics"
              target="_blank"
              rel="noreferrer"
              title="Prometheus Metrics Endpoint"
              className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <Terminal className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

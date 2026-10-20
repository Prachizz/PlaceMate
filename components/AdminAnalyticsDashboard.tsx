"use client";

import React from "react";
import { Users, Briefcase, Award, TrendingUp, Building2, CheckCircle2, Terminal, Shield } from "lucide-react";
import { PlatformAnalytics } from "@/lib/types";

interface AdminAnalyticsDashboardProps {
  analytics: PlatformAnalytics | null;
}

export function AdminAnalyticsDashboard({ analytics }: AdminAnalyticsDashboardProps) {
  if (!analytics) {
    return <div className="text-center py-12 text-gray-500">Loading placement platform analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Students</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {analytics.totalStudents}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Verified college candidates</div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Job Drives</span>
            <Briefcase className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {analytics.activeJobs}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Across {analytics.totalRecruiters} verified companies
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Applications</span>
            <Building2 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {analytics.totalApplications}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Automated eligibility verified</div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Placement Rate</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {analytics.placementRatePercent}%
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1">
            {analytics.selectedCount} students placed
          </div>
        </div>
      </div>

      {/* Two Column Section: Branch Stats & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise Placements */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
            <h4 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Branch-wise Placement Statistics</span>
            </h4>
            <span className="text-xs text-gray-400">Batch 2026</span>
          </div>

          <div className="space-y-4 text-xs">
            {analytics.branchStats.map((b) => {
              const pct = b.students > 0 ? Math.round((b.placed / b.students) * 100) : 0;

              return (
                <div key={b.branch} className="space-y-1.5">
                  <div className="flex justify-between text-gray-300">
                    <span className="font-semibold">{b.branch}</span>
                    <span className="text-gray-400">
                      {b.placed} / {b.students} Placed ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Status Funnel */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
            <h4 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Application Pipeline Distribution</span>
            </h4>
            <span className="text-xs text-gray-400">Live Funnel</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {analytics.applicationStatusDistribution.map((item) => {
              const colorClass =
                item.status === "SELECTED"
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                  : item.status === "REJECTED"
                  ? "bg-rose-950/60 border-rose-800 text-rose-300"
                  : item.status === "INTERVIEW"
                  ? "bg-purple-950/60 border-purple-800 text-purple-300"
                  : item.status === "SHORTLISTED"
                  ? "bg-amber-950/60 border-amber-800 text-amber-300"
                  : "bg-blue-950/60 border-blue-800 text-blue-300";

              return (
                <div key={item.status} className={`p-4 rounded-xl border ${colorClass} text-center`}>
                  <div className="text-xl font-bold font-mono">{item.count}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider mt-1">
                    {item.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

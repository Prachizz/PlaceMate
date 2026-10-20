"use client";

import React, { useState } from "react";
import { X, CheckCircle2, XCircle, AlertCircle, Send, Check } from "lucide-react";
import { JobPostingData } from "@/lib/types";

interface EligibilityModalProps {
  job: JobPostingData | null;
  isOpen: boolean;
  onClose: () => void;
  onApplySuccess: (jobId: string) => void;
}

export function EligibilityModal({ job, isOpen, onClose, onApplySuccess }: EligibilityModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !job) return null;

  const eligibility = job.userEligibility;
  const isEligible = eligibility?.isEligible ?? false;

  const handleApply = async () => {
    setIsApplying(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onApplySuccess(job.id);
        onClose();
      } else {
        setErrorMessage(data.error || data.summary || "Failed to submit application");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <span className="text-xs uppercase font-semibold text-blue-400 tracking-wider">
              Eligibility Verification Engine
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">{job.title}</h3>
            <p className="text-sm text-gray-400">{job.companyName} • {job.salaryPackage}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Status Banner */}
        <div className="mt-5">
          {job.hasApplied ? (
            <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800 flex items-center space-x-3 text-blue-300">
              <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Application Already Submitted</div>
                <div className="text-xs text-blue-300/80">
                  Current Status: <strong className="uppercase">{job.applicationStatus || "APPLIED"}</strong>
                </div>
              </div>
            </div>
          ) : isEligible ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center space-x-3 text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Eligible to Apply</div>
                <div className="text-xs text-emerald-300/80">{eligibility?.summary}</div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 flex items-center space-x-3 text-rose-300">
              <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Eligibility Criteria Not Met</div>
                <div className="text-xs text-rose-300/80">{eligibility?.summary}</div>
              </div>
            </div>
          )}
        </div>

        {/* Criteria Breakdown Checklist */}
        <div className="mt-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Automated Criterion Breakdown:
          </div>

          {eligibility?.criteria.map((c, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border flex items-start justify-between text-xs transition-colors ${
                c.passed
                  ? "bg-gray-950/60 border-emerald-900/50"
                  : "bg-rose-950/20 border-rose-900/50"
              }`}
            >
              <div className="flex items-start space-x-2.5">
                {c.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-gray-200">{c.name}</div>
                  <div className="text-gray-400 mt-0.5">{c.message}</div>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono ml-3 flex-shrink-0">
                <div className="text-gray-400">Required: <span className="text-gray-200">{c.required}</span></div>
                <div className="text-gray-400">Yours: <span className={c.passed ? "text-emerald-400" : "text-rose-400"}>{c.actual}</span></div>
              </div>
            </div>
          ))}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Close
          </button>

          {!job.hasApplied && (
            <button
              onClick={handleApply}
              disabled={!isEligible || isApplying}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                isEligible && !isApplying
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isApplying ? "Submitting..." : isEligible ? "Submit Application" : "Ineligible"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

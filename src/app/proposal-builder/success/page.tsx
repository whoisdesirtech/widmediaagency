"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const [specs, setSpecs] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // Auto-download proposal on load
  const downloadProposal = async (proposalSpecs: any) => {
    setIsDownloading(true);
    setDownloadError("");
    
    try {
      const response = await fetch("/api/proposal/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalSpecs)
      });

      if (!response.ok) {
        throw new Error(`Server returned error code ${response.status}`);
      }

      // Convert to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const safeClientName = (proposalSpecs.clientName || "proposal").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      link.setAttribute("download", `proposal-${safeClientName}.zip`);
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("ZIP download failed:", err);
      setDownloadError(err.message || "Failed to download ZIP file automatically.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("whoisdesir-mvp-proposal-specs");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSpecs(parsed);
        // Automatically start the download
        downloadProposal(parsed);
      } catch (e) {
        console.error("Failed to parse stored specs", e);
        setDownloadError("No valid proposal specifications found.");
      }
    } else {
      setDownloadError("No proposal specifications found in session.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#1E2233] flex flex-col items-center justify-center font-body p-6 antialiased">
      <div className="max-w-md w-full bg-white border border-[#E2E6EF] rounded-2xl p-8 shadow-sm text-center space-y-6">
        
        {/* SUCCESS BADGE */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500 text-3xl mx-auto shadow-sm">
          ✓
        </div>

        <div className="space-y-2">
          <h1 className="font-heading font-black text-2xl text-[#0A0D1A]">Payment Confirmed!</h1>
          <p className="text-sm text-[#8891A5] leading-normal">
            Thank you! Your customized proposal landing page assets are compiled and ready.
          </p>
        </div>

        {/* DETAILS SECTION */}
        {specs && (
          <div className="border border-[#E2E6EF] rounded-xl p-4 bg-[#F8F9FC] text-left text-xs space-y-2 divide-y divide-[#E2E6EF]/60">
            <div className="flex justify-between pb-2">
              <span className="text-[#8891A5]">Client Brand:</span>
              <span className="font-bold text-[#0A0D1A]">{specs.clientName}</span>
            </div>
            <div className="flex justify-between pt-2 pb-2">
              <span className="text-[#8891A5]">Event Title:</span>
              <span className="font-bold text-[#0A0D1A]">{specs.eventTitle}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-[#8891A5]">Payment Amount:</span>
              <span className="font-bold text-[#0A0D1A]">$4.99</span>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE IF ANY */}
        {downloadError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-4 leading-normal">
            <strong>⚠️ Warning:</strong> {downloadError}
          </div>
        )}

        {/* DOWNLOAD ACTIONS */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => downloadProposal(specs)}
            disabled={isDownloading || !specs}
            className="w-full bg-[#0A0D1A] hover:bg-[#1E2233] disabled:opacity-40 disabled:hover:bg-[#0A0D1A] font-heading font-black text-sm text-white py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 tracking-wide"
          >
            {isDownloading ? (
              <>
                <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                Zipping assets...
              </>
            ) : (
              <>
                <span>📥</span>
                Download ZIP Bundle Again
              </>
            )}
          </button>

          <Link
            href="/proposal-builder"
            className="w-full border border-[#E2E6EF] hover:bg-[#F8F9FC] font-heading font-bold text-xs text-[#0A0D1A] py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            ← Compile Another Proposal
          </Link>
        </div>

        <p className="text-[10px] text-[#8891A5] leading-normal pt-2">
          Make sure to unzip the file and read the compiled <code>README.md</code> to deploy it directly to Firebase in less than 2 minutes.
        </p>

      </div>
    </div>
  );
}

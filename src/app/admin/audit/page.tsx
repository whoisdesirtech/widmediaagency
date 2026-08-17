'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import Sidebar from '@/components/Sidebar';

export default function AdminAuditPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let stored: any = null;
    try {
      stored = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {}
    if (!stored || stored.role !== 'admin') {
      router.replace('/login');
      return;
    }
    setIsAdmin(true);

    fetch('/reports/ai-discovery-and-target-prompts.html')
      .then(r => r.text())
      .then(text => {
        setHtml(text);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handleDownloadPdf = async () => {
    const el = reportRef.current;
    if (!el) return;
    setExporting(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
      await doc.html(el, {
        x: 10,
        y: 10,
        width: 190,
        windowWidth: el.scrollWidth,
        autoPaging: 'text',
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        },
      });
      doc.save('AI-Discovery-and-Target-Prompts.pdf');
    } catch (e) {
      console.error('[AUDIT_PDF]', e);
    }
    setExporting(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-heading text-2xl font-black text-dark-800">Audit Admin</h1>
              <p className="text-muted text-sm mt-1">
                Phase 14 — AI Discovery &amp; Target Prompts · Internal report · Admin only
              </p>
            </div>
            <button
              onClick={handleDownloadPdf}
              disabled={loading || exporting}
              className="btn-primary text-sm whitespace-nowrap disabled:opacity-50"
            >
              {exporting ? 'Generating PDF...' : '⬇ Download PDF'}
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-muted text-sm">Loading report...</div>
            ) : !html ? (
              <div className="p-12 text-center text-muted text-sm">
                Report content could not be loaded.
              </div>
            ) : (
              <div ref={reportRef} className="bg-white overflow-x-auto">
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import React from 'react';

interface DraftBannerProps {
  variant?: 'full' | 'compact';
}

export default function DraftBanner({ variant = 'full' }: DraftBannerProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-xs font-semibold">
        <span className="text-amber-500">⚠</span>
        DRAFT — Attorney Review Required
      </div>
    );
  }

  return (
    <div className="draft-banner">
      <div className="draft-banner-icon">⚖</div>
      <div>
        <div className="font-heading font-bold text-amber-900 text-sm mb-1">
          Working Draft — Not a Binding Agreement
        </div>
        <div className="text-amber-800 text-xs leading-relaxed">
          This document is a generated working draft that must be reviewed by a licensed attorney before signing.
          IP assignment, indemnity, and worker-classification clauses carry real legal risk and vary by jurisdiction.
          Neither party should sign this document without independent legal review.
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface SignaturePadProps {
  onSign: (dataUrl: string) => void;
  signerName: string;
  signerRole: string;
}

export default function SignaturePad({ onSign, signerName, signerRole }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = '#1E2233';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }, []);

  const startDrawing = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPoint.current = getPos(e);
  }, [getPos]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    if (lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPoint.current = pos;
  }, [isDrawing, getPos]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
    setHasSigned(true);
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
    setHasSigned(false);
  }, []);

  const confirm = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSign(dataUrl);
  }, [onSign]);

  return (
    <div className="border-2 border-dashed border-muted-lighter rounded-2xl p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-heading font-bold text-dark-800 text-sm">{signerName}</div>
          <div className="text-muted text-xs capitalize">{signerRole} Signature</div>
        </div>
        <div className="flex gap-2">
          <button onClick={clear} className="btn-secondary text-xs px-3 py-1.5">Clear</button>
          {hasSigned && (
            <button onClick={confirm} className="btn-primary text-xs px-3 py-1.5">Confirm Signature</button>
          )}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-32 rounded-xl border border-muted-lighter cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <div className="mt-3 text-[0.7rem] text-muted text-center">
        Sign using mouse or touch. Both parties must sign for the agreement to be executed.
      </div>
    </div>
  );
}

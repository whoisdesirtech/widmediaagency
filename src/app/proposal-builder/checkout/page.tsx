"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    // Load local storage specs to get the client name
    const stored = localStorage.getItem("whoisdesir-mvp-proposal-specs");
    if (stored) {
      try {
        const specs = JSON.parse(stored);
        setClientName(specs.clientName || "Your Client");
      } catch (e) {
        console.error("Failed to parse stored specs", e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment transaction
    setTimeout(() => {
      window.location.href = "/proposal-builder/success";
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#1E2233] flex flex-col font-body antialiased">
      {/* NAVBAR */}
      <header className="h-16 px-8 border-b border-[#E2E6EF] bg-white flex items-center justify-between">
        <Link href="/proposal-builder" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-heading font-black text-xs">W</div>
          <span className="font-heading font-bold text-xs text-[#0A0D1A] tracking-wider uppercase">Proposal Hub</span>
        </Link>
        <Link href="/proposal-builder" className="text-xs font-semibold text-[#8891A5] hover:text-[#1E2233] transition-colors">
          ← Cancel and return
        </Link>
      </header>

      {/* STRIPE CHECKOUT TWO-COLUMN CONTAINER */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-8 grid md:grid-cols-12 gap-8 items-start my-8">
        
        {/* LEFT COLUMN: ORDER SUMMARY */}
        <div className="md:col-span-5 space-y-6 md:sticky md:top-8">
          <div className="space-y-1.5">
            <span className="text-[#8891A5] font-bold text-xs uppercase tracking-wide">Order Details</span>
            <h1 className="font-heading font-black text-2xl text-[#0A0D1A]">Proposal Generator</h1>
            <p className="text-3xl font-heading font-black text-miami-pink">$4.99</p>
          </div>

          <div className="border-t border-[#E2E6EF] pt-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#8891A5]">Custom Proposal Package:</span>
              <span className="font-semibold text-[#0A0D1A]">{clientName}</span>
            </div>
            
            <div className="bg-white border border-[#E2E6EF] rounded-xl p-4 space-y-3 shadow-sm">
              <div className="text-xs font-bold text-[#0A0D1A] uppercase tracking-wide flex items-center gap-1.5">
                <span>📦</span> What&apos;s in the box:
              </div>
              <ul className="text-xs text-[#8891A5] space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> fully customizable index.html
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> dynamic responsive styles.css
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> scroll interaction script.js
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Firebase hosting README.md
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> empty portfolio photos/ folder
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CARD PAYMENT FORM */}
        <div className="md:col-span-7 bg-white border border-[#E2E6EF] rounded-2xl p-8 shadow-sm space-y-6">
          <h2 className="font-heading font-bold text-lg text-[#0A0D1A]">Pay with Card</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EMAIL */}
            <div>
              <label className="block text-xs font-semibold text-[#8891A5] mb-1.5 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#F8F9FC] border border-[#E2E6EF] rounded-lg py-2.5 px-3 text-sm text-[#1E2233] focus:border-[#22ABC7] transition-all"
              />
            </div>

            {/* CARD DETAILS */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#8891A5] uppercase tracking-wide">Card Information</label>
              
              <div className="border border-[#E2E6EF] rounded-lg overflow-hidden bg-[#F8F9FC] divide-y divide-[#E2E6EF]">
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ""))}
                  placeholder="1234 5678 1234 5678"
                  className="w-full bg-[#F8F9FC] border-0 py-2.5 px-3 text-sm text-[#1E2233] focus:ring-0 focus:outline-none"
                />
                
                <div className="grid grid-cols-2 divide-x divide-[#E2E6EF]">
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full bg-[#F8F9FC] border-0 py-2.5 px-3 text-sm text-[#1E2233] focus:ring-0 focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="CVC"
                    className="w-full bg-[#F8F9FC] border-0 py-2.5 px-3 text-sm text-[#1E2233] focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* NAME ON CARD */}
            <div>
              <label className="block text-xs font-semibold text-[#8891A5] mb-1.5 uppercase tracking-wide">Name on Card</label>
              <input
                type="text"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-[#F8F9FC] border border-[#E2E6EF] rounded-lg py-2.5 px-3 text-sm text-[#1E2233] focus:border-[#22ABC7] transition-all"
              />
            </div>

            {/* SECURITY LOGO BANNER */}
            <div className="flex items-center justify-between text-[#8891A5] text-[10px] uppercase font-bold tracking-wider select-none py-2 border-t border-[#E2E6EF] mt-6">
              <span className="flex items-center gap-1">🔒 SECURE CHECKOUT</span>
              <span>POWERED BY STRIPE SIMULATOR</span>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#0A0D1A] hover:bg-[#1E2233] font-heading font-black text-sm text-white py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 tracking-wide mt-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                  Processing payment...
                </>
              ) : (
                <>
                  <span>💳</span>
                  Pay $4.99
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface DeliverableItem {
  icon: string;
  title: string;
  desc: string;
}

interface HospitalityItem {
  icon: string;
  title: string;
  desc: string;
}

interface TestimonialItem {
  text: string;
  author: string;
  role: string;
}

export default function ProposalBuilder() {
  // Core Spec State
  const [agencyName, setAgencyName] = useState("WhoIsDésir® Media");
  const [clientName, setClientName] = useState("Taste of Haiti");
  const [eventTitle, setEventTitle] = useState("Grand Opening & Showcase");
  const [eventDate, setEventDate] = useState("September 30, 2026");
  const [location, setLocation] = useState("Fort Lauderdale, FL");
  const [coverageHours, setCoverageHours] = useState("6:00 – 8:00 PM");
  const [eventHours, setEventHours] = useState("4:00 – 9:00 PM");
  const [email, setEmail] = useState("digitalvurv@gmail.com");
  const [cashAppLink, setCashAppLink] = useState("https://cash.app/$DesirDigital");
  const [youtubeId, setYoutubeId] = useState("XXhvNM6MDUU");
  
  // Pricing
  const [standardValue, setStandardValue] = useState(375);
  const [discount, setDiscount] = useState(225);
  const [balanceDueDate, setBalanceDueDate] = useState("September 15, 2026");
  
  // Cultural Branding
  const [signatureDish, setSignatureDish] = useState("Griot Pizza");
  const [brandSpecialization, setBrandSpecialization] = useState("Haitian-owned");
  const [targetRegion, setTargetRegion] = useState("Miami-Dade and Broward");
  const [culturalHeritage, setCulturalHeritage] = useState("Haitian");
  
  // Proposal Status & Questionnaire
  const [status, setStatus] = useState<"pending" | "confirmed">("pending");
  const [hostName, setHostName] = useState("Running Club");
  const [googleScriptUrl, setGoogleScriptUrl] = useState("");

  // Derived Pricing
  const clientInvestment = Math.max(0, standardValue - discount);
  const depositAmount = Math.round(clientInvestment * 0.5);
  const balanceAmount = clientInvestment - depositAmount;

  // Lists state
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([
    { icon: "🎊", title: "Grand Opening Festivities", desc: "Ribbon cutting, first customers, celebration energy, and milestone moments." },
    { icon: "👋", title: "Customer Interactions", desc: "Genuine moments of guests experiencing your brand for the first time." },
    { icon: "👨‍🍳", title: "Team Members", desc: "Your staff in action — the faces and passion behind the brand." },
    { icon: "🏪", title: "Interior & Exterior Venue", desc: "Architectural and design shots for Google Business, Yelp, and marketing materials." },
    { icon: "🍕", title: "Signature Menu Items", desc: "Mouthwatering photography of your signature dishes, styled for maximum visual impact." },
    { icon: "🍽️", title: "Detailed Food Photography", desc: "Close-up, editorial-quality food shots ideal for menus, ads, and social posts." },
    { icon: "📺", title: "Event Highlights", desc: "Capturing the excitement — fans, reactions, screens, and the core showcase experience." },
    { icon: "🌍", title: "Community Engagement", desc: "Moments that showcase your venue as a community hub." },
    { icon: "✨", title: "Brand Atmosphere & Candid Moments", desc: "The vibe, décor, lighting, and spontaneous moments that make your brand authentic." }
  ]);

  const [rights, setRights] = useState<string[]>([
    "Instagram posts, stories, and reels",
    "Facebook page and advertising",
    "TikTok content",
    "Website and landing pages",
    "Google Business Profile",
    "Press releases and media kits",
    "Printed marketing materials",
    "Promotional banners and signage",
    "Future advertising campaigns"
  ]);

  const [hospitality, setHospitality] = useState<HospitalityItem[]>([
    { icon: "🍽️", title: "Complimentary Meals", desc: "Two complimentary meals for production team members during the event — so we can stay fueled and focused." },
    { icon: "🎁", title: "Future Visit Gift Card", desc: "One $50 gift card for a future visit — because we'd love to come back as guests and customers too." },
    { icon: "🎯", title: "On-Site Accommodations", desc: "Access to a staging area or supportive on-site accommodations to facilitate smooth production logistics." }
  ]);

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([
    { text: "The team captured our grand opening perfectly! The pictures look incredible on our website and Yelp pages.", author: "Chef Jean-Luc", role: "Owner, Le Petit Bistro" },
    { text: "Amazing turnaround time and top-notch professionalism. They blended right in with our guests.", author: "Marie Dupoint", role: "Marketing Director, Epicurean Group" },
    { text: "Highly recommend for any local business opening. The social media tagging drove immediate foot traffic.", author: "Reginald Desir", role: "Organizer, Miami Food Festival" }
  ]);

  // Viewport & Active Form Tabs
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "branding" | "lists">("basic");
  
  // Loading & Checkout simulation state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  
  // Ref for debouncing iframe updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to compile query string
  const compileQueryString = () => {
    const params = new URLSearchParams({
      agencyName,
      clientName,
      eventTitle,
      eventDate,
      location,
      coverageHours,
      eventHours,
      email,
      cashAppLink,
      youtubeId,
      standardValue: standardValue.toString(),
      discount: discount.toString(),
      clientInvestment: clientInvestment.toString(),
      depositAmount: depositAmount.toString(),
      balanceAmount: balanceAmount.toString(),
      balanceDueDate,
      signatureDish,
      brandSpecialization,
      targetRegion,
      culturalHeritage,
      status,
      hostName,
      googleScriptUrl,
      deliverables: JSON.stringify(deliverables),
      rights: JSON.stringify(rights),
      hospitality: JSON.stringify(hospitality),
      testimonials: JSON.stringify(testimonials)
    });
    return params.toString();
  };

  // Trigger preview update
  const updatePreview = () => {
    setIsRefreshing(true);
    const queryString = compileQueryString();
    setIframeSrc(`/proposal-builder/preview?${queryString}`);
    
    // Simulate short refresh animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Debounced auto-preview refresh on input change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      updatePreview();
    }, 1000); // 1-second debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    agencyName, clientName, eventTitle, eventDate, location, coverageHours, 
    eventHours, email, cashAppLink, youtubeId, standardValue, discount, 
    balanceDueDate, signatureDish, brandSpecialization, targetRegion, 
    culturalHeritage, status, hostName, googleScriptUrl, deliverables, 
    rights, hospitality, testimonials
  ]);

  // Initial render load
  useEffect(() => {
    updatePreview();
  }, []);

  // Handler to add items to arrays
  const addDeliverable = () => {
    setDeliverables([...deliverables, { icon: "📸", title: "New Deliverable", desc: "Description of what is included." }]);
  };
  const updateDeliverable = (index: number, key: keyof DeliverableItem, value: string) => {
    const updated = [...deliverables];
    updated[index][key] = value;
    setDeliverables(updated);
  };
  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const addTestimonial = () => {
    setTestimonials([...testimonials, { text: "Client review goes here...", author: "Client Name", role: "Owner, Client Business" }]);
  };
  const updateTestimonial = (index: number, key: keyof TestimonialItem, value: string) => {
    const updated = [...testimonials];
    updated[index][key] = value;
    setTestimonials(updated);
  };
  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingOut(true);
    
    try {
      const response = await fetch("/api/proposal/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName,
          clientName,
          eventTitle,
          eventDate,
          location,
          coverageHours,
          eventHours,
          email,
          cashAppLink,
          youtubeId,
          standardValue,
          discount,
          clientInvestment,
          depositAmount,
          balanceAmount,
          balanceDueDate,
          signatureDish,
          brandSpecialization,
          targetRegion,
          culturalHeritage,
          status,
          hostName,
          googleScriptUrl,
          deliverables,
          rights,
          hospitality,
          testimonials
        })
      });
      
      const result = await response.json();
      if (result.url) {
        // Redirect to Stripe checkout page
        window.location.href = result.url;
      } else {
        alert("Failed to initiate payment flow. Please try again.");
        setIsCheckingOut(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("An error occurred. Check server logs.");
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col font-body">
      {/* BUILDER HEADER */}
      <header className="h-16 px-6 border-b border-white/5 bg-dark-900/80 backdrop-blur-md flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black text-sm">W</Link>
          <span className="font-heading font-bold text-sm tracking-wide">
            PROPOSAL BUILDER <span className="text-miami-pink">MVP</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={updatePreview}
            disabled={isRefreshing}
            className="px-4 py-2 border border-white/10 hover:border-white/20 text-xs font-semibold rounded-lg bg-white/5 transition-all flex items-center gap-2"
          >
            {isRefreshing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                Refreshing...
              </>
            ) : (
              <>
                <span>🔄</span>
                Force Refresh Preview
              </>
            )}
          </button>

          <Link href="/" className="text-xs text-white/40 hover:text-white/80 transition-colors">
            Exit Builder
          </Link>
        </div>
      </header>

      {/* CORE SPLIT INTERFACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT WORKSPACE PANELS */}
        <div className="w-[45%] border-r border-white/5 bg-dark-900/40 flex flex-col h-[calc(100vh-64px)]">
          
          {/* TAB MENU */}
          <div className="flex border-b border-white/5 text-sm bg-dark-900/60 p-2 gap-1.5">
            {[
              { id: "basic", label: "Core Specs", icon: "📋" },
              { id: "pricing", label: "Pricing & Terms", icon: "💰" },
              { id: "branding", label: "Culture & Branding", icon: "🎨" },
              { id: "lists", label: "Sections List", icon: "⚙️" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-miami-pink/15 text-miami-pink border border-miami-pink/20 shadow-glow-pink/10"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* FORM WORKSPACE PANEL */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* TAB 1: BASIC SPECS */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-2 mb-2">
                  <h3 className="font-heading font-bold text-base text-miami-blue-light">Core Event Specifications</h3>
                  <p className="text-xs text-white/40 mt-1">Specify key details of the client partnership event.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Client / Brand Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Event / Showcase Title</label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Event Date</label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                      placeholder="September 30, 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Event Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                      placeholder="Miami, FL"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Coverage Hours</label>
                    <input
                      type="text"
                      value={coverageHours}
                      onChange={(e) => setCoverageHours(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                      placeholder="6:00 – 8:00 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Total Event Hours</label>
                    <input
                      type="text"
                      value={eventHours}
                      onChange={(e) => setEventHours(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                      placeholder="4:00 – 9:00 PM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Agency / Creator Name</label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">YouTube Highlight ID</label>
                    <input
                      type="text"
                      value={youtubeId}
                      onChange={(e) => setYoutubeId(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                      placeholder="XXhvNM6MDUU"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRICING & TERMS */}
            {activeTab === "pricing" && (
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-2 mb-2">
                  <h3 className="font-heading font-bold text-base text-miami-blue-light">Investment & Booking Terms</h3>
                  <p className="text-xs text-white/40 mt-1">Configure pricing values. Deposit values will auto-calculate.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Standard Value ($)</label>
                    <input
                      type="number"
                      value={standardValue}
                      onChange={(e) => setStandardValue(Number(e.target.value))}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Discount ($)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Net Investment</label>
                    <div className="w-full bg-dark-900 border border-white/5 text-white/70 rounded-lg py-2 px-3 text-sm font-bold flex items-center h-[38px]">
                      ${clientInvestment}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">50% Booking Deposit</label>
                    <div className="w-full bg-dark-900 border border-white/5 text-miami-pink rounded-lg py-2 px-3 text-sm font-bold flex items-center h-[38px]">
                      ${depositAmount}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Remaining Balance</label>
                    <div className="w-full bg-dark-900 border border-white/5 text-white/70 rounded-lg py-2 px-3 text-sm font-bold flex items-center h-[38px]">
                      ${balanceAmount}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Balance Due Date</label>
                    <input
                      type="text"
                      value={balanceDueDate}
                      onChange={(e) => setBalanceDueDate(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                      placeholder="September 15, 2026"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Contact Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Cash App Payment URL</label>
                    <input
                      type="text"
                      value={cashAppLink}
                      onChange={(e) => setCashAppLink(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BRANDING & CULTURE */}
            {activeTab === "branding" && (
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-2 mb-2">
                  <h3 className="font-heading font-bold text-base text-miami-blue-light">Cultural Fit & Contextual Branding</h3>
                  <p className="text-xs text-white/40 mt-1">Embed localization hooks tailored for specific client categories.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Signature Dish/Service</label>
                    <input
                      type="text"
                      value={signatureDish}
                      onChange={(e) => setSignatureDish(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                      placeholder="Griot Pizza"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Brand Type (e.g. Haitian-owned)</label>
                    <input
                      type="text"
                      value={brandSpecialization}
                      onChange={(e) => setBrandSpecialization(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Target Audience Region</label>
                    <input
                      type="text"
                      value={targetRegion}
                      onChange={(e) => setTargetRegion(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                      placeholder="Miami-Dade and Broward"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Heritage / Brand Identity</label>
                    <input
                      type="text"
                      value={culturalHeritage}
                      onChange={(e) => setCulturalHeritage(e.target.value)}
                      className="w-full bg-dark border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-miami-blue-light transition-all"
                      placeholder="Haitian"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide">Proposal Deposit Status</label>
                    <div className="flex gap-2 bg-dark rounded-lg p-1 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setStatus("pending")}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                          status === "pending"
                            ? "bg-miami-pink text-white shadow-glow-pink/10"
                            : "text-white/45 hover:text-white"
                        }`}
                      >
                        Pending (Checkout)
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("confirmed")}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                          status === "confirmed"
                            ? "bg-emerald-600 text-white shadow-glow-green/10"
                            : "text-white/45 hover:text-white"
                        }`}
                      >
                        Confirmed (Discovery)
                      </button>
                    </div>
                  </div>

                  {status === "confirmed" && (
                    <div className="space-y-4 bg-white/5 p-4 border border-white/10 rounded-xl reveal">
                      <div className="text-xs font-semibold text-miami-blue-light uppercase tracking-wide flex items-center gap-1">
                        <span>📝</span> Discovery Questionnaire Settings
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold text-white/40 mb-1 uppercase tracking-wide">Discovery Host Event Partner</label>
                        <input
                          type="text"
                          value={hostName}
                          onChange={(e) => setHostName(e.target.value)}
                          className="w-full bg-dark border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:border-miami-blue-light transition-all"
                          placeholder="Running Club"
                        />
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold text-white/40 mb-1 uppercase tracking-wide">Google Sheets Script URL (Optional)</label>
                        <input
                          type="text"
                          value={googleScriptUrl}
                          onChange={(e) => setGoogleScriptUrl(e.target.value)}
                          className="w-full bg-dark border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:border-miami-blue-light transition-all"
                          placeholder="https://script.google.com/macros/s/..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: LISTS CONFIG */}
            {activeTab === "lists" && (
              <div className="space-y-5">
                <div className="border-b border-white/5 pb-2 mb-2">
                  <h3 className="font-heading font-bold text-base text-miami-blue-light">Dynamic Page Collections</h3>
                  <p className="text-xs text-white/40 mt-1">Configure individual cards for deliverables and client quotes.</p>
                </div>

                {/* DELIVERABLES LIST EDITOR */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wide flex items-center gap-1.5">
                      <span>📸</span> Deliverables Grid ({deliverables.length})
                    </label>
                    <button
                      type="button"
                      onClick={addDeliverable}
                      className="text-2xs font-bold bg-white/5 border border-white/10 rounded px-2 py-1 hover:bg-white/10 transition-colors"
                    >
                      + Add Card
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {deliverables.map((item, idx) => (
                      <div key={idx} className="bg-dark/40 border border-white/5 rounded-lg p-2.5 space-y-2 relative group">
                        <div className="grid grid-cols-12 gap-2">
                          <input
                            type="text"
                            value={item.icon}
                            onChange={(e) => updateDeliverable(idx, "icon", e.target.value)}
                            className="col-span-2 text-center bg-dark border border-white/10 rounded py-1 px-1 text-sm text-white"
                          />
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateDeliverable(idx, "title", e.target.value)}
                            className="col-span-10 bg-dark border border-white/10 rounded py-1 px-2 text-xs font-semibold text-white"
                          />
                        </div>
                        <textarea
                          value={item.desc}
                          onChange={(e) => updateDeliverable(idx, "desc", e.target.value)}
                          className="w-full bg-dark border border-white/10 rounded py-1 px-2 text-2xs text-white/70 h-12"
                          rows={2}
                        />
                        <button
                          type="button"
                          onClick={() => removeDeliverable(idx)}
                          className="absolute -top-1 -right-1 bg-rose-950 text-rose-300 border border-rose-800/30 rounded-full w-5 h-5 text-2xs font-bold hidden group-hover:flex items-center justify-center hover:bg-rose-900 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TESTIMONIALS LIST EDITOR */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wide flex items-center gap-1.5">
                      <span>❝</span> Client Testimonials ({testimonials.length})
                    </label>
                    <button
                      type="button"
                      onClick={addTestimonial}
                      className="text-2xs font-bold bg-white/5 border border-white/10 rounded px-2 py-1 hover:bg-white/10 transition-colors"
                    >
                      + Add Card
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {testimonials.map((item, idx) => (
                      <div key={idx} className="bg-dark/40 border border-white/5 rounded-lg p-2.5 space-y-2 relative group">
                        <textarea
                          value={item.text}
                          onChange={(e) => updateTestimonial(idx, "text", e.target.value)}
                          className="w-full bg-dark border border-white/10 rounded py-1.5 px-2 text-2xs text-white/70 h-16"
                          rows={3}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={item.author}
                            onChange={(e) => updateTestimonial(idx, "author", e.target.value)}
                            className="bg-dark border border-white/10 rounded py-1 px-2 text-2xs text-white font-semibold"
                            placeholder="Author Name"
                          />
                          <input
                            type="text"
                            value={item.role}
                            onChange={(e) => updateTestimonial(idx, "role", e.target.value)}
                            className="bg-dark border border-white/10 rounded py-1 px-2 text-2xs text-white/50"
                            placeholder="Author Role & Business"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTestimonial(idx)}
                          className="absolute -top-1 -right-1 bg-rose-950 text-rose-300 border border-rose-800/30 rounded-full w-5 h-5 text-2xs font-bold hidden group-hover:flex items-center justify-center hover:bg-rose-900 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* CHECKOUT FLOW BOX - Premium Footer Section */}
          <div className="p-6 border-t border-white/5 bg-dark-900/90 space-y-3 z-10 shadow-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Selected Plan:</span>
              <span className="font-heading font-black text-miami-blue-light">PROPOSAL GENERATOR BUNDLE</span>
            </div>
            
            <form onSubmit={handleCheckout} className="space-y-3">
              <button
                type="submit"
                disabled={isCheckingOut}
                className="w-full bg-gradient-to-r from-miami-pink to-miami-blue-light hover:opacity-95 font-heading font-black text-sm text-white py-3.5 px-4 rounded-xl shadow-glow-pink/15 transition-all flex items-center justify-center gap-2 tracking-wide"
              >
                {isCheckingOut ? (
                  <>
                    <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    SECURELY ROUTING TO STRIPE...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    COMPILE & DOWNLOAD FOR $4.99
                  </>
                )}
              </button>
            </form>
            
            <p className="text-[10px] text-white/30 text-center leading-normal">
              Stateless MVP Builder. We secure your checkout session through Stripe. Upon confirmation, your fully rendered customized assets are delivered as a ZIP download instantly.
            </p>
          </div>

        </div>

        {/* RIGHT PREVIEW CANVAS */}
        <div className="flex-1 bg-dark-900 flex flex-col h-[calc(100vh-64px)]">
          
          {/* VIEWPORT CONTROLS */}
          <div className="h-12 border-b border-white/5 bg-dark-900/60 px-6 flex items-center justify-between text-xs text-white/50 font-semibold select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-miami-pink shadow-glow-pink/40 animate-pulse"></span>
              <span>LIVE INTERACTION PREVIEW</span>
            </div>

            <div className="flex items-center bg-dark border border-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setViewportMode("desktop")}
                className={`py-1 px-2.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                  viewportMode === "desktop"
                    ? "bg-white/10 text-white"
                    : "hover:text-white"
                }`}
              >
                <span>🖥️</span>
                <span>Desktop (Full)</span>
              </button>
              <button
                onClick={() => setViewportMode("mobile")}
                className={`py-1 px-2.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                  viewportMode === "mobile"
                    ? "bg-white/10 text-white"
                    : "hover:text-white"
                }`}
              >
                <span>📱</span>
                <span>Mobile (375px)</span>
              </button>
            </div>
          </div>

          {/* IFRAME FRAME CONTAINER */}
          <div className="flex-1 p-6 flex items-center justify-center overflow-hidden relative">
            
            {/* Ambient glowing blobs in background */}
            <div className="absolute w-[300px] h-[300px] bg-miami-pink/5 rounded-full blur-[80px] top-10 right-10 pointer-events-none" />
            <div className="absolute w-[300px] h-[300px] bg-miami-blue-light/3 rounded-full blur-[80px] bottom-10 left-10 pointer-events-none" />

            <div
              className={`h-full border border-white/5 rounded-2xl shadow-2xl overflow-hidden bg-dark transition-all duration-300 relative flex flex-col ${
                viewportMode === "mobile"
                  ? "w-[375px] max-w-full"
                  : "w-full"
              }`}
            >
              {iframeSrc ? (
                <iframe
                  src={iframeSrc}
                  className="w-full flex-1 border-0 bg-dark"
                  title="Proposal Live Preview Canvas"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                  <span className="w-8 h-8 border-2 border-t-transparent border-miami-pink rounded-full animate-spin"></span>
                  <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Initializing Canvas...</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

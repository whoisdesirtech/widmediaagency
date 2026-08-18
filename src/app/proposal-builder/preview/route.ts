import { NextRequest, NextResponse } from "next/server";
import { generateProposal, ProposalData } from "@/lib/proposal-generator";

function safeJsonParse<T>(param: string | null, fallback: T): T {
  if (!param) return fallback;
  try {
    return JSON.parse(param) as T;
  } catch (e) {
    console.error("Failed to parse query param JSON:", e);
    return fallback;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const clientName = searchParams.get("clientName") || "Haitian Brand";
  const eventTitle = searchParams.get("eventTitle") || "Grand Opening & Showcase";
  const eventDate = searchParams.get("eventDate") || "September 30, 2026";
  const location = searchParams.get("location") || "Miami, FL";
  
  const agencyName = searchParams.get("agencyName") || "WhoIsDésir® Media";
  const coverageHours = searchParams.get("coverageHours") || "6:00 – 8:00 PM";
  const eventHours = searchParams.get("eventHours") || "4:00 – 9:00 PM";
  const email = searchParams.get("email") || "digitalvurv@gmail.com";
  const cashAppLink = searchParams.get("cashAppLink") || "https://cash.app/$DesirDigital";
  const youtubeId = searchParams.get("youtubeId") || "XXhvNM6MDUU";
  
  const standardValue = parseInt(searchParams.get("standardValue") || "375", 10);
  const discount = parseInt(searchParams.get("discount") || "225", 10);
  const clientInvestment = parseInt(searchParams.get("clientInvestment") || "150", 10);
  const depositAmount = parseInt(searchParams.get("depositAmount") || "75", 10);
  const balanceAmount = parseInt(searchParams.get("balanceAmount") || "75", 10);
  const balanceDueDate = searchParams.get("balanceDueDate") || "September 15, 2026";
  
  const signatureDish = searchParams.get("signatureDish") || "Griot Pizza";
  const brandSpecialization = searchParams.get("brandSpecialization") || "Haitian-owned";
  const targetRegion = searchParams.get("targetRegion") || "Miami-Dade and Broward";
  const culturalHeritage = searchParams.get("culturalHeritage") || "Haitian";
  
  const status = (searchParams.get("status") as "pending" | "confirmed") || "pending";
  const hostName = searchParams.get("hostName") || "Running Club";
  const googleScriptUrl = searchParams.get("googleScriptUrl") || "";

  // Parse list parameters
  const deliverables = safeJsonParse(searchParams.get("deliverables"), undefined);
  const rights = safeJsonParse(searchParams.get("rights"), undefined);
  const hospitality = safeJsonParse(searchParams.get("hospitality"), undefined);
  const testimonials = safeJsonParse(searchParams.get("testimonials"), undefined);

  const proposalData: ProposalData = {
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
  };

  try {
    const compiled = generateProposal(proposalData);

    // Inline CSS and JS into the HTML output for self-contained iframe rendering
    let previewHtml = compiled.html;
    
    previewHtml = previewHtml.replace(
      '<link rel="stylesheet" href="styles.css">',
      `<style>${compiled.css}</style>`
    );
    
    previewHtml = previewHtml.replace(
      '<script src="script.js"></script>',
      `<script>${compiled.js}</script>`
    );

    return new NextResponse(previewHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error: any) {
    console.error("Error generating proposal preview:", error);
    return new NextResponse(`<h3>Error rendering proposal preview: ${error.message}</h3>`, {
      status: 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  }
}

/**
 * TypeScript interfaces for the WhoIsDésir® Media Proposal Generator.
 */

export interface ProposalData {
  agencyName?: string;
  clientName: string;
  eventTitle: string;
  eventDate: string;
  location: string;
  coverageHours?: string;
  eventHours?: string;
  email?: string;
  cashAppLink?: string;
  youtubeId?: string;
  standardValue?: number;
  discount?: number;
  clientInvestment?: number;
  depositAmount?: number;
  balanceAmount?: number;
  balanceDueDate?: string;
  signatureDish?: string;
  brandSpecialization?: string;
  targetRegion?: string;
  culturalHeritage?: string;
  status?: "pending" | "confirmed";
  hostName?: string;
  googleScriptUrl?: string;
  deliverables?: { icon: string; title: string; desc: string }[];
  rights?: string[];
  hospitality?: { icon: string; title: string; desc: string }[];
  testimonials?: { text: string; author: string; role: string }[];
}

export interface GeneratedProposal {
  html: string;
  css: string;
  js: string;
  readme: string;
}

// Audit Agent — Modular scoring framework
// Each module scores one aspect of an influencer's brand on a 0-100 scale.
// The orchestrator runs all modules and produces a final composite score.

export interface ScoreInput {
  influencerName: string;
  platform: string;
  username?: string;
  niche?: string;
  followers?: number;
  engagementRate?: number;
  contentFrequency?: string;
  brandKit?: any;
  auditData?: any;
}

export interface ModuleScore {
  module: string;
  score: number; // 0-100
  weight: number;
  breakdown: Record<string, number>;
  notes: string[];
  recommendations: string[];
}

export interface AuditResult {
  overallScore: number;
  grade: string;
  modules: ModuleScore[];
  summary: string;
  generatedAt: string;
  dataCompleteness: DataCompleteness;
  disclaimers: string[];
}

export interface DataCompleteness {
  availableFields: string[];
  missingFields: string[];
  percentComplete: number;
  warnings: string[];
}

// --- Safety: Data completeness check ---
export function checkDataCompleteness(input: ScoreInput): DataCompleteness {
  const available: string[] = [];
  const missing: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (input.influencerName) available.push('influencerName');
  else missing.push('influencerName');

  if (input.platform) available.push('platform');
  else missing.push('platform');

  // Optional but important fields
  if (input.username) available.push('username');
  else { missing.push('username'); warnings.push('Username not provided — profile optimization scoring limited'); }

  if (input.niche) available.push('niche');
  else { missing.push('niche'); warnings.push('Niche not provided — market position scoring limited'); }

  if (input.followers && input.followers > 0) available.push('followers');
  else { missing.push('followers'); warnings.push('Follower count not provided — social presence scoring uses 0 baseline'); }

  if (input.engagementRate && input.engagementRate > 0) available.push('engagementRate');
  else { missing.push('engagementRate'); warnings.push('Engagement rate not provided — engagement scoring uses 0 baseline'); }

  if (input.contentFrequency) available.push('contentFrequency');
  else { missing.push('contentFrequency'); warnings.push('Content frequency not provided — content strategy scoring limited'); }

  // Brand Kit fields
  if (input.brandKit) {
    const bk = input.brandKit;
    if (bk.name) available.push('brandKit.name');
    else missing.push('brandKit.name');
    if (bk.mission) available.push('brandKit.mission');
    else missing.push('brandKit.mission');
    if (bk.positioning) available.push('brandKit.positioning');
    else missing.push('brandKit.positioning');
    if (bk.niche) available.push('brandKit.niche');
    else missing.push('brandKit.niche');
    if (bk.targetAudience) available.push('brandKit.targetAudience');
    else missing.push('brandKit.targetAudience');
    if (bk.brandPersonality) available.push('brandKit.brandPersonality');
    else missing.push('brandKit.brandPersonality');
    if (bk.primaryColor && bk.primaryColor !== '#000000') available.push('brandKit.primaryColor');
    else missing.push('brandKit.primaryColor');
    if (bk.voice) available.push('brandKit.voice');
    else missing.push('brandKit.voice');
    if (bk.tone) available.push('brandKit.tone');
    else missing.push('brandKit.tone');
    if (bk.instagramBio || bk.tiktokBio || bk.youtubeDescription) available.push('brandKit.socialProfiles');
    else missing.push('brandKit.socialProfiles');
  } else {
    missing.push('brandKit');
    warnings.push('No Brand Kit found — brand identity and visual identity scoring will be limited');
  }

  const total = available.length + missing.length;
  const percentComplete = total > 0 ? Math.round((available.length / total) * 100) : 0;

  return {
    availableFields: available,
    missingFields: missing,
    percentComplete,
    warnings,
  };
}

// --- Grade mapping ---
export function scoreToGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

// --- Module: Brand Identity ---
export function scoreBrandIdentity(input: ScoreInput): ModuleScore {
  const breakdown: Record<string, number> = {};
  const notes: string[] = [];
  const recommendations: string[] = [];

  const brandKit = input.brandKit;

  // Name consistency (20 pts)
  if (brandKit?.name) { breakdown['Name defined'] = 20; }
  else { breakdown['Name defined'] = 0; recommendations.push('Define a clear brand/creator name'); }

  // Mission clarity (20 pts)
  if (brandKit?.mission && brandKit.mission.length > 20) { breakdown['Mission clarity'] = 20; }
  else if (brandKit?.mission) { breakdown['Mission clarity'] = 10; notes.push('Mission could be more detailed'); }
  else { breakdown['Mission clarity'] = 0; recommendations.push('Write a clear mission statement'); }

  // Positioning (20 pts)
  if (brandKit?.positioning) { breakdown['Positioning'] = 20; }
  else { breakdown['Positioning'] = 0; recommendations.push('Define brand positioning statement'); }

  // Target audience (20 pts)
  if (brandKit?.targetAudience && brandKit.targetAudience.length > 15) { breakdown['Audience defined'] = 20; }
  else if (brandKit?.targetAudience) { breakdown['Audience defined'] = 10; notes.push('Audience description could be richer'); }
  else { breakdown['Audience defined'] = 0; recommendations.push('Clearly define target audience'); }

  // Niche (10 pts)
  if (brandKit?.niche) { breakdown['Niche clarity'] = 10; }
  else { breakdown['Niche clarity'] = 0; recommendations.push('Specify niche/industry focus'); }

  // Personality (10 pts)
  if (brandKit?.brandPersonality) { breakdown['Personality'] = 10; }
  else { breakdown['Personality'] = 0; recommendations.push('Define brand personality traits'); }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    module: 'Brand Identity',
    score: total,
    weight: 0.2,
    breakdown,
    notes,
    recommendations,
  };
}

// --- Module: Visual Identity ---
export function scoreVisualIdentity(input: ScoreInput): ModuleScore {
  const breakdown: Record<string, number> = {};
  const notes: string[] = [];
  const recommendations: string[] = [];
  const brandKit = input.brandKit;

  // Color palette (30 pts)
  let colorScore = 0;
  if (brandKit?.primaryColor && brandKit.primaryColor !== '#000000') colorScore += 15;
  if (brandKit?.secondaryColor && brandKit.secondaryColor !== '#FFFFFF') colorScore += 10;
  if (brandKit?.accentColor) colorScore += 5;
  breakdown['Color palette'] = Math.min(colorScore, 30);
  if (colorScore < 20) recommendations.push('Develop a cohesive color palette with primary, secondary, and accent colors');

  // Typography (30 pts)
  let typeScore = 0;
  if (brandKit?.headingFont) typeScore += 15;
  if (brandKit?.bodyFont) typeScore += 15;
  breakdown['Typography'] = typeScore;
  if (typeScore === 0) recommendations.push('Select consistent heading and body fonts');

  // Visual consistency (20 pts)
  const hasSections = brandKit?.sections?.length || 0;
  if (hasSections >= 3) breakdown['Visual sections'] = 20;
  else if (hasSections >= 1) { breakdown['Visual sections'] = 10; notes.push('Add more brand kit sections for visual consistency'); }
  else { breakdown['Visual sections'] = 0; recommendations.push('Create brand kit sections for visual guidelines'); }

  // Color harmony (20 pts)
  if (brandKit?.primaryColor && brandKit?.accentColor) {
    breakdown['Color harmony'] = 15;
    notes.push('Color combination present — verify harmony manually');
  } else {
    breakdown['Color harmony'] = 0;
    recommendations.push('Ensure color palette works harmoniously together');
  }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    module: 'Visual Identity',
    score: total,
    weight: 0.2,
    breakdown,
    notes,
    recommendations,
  };
}

// --- Module: Content Strategy ---
export function scoreContentStrategy(input: ScoreInput): ModuleScore {
  const breakdown: Record<string, number> = {};
  const notes: string[] = [];
  const recommendations: string[] = [];
  const brandKit = input.brandKit;

  // Content pillars (25 pts)
  let pillars: any[] = [];
  try {
    pillars = brandKit?.contentPillars ? (typeof brandKit.contentPillars === 'string' ? JSON.parse(brandKit.contentPillars) : brandKit.contentPillars) : [];
  } catch {}
  if (pillars.length >= 3) breakdown['Content pillars'] = 25;
  else if (pillars.length > 0) { breakdown['Content pillars'] = 10; notes.push('Add more content pillars (aim for 3-5)'); }
  else { breakdown['Content pillars'] = 0; recommendations.push('Define 3-5 content pillars'); }

  // Voice/tone (25 pts)
  if (brandKit?.voice && brandKit?.tone) breakdown['Voice & tone'] = 25;
  else if (brandKit?.voice || brandKit?.tone) { breakdown['Voice & tone'] = 12; notes.push('Define both voice and tone'); }
  else { breakdown['Voice & tone'] = 0; recommendations.push('Define brand voice and tone guidelines'); }

  // Social profiles (25 pts)
  let socialScore = 0;
  if (brandKit?.instagramBio) socialScore += 8;
  if (brandKit?.tiktokBio) socialScore += 8;
  if (brandKit?.youtubeDescription) socialScore += 9;
  breakdown['Social profiles'] = Math.min(socialScore, 25);
  if (socialScore < 15) recommendations.push('Complete social media bio/description sections');

  // Content frequency (25 pts)
  if (input.contentFrequency) { breakdown['Content frequency'] = 20; notes.push('Content frequency defined'); }
  else { breakdown['Content frequency'] = 0; recommendations.push('Define posting frequency/schedule'); }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    module: 'Content Strategy',
    score: total,
    weight: 0.2,
    breakdown,
    notes,
    recommendations,
  };
}

// --- Module: Social Media Presence ---
export function scoreSocialPresence(input: ScoreInput): ModuleScore {
  const breakdown: Record<string, number> = {};
  const notes: string[] = [];
  const recommendations: string[] = [];

  // Follower count (25 pts)
  if (input.followers) {
    if (input.followers >= 100000) breakdown['Audience size'] = 25;
    else if (input.followers >= 10000) breakdown['Audience size'] = 20;
    else if (input.followers >= 1000) { breakdown['Audience size'] = 15; notes.push('Growing audience — focus on engagement'); }
    else { breakdown['Audience size'] = 5; notes.push('Early-stage audience'); }
  } else {
    breakdown['Audience size'] = 0;
    recommendations.push('Track follower count metrics');
  }

  // Engagement rate (30 pts)
  if (input.engagementRate) {
    if (input.engagementRate >= 5) breakdown['Engagement rate'] = 30;
    else if (input.engagementRate >= 3) breakdown['Engagement rate'] = 22;
    else if (input.engagementRate >= 1) { breakdown['Engagement rate'] = 15; notes.push('Average engagement — room to improve'); }
    else { breakdown['Engagement rate'] = 5; recommendations.push('Improve engagement rate through better content strategy'); }
  } else {
    breakdown['Engagement rate'] = 0;
    recommendations.push('Track and improve engagement rate');
  }

  // Platform fit (25 pts)
  if (input.platform) {
    breakdown['Platform presence'] = 20;
    notes.push(`Primary platform: ${input.platform}`);
  } else {
    breakdown['Platform presence'] = 0;
    recommendations.push('Define primary platform');
  }

  // Username/branding (20 pts)
  if (input.username) { breakdown['Username consistency'] = 15; notes.push(`@${input.username}`); }
  else { breakdown['Username consistency'] = 0; recommendations.push('Ensure consistent username across platforms'); }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    module: 'Social Media Presence',
    score: total,
    weight: 0.2,
    breakdown,
    notes,
    recommendations,
  };
}

// --- Module: Market Position ---
export function scoreMarketPosition(input: ScoreInput): ModuleScore {
  const breakdown: Record<string, number> = {};
  const notes: string[] = [];
  const recommendations: string[] = [];

  // Niche clarity (30 pts)
  if (input.brandKit?.niche) { breakdown['Niche clarity'] = 25; notes.push(`Niche: ${input.brandKit.niche}`); }
  else { breakdown['Niche clarity'] = 0; recommendations.push('Define niche/industry focus for competitive positioning'); }

  // Differentiation (30 pts)
  if (input.brandKit?.positioning && input.brandKit.positioning.length > 20) {
    breakdown['Differentiation'] = 25;
    notes.push('Positioning statement present');
  } else {
    breakdown['Differentiation'] = 10;
    recommendations.push('Strengthen positioning to differentiate from competitors');
  }

  // Target market (20 pts)
  if (input.brandKit?.targetAudience) { breakdown['Target market'] = 20; }
  else { breakdown['Target market'] = 0; recommendations.push('Define target market for strategic positioning'); }

  // Brand maturity (20 pts)
  const sectionCount = input.brandKit?.sections?.length || 0;
  if (sectionCount >= 5) breakdown['Brand maturity'] = 20;
  else if (sectionCount >= 3) breakdown['Brand maturity'] = 15;
  else if (sectionCount >= 1) breakdown['Brand maturity'] = 8;
  else { breakdown['Brand maturity'] = 0; recommendations.push('Complete more brand kit sections to mature the brand'); }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    module: 'Market Position',
    score: total,
    weight: 0.2,
    breakdown,
    notes,
    recommendations,
  };
}

// --- Pipeline stages ---
export type PipelineStage =
  | 'input-validation'
  | 'data-completeness-check'
  | 'profile-analysis'
  | 'content-brand-analysis'
  | 'scoring'
  | 'recommendations'
  | 'brand-kit-preparation'
  | 'human-review-gate'
  | 'final-audit';

export interface PipelineResult {
  stages: { stage: PipelineStage; status: 'completed' | 'skipped' | 'pending-review'; output: any }[];
  auditResult: AuditResult;
  readyForReview: boolean;
}

// --- Staged pipeline orchestrator ---
export function runAuditPipeline(input: ScoreInput): PipelineResult {
  const stages: PipelineResult['stages'] = [];

  // Stage 1: Input Validation
  const inputValid = !!input.influencerName && !!input.platform;
  stages.push({
    stage: 'input-validation',
    status: inputValid ? 'completed' : 'skipped',
    output: { valid: inputValid, influencerName: input.influencerName, platform: input.platform },
  });

  // Stage 2: Data Completeness Check
  const dataCompleteness = checkDataCompleteness(input);
  stages.push({
    stage: 'data-completeness-check',
    status: 'completed',
    output: dataCompleteness,
  });

  // Stage 3: Profile Analysis
  const profileAnalysis = {
    hasUsername: !!input.username,
    hasNiche: !!input.niche,
    hasFollowerData: !!(input.followers && input.followers > 0),
    hasEngagementData: !!(input.engagementRate && input.engagementRate > 0),
    hasContentFrequency: !!input.contentFrequency,
    dataQuality: dataCompleteness.percentComplete >= 70 ? 'good' : dataCompleteness.percentComplete >= 40 ? 'limited' : 'insufficient',
  };
  stages.push({
    stage: 'profile-analysis',
    status: 'completed',
    output: profileAnalysis,
  });

  // Stage 4: Content & Brand Analysis
  const brandKit = input.brandKit;
  const contentBrandAnalysis = {
    hasBrandKit: !!brandKit,
    brandIdentityComplete: !!(brandKit?.name && brandKit?.mission && brandKit?.positioning),
    visualIdentityComplete: !!(brandKit?.primaryColor && brandKit?.headingFont),
    contentStrategyComplete: !!(brandKit?.voice && brandKit?.tone),
    socialProfilesComplete: !!(brandKit?.instagramBio || brandKit?.tiktokBio),
    maturityLevel: (brandKit?.sections?.length || 0) >= 5 ? 'mature' : (brandKit?.sections?.length || 0) >= 2 ? 'developing' : 'nascent',
  };
  stages.push({
    stage: 'content-brand-analysis',
    status: 'completed',
    output: contentBrandAnalysis,
  });

  // Stage 5: Scoring
  const modules = [
    scoreBrandIdentity(input),
    scoreVisualIdentity(input),
    scoreContentStrategy(input),
    scoreSocialPresence(input),
    scoreMarketPosition(input),
  ];
  stages.push({
    stage: 'scoring',
    status: 'completed',
    output: { moduleCount: modules.length, averageScore: Math.round(modules.reduce((s, m) => s + m.score, 0) / modules.length) },
  });

  // Stage 6: Recommendations
  const allRecommendations = modules.flatMap(m => m.recommendations);
  stages.push({
    stage: 'recommendations',
    status: 'completed',
    output: { count: allRecommendations.length, top3: allRecommendations.slice(0, 3) },
  });

  // Stage 7: Brand Kit Preparation
  const brandKitReady = brandKit && dataCompleteness.percentComplete >= 50;
  stages.push({
    stage: 'brand-kit-preparation',
    status: brandKitReady ? 'completed' : 'skipped',
    output: {
      brandKitExists: !!brandKit,
      ready: brandKitReady,
      suggestion: brandKit ? 'Brand kit exists — review and update sections' : 'Create a brand kit from audit recommendations',
    },
  });

  // Stage 8: Human Review Gate (always requires review)
  stages.push({
    stage: 'human-review-gate',
    status: 'pending-review',
    output: {
      message: 'This audit requires human review before being published. Scores are algorithmic assessments, not objective facts.',
      requiredActions: ['Review scores for accuracy', 'Verify data completeness', 'Approve or request revisions'],
    },
  });

  // Stage 9: Final Audit
  const overallScore = Math.round(
    modules.reduce((sum, m) => sum + m.score * m.weight, 0) * (100 / modules.reduce((sum, m) => sum + m.weight, 0))
  );
  const grade = scoreToGrade(overallScore);

  // Safety disclaimers
  const disclaimers: string[] = [
    'This audit is an algorithmic assessment, not an objective truth. Scores reflect available data and rule-based heuristics.',
    'AI-generated scores should be reviewed by a human before being published or shared with clients.',
  ];
  if (dataCompleteness.percentComplete < 50) {
    disclaimers.push(`Data completeness is only ${dataCompleteness.percentComplete}%. Scores may not accurately represent the influencer's actual brand strength.`);
  }
  if (!input.followers || input.followers === 0) {
    disclaimers.push('Follower count: Unknown or not provided. Do not assume a follower count.');
  }
  if (!input.engagementRate || input.engagementRate === 0) {
    disclaimers.push('Engagement rate: Unknown or not provided. Do not assume an engagement rate.');
  }

  const summary = `Audit complete for ${input.influencerName} on ${input.platform}. Overall score: ${overallScore}/100 (${grade}). ` +
    `Data completeness: ${dataCompleteness.percentComplete}%. ` +
    `Pipeline: ${stages.filter(s => s.status === 'completed').length}/${stages.length} stages completed. ` +
    `Top priorities: ${allRecommendations.slice(0, 3).join('; ') || 'No critical issues found.'}`;

  stages.push({
    stage: 'final-audit',
    status: 'completed',
    output: { overallScore, grade, requiresHumanReview: true },
  });

  return {
    stages,
    auditResult: {
      overallScore,
      grade,
      modules,
      summary,
      generatedAt: new Date().toISOString(),
      dataCompleteness,
      disclaimers,
    },
    readyForReview: false, // Always requires human review
  };
}

// --- Legacy single-pass orchestrator (kept for backward compatibility) ---
export function runAudit(input: ScoreInput): AuditResult {
  return runAuditPipeline(input).auditResult;
}

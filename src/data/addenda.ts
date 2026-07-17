export interface AddendumTemplate {
  roleType: string;
  title: string;
  icon: string;
  description: string;
  fields: AddendumField[];
}

export interface AddendumField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
  options?: string[];
  defaultValue?: string | number | boolean;
  required: boolean;
  description?: string;
}

export const ADDENDUM_TEMPLATES: AddendumTemplate[] = [
  {
    roleType: 'photography',
    title: 'Photography Addendum',
    icon: '📸',
    description: 'Covers image deliverables, licensing, equipment, and post-production specifics.',
    fields: [
      { id: 'edited_image_count', label: 'Number of Edited Images', type: 'number', defaultValue: 50, required: true },
      { id: 'raw_delivery', label: 'RAW File Delivery', type: 'select', options: ['Not included', 'Included at extra cost', 'Included'], defaultValue: 'Not included', required: true },
      { id: 'lighting_setup', label: 'Lighting Setup Required', type: 'select', options: ['Natural light only', 'Basic flash', 'Full studio lighting'], defaultValue: 'Natural light only', required: false },
      { id: 'second_shooter', label: 'Second Shooter Required', type: 'boolean', defaultValue: false, required: false },
      { id: 'travel_fees', label: 'Travel Fees', type: 'text', defaultValue: '', required: false, description: 'Specify travel fee or "Included within X miles"' },
      { id: 'image_licensing', label: 'Image Licensing Terms', type: 'select', options: ['Full commercial license', 'Limited use (specify)', 'Editorial only'], defaultValue: 'Full commercial license', required: true },
      { id: 'turnaround_days', label: 'Delivery Turnaround (business days)', type: 'number', defaultValue: 5, required: true },
      { id: 'photography_style', label: 'Photography Style', type: 'select', options: ['Editorial', 'Documentary', 'Commercial', 'Mixed'], defaultValue: 'Mixed', required: false },
      { id: 'retouching_level', label: 'Retouching Level', type: 'select', options: ['Basic color correction', 'Standard editing', 'Advanced retouching'], defaultValue: 'Standard editing', required: false },
    ],
  },
  {
    roleType: 'videography',
    title: 'Videography Addendum',
    icon: '🎬',
    description: 'Covers camera packages, drone usage, audio, editing, export formats, and social media versions.',
    fields: [
      { id: 'camera_package', label: 'Camera Package', type: 'select', options: ['Standard (1080p)', 'Professional (4K)', 'Cinema (4K+ / RAW)'], defaultValue: 'Professional (4K)', required: true },
      { id: 'drone_usage', label: 'Drone Usage', type: 'boolean', defaultValue: false, required: false, description: 'Requires FAA/CAA license on file' },
      { id: 'audio_recording', label: 'Audio Recording', type: 'select', options: ['Camera audio only', 'External recorder', 'Wireless lav + mixer'], defaultValue: 'Camera audio only', required: false },
      { id: 'editing_included', label: 'Editing Included', type: 'boolean', defaultValue: true, required: true },
      { id: 'revision_rounds', label: 'Revision Rounds', type: 'number', defaultValue: 2, required: true },
      { id: 'export_formats', label: 'Export Formats', type: 'text', defaultValue: 'MP4 (H.264), MOV', required: true },
      { id: 'captions_subtitles', label: 'Captions / Subtitles', type: 'boolean', defaultValue: false, required: false },
      { id: 'social_media_versions', label: 'Social Media Versions', type: 'boolean', defaultValue: false, required: false, description: 'Vertical 9:16, Square 1:1 versions' },
      { id: 'runtime_minutes', label: 'Final Video Runtime (minutes)', type: 'number', defaultValue: 3, required: true },
      { id: 'b_roll_included', label: 'B-Roll Footage Included', type: 'boolean', defaultValue: true, required: false },
    ],
  },
  {
    roleType: 'social-media',
    title: 'Social Media Management Addendum',
    icon: '📱',
    description: 'Covers platforms, posting frequency, community management, analytics, and approval workflows.',
    fields: [
      { id: 'platforms', label: 'Platforms Managed', type: 'text', defaultValue: 'Instagram, Facebook', required: true, description: 'Comma-separated list' },
      { id: 'posting_frequency', label: 'Posting Frequency', type: 'select', options: ['Daily', '3x per week', 'Weekly', 'Custom'], defaultValue: '3x per week', required: true },
      { id: 'community_management', label: 'Community Management', type: 'boolean', defaultValue: false, required: false, description: 'Responding to comments and DMs' },
      { id: 'analytics_reporting', label: 'Monthly Analytics Report', type: 'boolean', defaultValue: true, required: false },
      { id: 'caption_writing', label: 'Caption Writing Included', type: 'boolean', defaultValue: true, required: true },
      { id: 'approval_workflow', label: 'Approval Workflow', type: 'select', options: ['Pre-approval required', 'Post-approval', 'Autonomous'], defaultValue: 'Pre-approval required', required: true },
      { id: 'content_pillars', label: 'Content Pillars', type: 'textarea', defaultValue: '', required: false, description: 'Describe main content themes' },
      { id: 'hashtag_strategy', label: 'Hashtag Strategy', type: 'boolean', defaultValue: true, required: false },
      { id: 'story_reels', label: 'Stories / Reels Included', type: 'boolean', defaultValue: false, required: false },
    ],
  },
  {
    roleType: 'designer',
    title: 'Graphic Design Addendum',
    icon: '🎨',
    description: 'Covers file formats, source files, brand guidelines, revision limits, and software requirements.',
    fields: [
      { id: 'file_formats', label: 'Deliverable File Formats', type: 'text', defaultValue: 'PNG, PDF, PSD', required: true },
      { id: 'source_files', label: 'Source Files Included', type: 'boolean', defaultValue: true, required: true },
      { id: 'brand_guidelines', label: 'Brand Guidelines Provided', type: 'boolean', defaultValue: false, required: false, description: 'Agency provides brand guide to designer' },
      { id: 'revision_rounds', label: 'Revision Rounds', type: 'number', defaultValue: 2, required: true },
      { id: 'design_software', label: 'Design Software', type: 'select', options: ['Adobe Creative Suite', 'Figma', 'Canva Pro', 'Other'], defaultValue: 'Adobe Creative Suite', required: true },
      { id: 'deliverable_type', label: 'Deliverable Type', type: 'text', defaultValue: '', required: true, description: 'e.g., Social media graphics, brochures, logos' },
      { id: 'print_ready', label: 'Print-Ready Files', type: 'boolean', defaultValue: false, required: false },
      { id: 'animation_included', label: 'Animated Versions', type: 'boolean', defaultValue: false, required: false },
    ],
  },
  {
    roleType: 'ai-automation',
    title: 'AI Automation Addendum',
    icon: '🤖',
    description: 'Covers workflow ownership, documentation, API key security, and transferability.',
    fields: [
      { id: 'workflow_ownership', label: 'Workflow Ownership', type: 'select', options: ['Agency owns all workflows', 'Shared ownership', 'Contractor retains base workflows'], defaultValue: 'Agency owns all workflows', required: true },
      { id: 'documentation_required', label: 'Documentation Required', type: 'boolean', defaultValue: true, required: true, description: 'Written documentation of all automations' },
      { id: 'api_key_security', label: 'API Key Management', type: 'select', options: ['Agency-provided keys', 'Contractor-provided (reimbursed)', 'Shared accounts'], defaultValue: 'Agency-provided keys', required: true },
      { id: 'transferability', label: 'Workflow Transferability', type: 'select', options: ['Fully transferable', 'Partially transferable', 'Not transferable (licensed)'], defaultValue: 'Fully transferable', required: true },
      { id: 'platform_list', label: 'Platforms & Tools Used', type: 'text', defaultValue: '', required: true, description: 'e.g., Zapier, Make, n8n, OpenAI, custom APIs' },
      { id: 'data_retention', label: 'Data Retention Policy', type: 'textarea', defaultValue: 'All Agency data must be deleted from third-party platforms within 5 business days of project completion.', required: true },
      { id: 'model_training', label: 'AI Model Training Data', type: 'select', options: ['No Agency data used for training', 'Opt-out confirmed', 'Contractor confirms compliance'], defaultValue: 'Contractor confirms compliance', required: false },
      { id: 'maintenance_period', label: 'Post-Delivery Maintenance (days)', type: 'number', defaultValue: 30, required: false, description: 'Days of bug-fix support after delivery' },
    ],
  },
  {
    roleType: 'web-designer',
    title: 'Web Design Addendum',
    icon: '🌐',
    description: 'Covers design files, prototypes, responsive requirements, and CMS integration.',
    fields: [
      { id: 'design_tool', label: 'Design Tool', type: 'select', options: ['Figma', 'Adobe XD', 'Sketch', 'Other'], defaultValue: 'Figma', required: true },
      { id: 'responsive_design', label: 'Responsive Design', type: 'boolean', defaultValue: true, required: true },
      { id: 'prototype_included', label: 'Interactive Prototype', type: 'boolean', defaultValue: true, required: false },
      { id: 'cms_integration', label: 'CMS Integration', type: 'text', defaultValue: '', required: false, description: 'e.g., WordPress, Webflow, custom' },
      { id: 'page_count', label: 'Number of Pages', type: 'number', defaultValue: 1, required: true },
      { id: 'revision_rounds', label: 'Revision Rounds', type: 'number', defaultValue: 2, required: true },
      { id: 'design_system', label: 'Design System Deliverable', type: 'boolean', defaultValue: false, required: false },
    ],
  },
  {
    roleType: 'developer',
    title: 'Development Addendum',
    icon: '💻',
    description: 'Covers tech stack, repository access, deployment, and code ownership.',
    fields: [
      { id: 'tech_stack', label: 'Tech Stack', type: 'text', defaultValue: '', required: true, description: 'e.g., React, Next.js, Node.js, PostgreSQL' },
      { id: 'repository_access', label: 'Repository Access', type: 'select', options: ['Agency-owned repo', 'Contractor-owned (transfer on completion)', 'Shared'], defaultValue: 'Agency-owned repo', required: true },
      { id: 'deployment', label: 'Deployment Included', type: 'boolean', defaultValue: false, required: false },
      { id: 'code_comments', label: 'Code Documentation Required', type: 'boolean', defaultValue: true, required: false },
      { id: 'testing_required', label: 'Testing Required', type: 'select', options: ['Unit tests', 'Integration tests', 'Full test suite', 'None'], defaultValue: 'None', required: false },
      { id: 'maintenance_days', label: 'Post-Launch Maintenance (days)', type: 'number', defaultValue: 30, required: false },
      { id: 'api_documentation', label: 'API Documentation', type: 'boolean', defaultValue: false, required: false },
    ],
  },
  {
    roleType: 'copywriter',
    title: 'Copywriting Addendum',
    icon: '✍️',
    description: 'Covers content types, word counts, SEO, revision rounds, and usage rights.',
    fields: [
      { id: 'content_type', label: 'Content Type', type: 'text', defaultValue: '', required: true, description: 'e.g., Blog posts, website copy, ad copy, email sequences' },
      { id: 'word_count', label: 'Target Word Count', type: 'number', defaultValue: 1000, required: false },
      { id: 'seo_optimization', label: 'SEO Optimization', type: 'boolean', defaultValue: false, required: false },
      { id: 'revision_rounds', label: 'Revision Rounds', type: 'number', defaultValue: 2, required: true },
      { id: 'tone_of_voice', label: 'Tone of Voice', type: 'text', defaultValue: '', required: false, description: 'e.g., Professional, casual, authoritative' },
      { id: 'usage_rights', label: 'Usage Rights', type: 'select', options: ['Exclusive to Agency', 'Non-exclusive', 'First publication rights'], defaultValue: 'Exclusive to Agency', required: true },
    ],
  },
  {
    roleType: 'motion-designer',
    title: 'Motion Design Addendum',
    icon: '✨',
    description: 'Covers animation style, software, export formats, and duration.',
    fields: [
      { id: 'animation_style', label: 'Animation Style', type: 'select', options: ['2D motion graphics', '3D animation', 'Mixed', 'UI/UX animation'], defaultValue: '2D motion graphics', required: true },
      { id: 'software', label: 'Software', type: 'text', defaultValue: 'After Effects', required: true },
      { id: 'duration_seconds', label: 'Animation Duration (seconds)', type: 'number', defaultValue: 30, required: true },
      { id: 'export_formats', label: 'Export Formats', type: 'text', defaultValue: 'MP4, GIF, Lottie', required: true },
      { id: 'revision_rounds', label: 'Revision Rounds', type: 'number', defaultValue: 2, required: true },
      { id: 'sound_design', label: 'Sound Design Included', type: 'boolean', defaultValue: false, required: false },
    ],
  },
  {
    roleType: 'virtual-assistant',
    title: 'Virtual Assistant Addendum',
    icon: '🗓️',
    description: 'Covers hours, tasks, tools access, and availability requirements.',
    fields: [
      { id: 'weekly_hours', label: 'Weekly Hours', type: 'number', defaultValue: 10, required: true },
      { id: 'task_types', label: 'Task Types', type: 'textarea', defaultValue: '', required: true, description: 'List the types of tasks' },
      { id: 'tools_access', label: 'Tools Requiring Access', type: 'text', defaultValue: '', required: false, description: 'e.g., Email, Calendar, CRM, Slack' },
      { id: 'availability_hours', label: 'Availability Hours', type: 'text', defaultValue: '9 AM – 5 PM ET', required: true },
      { id: 'phone_required', label: 'Phone Availability Required', type: 'boolean', defaultValue: false, required: false },
    ],
  },
  {
    roleType: 'marketing-specialist',
    title: 'Marketing Specialist Addendum',
    icon: '📈',
    description: 'Covers strategy, channels, KPIs, reporting, and ad spend management.',
    fields: [
      { id: 'channels', label: 'Marketing Channels', type: 'text', defaultValue: '', required: true, description: 'e.g., Google Ads, Meta Ads, SEO, Email' },
      { id: 'ad_spend_management', label: 'Ad Spend Management', type: 'boolean', defaultValue: false, required: false, description: 'Contractor manages ad budgets' },
      { id: 'kpi_reporting', label: 'KPI Reporting Frequency', type: 'select', options: ['Weekly', 'Biweekly', 'Monthly'], defaultValue: 'Monthly', required: true },
      { id: 'strategy_creation', label: 'Strategy Document Included', type: 'boolean', defaultValue: true, required: false },
      { id: 'content_creation', label: 'Content Creation Included', type: 'boolean', defaultValue: false, required: false },
    ],
  },
  {
    roleType: 'podcast-editor',
    title: 'Podcast Editor Addendum',
    icon: '🎙️',
    description: 'Covers editing style, audio formats, mastering, and episode turnaround.',
    fields: [
      { id: 'editing_style', label: 'Editing Style', type: 'select', options: ['Light edit (remove flubs)', 'Standard edit', 'Heavy edit (narrative)', 'Full production'], defaultValue: 'Standard edit', required: true },
      { id: 'audio_formats', label: 'Audio Export Formats', type: 'text', defaultValue: 'WAV, MP3 (320kbps)', required: true },
      { id: 'mastering', label: 'Audio Mastering Included', type: 'boolean', defaultValue: true, required: false },
      { id: 'episode_turnaround', label: 'Episode Turnaround (business days)', type: 'number', defaultValue: 3, required: true },
      { id: 'transcription', label: 'Transcription Included', type: 'boolean', defaultValue: false, required: false },
      { id: 'show_notes', label: 'Show Notes Writing', type: 'boolean', defaultValue: false, required: false },
      { id: 'intro_outro', label: 'Intro/Outro Production', type: 'boolean', defaultValue: false, required: false },
    ],
  },
];

export function getAddendumByRole(roleType: string): AddendumTemplate | undefined {
  return ADDENDUM_TEMPLATES.find(t => t.roleType === roleType);
}

export function getRoleLabel(roleType: string): string {
  const template = getAddendumByRole(roleType);
  return template?.title.replace(' Addendum', '') || roleType;
}

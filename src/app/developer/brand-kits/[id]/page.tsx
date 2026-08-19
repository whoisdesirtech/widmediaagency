'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const SECTION_TYPES = [
  { type: 'brand-identity', label: 'Brand Identity', icon: '🏷️' },
  { type: 'visual-identity', label: 'Visual Identity', icon: '🎨' },
  { type: 'social-identity', label: 'Social Identity', icon: '📱' },
  { type: 'content-pillars', label: 'Content Pillars', icon: '📝' },
  { type: 'content-style', label: 'Content Style', icon: '✍️' },
  { type: 'visual-content', label: 'Visual Content', icon: '📸' },
  { type: 'brand-rules', label: 'Brand Rules', icon: '📋' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  { value: 'in-review', label: 'In Review', color: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'published', label: 'Published', color: 'bg-purple-100 text-purple-700' },
];

export default function BrandKitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [brandKit, setBrandKit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('brand-identity');
  const [saving, setSaving] = useState(false);
  const [showSubmitReview, setShowSubmitReview] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [mission, setMission] = useState('');
  const [positioning, setPositioning] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandPersonality, setBrandPersonality] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
  const [accentColor, setAccentColor] = useState('#ED145A');
  const [headingFont, setHeadingFont] = useState('Outfit');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [voice, setVoice] = useState('');
  const [tone, setTone] = useState('');
  const [contentPillars, setContentPillars] = useState<any[]>([]);
  const [instagramBio, setInstagramBio] = useState('');
  const [tiktokBio, setTiktokBio] = useState('');
  const [youtubeDescription, setYoutubeDescription] = useState('');
  const [visualContentDirection, setVisualContentDirection] = useState('');
  const [brandConsistencyRules, setBrandConsistencyRules] = useState('');
  const [vocabulary, setVocabulary] = useState('');
  const [captionStyle, setCaptionStyle] = useState('');
  const [hookStyle, setHookStyle] = useState('');
  const [ctaStyle, setCtaStyle] = useState('');
  const [storytellingApproach, setStorytellingApproach] = useState('');
  const [visualReels, setVisualReels] = useState('');
  const [visualStories, setVisualStories] = useState('');
  const [visualCarousels, setVisualCarousels] = useState('');
  const [visualStatic, setVisualStatic] = useState('');
  const [visualThumbnails, setVisualThumbnails] = useState('');
  const [visualPhotography, setVisualPhotography] = useState('');
  const [visualVideo, setVisualVideo] = useState('');
  const [visualTemplates, setVisualTemplates] = useState('');
  const [rulesDo, setRulesDo] = useState('');
  const [rulesDont, setRulesDont] = useState('');
  const [rulesVisual, setRulesVisual] = useState('');
  const [rulesWriting, setRulesWriting] = useState('');
  const [rulesSocial, setRulesSocial] = useState('');

  useEffect(() => {
    fetch(`/api/brand-kits/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setBrandKit(data);
        setName(data.name || '');
        setTagline(data.tagline || '');
        setMission(data.mission || '');
        setPositioning(data.positioning || '');
        setNiche(data.niche || '');
        setTargetAudience(data.targetAudience || '');
        setBrandPersonality(data.brandPersonality || '');
        setPrimaryColor(data.primaryColor || '#000000');
        setSecondaryColor(data.secondaryColor || '#FFFFFF');
        setAccentColor(data.accentColor || '#ED145A');
        setHeadingFont(data.headingFont || 'Outfit');
        setBodyFont(data.bodyFont || 'Inter');
        setVoice(data.voice || '');
        setTone(data.tone || '');
        setContentPillars(data.contentPillars ? JSON.parse(data.contentPillars) : []);
        setInstagramBio(data.instagramBio || '');
        setTiktokBio(data.tiktokBio || '');
        setYoutubeDescription(data.youtubeDescription || '');
        setVisualContentDirection(data.visualContentDirection || '');
        setBrandConsistencyRules(data.brandConsistencyRules || '');
        setVocabulary(data.vocabulary || '');
        setCaptionStyle(data.captionStyle || '');
        setHookStyle(data.hookStyle || '');
        setCtaStyle(data.ctaStyle || '');
        setStorytellingApproach(data.storytellingApproach || '');

        try {
          const vc = data.visualContentDirection ? JSON.parse(data.visualContentDirection) : {};
          setVisualReels(vc.reels || '');
          setVisualStories(vc.stories || '');
          setVisualCarousels(vc.carousels || '');
          setVisualStatic(vc.static || '');
          setVisualThumbnails(vc.thumbnails || '');
          setVisualPhotography(vc.photography || '');
          setVisualVideo(vc.video || '');
          setVisualTemplates(vc.templates || '');
          setVisualContentDirection(vc.direction || '');
        } catch {
          setVisualContentDirection(data.visualContentDirection || '');
        }

        try {
          const br = data.brandConsistencyRules ? JSON.parse(data.brandConsistencyRules) : {};
          setRulesDo(br.do || '');
          setRulesDont(br.dont || '');
          setRulesVisual(br.visual || '');
          setRulesWriting(br.writing || '');
          setRulesSocial(br.social || '');
          setBrandConsistencyRules(br.additional || '');
        } catch {
          setBrandConsistencyRules(data.brandConsistencyRules || '');
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/brand-kits/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, tagline, mission, positioning, niche, targetAudience, brandPersonality,
          primaryColor, secondaryColor, accentColor, headingFont, bodyFont,
          voice, tone, vocabulary, captionStyle, hookStyle, ctaStyle, storytellingApproach,
          contentPillars, instagramBio, tiktokBio, youtubeDescription,
          visualContentDirection: JSON.stringify({
            reels: visualReels, stories: visualStories, carousels: visualCarousels,
            static: visualStatic, thumbnails: visualThumbnails, photography: visualPhotography,
            video: visualVideo, templates: visualTemplates, direction: visualContentDirection,
          }),
          brandConsistencyRules: JSON.stringify({
            do: rulesDo, dont: rulesDont, visual: rulesVisual,
            writing: rulesWriting, social: rulesSocial, additional: brandConsistencyRules,
          }),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBrandKit(updated);
      }
    } catch {}
    setSaving(false);
  };

  const handleSubmitForReview = async () => {
    setSaving(true);
    try {
      // Update status to in-review
      await fetch(`/api/brand-kits/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in-review' }),
      });

      // Create a review record
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandKitId: params.id,
          status: 'pending',
          comments: JSON.stringify([{ author: 'System', text: 'Brand kit submitted for review', date: new Date().toISOString() }]),
        }),
      });

      setShowSubmitReview(false);
      router.refresh();
      // Reload data
      const updated = await fetch(`/api/brand-kits/${params.id}`).then(r => r.json());
      setBrandKit(updated);
    } catch {}
    setSaving(false);
  };

  const completionChecklist = [
    { label: 'Brand identity completed', done: !!name && !!tagline && !!mission },
    { label: 'Audience defined', done: !!targetAudience },
    { label: 'Color palette defined', done: primaryColor !== '#000000' },
    { label: 'Typography defined', done: headingFont !== 'Outfit' || bodyFont !== 'Inter' },
    { label: 'Voice/tone defined', done: !!voice && !!tone },
    { label: 'Content pillars defined', done: contentPillars.length > 0 },
    { label: 'Social profiles completed', done: !!instagramBio || !!tiktokBio },
    { label: 'Positioning defined', done: !!positioning },
    { label: 'Visual content direction', done: !!visualContentDirection },
    { label: 'Brand consistency rules', done: !!brandConsistencyRules },
  ];

  const completedCount = completionChecklist.filter(c => c.done).length;
  const completionPercent = Math.round((completedCount / completionChecklist.length) * 100);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!brandKit) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">🎨</div>
        <div className="font-heading font-bold text-gray-900">Brand Kit Not Found</div>
        <Link href="/developer/brand-kits" className="text-pink-600 text-sm mt-2 inline-block">← Back to Brand Kits</Link>
      </div>
    );
  }

  const statusOpt = STATUS_OPTIONS.find(s => s.value === brandKit.status);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/developer/brand-kits" className="text-gray-400 hover:text-gray-600 text-sm">← Brand Kits</Link>
            <h1 className="font-heading text-2xl font-black text-gray-900 mt-1">{brandKit.name || 'Untitled Brand Kit'}</h1>
            <p className="text-sm text-gray-500">{brandKit.influencer?.name} · {brandKit.influencer?.platform}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusOpt?.color}`}>
              {statusOpt?.label || brandKit.status}
            </span>
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {brandKit.status === 'draft' && (
              <button onClick={() => setShowSubmitReview(true)} className="btn-secondary border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Submit for Review
              </button>
            )}
          </div>
        </div>

        {/* Color Preview Bar */}
        <div className="flex h-8 rounded-lg overflow-hidden mb-6">
          <div className="flex-1" style={{ backgroundColor: primaryColor }}></div>
          <div className="flex-1" style={{ backgroundColor: secondaryColor }}></div>
          <div className="flex-1" style={{ backgroundColor: accentColor }}></div>
        </div>

        {/* Completion Checklist */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-sm text-gray-900">Quality Checklist</h3>
            <span className="text-sm font-bold text-gray-700">{completionPercent}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full transition-all" style={{ width: `${completionPercent}%` }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {completionChecklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={item.done ? 'text-emerald-500' : 'text-gray-300'}>
                  {item.done ? '✓' : '○'}
                </span>
                <span className={item.done ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Nav */}
          <div className="lg:col-span-1">
            <div className="glass-card p-3 sticky top-8">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Sections</h4>
              <div className="space-y-1">
                {SECTION_TYPES.map(section => {
                  const sectionData = brandKit.sections?.find((s: any) => s.sectionType === section.type);
                  return (
                    <button
                      key={section.type}
                      onClick={() => setActiveSection(section.type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                        activeSection === section.type ? 'bg-pink-50 text-pink-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{section.icon}</span>
                      <span className="flex-1">{section.label}</span>
                      {sectionData?.isCompleted && <span className="text-emerald-500 text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-3">
            {activeSection === 'brand-identity' && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-heading font-bold text-lg text-gray-900">🏷️ Brand Identity</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Brand/Creator Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="Brand name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tagline</label>
                  <input type="text" value={tagline} onChange={e => setTagline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="Short tagline" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mission</label>
                  <textarea value={mission} onChange={e => setMission(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="Brand mission statement" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Positioning</label>
                  <input type="text" value={positioning} onChange={e => setPositioning(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="How the brand is positioned" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Niche</label>
                  <input type="text" value={niche} onChange={e => setNiche(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="e.g. Fashion, Tech, Lifestyle" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Audience</label>
                  <textarea value={targetAudience} onChange={e => setTargetAudience(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="Who is the target audience?" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Brand Personality</label>
                  <input type="text" value={brandPersonality} onChange={e => setBrandPersonality(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="e.g. Warm, Authentic, Bold" />
                </div>
              </div>
            )}

            {activeSection === 'visual-identity' && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-heading font-bold text-lg text-gray-900">🎨 Visual Identity</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer" />
                      <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer" />
                      <input type="text" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer" />
                      <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-mono" />
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Color Preview</p>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg shadow-sm" style={{ backgroundColor: primaryColor }}></div>
                    <div className="w-16 h-16 rounded-lg shadow-sm" style={{ backgroundColor: secondaryColor, border: '1px solid #e5e7eb' }}></div>
                    <div className="w-16 h-16 rounded-lg shadow-sm" style={{ backgroundColor: accentColor }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Heading Font</label>
                    <select value={headingFont} onChange={e => setHeadingFont(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm">
                      {['Outfit', 'Playfair Display', 'Montserrat', 'Poppins', 'Raleway', 'Lora', 'Merriweather', 'DM Sans'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Body Font</label>
                    <select value={bodyFont} onChange={e => setBodyFont(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm">
                      {['Inter', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro', 'Nunito', 'Work Sans'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'social-identity' && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-heading font-bold text-lg text-gray-900">📱 Social Identity</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Instagram Bio</label>
                  <textarea value={instagramBio} onChange={e => setInstagramBio(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="Instagram bio text" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">TikTok Bio</label>
                  <textarea value={tiktokBio} onChange={e => setTiktokBio(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="TikTok bio text" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">YouTube Description</label>
                  <textarea value={youtubeDescription} onChange={e => setYoutubeDescription(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="YouTube channel description" />
                </div>
              </div>
            )}

            {activeSection === 'content-pillars' && (
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-gray-900">📝 Content Pillars</h3>
                  <button onClick={() => setContentPillars([...contentPillars, { name: '', description: '' }])}
                    className="text-sm text-pink-600 hover:text-pink-700">+ Add Pillar</button>
                </div>
                {contentPillars.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No content pillars defined. Add at least 3.</p>
                ) : (
                  <div className="space-y-3">
                    {contentPillars.map((pillar, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500">Pillar {i + 1}</span>
                          <button onClick={() => setContentPillars(contentPillars.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                        </div>
                        <input type="text" value={pillar.name} placeholder="Pillar name"
                          onChange={e => {
                            const updated = [...contentPillars];
                            updated[i] = { ...updated[i], name: e.target.value };
                            setContentPillars(updated);
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm mb-2" />
                        <input type="text" value={pillar.description} placeholder="Description"
                          onChange={e => {
                            const updated = [...contentPillars];
                            updated[i] = { ...updated[i], description: e.target.value };
                            setContentPillars(updated);
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'content-style' && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-heading font-bold text-lg text-gray-900">✍️ Content Style</h3>
                <p className="text-xs text-gray-500">Define how the brand communicates across all channels.</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Voice</label>
                  <textarea value={voice} onChange={e => setVoice(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="How the brand speaks (e.g. warm, authoritative, playful)" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tone</label>
                  <textarea value={tone} onChange={e => setTone(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm" placeholder="Tone of voice (e.g. casual, professional, inspiring)" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vocabulary</label>
                  <textarea value={vocabulary} onChange={e => setVocabulary(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    placeholder="Key words and phrases the brand uses (e.g. 'elevate', 'authentic', 'level up')"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Caption Style</label>
                  <textarea value={captionStyle} onChange={e => setCaptionStyle(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    placeholder="How captions are structured (e.g. short punchy lines, storytelling, list format)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Hook Style</label>
                  <textarea value={hookStyle} onChange={e => setHookStyle(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    placeholder="How content hooks the audience (e.g. question openers, bold statements, curiosity gaps)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">CTA Style</label>
                  <textarea value={ctaStyle} onChange={e => setCtaStyle(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    placeholder="Call-to-action style (e.g. 'Link in bio', 'DM us', 'Comment below')"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Storytelling Approach</label>
                  <textarea value={storytellingApproach} onChange={e => setStorytellingApproach(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    placeholder="How the brand tells stories (e.g. personal anecdotes, before/after transformations, user-generated content)"
                  />
                </div>
              </div>
            )}

            {activeSection === 'visual-content' && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-heading font-bold text-lg text-gray-900">📸 Visual Content Direction</h3>
                <p className="text-xs text-gray-500">Define the visual style for all content types.</p>

                {[
                  { label: 'Reels', key: 'reels', value: visualReels, setter: setVisualReels, placeholder: 'e.g. Vertical 9:16, fast cuts, bold text overlays, trending audio' },
                  { label: 'Stories', key: 'stories', value: visualStories, setter: setVisualStories, placeholder: 'e.g. Casual behind-the-scenes, polls, interactive stickers' },
                  { label: 'Carousel Posts', key: 'carousels', value: visualCarousels, setter: setVisualCarousels, placeholder: 'e.g. Educational slides, branded templates, 5-10 slides' },
                  { label: 'Static Posts', key: 'static', value: visualStatic, setter: setVisualStatic, placeholder: 'e.g. Quote cards, product shots, flat-lay photography' },
                  { label: 'Thumbnails', key: 'thumbnails', value: visualThumbnails, setter: setVisualThumbnails, placeholder: 'e.g. Bold text, expressive face, high contrast colors' },
                  { label: 'Photography', key: 'photography', value: visualPhotography, setter: setVisualPhotography, placeholder: 'e.g. Natural light, warm tones, lifestyle shots' },
                  { label: 'Video', key: 'video', value: visualVideo, setter: setVisualVideo, placeholder: 'e.g. 4K, cinematic color grading, smooth transitions' },
                  { label: 'Backgrounds & Templates', key: 'templates', value: visualTemplates, setter: setVisualTemplates, placeholder: 'e.g. Clean minimal, brand colors, consistent borders' },
                ].map(item => (
                  <div key={item.key}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{item.label}</label>
                    <input
                      type="text"
                      value={item.value}
                      onChange={e => item.setter(e.target.value)}
                      placeholder={item.placeholder}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Additional Visual Direction</label>
                  <textarea
                    value={visualContentDirection}
                    onChange={e => setVisualContentDirection(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    placeholder="Describe the overall visual direction, mood, aesthetic, and any other visual guidelines..."
                  />
                </div>
              </div>
            )}

            {activeSection === 'brand-rules' && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-heading font-bold text-lg text-gray-900">📋 Brand Consistency Rules</h3>
                <p className="text-xs text-gray-500">Define what the brand should and should not do across all channels.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-700 mb-1.5">✅ Do</label>
                    <textarea value={rulesDo} onChange={e => setRulesDo(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-sm"
                      placeholder={"Use brand colors consistently\nPost at least 3x per week\nRespond to comments within 24h\nUse branded templates\nTag collaborators"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-red-700 mb-1.5">❌ Don't</label>
                    <textarea value={rulesDont} onChange={e => setRulesDont(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-red-200 bg-red-50 text-sm"
                      placeholder={"Use competitor branding\nPost blurry or low-quality images\nUse excessive hashtags (max 15)\nEngage in controversial topics\nBuy followers or engagement"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Visual Rules</label>
                  <textarea value={rulesVisual} onChange={e => setRulesVisual(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    placeholder="e.g. Always use brand fonts, maintain consistent color palette, no stock photos without approval"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Writing Rules</label>
                  <textarea value={rulesWriting} onChange={e => setRulesWriting(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    placeholder="e.g. Use active voice, keep captions under 200 words, always include a CTA"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Social Posting Rules</label>
                  <textarea value={rulesSocial} onChange={e => setRulesSocial(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    placeholder="e.g. Post between 9am-6pm, use 10-15 hashtags, alternate content types, cross-post to stories"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Additional Rules & Notes</label>
                  <textarea
                    value={brandConsistencyRules}
                    onChange={e => setBrandConsistencyRules(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm"
                    placeholder="Any other brand consistency rules, guidelines, or notes..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit for Review Modal */}
        {showSubmitReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-gray-900 text-lg">Submit for Review</h3>
                  <button onClick={() => setShowSubmitReview(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Submit this brand kit for review. A reviewer will check the quality checklist and approve or request revisions.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Quality Checklist</div>
                  <div className="space-y-1">
                    {completionChecklist.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={item.done ? 'text-emerald-500' : 'text-red-400'}>{item.done ? '✓' : '✕'}</span>
                        <span className={item.done ? 'text-gray-700' : 'text-gray-500'}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-gray-700">Completion: {completionPercent}%</div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSubmitForReview} disabled={saving}
                    className="btn-primary disabled:opacity-50 flex-1">
                    {saving ? 'Submitting...' : 'Submit for Review'}
                  </button>
                  <button onClick={() => setShowSubmitReview(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

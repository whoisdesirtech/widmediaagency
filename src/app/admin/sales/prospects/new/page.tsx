'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function NewProspectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    instagramHandle: '',
    tiktokHandle: '',
    linkedinUrl: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    industry: '',
    category: '',
    source: '',
    ownerId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sales/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create prospect');
      }

      router.push(`/admin/sales/prospects/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create prospect');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="ml-64 flex-1">
        <div className="max-w-2xl mx-auto px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-white/50 hover:text-white text-sm mb-6 inline-flex items-center gap-1"
            >
              ← Back
            </button>
            <h1 className="font-heading text-2xl font-bold text-white">New Prospect</h1>
            <p className="text-white/50 text-sm mt-1">Enter prospect details to begin intelligence gathering</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-white/70 text-sm font-medium mb-2">
                  Prospect Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="Company or organization name"
                />
              </div>

              <div>
                <label htmlFor="websiteUrl" className="block text-white/70 text-sm font-medium mb-2">Website URL</label>
                <input
                  type="url"
                  id="websiteUrl"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="source" className="block text-white/70 text-sm font-medium mb-2">Source</label>
                <select
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                >
                  <option value="">Select source</option>
                  <option value="referral">Referral</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="event">Event</option>
                  <option value="social">Social Media</option>
                  <option value="partner">Partner</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="industry" className="block text-white/70 text-sm font-medium mb-2">Industry</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="e.g., Technology, Healthcare, Events"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-white/70 text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="e.g., Enterprise, SMB, Startup"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="primaryContactName" className="block text-white/70 text-sm font-medium mb-2">Primary Contact Name</label>
                <input
                  type="text"
                  id="primaryContactName"
                  name="primaryContactName"
                  value={formData.primaryContactName}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="Decision maker or main contact"
                />
              </div>

              <div>
                <label htmlFor="primaryContactEmail" className="block text-white/70 text-sm font-medium mb-2">Primary Contact Email</label>
                <input
                  type="email"
                  id="primaryContactEmail"
                  name="primaryContactEmail"
                  value={formData.primaryContactEmail}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <label htmlFor="primaryContactPhone" className="block text-white/70 text-sm font-medium mb-2">Primary Contact Phone</label>
                <input
                  type="tel"
                  id="primaryContactPhone"
                  name="primaryContactPhone"
                  value={formData.primaryContactPhone}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="websiteUrl" className="block text-white/70 text-sm font-medium mb-2">Website URL</label>
                <input
                  type="url"
                  id="websiteUrl"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="https://company.com"
                />
              </div>

              <div>
                <label htmlFor="instagramHandle" className="block text-white/70 text-sm font-medium mb-2">Instagram Handle</label>
                <input
                  type="text"
                  id="instagramHandle"
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="@handle (without @)"
                />
              </div>

              <div>
                <label htmlFor="tiktokHandle" className="block text-white/70 text-sm font-medium mb-2">TikTok Handle</label>
                <input
                  type="text"
                  id="tiktokHandle"
                  name="tiktokHandle"
                  value={formData.tiktokHandle}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="@handle (without @)"
                />
              </div>

              <div>
                <label htmlFor="linkedinUrl" className="block text-white/70 text-sm font-medium mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div>
                <label htmlFor="primaryContactPhone" className="block text-white/70 text-sm font-medium mb-2">Primary Contact Phone</label>
                <input
                  type="tel"
                  id="primaryContactPhone"
                  name="primaryContactPhone"
                  value={formData.primaryContactPhone}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="ownerId" className="block text-white/70 text-sm font-medium mb-2">Assigned Staff (Owner)</label>
                <select
                  id="ownerId"
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-miami-pink focus:outline-none focus:ring-1 focus:ring-miami-pink"
                >
                  <option value="">Unassigned</option>
                  <option value="self">Current User (Me)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-miami-pink hover:bg-miami-pink/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Prospect'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
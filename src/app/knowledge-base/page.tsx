import Link from 'next/link';
import HtmlRenderer from '@/components/HtmlRenderer';

export const metadata = { title: 'Knowledge Base — WhoIsDésir® Media' };

export default function KnowledgeBasePage() {
  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-heading font-black text-sm">W</div>
            <span className="font-heading font-bold text-sm text-white">WhoIsDésir<span className="text-miami-pink">®</span> Media</span>
            <span className="text-xs text-white/30">v1.1.0</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/portal-guide" className="text-sm text-white/50 hover:text-white transition-colors">Portal Guide</Link>
            <Link href="/login" className="btn-primary text-sm px-5 py-2.5">Login</Link>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        <HtmlRenderer src="/knowledge-base.html" />
      </div>
    </div>
  );
}

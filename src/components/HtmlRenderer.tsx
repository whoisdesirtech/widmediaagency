'use client';

import { useEffect, useState } from 'react';

export default function HtmlRenderer({ src }: { src: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const styleMatch = text.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        if (bodyMatch) {
          setHtml(
            (styleMatch ? styleMatch.join('') : '') + bodyMatch[1]
          );
        }
      })
      .catch(() => setHtml('<p style="padding:40px;text-align:center;color:#888;">Failed to load content.</p>'));
  }, [src]);

  if (!html) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-miami-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

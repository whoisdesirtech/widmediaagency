'use client';

import { useEffect } from 'react';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function CsrfProvider() {
  useEffect(() => {
    const original = window.fetch;
    const MUTATING = ['POST', 'PUT', 'PATCH', 'DELETE'];

    (window as any).fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const method = (init?.method || 'GET').toUpperCase();

      if (url.includes('/api/') && MUTATING.includes(method)) {
        const token = getCookie('XSRF-TOKEN');
        if (token) {
          const headers = new Headers(init?.headers);
          headers.set('X-XSRF-Token', token);
          init = { ...init, headers };
        }
      }

      return original.call(window, input, init);
    };

    return () => {
      (window as any).fetch = original;
    };
  }, []);

  return null;
}

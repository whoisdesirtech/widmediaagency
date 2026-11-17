const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape a value before interpolating it into HTML (including attributes).
 * Always use this for user-supplied content in email or page templates.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Strip CR/LF so a value cannot inject extra email headers.
 */
export function sanitizeHeaderValue(value: unknown): string {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

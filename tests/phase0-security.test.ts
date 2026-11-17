import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { escapeHtml, sanitizeHeaderValue } from '@/lib/html';
import { buildContractorPatch, isSameAgency } from '@/lib/contractor-patch';

const read = (relativePath: string) =>
  readFileSync(join(process.cwd(), relativePath), 'utf8');

describe('Phase 0 — HTML escaping (F-07)', () => {
  it('escapes every HTML-significant character', () => {
    expect(escapeHtml(`<script>alert("x") & 'y'</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;'
    );
  });

  it('escapes attribute-breaking quotes', () => {
    expect(escapeHtml(`" onmouseover="alert(1)`)).toBe(
      '&quot; onmouseover=&quot;alert(1)'
    );
  });

  it('renders null and undefined as an empty string', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('strips CR/LF from header values', () => {
    expect(sanitizeHeaderValue('Ada\r\nBcc: evil@example.com')).toBe(
      'Ada Bcc: evil@example.com'
    );
  });
});

describe('Phase 0 — contractor PATCH allowlist (F-03)', () => {
  it('rejects protected identity and tenancy fields', () => {
    for (const field of ['userId', 'agencyId', 'id', 'createdAt', 'updatedAt']) {
      const result = buildContractorPatch({ [field]: 'x' });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.fields).toContain(field);
      }
    }
  });

  it('accepts an allowed status change', () => {
    const result = buildContractorPatch({ status: 'active' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ status: 'active' });
  });

  it('rejects an unknown status value', () => {
    const result = buildContractorPatch({ status: 'superadmin' });
    expect(result.ok).toBe(false);
  });

  it('trims strings and converts empty optional fields to null', () => {
    const result = buildContractorPatch({ name: '  Ada  ', taxFormType: '' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ name: 'Ada', taxFormType: null });
  });

  it('rejects null for required fields', () => {
    const result = buildContractorPatch({ name: null });
    expect(result.ok).toBe(false);
  });

  it('ignores unknown non-protected keys', () => {
    const result = buildContractorPatch({ name: 'Ada', somethingElse: 'x' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ name: 'Ada' });
  });

  it('rejects a non-object body', () => {
    expect(buildContractorPatch(null).ok).toBe(false);
    expect(buildContractorPatch('nope').ok).toBe(false);
    expect(buildContractorPatch([]).ok).toBe(false);
  });
});

describe('Phase 0 — agency scoping (F-06)', () => {
  it('allows a platform user with no agency', () => {
    expect(isSameAgency(null, 'agency-a')).toBe(true);
  });

  it('allows the same agency', () => {
    expect(isSameAgency('agency-a', 'agency-a')).toBe(true);
  });

  it('blocks a different agency', () => {
    expect(isSameAgency('agency-a', 'agency-b')).toBe(false);
  });
});

describe('Phase 0 — credential routes never expose secrets (F-01, F-02)', () => {
  it('reset-password never logs the generated password', () => {
    const source = read('src/app/api/auth/reset-password/route.ts');
    expect(source).not.toMatch(/console\.(log|warn|error)\([^)]*newPassword/);
  });

  it('contractor login does not return a password field', () => {
    const source = read('src/app/api/contractors/[id]/login/route.ts');
    expect(source).not.toMatch(/^\s*password:\s/m);
  });
});

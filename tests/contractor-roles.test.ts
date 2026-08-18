import { describe, it, expect } from 'vitest';

describe('ContractorRole allowed values', () => {
  const ALLOWED_ROLES = [
    'photography', 'videography', 'social-media', 'designer',
    'ai-automation', 'web-designer', 'developer', 'copywriter',
    'motion-designer', 'virtual-assistant', 'marketing-specialist', 'podcast-editor',
  ];

  it('should have 12 allowed roles', () => {
    expect(ALLOWED_ROLES).toHaveLength(12);
  });

  it('should include developer role', () => {
    expect(ALLOWED_ROLES).toContain('developer');
  });

  it('should include photography role', () => {
    expect(ALLOWED_ROLES).toContain('photography');
  });
});

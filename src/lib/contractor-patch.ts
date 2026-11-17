/**
 * Allowlist for PATCH /api/contractors/[id].
 *
 * `agencyId`, `userId`, and the record identifiers are never client-writable:
 * they control tenancy and account linkage. Anything not listed here is ignored.
 */

export const CONTRACTOR_PATCHABLE_FIELDS = [
  'name',
  'businessName',
  'role',
  'state',
  'country',
  'status',
  'taxFormType',
  'taxFormUrl',
  'insuranceProofUrl',
  'licensingProofUrl',
] as const;

export const CONTRACTOR_PROTECTED_FIELDS = [
  'id',
  'agencyId',
  'userId',
  'createdAt',
  'updatedAt',
] as const;

export const CONTRACTOR_STATUSES = ['invited', 'active', 'terminated'] as const;

const REQUIRED_STRING_FIELDS = new Set<string>([
  'name',
  'businessName',
  'role',
  'state',
  'country',
  'status',
]);

const NULLABLE_STRING_FIELDS = new Set<string>([
  'taxFormType',
  'taxFormUrl',
  'insuranceProofUrl',
  'licensingProofUrl',
]);

export type ContractorPatchResult =
  | { ok: true; data: Record<string, string | null> }
  | { ok: false; error: string; fields?: string[] };

export function buildContractorPatch(body: unknown): ContractorPatchResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid request body' };
  }

  const input = body as Record<string, unknown>;

  const protectedFields = CONTRACTOR_PROTECTED_FIELDS.filter((field) => field in input);
  if (protectedFields.length > 0) {
    return { ok: false, error: 'Field not allowed', fields: protectedFields };
  }

  const data: Record<string, string | null> = {};

  for (const field of CONTRACTOR_PATCHABLE_FIELDS) {
    if (!(field in input)) continue;

    const value = input[field];

    if (value === null) {
      if (!NULLABLE_STRING_FIELDS.has(field)) {
        return { ok: false, error: `${field} cannot be null`, fields: [field] };
      }
      data[field] = null;
      continue;
    }

    if (typeof value !== 'string') {
      return { ok: false, error: `${field} must be a string`, fields: [field] };
    }

    const trimmed = value.trim();

    if (!trimmed && REQUIRED_STRING_FIELDS.has(field)) {
      return { ok: false, error: `${field} cannot be empty`, fields: [field] };
    }

    if (field === 'status' && !CONTRACTOR_STATUSES.includes(trimmed as (typeof CONTRACTOR_STATUSES)[number])) {
      return { ok: false, error: 'Invalid status', fields: ['status'] };
    }

    data[field] = trimmed || null;
  }

  return { ok: true, data };
}

/**
 * Agency scoping rule shared by contractor read/write routes.
 * A platform-level user with no agency is unrestricted; everyone else only
 * sees records from their own agency.
 */
export function isSameAgency(
  userAgencyId: string | null | undefined,
  recordAgencyId: string | null | undefined
): boolean {
  if (!userAgencyId) return true;
  return userAgencyId === recordAgencyId;
}

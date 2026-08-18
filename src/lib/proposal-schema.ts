/**
 * Generic Proposal Input Schema
 * -------------------------------------------------------
 * Domain-agnostic data model for the public proposal generator.
 * No photography, food, restaurant, or WhoIsDésir-specific concepts.
 *
 * Reusable by:
 *   - Web application (form → API)
 *   - REST API routes
 *   - Future CLI adapter
 */

// ─── SECTION TYPES ────────────────────────────────────────────────────────────

/** The agency or freelancer generating the proposal. */
export interface BusinessInfo {
  /** Legal or trade name of the business. @required */
  business_name: string;
  /** Primary contact email address. @required */
  business_email: string;
  /** Business phone number. */
  business_phone?: string;
  /** Business website URL. */
  business_website?: string;
}

/** The prospective client receiving the proposal. */
export interface ClientInfo {
  /** Full name of the client contact. @required */
  client_name: string;
  /** Client contact email address. */
  client_email?: string;
  /** Name of the client's company or organisation. */
  client_company?: string;
}

/** Core project identification. */
export interface ProjectInfo {
  /** Short descriptive title for the proposed work. @required */
  project_title: string;
  /** Longer description of what the project entails. */
  project_description?: string;
  /** Proposed start date or event date (human-readable string). @required */
  project_date: string;
  /** Physical or virtual location where work will be delivered. @required */
  location: string;
}

/** A single deliverable line item in the scope section. */
export interface DeliverableItem {
  /** Short label for the deliverable. @required */
  title: string;
  /** Optional longer description of what is included. */
  description?: string;
}

/** Scope of work definition. */
export interface ScopeInfo {
  /**
   * List of services being offered.
   * Each entry is a plain string (e.g. "Brand Photography", "Video Editing").
   */
  services?: string[];
  /**
   * Structured list of deliverables with optional descriptions.
   */
  deliverables?: DeliverableItem[];
  /**
   * High-level project timeline or milestone summary
   * (e.g. "2 weeks from signed agreement").
   */
  timeline?: string;
}

/** Commercial and payment terms. */
export interface CommercialInfo {
  /**
   * Total investment amount in USD (or your currency).
   * @required Must be a positive number greater than zero.
   * Do NOT supply a default — the user must set this explicitly.
   */
  investment: number;
  /**
   * Human-readable payment terms
   * (e.g. "50% deposit on acceptance, 50% on delivery").
   */
  payment_terms?: string;
}

// ─── FULL PROPOSAL INPUT ──────────────────────────────────────────────────────

/**
 * Complete generic proposal input.
 * All section objects are typed individually above for composability.
 * This flat structure makes serialisation (JSON, URLSearchParams, FormData) straightforward.
 */
export interface ProposalInput {
  // ── Business ──────────────────────────────────────────────────────────────
  business_name: string;
  business_email: string;
  business_phone?: string;
  business_website?: string;

  // ── Client ────────────────────────────────────────────────────────────────
  client_name: string;
  client_email?: string;
  client_company?: string;

  // ── Project ───────────────────────────────────────────────────────────────
  project_title: string;
  project_description?: string;
  project_date: string;
  location: string;

  // ── Scope ─────────────────────────────────────────────────────────────────
  services?: string[];
  deliverables?: DeliverableItem[];
  timeline?: string;

  // ── Commercial ────────────────────────────────────────────────────────────
  /** Must be > 0. No defaults are provided. */
  investment: number;
  payment_terms?: string;
}

// ─── REQUIRED FIELD REGISTRY ─────────────────────────────────────────────────

/**
 * Canonical list of required top-level fields.
 * Used by the validator and by the web form to drive required-field indicators.
 */
export const REQUIRED_FIELDS: ReadonlyArray<keyof ProposalInput> = [
  "business_name",
  "business_email",
  "client_name",
  "project_title",
  "project_date",
  "location",
  "investment",
] as const;

// ─── VALIDATION ───────────────────────────────────────────────────────────────

export interface ValidationError {
  field: keyof ProposalInput | string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE   = /^https?:\/\/.+/i;

/**
 * Validates a ProposalInput object against all schema rules.
 *
 * Rules:
 *  1. Required string fields must be non-empty after trimming.
 *  2. business_email must be a valid email address.
 *  3. client_email, if provided, must be a valid email address.
 *  4. business_website, if provided, must start with http:// or https://.
 *  5. investment must be a finite number strictly greater than zero.
 *  6. services, if provided, must be a non-empty array of non-empty strings.
 *  7. deliverables, if provided, must be a non-empty array where each item
 *     has a non-empty `title`.
 *
 * @param data  The raw input object — may be partial/unknown at call time.
 * @returns     A ValidationResult with a boolean flag and an error list.
 */
export function validateProposalInput(data: Partial<ProposalInput>): ValidationResult {
  const errors: ValidationError[] = [];

  // ── 1. Required string fields ──────────────────────────────────────────────
  const requiredStrings: Array<keyof ProposalInput> = [
    "business_name",
    "business_email",
    "client_name",
    "project_title",
    "project_date",
    "location",
  ];

  for (const field of requiredStrings) {
    const val = data[field];
    if (typeof val !== "string" || val.trim() === "") {
      errors.push({ field, message: `${field} is required and cannot be empty.` });
    }
  }

  // ── 2. business_email format ───────────────────────────────────────────────
  if (
    typeof data.business_email === "string" &&
    data.business_email.trim() !== "" &&
    !EMAIL_RE.test(data.business_email.trim())
  ) {
    errors.push({ field: "business_email", message: "business_email must be a valid email address." });
  }

  // ── 3. client_email format (optional) ─────────────────────────────────────
  if (
    typeof data.client_email === "string" &&
    data.client_email.trim() !== "" &&
    !EMAIL_RE.test(data.client_email.trim())
  ) {
    errors.push({ field: "client_email", message: "client_email must be a valid email address." });
  }

  // ── 4. business_website format (optional) ─────────────────────────────────
  if (
    typeof data.business_website === "string" &&
    data.business_website.trim() !== "" &&
    !URL_RE.test(data.business_website.trim())
  ) {
    errors.push({
      field: "business_website",
      message: "business_website must be a valid URL starting with http:// or https://.",
    });
  }

  // ── 5. investment (required, > 0) ─────────────────────────────────────────
  if (data.investment === undefined || data.investment === null) {
    errors.push({ field: "investment", message: "investment is required." });
  } else if (typeof data.investment !== "number" || !isFinite(data.investment)) {
    errors.push({ field: "investment", message: "investment must be a number." });
  } else if (data.investment <= 0) {
    errors.push({ field: "investment", message: "investment must be greater than zero." });
  }

  // ── 6. services array (optional) ──────────────────────────────────────────
  if (data.services !== undefined) {
    if (!Array.isArray(data.services) || data.services.length === 0) {
      errors.push({ field: "services", message: "services must be a non-empty array if provided." });
    } else {
      data.services.forEach((s, i) => {
        if (typeof s !== "string" || s.trim() === "") {
          errors.push({ field: "services", message: `services[${i}] must be a non-empty string.` });
        }
      });
    }
  }

  // ── 7. deliverables array (optional) ──────────────────────────────────────
  if (data.deliverables !== undefined) {
    if (!Array.isArray(data.deliverables) || data.deliverables.length === 0) {
      errors.push({ field: "deliverables", message: "deliverables must be a non-empty array if provided." });
    } else {
      data.deliverables.forEach((d, i) => {
        if (typeof d !== "object" || d === null) {
          errors.push({ field: "deliverables", message: `deliverables[${i}] must be an object.` });
        } else if (typeof d.title !== "string" || d.title.trim() === "") {
          errors.push({ field: "deliverables", message: `deliverables[${i}].title is required and cannot be empty.` });
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Returns a blank ProposalInput with safe defaults for optional fields.
 * investment is intentionally left as 0 to force explicit entry.
 */
export function createEmptyProposalInput(): ProposalInput {
  return {
    business_name: "",
    business_email: "",
    business_phone: "",
    business_website: "",
    client_name: "",
    client_email: "",
    client_company: "",
    project_title: "",
    project_description: "",
    project_date: "",
    location: "",
    services: [],
    deliverables: [],
    timeline: "",
    investment: 0,
    payment_terms: "",
  };
}

/**
 * Type guard — narrows an unknown value to a validated ProposalInput.
 * Returns false if validation fails.
 */
export function isValidProposalInput(data: unknown): data is ProposalInput {
  if (typeof data !== "object" || data === null) return false;
  const result = validateProposalInput(data as Partial<ProposalInput>);
  return result.valid;
}

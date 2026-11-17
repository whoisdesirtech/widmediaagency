# WordPress Developer Training & Certification

WordPress developers (role: `wordpress-developer`) work from the agency SOP for Enfold
city landing pages: duplicate the approved master page, localize the content, set the
complete Yoast package, QA desktop + mobile, and deliver in the required section order.

The program has **three separate parts**:

| Part | Where | Purpose |
| --- | --- | --- |
| Training module | `/contractor/wordpress-developer` → *Training module* | The SOP itself (11 sections + non-negotiable rules) |
| Certification quiz | *Certification quiz* tab + auto-opening modal | 10 intermediate questions, graded on the server |
| Practical work submission | *Practical work* tab | Live page URL + edit URL + Yoast fields for admin review |

The quiz is deliberately **separate** from the training module, and it pops up
automatically for WordPress developers so it is never skipped.

## Files

| Path | Purpose |
| --- | --- |
| `src/lib/wordpress-quiz.ts` | Single source of truth: constants, the 10-question bank, grading, pay-tier helpers, public-question serializer |
| `src/lib/wordpress-developer-provisioning.ts` | Idempotent provisioning of the module assignment + quiz attempt |
| `src/components/WordPressDeveloperTrainingContent.tsx` | Module content rendered for contractors and admins |
| `src/components/WordPressQuizModal.tsx` | Self-contained quiz UI (auto-open + trigger modes) |
| `src/app/contractor/wordpress-developer/page.tsx` | Contractor program page (module / work / certification tabs) |
| `src/app/admin/wordpress-developer/page.tsx` | Admin review: attempts, overrides, pay rates, work approvals |
| `src/app/api/training/wordpress-quiz/route.ts` | `GET` state, `POST { action: start \| submit }` |
| `src/app/api/training/wordpress-work/route.ts` | `GET` own submissions, `POST` new submission |
| `src/app/api/admin/training/wordpress-quiz/route.ts` | `GET` all attempts (WordPress quiz only) |
| `src/app/api/admin/training/wordpress-quiz/[attemptId]/route.ts` | `GET` attempt detail, `PATCH` review/override/rates |
| `src/app/api/admin/training/wordpress-work/route.ts` | `GET` all practical submissions |
| `src/app/api/admin/training/wordpress-work/[id]/route.ts` | `GET`/`PATCH` approve or request changes |
| `prisma/seed-training.ts` | Seeds the lesson and upserts the quiz + 10 questions |
| `tests/wordpress-quiz.test.ts` | Question-bank validity, grading, pay-tier helpers |

## Quiz rules

- Exactly **10** questions: **5 Enfold Theme** + **5 WordPress fundamentals**, intermediate.
- Passing score **80%** (8/10), stored on `TrainingQuiz.passingScore` — change it there to adjust.
- **Grading is server-side only.** `gradeQuiz()` compares submitted indices against
  `QuizQuestion.correctIndex`; the browser never sends a score and answers are never
  included in the payload sent to the contractor (`toPublicQuestions()` strips
  `correctIndex` and `explanation`).
- Unanswered or out-of-range selections count as incorrect.
- Question definitions live in `src/lib/wordpress-quiz.ts`. Edit them there and re-run
  `npx tsx prisma/seed-training.ts`; questions are upserted by `QuizQuestion.key`, so
  editing prompts/answers updates in place and never duplicates rows.

## Pay tiers

`ContractorPayTier` (one row per contractor):

- `tier`: `standard` | `certified`
- `standardRate` / `certifiedRate`: optional `Float`
- `rateType`: `project` | `hourly` | ... (carried into the SOW builder)
- `source`: `default` | `quiz` | `manual`

Behaviour:

- **Passing** the quiz → `certified`, `source = quiz`, `effectiveAt = submittedAt`.
- **Failing** → `standard`, unless the contractor already earned `certified`; a failed
  retake never downgrades an earned tier.
- **`certifiedRate` is auto-suggested** at `standardRate × 1.25`
  (`CERTIFIED_RATE_MULTIPLIER`) whenever a standard rate exists and no certified rate is set.
- Admins can override the tier and set both rates from the review modal
  (`PATCH /api/admin/training/wordpress-quiz/[attemptId]`).
- The SOW builder reads `payTier` from `GET /api/contractors`, shows the current tier and
  rates, and offers a one-click "Apply rate" for the contractor's effective tier.

## When the quiz is assigned

`ensureWordPressDeveloperProvisioning(contractorId)` runs when:

1. A contractor record is created with `role = 'wordpress-developer'`
   (`POST /api/contractors`).
2. A login is created for the contractor (`POST /api/contractors/[id]/login`).
3. The `wordpress-developer` role is approved
   (`PATCH /api/contractors/[id]/roles/[roleId]`).

It is fully idempotent: it assigns the `wordpress-developer` lesson (with step rows) if
missing, creates one open `QuizAttempt` if the contractor has no attempts, and sends a
single notification only when something new was assigned.

Eligibility accepts the primary `Contractor.role` or any **approved** `ContractorRole`.
Non-WordPress contractors get `eligible: false` and the modal renders nothing.

## Practical work review

Contractors submit: city, page name, live URL, edit URL, SEO title, focus keyphrase,
slug, meta description, related keyphrases, canonical URL, social title/description,
and optional notes. Required fields and the URL format are validated server-side;
slugs are normalized.

Admins approve or request changes with notes. Either action is audit-logged and
notifies the contractor. `status` transitions are `submitted → approved |
changes_requested`.

## Security notes

- Every route starts with `requireContractor()` / `requireAdminOrStaff()` plus
  `isNextResponse()`. Contractors are always scoped to their own `contractorId`;
  attempt ownership is verified before grading or resubmitting.
- Every mutation writes an `AuditLog` entry (`wordpress_quiz.started`,
  `wordpress_quiz.submitted`, `wordpress_quiz.reviewed`, `wordpress_work.submitted`,
  `wordpress_work.approve|changes_requested`, `wordpress_developer.provisioned`).
- All outbound URLs are validated as `http(s)`. Text fields are trimmed and length-capped.
- The quiz cannot be submitted twice (`409` once `submitted`/`reviewed`).
- CSRF is handled by the existing middleware + `CsrfProvider`.

## Setup checklist

1. `npx prisma format && npx prisma generate`
2. Apply the schema to the database (requires authorization): `npm run db:push`
3. Seed lessons + quiz: `npx tsx prisma/seed-training.ts`
4. Assign the role: approve `wordpress-developer` on the contractor detail page — the
   module and quiz are assigned automatically.

## Manual verification

1. Approve `wordpress-developer` for a test contractor → notification + open attempt.
2. Log in as that contractor → the quiz modal auto-opens on the dashboard.
3. Submit 8+/10 → tier becomes `certified`, SOW builder shows the certified tier.
4. Submit <8/10 on a retake → tier stays `certified` if already earned.
5. As admin: `/admin/wordpress-developer` → review answers, override a score/result,
   set rates, approve practical work.

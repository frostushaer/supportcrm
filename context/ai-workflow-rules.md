# AI Workflow Rules

Build **SupportCRM** incrementally using a spec-driven workflow. Context files define **what** to build, **how** to build it, and the **current progress state**. Always implement against these specs—never infer or invent behaviour.

---

## Development Workflow

### Approach
- Work on **one module or sub-feature at a time**.
- Prefer **small, verifiable increments** over large speculative changes.
- Do not combine unrelated modules in a single step.

---

### Scoping Rules

**Split** if a step combines:
- UI changes and API/database changes simultaneously.
- Multiple unrelated modules in one step.
- Form UI and Zod schema (do schema first, then wire the form).
- Behaviour not defined in context files.

**If a change can't be verified end-to-end quickly, it's too broad—split it.**

---

### When To Split Work

Ask yourself:
1. Can I test this change in isolation in under 2 minutes?
2. Does this step require knowledge from multiple context files?
3. Am I creating schema + API + UI + tests in one step?

If **any** answer is "yes", split into smaller steps.

---

## Module Build Order

For **each module**, follow this sequence:

1. **Prisma schema additions** → `prisma migrate dev`
2. **Zod validation schema** → in `lib/validations/{module}.ts`
3. **API route handlers** → in `app/api/{module}/route.ts`
4. **TanStack Query hook** → in `hooks/use-{module}.ts`
5. **List page** → with DataTable and filter toolbar
6. **Add New Sheet** → right-side drawer with react-hook-form
7. **Detail/Profile page** → with inner Tabs
8. **Connect to global Region filter** → Zustand `regionStore`

---

## Handling Missing Requirements

- **Do not invent product behaviour** not in context files.
- If a requirement is **ambiguous**, resolve it in the relevant context file first.
- Add unresolved questions to `progress-tracker.md` before continuing.

---

## Protected Foundation Components

**Do not modify `components/ui`.**

All project logic lives in:
- `components/shared`
- `components/layout`
- `components/{module}`

Only modify `components/ui` when **explicitly instructed**. Document the reason in `progress-tracker.md`.

---

## Keeping Docs In Sync

Update context files when implementation changes:

| Change Type | File to Update |
|-------------|----------------|
| Architecture or data model | `architecture-context.md` |
| UI patterns | `ui-context.md` |
| Code conventions | `code-standards.md` |
| Feature scope | `project-overview.md` |

**`progress-tracker.md` must reflect actual state, not intended state.**

---

## Before Moving To Next Module

Verify:
1. Current module works end-to-end within defined scope.
2. No invariant in `architecture-context.md` was violated.
3. `progress-tracker.md` accurately reflects what was completed.
4. `pnpm build` passes with no TypeScript or lint errors.

---

## Feature Spec Template

When creating a new feature spec in `context/feature-specs/`, use this structure:

\`\`\`markdown
# {Module Name} - Feature Spec

## Goal
Single-sentence description of what this feature enables.

## User Flow
1. User does X
2. System responds with Y
3. User sees Z

## Data Schema
\`\`\`prisma
model Example {
  id String @id @default(cuid())
  // fields
}
\`\`\`

## API Endpoints
- `GET /api/{module}` → list with filters
- `POST /api/{module}` → create new record
- `GET /api/{module}/[id]` → single record
- `PATCH /api/{module}/[id]` → update
- `DELETE /api/{module}/[id]` → soft delete

## UI Components
1. List page with DataTable
2. Add New Sheet with form
3. Detail page with tabs

## Validation Rules
- Field X must be unique
- Field Y is required when Z is true

## Success Criteria
- [ ] User can create a record
- [ ] User can view list filtered by region
- [ ] User can update and delete
\`\`\`

---

## Session Discipline

At the start of each session:
1. Read `progress-tracker.md` → "Current Goal"
2. Read the matching feature spec
3. Confirm dependencies are complete

At the end of each session:
1. Update `progress-tracker.md` → Completed steps
2. Log open questions or blockers
3. Verify `pnpm build` is clean

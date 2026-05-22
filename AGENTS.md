<!-- BEGIN:agent-rules -->
**CRITICAL: Read this file first before any implementation work.**

Next.js 15 is fundamentally different from Next.js 13/14.
This version has breaking changes. Read relevant guides in `node_modules/next/dist/docs` before writing any code.
<!-- END:agent-rules -->

# SupportCRM AI Agent Context

## This is NOT the Next.js you know

Read the following files **in order** before implementing anything:

1. `context/project-overview.md` → product definition, goals, modules, scope
2. `context/architecture-context.md` → stack, data model, boundaries, invariants
3. `context/ui-context.md` → brand, theme, sidebar, component patterns
4. `context/code-standards.md` → implementation rules, file organisation
5. `context/ai-workflow-rules.md` → workflow, scoping rules, delivery approach
6. `context/progress-tracker.md` → current phase, completed work, open questions

Then read the active feature spec from `context/feature-specs/` that matches the current goal in `progress-tracker.md`.

---

## Key Rules (Always Apply)

- **Do not modify `components/ui`** → generated shadcn primitives.
- **Use token variables for all colours** → `bg-[var(--color-bg)]`, `text-[var(--color-text)]`, etc.
- **No raw hex values** or Tailwind colour shortcuts like `sky-500`, `gray-300`.
- **Region filter is global state** → Zustand `regionStore`. Every list page subscribes to it.
- **Single-organisation architecture** → do not design for multi-tenancy.
- **Update `context/progress-tracker.md`** after each meaningful implementation step.

---

## Implementation Sequence

For each module, follow this exact order:

1. **Schema** → `prisma/schema.prisma` + `prisma migrate dev`
2. **Validation** → Zod schema in `lib/validations/{module}.ts`
3. **API** → Route handlers in `app/api/{module}/route.ts`
4. **Hooks** → TanStack Query in `hooks/use-{module}.ts`
5. **List Page** → DataTable with filters
6. **Add New** → Sheet (right-side drawer) with react-hook-form
7. **Detail Page** → Profile view with inner Tabs
8. **Region Filter** → Connect to global `regionStore`

---

## Before You Code

1. Verify current goal in `progress-tracker.md`
2. Check if feature spec exists in `context/feature-specs/`
3. Confirm no architecture invariants in `architecture-context.md` are violated
4. Run `pnpm build` to ensure clean baseline

---

## After You Code

1. Update `progress-tracker.md` → mark step complete, log decisions
2. Verify `pnpm build` passes with no TypeScript or lint errors
3. Test end-to-end in browser
4. Document any deviations or open questions in `progress-tracker.md`

# Feature Specs

This folder contains incremental feature specifications for **SupportCRM** modules.

Each feature spec should follow the template in `ai-workflow-rules.md`.

---

## Feature Spec Naming Convention

Use kebab-case with a sequential number prefix:

- `01-participants-module.md`
- `02-hrm-workers.md`
- `03-rostering-calendar.md`
- `04-incident-management.md`
- etc.

---

## When to Create a Feature Spec

Create a new feature spec when:

1. Starting work on a new module from the sidebar (e.g., Participants, HRM, Rostering).
2. Adding a complex sub-feature (e.g., Timesheet approval workflow).
3. Implementing a cross-cutting concern (e.g., Global Region Filter).

---

## Feature Spec Template

```markdown
# {Module Name} - Feature Spec

## Goal
Single-sentence description of what this feature enables.

## User Flow
1. User does X
2. System responds with Y
3. User sees Z

## Data Schema
```prisma
model Example {
  id String @id @default(cuid())
  // fields
}
```

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
```

---

## Current Feature Specs

None yet. Start with `01-participants-module.md` in Phase 3.

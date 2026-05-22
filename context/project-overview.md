# SupportCRM - Project Overview

**App Name:** SupportCRM  
**Domain:** supportcrm.io  
**Tagline:** NDIS care management, simplified.

---

## Overview

**SupportCRM** is a full-featured CRM/ERP platform built for NDIS (National Disability Insurance Scheme) support providers in Australia. It unifies:

- Participant management
- Staff/worker management (HRM)
- Clinical services (Allied Health)
- Shift scheduling (Rostering)
- Accommodation tracking (SIL/SDA)
- Incident reporting
- Financial billing and invoicing

...into a **single workspace**.

**Architecture note:** SupportCRM is currently built as a **single-organisation application** (one provider per deployment). Multi-tenancy/SaaS will be introduced in a future phase. **Do not design schemas or auth flows with multi-tenancy in mind** unless explicitly instructed.

---

## Goals

1. Enable NDIS providers to manage **participants** across their full plan lifecycle.
2. Manage **workers**, compliance documents, and hiring pipelines.
3. Schedule and track **support shifts** with timesheet reconciliation.
4. Handle **Allied Health** service delivery and NDIS claims.
5. Track **SDA/SIL accommodation** properties and vacancies.
6. Report and escalate **incidents** through a structured workflow.
7. Generate and export **NDIS-compliant invoices** from approved timesheets.
8. Enforce **role-based access** so each user sees only their authorised data.

---

## Core User Flow

1. Admin logs in and selects a **Region** from the global region filter.
2. Admin creates and manages **Participants** (profiles, NDIS plans, documents).
3. Admin onboards **Workers** in HRM with compliance records.
4. Rostering team creates **shifts** linking Participants to Workers via Support Items.
5. Workers complete shifts → **timesheets** are submitted and approved.
6. Approved timesheets flow into the **invoice generation** pipeline.
7. Invoices are batch-generated and exported for NDIS portal submission.
8. **Incidents** are reported, reviewed, and resolved through a workflow.
9. **Reporting dashboards** surface expiring documents, claims, and ROC data.

---

## Modules (16 Sidebar Items)

### 1. Dashboard
- KPI overview: Total Participants, Active Workers, Shifts This Week, Pending Invoices

### 2. Participants (CRM)
- List with search, region, and status filters.
- **Add New:** NDIS Number, Plan Dates, Management Style (NDIA/Plan Managed/Self Managed), Region, Contact.
- **Profile tabs:** Details, NDIS Plans, Documents, Notes, Service Agreements.
- Bulk import via CSV.

### 3. HRM (Team Management)
- **Worker list:** role, status, compliance summary.
- **Add Worker:** Role, Email, Phone, Status, Police Check expiry, WWCC expiry.
- **Hiring Pipeline:** applicant tracking per role.

### 4. Support Coordination
- Caseload overview per coordinator.
- Plan utilisation tracking against NDIS budgets.
- Case notes linked to participants.

### 5. Allied Health
- **Sub-tabs:** Participant List, Service Catalogue, Service Providers, Case Note History, NDIS Claims, Invoices, Reporting.
- Dashboard: billable vs non-billable hours, worker leaderboard.

### 6. Rostering
- **Calendar view:** Participant view / Worker view toggle. Weekly/Fortnightly.
- **Add Shift modal:** Participant, Worker, Start/End datetime, Support Item.
- **Timesheets sub-module:** scheduled vs actual hours.

### 7. Home Management (Accommodation)
- **Property registry:** Address, SDA Type, Room Count, Accessibility Features, Vacancy Status.
- Participant occupancy linkage per property.

### 8. Incident Management
- **Form:** Reportable vs Non-Reportable, Outcome Type, Participant/Worker, Date.
- **Workflow:** Draft → Submitted → Under Review → Resolved.
- Audit trail for compliance.

### 9. Invoicing
- **Pipeline stages:** Timesheet Approved → Ready for Invoice → Generated.
- Batch generation.
- Export in NDIS portal-compatible formats.

### 10. Reporting
- ROC report, Feedback/Complaints report, Expiring Documents, Detailed Invoicing, NDIS Claims.

### 11. Forms Management
- Dynamic form builder: Inductions, Risk Assessments, Maintenance Requests.

### 12. Policies
- Document repository for internal policy PDFs.

### 13. Complaints
- Ticketing system for complaint records and resolution.

### 14. Feedback
- Submission form and response tracking.

### 15. Ask a Question
- Internal QA ticketing for staff queries.

### 16. Settings
- RBAC (role definitions and permissions).
- Branding (logo, colours).
- Region Management.

---

## Scope

### In Scope (Phase 1)
- Auth and role-based route protection (single organisation).
- All 16 sidebar modules above.
- Participant and Worker full lifecycle management.
- Rostering calendar with shift creation.
- Invoicing pipeline from timesheet to export.
- Incident reporting and resolution workflow.
- Dynamic form builder.
- Reporting dashboards.
- Settings (RBAC, Branding, Regions).

### Out of Scope (Phase 1)
- Multi-tenancy / SaaS organisation switching.
- Native mobile app.
- Real-time video (telehealth).
- Third-party payroll integration.
- Billing and subscription management.

---

## Success Criteria

Phase 1 is complete when:

1. Admin can create a **Participant** with NDIS plan and documents.
2. Admin can onboard a **Worker** with compliance records.
3. Rostering team can create and manage **shifts** on a calendar.
4. **Timesheets** flow correctly into the invoicing pipeline.
5. **Incidents** can be reported, reviewed, and resolved.
6. **RBAC** restricts data appropriately per user role.
7. Invoices exported in **NDIS-compatible format**.

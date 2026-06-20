# Home Management (SIL Accommodation) - Feature Specification

---

## 1. Module Purpose

The Home Management module manages SIL/NDIS accommodation properties and links them to participants.

Core capabilities:

- Maintain a list of homes/properties per region.
- Store key property attributes (rooms, bathrooms, SDA type, shared spaces).
- Track occupancy and vacancy.
- (Later) link participants living in each home.

Initial screens (from Vertex360):

1. Home Listing – `/home-management/homes` (SIL Accommodation list)
2. Create / Edit Home modal

---

## 2. Data Model (Prisma)

### 2.1 Home

Represents a single SIL / accommodation property.

Fields:

- `id`
- `streetAddress` (string)
- `suburb` (string)
- `state` (string)
- `postalCode` (string)
- `regionId` (FK to Region)
- `propertyType` (string/enum, e.g. House, Apartment, Unit)
- `sdaType` (string/enum – Specialist Disability Accommodation type)
- `rooms` (int) – total number of bedrooms.
- `bathrooms` (int)
- `kitchens` (int)
- `parkingSpaces` (int)
- `sharedSpaces` (int) – number of shared spaces/areas.
- `hasFrontYard` (boolean)
- `hasBackyard` (boolean)
- `hasSwimmingPool` (boolean)
- `status` (enum):
  - `Active`
  - `Inactive`
- Occupancy/vacancy:

  To support the “Vacancy” column:

  - `maxCapacity` (int) – max number of residents.
  - `currentOccupancy` (int) – derived or stored.
  - Optionally keep this derived from `HomeParticipant` count instead of storing.

- `createdAt`
- `updatedAt`

### 2.2 HomeParticipant (optional for v1)

Links participants to a home.

Fields:

- `id`
- `homeId`
- `participantId`
- `moveInDate` (Date)
- `moveOutDate` (Date, optional)
- `createdAt`
- `updatedAt`

Vacancy can then be:

- `vacancy = maxCapacity - activeHomeParticipants`.

For this phase, you may stub the participants list using this table or leave it empty.

---

## 3. Screens & Flows

### 3.1 Home Listing – `/home-management/homes`

Header:

- Title: “Home Listing”.
- Region selector (top right).
- Status filter dropdown on the left: `Active`, `Inactive`, `All`.

Actions:

- “+ Add Home” button – opens Create Home modal.
- Search box – search by property address / suburb / state.

Table columns (per screenshot):

- Property Address (display street + suburb).
- Participants (count of current occupants).
- Region.
- Vacancy (e.g. “2 of 4” or “2 Vacancies”).
- Status (Active/Inactive pill).
- Actions (View/Edit, maybe Deactivate).

Empty state: “No data found!” when no homes exist.

Clicking the Actions icon opens an edit view:

- Either reuse the modal in edit mode, or navigate to `/home-management/homes/[id]` later; for this phase a modal is enough.

---

### 3.2 Create / Edit Home Modal

Opened from “+ Add Home” or table Actions.

Title: “Create Home” (or “Edit Home”).

Section: **Home Information**

Fields (all visible in screenshot):

- Street Address * (text)
- Suburb * (text)
- State * (select – use existing state list used elsewhere).
- Postal Code * (text)
- Property Type (select – e.g. House, Unit, Apartment).
- SDA Type (Specialist Disability Accommodation) (select)
- Rooms * (number – “Enter number of rooms”)
- Bathrooms (number)
- Kitchens (number)
- Parking Spaces (number)
- Shared Spaces (number – “Enter number of shared spaces”)

Shared Spaces checkboxes:

- Front Yard (boolean)
- Backyard (boolean)
- Swimming Pool (boolean)

Additional v1 fields to include (even if not in screenshot):

- Max Capacity (number).
- Status (Active/Inactive dropdown, default Active).
- Region (select, default current region).

Buttons:

- “Create” / “Save” – validates with Zod, creates or updates Home, closes modal and refreshes table.
- “Cancel” / close icon – closes modal without saving.

Behaviour:

- On success, invalidate homes list query for current region and status filter.
- For edit, prefill all fields from existing record.

---

## 4. API & Hooks

### 4.1 API Endpoints

Homes (under `/api/home-management/homes`):

- `GET /api/home-management/homes`
  - Query params:
    - `status` (Active|Inactive|All)
    - `regionId`
    - `search`
  - Returns list including derived participants count & vacancy if implemented.

- `POST /api/home-management/homes`
  - Creates new Home.

- `GET /api/home-management/homes/[id]`
  - Returns full Home, plus HomeParticipant list if used.

- `PATCH /api/home-management/homes/[id]`
  - Updates Home (address, property details, capacity, status).

- `DELETE /api/home-management/homes/[id]` (optional)
  - Soft delete or set status to Inactive.

Home participants (optional for this phase):

- `GET /api/home-management/homes/[id]/participants`
- `POST /api/home-management/homes/[id]/participants`
- `PATCH /api/home-management/home-participants/[id]`

Add Zod schemas in `lib/validations/home-management.ts`:

- `homeCreateSchema`
- `homeUpdateSchema`
- `homeFiltersSchema`

### 4.2 Hooks (TanStack Query)

Create `hooks/use-home-management.ts`:

Homes:

- `useHomes(filters)` – wraps `GET /api/home-management/homes`.
- `useHome(id)` – fetch single Home.
- `useCreateHome()`
- `useUpdateHome()`
- `useDeleteHome()` (optional).

Home participants (optional):

- `useHomeParticipants(homeId)`
- `useAddHomeParticipant(homeId)`
- `useUpdateHomeParticipant()`

All hooks:

- Include `selectedRegionId` in query keys and requests.
- Follow patterns of `use-incidents`, `use-hrm`, `use-cos`.

---

## 5. UI Components & Pages

Pages:

- `app/(dashboard)/home-management/homes/page.tsx`
  - Implements “Home Listing”:
    - PageHeader “Home Listing”.
    - Status filter, region selector, search.
    - DataTable of homes using `useHomes`.
    - “+ Add Home” button to open Create/Edit modal.
    - EmptyState when no data.

Components:

- `components/home-management/home-table.tsx`
- `components/home-management/home-modal.tsx`

Component behaviour:

- `home-table.tsx`:
  - Receives data and displays columns exactly as in screenshot.
  - Shows Participants as a number (0 if not implemented).
  - Vacancy column computed from `maxCapacity` and occupancy if available.

- `home-modal.tsx`:
  - React Hook Form + Zod resolver using `homeCreateSchema`/`homeUpdateSchema`.
  - Accepts `home` (optional) and `mode` (“create” or “edit”).
  - On submit, calls `useCreateHome` or `useUpdateHome`.

Success Criteria:

- Home Listing page loads and filters homes by status, region, and search.
- Create Home modal creates a new Home record and refreshes the list.
- Edit Home supports adjusting property information and status.
- All new code passes `pnpm lint` and `pnpm build`.
- `context/progress-tracker.md` updated with “Home Management Module COMPLETE”.
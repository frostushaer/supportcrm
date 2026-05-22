# SupportCRM - Installation Guide

This guide walks you through setting up **SupportCRM** from scratch.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** 18.17 or later
- **pnpm** 8.0 or later (recommended) or npm/yarn
- **PostgreSQL** 16.x (local or cloud)
- **Git** for version control

---

## Step 1: Initialize Next.js Project

Run the following command to create a new Next.js 15 project:

```bash
npx create-next-app@latest supportcrm
```

When prompted, choose these options:

- ✅ TypeScript: **Yes**
- ✅ ESLint: **Yes**
- ✅ Tailwind CSS: **Yes**
- ✅ `src/` directory: **No**
- ✅ App Router: **Yes**
- ✅ Customize default import alias: **No** (use `@/*`)

Navigate to the project:

```bash
cd supportcrm
```

---

## Step 2: Install shadcn/ui

Initialize shadcn/ui:

```bash
npx shadcn@latest init
```

Choose these options:

- Style: **New York**
- Base color: **Slate**
- CSS variables: **Yes**

Add core components:

```bash
npx shadcn@latest add button card dialog sheet input tabs textarea scroll-area dropdown-menu select badge avatar separator tooltip skeleton table
```

---

## Step 3: Install Dependencies

Install all required packages:

```bash
pnpm add @prisma/client prisma next-auth@beta zustand @tanstack/react-query react-hook-form @hookform/resolvers/zod zod lucide-react geist sonner
```

Initialize Prisma:

```bash
pnpm prisma init
```

This creates:
- `prisma/schema.prisma`
- `.env` file

---

## Step 4: Configure PostgreSQL

### Local Setup (Option A)

Install PostgreSQL locally and create a database:

```sql
CREATE DATABASE supportcrm;
```

Update `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/supportcrm"
```

### Cloud Setup (Option B - Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Update `.env`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

---

## Step 5: Apply SupportCRM Theme

Replace `app/globals.css` with the SupportCRM theme tokens:

```css
@import "tailwindcss";

@theme inline {
  /* SupportCRM Brand Tokens */
  --color-bg: #f4f6f9;
  --color-surface: #ffffff;
  --color-elevated: #f8fafc;
  --color-subtle: #eef2f7;
  --color-border: #d1d5db;
  --color-border-subtle: #e5e7eb;
  --color-text: #111827;
  --color-text-secondary: #374151;
  --color-text-muted: #6b7280;
  --color-text-faint: #9ca3af;
  --color-primary: #0284c7;
  --color-primary-hover: #0369a1;
  --color-primary-dim: rgba(2,132,199,0.10);
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-info: #2563eb;

  /* shadcn Aliases */
  --background: var(--color-bg);
  --foreground: var(--color-text);
  --card: var(--color-surface);
  --card-foreground: var(--color-text);
  --primary: var(--color-primary);
  --primary-foreground: #ffffff;
  --border: var(--color-border);
  --ring: var(--color-primary);
}

* {
  @apply border-[var(--color-border)];
}

body {
  @apply bg-[var(--color-bg)] text-[var(--color-text)] font-sans antialiased;
}
```

---

## Step 6: Apply Geist Font

Update `app/layout.tsx`:

```typescript
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

## Step 7: Create Folder Structure

Create the following folders:

```bash
mkdir -p components/ui components/shared components/layout store hooks lib/validations app/api
```

Your structure should look like this:

```
supportcrm/
├── app/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/          # shadcn components
│   ├── shared/      # Reusable components
│   └── layout/      # Layout components
├── hooks/
├── lib/
│   └── validations/
├── store/
├── prisma/
│   └── schema.prisma
├── context/         # AI agent context files (already created)
└── public/
```

---

## Step 8: Add Environment Variables

Update `.env` with all required variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/supportcrm"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Optional: File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=""
```

Generate a random secret:

```bash
openssl rand -base64 32
```

---

## Step 9: Initialize Prisma Schema

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Basic Region model for Phase 0
model Region {
  id        String   @id @default(cuid())
  name      String   @unique
  state     String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Run migration:

```bash
pnpm prisma migrate dev --name init
```

---

## Step 10: Create Prisma Client

Create `lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

---

## Step 11: Verify Build

Run the development server:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

Build for production to verify everything works:

```bash
pnpm build
```

If the build passes with no TypeScript or lint errors, you're ready to proceed to **Phase 1**!

---

## Next Steps

1. Update `context/progress-tracker.md` → mark Phase 0 as complete
2. Read `context/feature-specs/README.md`
3. Proceed to **Phase 1: Foundation & Layout** (build Sidebar, TopNavbar, Dashboard)

---

## Troubleshooting

### Prisma Connection Error

```
Error: P1001: Can't reach database server
```

**Solution:** Verify PostgreSQL is running and connection string is correct in `.env`.

### Tailwind Not Working

**Solution:** Ensure `tailwind.config.ts` includes:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;
```

### shadcn Components Not Found

**Solution:** Run `npx shadcn@latest add {component}` to install missing components.

---

## Support

For questions or issues, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

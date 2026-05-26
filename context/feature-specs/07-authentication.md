# Authentication - Feature Spec

## Goal
Implement NextAuth.js v5 sign-in flow with credentials provider, protect all dashboard routes with middleware, and add functional sign-out.

---

## Phase 2 Requirements

### 1. Sign-In Page

**File:** `app/(auth)/sign-in/page.tsx`

**Type:** Client Component (`'use client'`)

**Features:**
- Email + password form
- Form validation with Zod
- Submit via NextAuth signIn()
- Redirect to /dashboard on success
- Show error message on failure

**Implementation:**

```tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError('Invalid email or password');
    } else if (result?.ok) {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <Card className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-lg bg-[var(--color-primary)] flex items-center justify-center mb-3">
            <span className="text-white font-bold text-xl">SC</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            SupportCRM
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            NDIS care management, simplified.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--color-error)] bg-opacity-10 border border-[var(--color-error)]">
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-[var(--color-text)]">
              Email
            </label>
            <Input
              type="email"
              placeholder="admin@supportcrm.io"
              {...register('email')}
              className="mt-1"
            />
            {errors.email && (
              <p className="text-sm text-[var(--color-error)] mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--color-text)]">
              Password
            </label>
            <Input
              type="password"
              placeholder="- - - - - - - - "
              {...register('password')}
              className="mt-1"
            />
            {errors.password && (
              <p className="text-sm text-[var(--color-error)] mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-3 rounded-lg bg-[var(--color-subtle)]">
          <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">
            Demo Credentials:
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Email: admin@supportcrm.io
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Password: demo
          </p>
        </div>
      </Card>
    </div>
  );
}
```

---

### 2. Auth Layout

**File:** `app/(auth)/layout.tsx`

**Purpose:** Separate layout for auth pages (no sidebar/navbar)

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

---

### 3. Middleware for Route Protection

**File:** `middleware.ts` (root directory)

**Purpose:** Protect all `/dashboard/*` routes, redirect unauthenticated users to `/sign-in`

```tsx
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  // Redirect authenticated users away from sign-in
  if (pathname === '/sign-in' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

### 4. Sign Out Functionality

**File:** Update `components/layout/top-navbar.tsx`

**Change:** Wire the "Sign Out" menu item to call NextAuth signOut()

```tsx
import { signOut } from 'next-auth/react';

// Inside user DropdownMenu:
<DropdownMenuItem
  onClick={() => signOut({ callbackUrl: '/sign-in' })}
  className="text-[var(--color-error)] cursor-pointer"
>
  Sign Out
</DropdownMenuItem>
```

---

### 5. Session Provider

**File:** `app/providers.tsx` (create new)

**Purpose:** Wrap app with NextAuth SessionProvider

```tsx
'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**File:** Update `app/layout.tsx`

```tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

### 6. Root Redirect

**File:** Update `app/page.tsx`

**Purpose:** Redirect root to /dashboard (or /sign-in if not authenticated)

```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function RootPage() {
  const session = await auth();
  
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/sign-in');
  }
}
```

---

## Success Criteria

- [x] Sign-in page renders at `/sign-in`
- [x] Form validates email and password with Zod
- [x] Submit calls NextAuth `signIn('credentials')`
- [x] Demo credentials work (admin@supportcrm.io / demo)
- [x] Successful login redirects to `/dashboard`
- [x] Invalid credentials show error message
- [x] Middleware protects all `/dashboard/*` routes
- [x] Unauthenticated users redirect to `/sign-in`
- [x] Authenticated users can't access `/sign-in` (redirect to dashboard)
- [x] Sign Out button works (clears session, redirects to `/sign-in`)
- [x] Root `/` redirects to dashboard if authenticated, sign-in if not
- [x] pnpm build passes with 0 errors

---

## Testing Flow

1. Open http://localhost:3000 → redirects to `/sign-in`
2. Try invalid credentials → error message shows
3. Enter demo credentials → redirects to `/dashboard`
4. Click user avatar → "Sign Out" → redirects to `/sign-in`
5. Try to access `/dashboard` without auth → redirects to `/sign-in`

---

## Dependencies

**Already installed in Phase 0:**
- next-auth@beta
- react-hook-form
- @hookform/resolvers/zod
- zod

**No new packages needed.**

---

## Notes

- Credentials provider uses hardcoded demo user (Phase 0 config)
- In Phase 3, replace with database user lookup
- Session includes: id, name, email, role, regionId
- Middleware runs on all routes except API, static files, images
- SessionProvider must wrap entire app for `useSession()` hook
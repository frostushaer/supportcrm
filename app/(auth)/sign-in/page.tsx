'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
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
    resolver: standardSchemaResolver(signInSchema),
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
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <Card className="w-full max-w-md">
        <div className="px-8 py-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary)]">
              <span className="text-xl font-bold text-white">SC</span>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">
              SupportCRM
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              NDIS care management, simplified.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/10 p-3">
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
                <p className="mt-1 text-sm text-[var(--color-error)]">
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
                placeholder="••••••••"
                {...register('password')}
                className="mt-1"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-[var(--color-error)]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 rounded-lg bg-[var(--color-subtle)] p-3">
            <p className="mb-1 text-xs font-medium text-[var(--color-text-muted)]">
              Demo Credentials:
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Email: admin@supportcrm.io
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Password: demo
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

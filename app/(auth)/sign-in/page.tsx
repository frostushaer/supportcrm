'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { z } from 'zod';
import { Command, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  remember: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: standardSchemaResolver(signInSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-dvh">
      {/* ── Left panel — bg-primary, 1/3 width ── */}
      <div className="hidden bg-primary lg:block lg:w-1/3">
        <div className="flex h-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <Command className="mx-auto size-12 text-primary-foreground" />
            <div className="space-y-2">
              <h1 className="text-5xl font-light text-primary-foreground">Hello again</h1>
              <p className="text-xl text-primary-foreground/80">Login to continue</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form, 2/3 width ── */}
      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-10 py-24 lg:py-32">

          {/* Heading */}
          <div className="space-y-4 text-center">
            <div className="font-medium tracking-tight">Login</div>
            <div className="mx-auto max-w-xl text-muted-foreground">
              Welcome back. Enter your email and password, let&apos;s hope you remember them this time.
            </div>
          </div>

          {/* Form + social */}
          <div className="space-y-4">
            <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-email">Email Address</Label>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        {...field}
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <p className="text-xs text-destructive">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        {...field}
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <p className="text-xs text-destructive">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <Checkbox
                      id="login-remember"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                    />
                  )}
                />
                <Label htmlFor="login-remember" className="cursor-pointer font-normal">
                  Remember me for 30 days
                </Label>
              </div>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Demo:</span> admin@supportcrm.io · demo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

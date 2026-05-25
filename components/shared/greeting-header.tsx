'use client';

export function GreetingHeader() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">
        {greeting}! 👋
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Here&apos;s an overview of your NDIS operations today.
      </p>
    </div>
  );
}

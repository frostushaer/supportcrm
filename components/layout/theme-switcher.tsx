'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const CYCLE = ['light', 'dark', 'system'] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const idx = CYCLE.indexOf((theme ?? 'light') as typeof CYCLE[number]);
    setTheme(CYCLE[(idx + 1) % CYCLE.length]);
  };

  return (
    <Button size="icon" variant="ghost" onClick={cycle} aria-label="Toggle theme">
      <Sun className="block dark:hidden" />
      <Moon className="hidden dark:block" />
    </Button>
  );
}

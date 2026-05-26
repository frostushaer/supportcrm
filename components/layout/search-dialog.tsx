'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { sidebarItems } from '@/lib/navigation';

type SearchItem = { group: string; label: string; url: string };

const searchItems: SearchItem[] = sidebarItems.flatMap((group) =>
  group.items.map((item) => ({
    group: group.label ?? 'Other',
    label: item.title,
    url: item.url,
  }))
);

function groupBy(items: SearchItem[]) {
  const groups = [...new Set(items.map((i) => i.group))];
  return groups.map((g) => ({ group: g, items: items.filter((i) => i.group === g) }));
}

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) setQuery('');
  };

  const filtered = query
    ? searchItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : searchItems;

  return (
    <>
      <Button
        variant="link"
        onClick={() => handleOpenChange(true)}
        className="px-0! font-normal text-muted-foreground hover:no-underline"
      >
        <Search data-icon="inline-start" />
        Search
        <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px]">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command>
          <CommandInput
            placeholder="Search pages..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {groupBy(filtered).map(({ group, items }, idx) => (
              <React.Fragment key={group}>
                {idx > 0 && <CommandSeparator />}
                <CommandGroup heading={group}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.url}
                      value={`${item.group} ${item.label}`}
                      onSelect={() => {
                        handleOpenChange(false);
                        router.push(item.url);
                      }}
                    >
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

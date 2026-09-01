import { useState } from "react";
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export interface CMSOption {
  id: string;
  label: string;
  color?: string | null;
}

export function CreatorMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  emptyLabel = "No options",
  onCreate,
}: {
  options: CMSOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  emptyLabel?: string;
  onCreate?: (name: string) => Promise<string>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const selectedSet = new Set(value);
  const selected = options.filter((o) => selectedSet.has(o.id));

  // Determine if exact match exists
  const hasExactMatch = options.some((o) => o.label.toLowerCase() === search.trim().toLowerCase());

  async function handleCreate() {
    if (!onCreate || !search.trim()) return;
    setCreating(true);
    try {
      const newId = await onCreate(search.trim());
      onChange([...value, newId]);
      setSearch("");
    } catch {
      // toast error is handled by parent
    } finally {
      setCreating(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-10 text-left"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary px-2 py-0.5 text-xs font-medium"
                >
                  {s.label}
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(value.filter((v) => v !== s.id));
                    }}
                    className="hover:opacity-70 ml-0.5"
                  >
                    <X className="size-3" />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput
            placeholder="Search or type to create…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {search.trim() && !hasExactMatch && onCreate && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreate}
                  disabled={creating}
                  className="text-primary font-medium cursor-pointer"
                >
                  {creating ? (
                    <Loader2 className="size-3 animate-spin mr-2" />
                  ) : (
                    <span className="mr-2 font-bold">+</span>
                  )}
                  Create new "{search.trim()}"
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {options.length === 0 && !search.trim() && (
                <div className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</div>
              )}
              {options.map((o) => {
                const isSel = selectedSet.has(o.id);
                return (
                  <CommandItem
                    key={o.id}
                    value={o.label}
                    onSelect={() => {
                      if (isSel) onChange(value.filter((v) => v !== o.id));
                      else onChange([...value, o.id]);
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={isSel}
                      onCheckedChange={() => {}}
                      className="pointer-events-none"
                    />
                    <span>{o.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

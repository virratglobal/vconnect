import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface MSOption {
  id: string;
  label: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  emptyLabel = "No options",
}: {
  options: MSOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedSet = new Set(value);
  const selected = options.filter((o) => selectedSet.has(o.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-10"
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
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
                    className="hover:opacity-70"
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
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const isSel = selectedSet.has(o.id);
                return (
                  <CommandItem
                    key={o.id}
                    onSelect={() => {
                      if (isSel) onChange(value.filter((v) => v !== o.id));
                      else onChange([...value, o.id]);
                    }}
                  >
                    <Check
                      className={cn(
                        "size-4 mr-2",
                        isSel ? "opacity-100 text-primary" : "opacity-0",
                      )}
                    />
                    {o.label}
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

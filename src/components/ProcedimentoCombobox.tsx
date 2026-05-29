import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { procedimentoService, ProcedimentoRecord } from "@/services/procedimentoService";
import { procedimentoConsultaLabels } from "@/types";

interface Option {
  value: string;
  label: string;
  group: "Padrão" | "Cadastrados";
}

interface ProcedimentoComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  includeDefaults?: boolean;
  allowCustom?: boolean;
  className?: string;
}

let cache: ProcedimentoRecord[] | null = null;

export const ProcedimentoCombobox = ({
  value,
  onChange,
  placeholder = "Selecione um procedimento...",
  includeDefaults = true,
  allowCustom = false,
  className,
}: ProcedimentoComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [registered, setRegistered] = useState<ProcedimentoRecord[]>(cache || []);

  useEffect(() => {
    if (cache) return;
    procedimentoService
      .list()
      .then((data) => {
        cache = data;
        setRegistered(data);
      })
      .catch(() => {});
  }, []);

  const options: Option[] = useMemo(() => {
    const list: Option[] = [];
    if (includeDefaults) {
      Object.entries(procedimentoConsultaLabels).forEach(([k, label]) => {
        list.push({ value: k, label, group: "Padrão" });
      });
    }
    registered.forEach((p) => {
      list.push({ value: p.nome, label: p.nome, group: "Cadastrados" });
    });
    return list;
  }, [registered, includeDefaults]);

  const selected = options.find((o) => o.value === value);
  const selectedLabel = selected?.label || value || "";

  const padrao = options.filter((o) => o.group === "Padrão");
  const cadastrados = options.filter((o) => o.group === "Cadastrados");

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", !selectedLabel && "text-muted-foreground", className)}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Pesquisar procedimento..."
              value={search}
              onValueChange={setSearch}
              className="border-0 focus:ring-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>
              {allowCustom && search.trim() ? (
                <button
                  type="button"
                  onClick={() => handleSelect(search.trim())}
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded"
                >
                  Usar "{search.trim()}"
                </button>
              ) : (
                "Nenhum procedimento encontrado."
              )}
            </CommandEmpty>
            {padrao.length > 0 && (
              <CommandGroup heading="Padrão">
                {padrao.map((o) => (
                  <CommandItem key={`d-${o.value}`} value={o.label} onSelect={() => handleSelect(o.value)}>
                    <Check className={cn("mr-2 h-4 w-4", value === o.value ? "opacity-100" : "opacity-0")} />
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {cadastrados.length > 0 && (
              <CommandGroup heading="Cadastrados">
                {cadastrados.map((o) => (
                  <CommandItem key={`c-${o.value}`} value={o.label} onSelect={() => handleSelect(o.value)}>
                    <Check className={cn("mr-2 h-4 w-4", value === o.value ? "opacity-100" : "opacity-0")} />
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

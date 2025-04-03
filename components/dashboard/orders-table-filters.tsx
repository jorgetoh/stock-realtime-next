"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ListFilter } from "lucide-react";
import { nanoid } from "nanoid";
import * as React from "react";
import { AnimateChangeInHeight } from "@/components/ui/filters";
import Filters from "@/components/ui/filters";
import {
  Filter,
  FilterOperator,
  FilterOption,
  FilterType,
  filterViewOptions,
  filterViewToFilterOptions,
  Order,
  Type,
  Status,
} from "@/components/ui/filters";
import { useRouter, useSearchParams } from "next/navigation";

export function CustomTableFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const [selectedView, setSelectedView] = React.useState<FilterType | null>(
    null
  );
  const [commandInput, setCommandInput] = React.useState("");
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const [filters, setFilters] = React.useState<Filter[]>(() => {
    const filters: Filter[] = [];

    const order = searchParams.get("order");
    if (order) {
      filters.push({
        id: nanoid(),
        type: FilterType.ORDER,
        operator: FilterOperator.IS,
        value: [order === "OLD" ? Order.OLD : Order.NEW],
      });
    }

    const type = searchParams.get("type");
    if (type) {
      const types = type.split(",");
      filters.push({
        id: nanoid(),
        type: FilterType.TYPE,
        operator: FilterOperator.IS,
        value: types.map((t) => (t === "BUY" ? Type.BUY : Type.SELL)),
      });
    }

    const status = searchParams.get("status");
    if (status) {
      const statuses = status
        .split(",")
        .map((s) => {
          const upperStatus = s.toUpperCase();
          switch (upperStatus) {
            case "PENDING":
              return Status.PENDING;
            case "COMPLETED":
              return Status.COMPLETED;
            case "CANCELLED":
              return Status.CANCELLED;
            default:
              return null;
          }
        })
        .filter((s): s is Status => s !== null);

      if (statuses.length > 0) {
        filters.push({
          id: nanoid(),
          type: FilterType.STATUS,
          operator: FilterOperator.IS,
          value: statuses,
        });
      }
    }

    return filters;
  });

  const updateUrlParams = React.useCallback(
    (newFilters: Filter[]) => {
      const params = new URLSearchParams(searchParams.toString());

      params.delete("order");
      params.delete("type");
      params.delete("status");

      newFilters.forEach((filter) => {
        if (filter.value.length > 0) {
          switch (filter.type) {
            case FilterType.ORDER:
              params.set(
                "order",
                filter.value[0] === Order.OLD ? "OLD" : "NEW"
              );
              break;
            case FilterType.TYPE:
              params.set(
                "type",
                filter.value
                  .map((v) => (v === Type.BUY ? "BUY" : "SELL"))
                  .join(",")
              );
              break;
            case FilterType.STATUS:
              params.set(
                "status",
                filter.value.map((v) => v.toUpperCase()).join(",")
              );
              break;
          }
        }
      });

      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleFiltersChange = React.useCallback(
    (newFilters: Filter[] | ((prev: Filter[]) => Filter[])) => {
      const updatedFilters =
        typeof newFilters === "function" ? newFilters(filters) : newFilters;
      setFilters(updatedFilters);
      updateUrlParams(updatedFilters);
    },
    [updateUrlParams, filters]
  );

  return (
    <div
      className={`flex mb-[1px] flex-wrap ${filters.length > 0 ? "gap-2" : ""}`}
    >
      <Filters filters={filters} setFilters={handleFiltersChange} />
      {filters.filter((filter) => filter.value?.length > 0).length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="transition group h-6 text-xs items-center rounded-sm"
          onClick={() => handleFiltersChange([])}
        >
          Clear
        </Button>
      )}
      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setTimeout(() => {
              setSelectedView(null);
              setCommandInput("");
            }, 200);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            size="sm"
            className={cn(
              "transition group h-6 text-xs items-center rounded-sm flex gap-1.5",
              filters.length > 0 && "w-6"
            )}
          >
            <ListFilter className="size-3 shrink-0 transition-all text-muted-foreground group-hover:text-primary" />
            {!filters.length && "Filter"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <AnimateChangeInHeight>
            <Command>
              <CommandInput
                placeholder={selectedView ? selectedView : "Filter..."}
                className="h-9"
                value={commandInput}
                onInputCapture={(e) => {
                  setCommandInput(e.currentTarget.value);
                }}
                ref={commandInputRef}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {selectedView ? (
                  <CommandGroup>
                    {filterViewToFilterOptions[selectedView].map(
                      (filter: FilterOption) => (
                        <CommandItem
                          className="group text-muted-foreground flex gap-2 items-center"
                          key={filter.name}
                          value={filter.name}
                          onSelect={(currentValue) => {
                            handleFiltersChange([
                              ...filters,
                              {
                                id: nanoid(),
                                type: selectedView,
                                operator: FilterOperator.IS,
                                value: [currentValue],
                              },
                            ]);
                            setTimeout(() => {
                              setSelectedView(null);
                              setCommandInput("");
                            }, 200);
                            setOpen(false);
                          }}
                        >
                          {filter.icon}
                          <span className="text-accent-foreground">
                            {filter.name}
                          </span>
                          {filter.label && (
                            <span className="text-muted-foreground text-xs ml-auto">
                              {filter.label}
                            </span>
                          )}
                        </CommandItem>
                      )
                    )}
                  </CommandGroup>
                ) : (
                  filterViewOptions.map(
                    (group: FilterOption[], index: number) => (
                      <React.Fragment key={index}>
                        <CommandGroup>
                          {group.map((filter: FilterOption) => (
                            <CommandItem
                              className="group text-muted-foreground flex gap-2 items-center"
                              key={filter.name}
                              value={filter.name}
                              onSelect={(currentValue) => {
                                setSelectedView(currentValue as FilterType);
                                setCommandInput("");
                                commandInputRef.current?.focus();
                              }}
                            >
                              {filter.icon}
                              <span className="text-accent-foreground">
                                {filter.name}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {index < filterViewOptions.length - 1 && (
                          <CommandSeparator />
                        )}
                      </React.Fragment>
                    )
                  )
                )}
              </CommandList>
            </Command>
          </AnimateChangeInHeight>
        </PopoverContent>
      </Popover>
    </div>
  );
}

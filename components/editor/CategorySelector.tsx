"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getCategories, createCategory } from "@/actions/post";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategorySelectorProps {
  selectedId: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategorySelector({
  selectedId,
  onSelect,
}: CategorySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!search.trim()) return;
    try {
      const newCategory = await createCategory(search.trim());
      setCategories((prev) =>
        [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)),
      );
      onSelect(newCategory.id);
      setOpen(false);
      setSearch("");
      toast.success(`Category "${newCategory.name}" created`);
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-100 dark:bg-slate-900 border-none hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          {selectedCategory ? selectedCategory.name : "Select category..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search category..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-2 text-center text-sm">
              <p className="text-muted-foreground mb-2">No category found.</p>
              <Button
                size="sm"
                className="w-full"
                onClick={handleCreateCategory}
                variant="secondary"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create &quot;{search}&quot;
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={(currentValue) => {
                    onSelect(category.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedId === category.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

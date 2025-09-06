'use client';

import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface MultiSelectFilterProps {
  label: string;
  options: Array<{ value: string; label: string; color?: string }>;
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select options...',
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  const selectedOptions = options.filter(option => 
    selectedValues.includes(option.value)
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
        >
          <span className="truncate">
            {selectedValues.length === 0
              ? placeholder
              : `${selectedValues.length} selected`}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[200px]" align="start">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {selectedValues.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded-sm cursor-pointer"
                onClick={() => handleToggle(option.value)}
              >
                <Checkbox
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleToggle(option.value)}
                />
                <span className="text-sm flex-1">{option.label}</span>
                {option.color && (
                  <div className={`w-2 h-2 rounded-full bg-${option.color}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="text-xs"
            >
              {option.label}
              <button
                onClick={() => handleToggle(option.value)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </DropdownMenu>
  );
}

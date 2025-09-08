'use client';

import { useSignalStore } from '@/store/signal-store';
import { PERSONA_FILTERS, SIGNAL_TYPES, URGENCY_LEVELS, COMPANY_SIZES } from '@/types/signal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonaFilterChipsProps {
  className?: string;
}

export function PersonaFilterChips({ className }: PersonaFilterChipsProps) {
  const { 
    selectedPersona, 
    isPersonaMode, 
    filters, 
    setFilters 
  } = useSignalStore();

  if (!isPersonaMode) {
    return null;
  }

  const personaFilters = PERSONA_FILTERS[selectedPersona];
  
  // Get filter labels
  const getSignalTypeLabel = (value: string) => 
    SIGNAL_TYPES.find(type => type.value === value)?.label || value;
  
  const getUrgencyLabel = (value: string) => 
    URGENCY_LEVELS.find(level => level.value === value)?.label || value;
  
  const getCompanySizeLabel = (value: string) => 
    COMPANY_SIZES.find(size => size.value === value)?.label || value;

  const removeFilter = (filterType: keyof typeof filters, value: string) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.filter(v => v !== value);
    setFilters({ [filterType]: newValues });
  };

  const clearAllFilters = () => {
    setFilters({
      signalTypes: [],
      urgencies: [],
      industries: [],
      companySizes: [],
      searchQuery: '',
    });
  };

  const hasActiveFilters = 
    filters.signalTypes.length > 0 ||
    filters.urgencies.length > 0 ||
    filters.industries.length > 0 ||
    filters.companySizes.length > 0 ||
    filters.searchQuery;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className={cn('space-y-3 animate-in slide-in-from-top-2 duration-300', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Applied Filters</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear all
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Signal Types */}
        {filters.signalTypes.map((type) => (
          <Badge
            key={`signal-${type}`}
            variant="secondary"
            className="flex items-center space-x-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            <span>{getSignalTypeLabel(type)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-blue-300"
              onClick={() => removeFilter('signalTypes', type)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {/* Urgencies */}
        {filters.urgencies.map((urgency) => (
          <Badge
            key={`urgency-${urgency}`}
            variant="secondary"
            className={cn(
              'flex items-center space-x-1',
              urgency === 'high' && 'bg-red-100 text-red-800 hover:bg-red-200',
              urgency === 'medium' && 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
              urgency === 'low' && 'bg-green-100 text-green-800 hover:bg-green-200'
            )}
          >
            <span>{getUrgencyLabel(urgency)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => removeFilter('urgencies', urgency)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {/* Company Sizes */}
        {filters.companySizes.map((size) => (
          <Badge
            key={`size-${size}`}
            variant="secondary"
            className="flex items-center space-x-1 bg-purple-100 text-purple-800 hover:bg-purple-200"
          >
            <span>{getCompanySizeLabel(size)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-purple-300"
              onClick={() => removeFilter('companySizes', size)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {/* Industries */}
        {filters.industries.map((industry) => (
          <Badge
            key={`industry-${industry}`}
            variant="secondary"
            className="flex items-center space-x-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            <span>{industry}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-gray-300"
              onClick={() => removeFilter('industries', industry)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {/* Search Query */}
        {filters.searchQuery && (
          <Badge
            variant="secondary"
            className="flex items-center space-x-1 bg-orange-100 text-orange-800 hover:bg-orange-200"
          >
            <span>Search: &quot;{filters.searchQuery}&quot;</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-orange-300"
              onClick={() => setFilters({ searchQuery: '' })}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {/* Persona-specific filters */}
        {selectedPersona === 'AE' && personaFilters.titleKeywords && (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800"
          >
            Title: {personaFilters.titleKeywords.join(', ')}
          </Badge>
        )}

        {selectedPersona === 'CSM' && personaFilters.companyList && (
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-800"
          >
            Existing Customers ({personaFilters.companyList.length} companies)
          </Badge>
        )}
      </div>
    </div>
  );
}

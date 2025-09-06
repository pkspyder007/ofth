'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSignalStore } from '@/store/signal-store';
import { MultiSelectFilter } from './multi-select-filter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { SIGNAL_TYPES, URGENCY_LEVELS, COMPANY_SIZES, INDUSTRIES } from '@/types/signal';

export function SignalFilters() {
  const { filters, setFilters, clearFilters, setFiltersFromURL } = useSignalStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    const urlFilters = {
      searchQuery: params.get('search') || '',
      signalTypes: params.get('signalTypes')?.split(',').filter(Boolean) || [],
      urgencies: params.get('urgencies')?.split(',').filter(Boolean) || [],
      industries: params.get('industries')?.split(',').filter(Boolean) || [],
      companySizes: params.get('companySizes')?.split(',').filter(Boolean) || [],
    };

    setFiltersFromURL(urlFilters);
  }, [searchParams, setFiltersFromURL]);

  // Update URL when filters change
  const updateURL = (newFilters: any) => {
    const params = new URLSearchParams(searchParams);
    
    if (newFilters.searchQuery) {
      params.set('search', newFilters.searchQuery);
    } else {
      params.delete('search');
    }
    
    if (newFilters.signalTypes?.length > 0) {
      params.set('signalTypes', newFilters.signalTypes.join(','));
    } else {
      params.delete('signalTypes');
    }
    
    if (newFilters.urgencies?.length > 0) {
      params.set('urgencies', newFilters.urgencies.join(','));
    } else {
      params.delete('urgencies');
    }
    
    if (newFilters.industries?.length > 0) {
      params.set('industries', newFilters.industries.join(','));
    } else {
      params.delete('industries');
    }
    
    if (newFilters.companySizes?.length > 0) {
      params.set('companySizes', newFilters.companySizes.join(','));
    } else {
      params.delete('companySizes');
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    const newFilters = { searchQuery: value };
    setFilters(newFilters);
    updateURL({ ...filters, ...newFilters });
  };

  const handleSignalTypeChange = (values: string[]) => {
    const newFilters = { signalTypes: values };
    setFilters(newFilters);
    updateURL({ ...filters, ...newFilters });
  };

  const handleUrgencyChange = (values: string[]) => {
    const newFilters = { urgencies: values };
    setFilters(newFilters);
    updateURL({ ...filters, ...newFilters });
  };

  const handleIndustryChange = (values: string[]) => {
    const newFilters = { industries: values };
    setFilters(newFilters);
    updateURL({ ...filters, ...newFilters });
  };

  const handleCompanySizeChange = (values: string[]) => {
    const newFilters = { companySizes: values };
    setFilters(newFilters);
    updateURL({ ...filters, ...newFilters });
  };

  const hasActiveFilters = 
    filters.searchQuery ||
    filters.signalTypes.length > 0 ||
    filters.urgencies.length > 0 ||
    filters.industries.length > 0 ||
    filters.companySizes.length > 0;

  return (
    <div className="space-y-4 p-4 bg-white border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearFilters();
              router.replace(window.location.pathname, { scroll: false });
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search prospects, companies..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Signal Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Signal Type</label>
          <MultiSelectFilter
            label="Signal Type"
            options={[...SIGNAL_TYPES]}
            selectedValues={filters.signalTypes}
            onSelectionChange={handleSignalTypeChange}
            placeholder="All signal types"
          />
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Urgency</label>
          <MultiSelectFilter
            label="Urgency"
            options={[...URGENCY_LEVELS]}
            selectedValues={filters.urgencies}
            onSelectionChange={handleUrgencyChange}
            placeholder="All urgency levels"
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Industry</label>
          <MultiSelectFilter
            label="Industry"
            options={INDUSTRIES.map(industry => ({ value: industry, label: industry }))}
            selectedValues={filters.industries}
            onSelectionChange={handleIndustryChange}
            placeholder="All industries"
          />
        </div>

        {/* Company Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Company Size</label>
          <MultiSelectFilter
            label="Company Size"
            options={[...COMPANY_SIZES]}
            selectedValues={filters.companySizes}
            onSelectionChange={handleCompanySizeChange}
            placeholder="All company sizes"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-2 border-t">
          <div className="text-sm text-gray-600">
            Showing {useSignalStore.getState().filteredSignals.length} of {useSignalStore.getState().signals.length} signals
          </div>
        </div>
      )}
    </div>
  );
}

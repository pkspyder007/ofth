'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSignalStore } from '@/store/signal-store';
import { SignalFilters } from '@/components/filters/signal-filters';
import { VirtualizedSignalTable } from '@/components/table/virtualized-signal-table';
import { PersonaSwitcher } from './persona-switcher';
import { PersonaSummary } from './persona-summary';
import { PersonaFilterChips } from './persona-filter-chips';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export function SignalDashboard() {
  const { 
    signals, 
    filteredSignals, 
    isLoading, 
    error, 
    initializeSignals, 
    addNewSignal,
    selectedPersona,
    isPersonaMode,
    applyPersonaFilters
  } = useSignalStore();
  
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  // Initialize signals on mount
  useEffect(() => {
    initializeSignals(10000);
  }, [initializeSignals]);

  // Apply default persona filters when signals are loaded
  useEffect(() => {
    if (signals && signals.length > 0 && isPersonaMode) {
      applyPersonaFilters(selectedPersona);
    }
  }, [signals, isPersonaMode, selectedPersona, applyPersonaFilters]);

  // Real-time updates
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      addNewSignal();
    }, 2500); // Add new signal every 2.5 seconds

    return () => clearInterval(interval);
  }, [addNewSignal, isRealTimeEnabled]);

  const stats = {
    total: signals?.length || 0,
    filtered: filteredSignals?.length || 0,
    new: signals?.filter(s => s.isNew).length || 0,
    processed: signals?.filter(s => s.actionTaken).length || 0,
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium mb-2">Error loading signals</h3>
        <p className="text-sm mb-4">{error}</p>
        <Button onClick={() => initializeSignals(10000)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GTM Signal Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time prospect signals with AI-powered insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={isRealTimeEnabled ? "default" : "outline"}
            onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>{isRealTimeEnabled ? 'Live' : 'Paused'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => addNewSignal()}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Add Signal</span>
          </Button>
        </div>
      </div>

      {/* Persona Switcher */}
      <PersonaSwitcher />

      {/* Persona Summary */}
      <PersonaSummary />

      {/* Persona Filter Chips */}
      <PersonaFilterChips />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Signals</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.total.toLocaleString()}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.filtered.toLocaleString()}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Signals</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.new}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
          {stats.new > 0 && (
            <Badge variant="default" className="ml-2 bg-orange-100 text-orange-800">
              {stats.new} new
            </Badge>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stats.processed}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="p-4 bg-white border rounded-lg"><Skeleton className="h-32 w-full" /></div>}>
        <SignalFilters />
      </Suspense>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Signal Feed</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Showing {stats.filtered.toLocaleString()} of {stats.total.toLocaleString()} signals</span>
              {isRealTimeEnabled && (
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isLoading || !signals || signals.length === 0 ? (
          <div className="p-8">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <VirtualizedSignalTable data={filteredSignals || []} />
        )}
      </div>
    </div>
  );
}

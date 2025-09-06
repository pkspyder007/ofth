import { create } from 'zustand';
import { Signal, FilterState } from '@/types/signal';
import { generateSignals, generateRandomSignal } from '@/lib/data-generator';

interface SignalStore {
  signals: Signal[];
  filteredSignals: Signal[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeSignals: (count?: number) => void;
  addNewSignal: () => void;
  updateSignal: (id: string, updates: Partial<Signal>) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setFiltersFromURL: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  markSignalAsProcessed: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFilters: FilterState = {
  signalTypes: [],
  urgencies: [],
  industries: [],
  companySizes: [],
  searchQuery: '',
};

export const useSignalStore = create<SignalStore>((set, get) => ({
  signals: [],
  filteredSignals: [],
  filters: initialFilters,
  isLoading: false,
  error: null,

  initializeSignals: (count = 10000) => {
    set({ isLoading: true, error: null });
    try {
      // Generate signals in smaller batches to avoid memory issues
      const batchSize = 1000;
      const batches = Math.ceil(count / batchSize);
      let allSignals: Signal[] = [];
      
      for (let i = 0; i < batches; i++) {
        const currentBatchSize = Math.min(batchSize, count - (i * batchSize));
        const batchSignals = generateSignals(currentBatchSize);
        allSignals = [...allSignals, ...batchSignals];
      }
      
      set({ signals: allSignals, isLoading: false });
      get().applyFilters();
    } catch (error) {
      console.error('Error initializing signals:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize signals',
        isLoading: false 
      });
    }
  },

  addNewSignal: () => {
    const newSignal = generateRandomSignal();
    newSignal.isNew = true;
    
    set((state) => {
      const updatedSignals = [newSignal, ...state.signals];
      return { signals: updatedSignals };
    });
    
    get().applyFilters();
    
    // Remove the "new" flag after 5 seconds
    setTimeout(() => {
      set((state) => ({
        signals: state.signals.map(signal => 
          signal.id === newSignal.id ? { ...signal, isNew: false } : signal
        )
      }));
    }, 5000);
  },

  updateSignal: (id: string, updates: Partial<Signal>) => {
    set((state) => ({
      signals: state.signals.map(signal =>
        signal.id === id ? { ...signal, ...updates } : signal
      )
    }));
    get().applyFilters();
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().applyFilters();
  },

  setFiltersFromURL: (urlFilters: Partial<FilterState>) => {
    set((state) => ({
      filters: { ...state.filters, ...urlFilters }
    }));
    get().applyFilters();
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { signals, filters } = get();
    
    // Safety check for signals array
    if (!signals || !Array.isArray(signals)) {
      set({ filteredSignals: [] });
      return;
    }
    
    let filtered = signals;

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(signal =>
        signal.prospectName.toLowerCase().includes(query) ||
        signal.company.toLowerCase().includes(query) ||
        signal.title.toLowerCase().includes(query) ||
        signal.description.toLowerCase().includes(query)
      );
    }

    // Apply signal type filter
    if (filters.signalTypes.length > 0) {
      filtered = filtered.filter(signal =>
        filters.signalTypes.includes(signal.signalType)
      );
    }

    // Apply urgency filter
    if (filters.urgencies.length > 0) {
      filtered = filtered.filter(signal =>
        filters.urgencies.includes(signal.urgency)
      );
    }

    // Apply industry filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter(signal =>
        filters.industries.includes(signal.industry)
      );
    }

    // Apply company size filter
    if (filters.companySizes.length > 0) {
      filtered = filtered.filter(signal =>
        filters.companySizes.includes(signal.companySize)
      );
    }

    set({ filteredSignals: filtered });
  },

  markSignalAsProcessed: (id: string) => {
    get().updateSignal(id, { actionTaken: true });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

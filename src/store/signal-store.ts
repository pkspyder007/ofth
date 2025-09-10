import { create } from 'zustand';
import { Signal, FilterState, Persona, PERSONA_FILTERS } from '@/types/signal';
import { generateSignals, generateRandomSignal } from '@/lib/data-generator';

interface SignalStore {
  signals: Signal[];
  filteredSignals: Signal[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  selectedPersona: Persona;
  isPersonaMode: boolean;
  isAddingSignal: boolean;
  
  // Actions
  initializeSignals: (count?: number) => void;
  addNewSignal: () => Promise<void>;
  updateSignal: (id: string, updates: Partial<Signal>) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setFiltersFromURL: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  markSignalAsProcessed: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPersona: (persona: Persona) => void;
  applyPersonaFilters: (persona: Persona) => void;
  togglePersonaMode: () => void;
  setAddingSignal: (adding: boolean) => void;
  bulkDeleteSignals: (signalIds: string[]) => void;
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
  selectedPersona: 'SDR',
  isPersonaMode: true,
  isAddingSignal: false,

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

  addNewSignal: async () => {
    set({ isAddingSignal: true, error: null });
    
    try {
      // Simulate API call delay (3-5 seconds)
      const delay = 3000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const newSignal = generateRandomSignal();
      newSignal.isNew = true;
      
      set((state) => {
        const updatedSignals = [newSignal, ...state.signals];
        return { signals: updatedSignals, isAddingSignal: false };
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
    } catch (error) {
      console.error('Error adding new signal:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add signal',
        isAddingSignal: false 
      });
    }
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
    const { signals, filters, selectedPersona, isPersonaMode } = get();
    
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

    // Apply persona-specific filters if in persona mode
    if (isPersonaMode) {
      const personaFilters = PERSONA_FILTERS[selectedPersona];
      
      // Apply title keywords filter for AE persona
      if (personaFilters.titleKeywords && personaFilters.titleKeywords.length > 0) {
        filtered = filtered.filter(signal =>
          personaFilters.titleKeywords!.some(keyword =>
            signal.title.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }
      
      // Apply company list filter for CSM persona
      if (personaFilters.companyList && personaFilters.companyList.length > 0) {
        filtered = filtered.filter(signal =>
          personaFilters.companyList!.includes(signal.company)
        );
      }
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

  setPersona: (persona: Persona) => {
    set({ selectedPersona: persona });
    get().applyPersonaFilters(persona);
  },

  applyPersonaFilters: (persona: Persona) => {
    const personaFilters = PERSONA_FILTERS[persona];
    const newFilters: FilterState = {
      signalTypes: personaFilters.signalTypes,
      urgencies: personaFilters.urgencies,
      industries: personaFilters.industries,
      companySizes: personaFilters.companySizes,
      searchQuery: personaFilters.searchQuery || '',
    };
    
    set({ filters: newFilters });
    get().applyFilters();
  },

  togglePersonaMode: () => {
    const { isPersonaMode, selectedPersona } = get();
    const newPersonaMode = !isPersonaMode;
    
    set({ isPersonaMode: newPersonaMode });
    
    if (newPersonaMode) {
      // Reapply persona filters when enabling persona mode
      get().applyPersonaFilters(selectedPersona);
    } else {
      // Clear filters when disabling persona mode
      get().clearFilters();
    }
  },

  setAddingSignal: (adding: boolean) => {
    set({ isAddingSignal: adding });
  },

  bulkDeleteSignals: (signalIds: string[]) => {
    set((state) => ({
      signals: state.signals.filter(signal => !signalIds.includes(signal.id))
    }));
    get().applyFilters();
  },
}));

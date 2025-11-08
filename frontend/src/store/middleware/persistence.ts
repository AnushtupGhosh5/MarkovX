import { StateCreator, StoreMutatorIdentifier } from 'zustand';

const STORAGE_KEY = 'musepilot-session';

export const clearLocalStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const persistenceMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<T, Mps, Mcs>
): StateCreator<T, Mps, Mcs> => {
  return (set, get, api) => {
    // Load initial state from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Merge stored state with initial state
          api.setState(parsed, true);
        } catch (error) {
          console.error('Failed to parse stored state:', error);
        }
      }
    }

    // Wrap set to persist state changes
    const persistedSet: typeof set = (...args) => {
      set(...args);
      
      if (typeof window !== 'undefined') {
        const state = get();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
          console.error('Failed to persist state:', error);
        }
      }
    };

    return config(persistedSet, get, api);
  };
};

import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { SessionContext } from '@/src/types';

const STORAGE_KEY = 'musepilot-session';
const SESSION_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface PersistedState {
  session: SessionContext;
  timestamp: number;
}

/**
 * Save session state to local storage
 */
export function saveToLocalStorage(session: SessionContext): void {
  if (typeof window === 'undefined') return;
  
  try {
    const persistedState: PersistedState = {
      session,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  } catch (error) {
    console.error('Failed to save session to local storage:', error);
  }
}

/**
 * Load session state from local storage
 * Returns null if no valid session exists or if session has expired
 */
export function loadFromLocalStorage(): SessionContext | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const persistedState: PersistedState = JSON.parse(stored);
    
    // Check if session has expired (24 hours)
    const now = Date.now();
    const age = now - persistedState.timestamp;
    
    if (age > SESSION_EXPIRATION_MS) {
      // Session expired, clear it
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return persistedState.session;
  } catch (error) {
    console.error('Failed to load session from local storage:', error);
    return null;
  }
}

/**
 * Clear session from local storage
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear local storage:', error);
  }
}

/**
 * Debounce utility function
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Zustand middleware for automatic persistence with debouncing
 */
export const persist = <T extends { session: SessionContext }>(
  config: StateCreator<T, [], []>
): StateCreator<T, [], []> => {
  return (set, get, api) => {
    // Create debounced save function (500ms delay)
    const debouncedSave = debounce((session: SessionContext) => {
      saveToLocalStorage(session);
    }, 500);
    
    // Load initial state from local storage
    const loadedSession = loadFromLocalStorage();
    
    // Create the store with config
    const store = config(
      (partial, replace) => {
        set(partial, replace);
        
        // After state update, save to local storage (debounced)
        const state = get();
        if ('session' in state) {
          debouncedSave(state.session);
        }
      },
      get,
      api
    );
    
    // If we have a loaded session, merge it with the initial state
    if (loadedSession) {
      return {
        ...store,
        session: loadedSession,
      } as T;
    }
    
    return store;
  };
};

export type PersistMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  initializer: StateCreator<T, Mps, Mcs>
) => StateCreator<T, Mps, Mcs>;

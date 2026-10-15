import { useSyncExternalStore } from 'react';
import { subscribe, getRev } from './core/engine.js';

/** Re-renders the calling component whenever the engine calls render(). Returns the revision number. */
export const useEngine = () => useSyncExternalStore(subscribe, getRev);

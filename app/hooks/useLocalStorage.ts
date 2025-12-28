'use client';

import { useState, useEffect, useCallback } from 'react';
import { Entry } from '@/app/types';
import { getActiveEntries } from '@/app/utils/storage';

export function useLocalStorage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const refreshEntries = useCallback(async () => {
    // Only fetch on client side
    if (typeof window !== 'undefined') {
      try {
        setIsLoading(true);
        const activeEntries = await getActiveEntries();
        setEntries(activeEntries);
      } catch (error) {
        console.error('Error refreshing entries:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true);
    
    // Load initial data after mount
    refreshEntries();

    // Poll for updates every 5 seconds (for multi-computer sync)
    const interval = setInterval(() => {
      refreshEntries();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshEntries]);

  // Return empty array during SSR and initial client render to prevent hydration mismatch
  return {
    entries: mounted ? entries : [],
    isLoading: !mounted || isLoading,
    refreshEntries,
  };
}


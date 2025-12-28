'use client';

import { useEffect, useState, useRef } from 'react';
import { Entry } from '@/app/types';
import { formatTime, getTimeRemaining, isExpired, ONE_HOUR_MS } from '@/app/utils/formatTime';
import { FormattedTime } from '@/app/utils/formatTime';

export function useTimer(entries: Entry[], onExpired?: () => void) {
  const [timers, setTimers] = useState<Record<number, FormattedTime>>({});
  const onExpiredRef = useRef(onExpired);
  const entriesRef = useRef<Entry[]>(entries);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastExpiredCheckRef = useRef<number>(Date.now());

  // Update refs when values change
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  // Update entries ref and recalculate timers when entries change
  useEffect(() => {
    const entriesChanged = 
      entries.length !== entriesRef.current.length ||
      entries.some((entry, idx) => {
        const oldEntry = entriesRef.current[idx];
        return !oldEntry || oldEntry.id !== entry.id || oldEntry.createdAt !== entry.createdAt;
      });

    if (entriesChanged) {
      entriesRef.current = entries;
      
      // Recalculate timers for new/changed entries
      const timerMap: Record<number, FormattedTime> = {};
      entries.forEach((entry) => {
        const remaining = getTimeRemaining(entry.createdAt);
        timerMap[entry.id] = formatTime(remaining);
      });
      setTimers(timerMap);
    }
  }, [entries]);

  useEffect(() => {
    // Update timers every second
    intervalRef.current = setInterval(() => {
      const currentEntries = entriesRef.current;
      const now = Date.now();

      // Check for expired entries (cleanup is done on server, but we check for UI updates)
      const hasExpired = currentEntries.some((entry) => isExpired(entry.createdAt));

      // Refresh data from server if expired entries detected (every 5 seconds to avoid too many requests)
      if (hasExpired && now - lastExpiredCheckRef.current > 5000) {
        lastExpiredCheckRef.current = now;
        if (onExpiredRef.current) {
          onExpiredRef.current();
        }
      }

      // Update timer displays for all entries (server will filter expired ones)
      const timerMap: Record<number, FormattedTime> = {};
      currentEntries.forEach((entry) => {
        const remaining = getTimeRemaining(entry.createdAt);
        timerMap[entry.id] = formatTime(remaining);
      });
      setTimers(timerMap);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - interval runs independently

  const getTimer = (entryId: number): FormattedTime => {
    return timers[entryId] || { text: '00m 00s', isUrgent: true };
  };

  const getProgress = (entryId: number): number => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return 0;
    
    const remaining = getTimeRemaining(entry.createdAt);
    return Math.max(0, Math.min(100, (remaining / ONE_HOUR_MS) * 100));
  };

  return {
    getTimer,
    getProgress,
  };
}


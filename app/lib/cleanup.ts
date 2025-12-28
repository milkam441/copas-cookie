import { deleteExpiredEntries } from './db';

// Run cleanup every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

let cleanupInterval: NodeJS.Timeout | null = null;

export function startCleanupJob() {
  // Run cleanup immediately on startup
  deleteExpiredEntries();

  // Then run cleanup periodically
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }

  cleanupInterval = setInterval(() => {
    const deletedCount = deleteExpiredEntries();
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired entries`);
    }
  }, CLEANUP_INTERVAL);
}

export function stopCleanupJob() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}


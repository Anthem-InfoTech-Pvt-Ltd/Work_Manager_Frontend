// Lightweight in-memory response cache with TTL for instant tab switching (0ms perceived delay)

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cacheStore = new Map<string, CacheItem<any>>();

export function getCachedData<T>(key: string, ttlMs: number = 60000): T | null {
  const item = cacheStore.get(key);
  if (!item) return null;

  const isExpired = Date.now() - item.timestamp > ttlMs;
  if (isExpired) {
    cacheStore.delete(key);
    return null;
  }

  return item.data as T;
}

export function setCachedData<T>(key: string, data: T): void {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(key?: string): void {
  if (key) {
    cacheStore.delete(key);
  } else {
    cacheStore.clear();
  }
}

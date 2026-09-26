/**
 * In-memory LRU Cache with TTL and Redis compatibility
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LRUCache<T = unknown> {
  private capacity: number;
  private defaultTTL: number; // in milliseconds
  private cache: Map<string, CacheEntry<T>>;
  private hits = 0;
  private misses = 0;

  constructor(capacity = 500, defaultTTLMs = 15 * 60 * 1000) { // 15 mins default
    this.capacity = capacity;
    this.defaultTTL = defaultTTLMs;
    this.cache = new Map();
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest entry (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const expiresAt = Date.now() + (ttlMs ?? this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      capacity: this.capacity,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total).toFixed(3) : '0.000',
    };
  }
}

export const globalCache = new LRUCache(1000, 30 * 60 * 1000);

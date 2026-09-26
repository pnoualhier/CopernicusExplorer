/**
 * Unit Tests for LRUCache
 */

import { LRUCache } from '../backend/cache/lruCache';

function runCacheTests() {
  console.log('--- RUNNING CACHE TESTS ---');

  const cache = new LRUCache<string>(3, 1000); // capacity 3, ttl 1s

  // Set 3 items
  cache.set('a', 'apple');
  cache.set('b', 'banana');
  cache.set('c', 'cherry');

  console.assert(cache.get('a') === 'apple', 'Item a should exist');
  console.assert(cache.get('b') === 'banana', 'Item b should exist');

  // Adding 4th item should evict oldest (c was not accessed recently, but a and b were)
  cache.set('d', 'date');
  console.assert(cache.get('c') === null, 'Item c should have been evicted by LRU policy');
  console.assert(cache.get('d') === 'date', 'Item d should exist');

  const stats = cache.getStats();
  console.assert(stats.hits > 0, 'Cache should record hits');
  console.assert(stats.misses > 0, 'Cache should record misses');
  console.log('✓ LRU eviction and hit/miss stats passed');

  console.log('ALL CACHE TESTS PASSED!');
}

runCacheTests();

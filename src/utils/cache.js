// Enhanced cache implementation
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour
const CACHE_SIZE_LIMIT = 100; // Maximum number of items in cache
const CACHE_STATS_KEY = 'cache_statistics';

class CacheStore {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      lastCleanup: Date.now()
    };
    this.loadStatsFromStorage();
  }

  // Save stats to localStorage
  saveStatsToStorage() {
    try {
      localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(this.stats));
    } catch (error) {
      console.warn('Failed to save cache stats:', error);
    }
  }

  // Load stats from localStorage
  loadStatsFromStorage() {
    try {
      const savedStats = localStorage.getItem(CACHE_STATS_KEY);
      if (savedStats) {
        this.stats = { ...this.stats, ...JSON.parse(savedStats) };
      }
    } catch (error) {
      console.warn('Failed to load cache stats:', error);
    }
  }

  set(key, value, customExpiry = null) {
    // Check cache size limit
    if (this.cache.size >= CACHE_SIZE_LIMIT) {
      this.removeOldestEntry();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      expiry: customExpiry || CACHE_EXPIRY,
      lastAccessed: Date.now()
    });
  }

  get(key) {
    this.stats.totalRequests++;
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      this.saveStatsToStorage();
      return null;
    }

    // Check if cache has expired
    if (Date.now() - item.timestamp > item.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      this.saveStatsToStorage();
      return null;
    }

    // Update last accessed time and hit count
    item.lastAccessed = Date.now();
    this.stats.hits++;
    this.saveStatsToStorage();
    return item.value;
  }

  removeOldestEntry() {
    let oldestKey = null;
    let oldestAccess = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestAccess) {
        oldestAccess = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      lastCleanup: Date.now()
    };
    this.saveStatsToStorage();
  }

  // Remove expired items and return number of items removed
  cleanup() {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiry) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    this.stats.lastCleanup = now;
    this.saveStatsToStorage();
    return removedCount;
  }

  // Get cache statistics
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.totalRequests ? 
        (this.stats.hits / this.stats.totalRequests * 100).toFixed(2) + '%' : '0%',
      items: Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        age: Date.now() - item.timestamp,
        expires: item.timestamp + item.expiry,
        lastAccessed: item.lastAccessed
      }))
    };
  }

  // Check if key exists without updating stats
  has(key) {
    return this.cache.has(key);
  }

  // Set multiple items at once
  setMany(items) {
    items.forEach(({ key, value, expiry }) => {
      this.set(key, value, expiry);
    });
  }

  // Get multiple items at once
  getMany(keys) {
    return keys.map(key => ({
      key,
      value: this.get(key)
    }));
  }
}

const cacheStore = new CacheStore();

// Run cleanup periodically
setInterval(() => {
  const removed = cacheStore.cleanup();
  if (removed > 0) {
    console.log(`Cache cleanup: removed ${removed} expired items`);
  }
}, CACHE_EXPIRY);

// Export enhanced functions
export const setCachedData = (key, data, expiry = null) => {
  cacheStore.set(key, data, expiry);
};

export const getCachedData = (key) => {
  return cacheStore.get(key);
};

export const clearCache = () => {
  cacheStore.clear();
};

export const getCacheStats = () => {
  return cacheStore.getStats();
};

export const setCacheMany = (items) => {
  cacheStore.setMany(items);
};

export const getCacheMany = (keys) => {
  return cacheStore.getMany(keys);
};

export const hasCachedData = (key) => {
  return cacheStore.has(key);
}; 
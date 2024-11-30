export class PredictionCache {
  constructor(config) {
    this.maxSize = config.cacheSize || 1000;
    this.cache = new Map();
    this.accessOrder = [];
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    
    // Update access order
    this.updateAccessOrder(key);
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used
      const lru = this.accessOrder.shift();
      this.cache.delete(lru);
    }

    this.cache.set(key, value);
    this.updateAccessOrder(key);
  }

  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.getHitRate()
    };
  }

  getHitRate() {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }
}
import { validateInput } from '../utils/validation.js';
import logger from '../../../utils/logger.js';

export class MemoryStore {
  constructor(config) {
    this.config = config;
    this.shortTerm = new Map();
    this.longTerm = new Map();
    this.associations = new Map();
    this.lastAccess = new Map();
  }

  async store(key, memory, context = {}) {
    const validatedKey = validateInput(key);
    
    // Create memory entry with metadata
    const entry = {
      content: memory,
      context,
      timestamp: new Date().toISOString(),
      accessCount: 0,
      associations: new Set(),
      version: context.version || 1
    };

    // Store in short-term first
    this.shortTerm.set(validatedKey, entry);
    this.updateLastAccess(validatedKey);

    // Build associations
    if (context.tags) {
      context.tags.forEach(tag => {
        if (!this.associations.has(tag)) {
          this.associations.set(tag, new Set());
        }
        this.associations.get(tag).add(validatedKey);
        entry.associations.add(tag);
      });
    }

    // Consolidate to long-term if frequently accessed
    await this.consolidate(validatedKey);

    logger.info(`Stored memory: ${validatedKey}`);
    return entry;
  }

  async recall(key, context = {}) {
    const validatedKey = validateInput(key);
    
    // Try short-term first
    let entry = this.shortTerm.get(validatedKey);
    
    // Then check long-term
    if (!entry) {
      entry = this.longTerm.get(validatedKey);
    }

    if (entry) {
      entry.accessCount++;
      this.updateLastAccess(validatedKey);
      
      // Update associations based on recall context
      if (context.tags) {
        context.tags.forEach(tag => {
          if (!entry.associations.has(tag)) {
            entry.associations.add(tag);
            if (!this.associations.has(tag)) {
              this.associations.set(tag, new Set());
            }
            this.associations.get(tag).add(validatedKey);
          }
        });
      }

      await this.consolidate(validatedKey);
      return entry;
    }

    return null;
  }

  async associate(key, tags) {
    const entry = await this.recall(key);
    if (!entry) return false;

    tags.forEach(tag => {
      entry.associations.add(tag);
      if (!this.associations.has(tag)) {
        this.associations.set(tag, new Set());
      }
      this.associations.get(tag).add(key);
    });

    return true;
  }

  async findSimilar(key, limit = 5) {
    const entry = await this.recall(key);
    if (!entry) return [];

    const similar = new Map();
    
    // Find memories with shared associations
    entry.associations.forEach(tag => {
      const associated = this.associations.get(tag) || new Set();
      associated.forEach(memoryKey => {
        if (memoryKey !== key) {
          similar.set(memoryKey, (similar.get(memoryKey) || 0) + 1);
        }
      });
    });

    // Sort by association strength
    return Array.from(similar.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([k]) => this.recall(k));
  }

  private async consolidate(key) {
    const entry = this.shortTerm.get(key);
    if (!entry) return;

    // Move to long-term if frequently accessed
    if (entry.accessCount >= this.config.consolidationThreshold) {
      this.longTerm.set(key, entry);
      this.shortTerm.delete(key);
      logger.info(`Consolidated memory to long-term: ${key}`);
    }
  }

  private updateLastAccess(key) {
    this.lastAccess.set(key, Date.now());
  }

  async prune(maxAge = 24 * 60 * 60 * 1000) { // Default 24 hours
    const now = Date.now();
    
    // Prune old memories from short-term
    for (const [key, lastAccess] of this.lastAccess.entries()) {
      if (now - lastAccess > maxAge) {
        this.shortTerm.delete(key);
        this.lastAccess.delete(key);
      }
    }

    // Update associations
    for (const [tag, memories] of this.associations.entries()) {
      const active = new Set(
        Array.from(memories).filter(key => 
          this.shortTerm.has(key) || this.longTerm.has(key)
        )
      );
      if (active.size === 0) {
        this.associations.delete(tag);
      } else {
        this.associations.set(tag, active);
      }
    }
  }
}
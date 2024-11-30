import { MemoryStore } from './store.js';
import logger from '../../../utils/logger.js';

export class ContinuityManager {
  constructor(config) {
    this.config = config;
    this.store = new MemoryStore(config);
    this.currentContext = null;
  }

  async beginContext(context) {
    this.currentContext = {
      ...context,
      startTime: Date.now(),
      memories: new Set()
    };
    
    logger.info('Started new context:', context);
  }

  async recordMemory(key, memory, tags = []) {
    if (!this.currentContext) {
      throw new Error('No active context');
    }

    const entry = await this.store.store(key, memory, {
      ...this.currentContext,
      tags: [...tags, `context:${this.currentContext.id}`]
    });

    this.currentContext.memories.add(key);
    return entry;
  }

  async linkMemories(sourceKey, targetKey, relationship) {
    const source = await this.store.recall(sourceKey);
    const target = await this.store.recall(targetKey);

    if (!source || !target) return false;

    // Create bidirectional link
    await this.store.associate(sourceKey, [`rel:${relationship}:${targetKey}`]);
    await this.store.associate(targetKey, [`rel:${relationship}:${sourceKey}`]);

    return true;
  }

  async findContextualMemories(context, limit = 10) {
    const contextTag = `context:${context}`;
    const memories = this.store.associations.get(contextTag);
    
    if (!memories) return [];

    return Promise.all(
      Array.from(memories)
        .slice(0, limit)
        .map(key => this.store.recall(key))
    );
  }

  async synthesizeContext() {
    if (!this.currentContext) return null;

    const memories = await this.findContextualMemories(
      this.currentContext.id
    );

    return {
      ...this.currentContext,
      duration: Date.now() - this.currentContext.startTime,
      memoryCount: memories.length,
      summary: this.summarizeMemories(memories)
    };
  }

  private summarizeMemories(memories) {
    // Group memories by tags
    const groups = new Map();
    
    memories.forEach(memory => {
      memory.associations.forEach(tag => {
        if (!tag.startsWith('context:') && !tag.startsWith('rel:')) {
          if (!groups.has(tag)) {
            groups.set(tag, []);
          }
          groups.get(tag).push(memory);
        }
      });
    });

    // Create summary
    return Array.from(groups.entries()).map(([tag, tagMemories]) => ({
      tag,
      count: tagMemories.length,
      mostRecent: tagMemories
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 3)
    }));
  }
}
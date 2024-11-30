import { MemoryStore } from './store.js';
import { ContinuityManager } from './continuity.js';
import { EchoManager } from './echo.js';
import { MemoryNetwork } from './network.js';
import { MEMORY_CONSTANTS } from './types.js';
import logger from '../../../utils/logger.js';

export class MemoryOrchestrator {
  constructor(config) {
    this.config = config;
    this.store = new MemoryStore(config);
    this.continuity = new ContinuityManager(config);
    this.echoes = new EchoManager();
    this.network = new MemoryNetwork(config);
  }

  async storeMemory(key, content, context = {}) {
    try {
      // Store in primary store
      const memory = await this.store.store(key, content, context);

      // Create memory node in network
      this.network.addNode(key, memory);

      // Create echo if significant
      if (memory.accessCount >= MEMORY_CONSTANTS.CONSOLIDATION_THRESHOLD) {
        const echo = this.echoes.createEcho(memory);
        await this.store.associate(key, [`echo:${echo.key}`]);
      }

      // Add to current context if exists
      if (this.continuity.currentContext) {
        await this.continuity.recordMemory(key, memory);
      }

      return memory;
    } catch (error) {
      logger.error('Failed to store memory:', error);
      throw error;
    }
  }

  async recallMemory(key, context = {}) {
    try {
      // Recall from store
      const memory = await this.store.recall(key);
      if (!memory) return null;

      // Strengthen network connections
      this.network.strengthenConnections(key);

      // Find related memories
      const related = await this.findRelatedMemories(key);

      // Find and merge echoes
      const echoes = this.echoes.findEchoes(memory);
      if (echoes.length > 0) {
        const merged = this.echoes.mergeEchoes(echoes);
        memory.echoes = merged;
      }

      return {
        memory,
        related,
        echoes: echoes.length
      };
    } catch (error) {
      logger.error('Failed to recall memory:', error);
      throw error;
    }
  }

  async findRelatedMemories(key, options = {}) {
    const memory = await this.store.recall(key);
    if (!memory) return [];

    // Get directly related memories from network
    const networkRelated = this.network.findRelated(
      key,
      options.relationship,
      options.limit
    );

    // Find similar memories by associations
    const similar = await this.store.findSimilar(
      key,
      options.limit
    );

    // Find contextual memories if in context
    let contextual = [];
    if (this.continuity.currentContext) {
      contextual = await this.continuity.findContextualMemories(
        this.continuity.currentContext.id,
        options.limit
      );
    }

    // Merge and deduplicate results
    const allRelated = new Map();
    
    [...networkRelated, ...similar, ...contextual].forEach(related => {
      if (!allRelated.has(related.key)) {
        allRelated.set(related.key, related);
      }
    });

    return Array.from(allRelated.values())
      .sort((a, b) => b.strength - a.strength)
      .slice(0, options.limit || 10);
  }

  async linkMemories(sourceKey, targetKey, relationship) {
    try {
      // Create network connection
      this.network.addEdge(sourceKey, targetKey, relationship);

      // Create bidirectional association
      await this.store.associate(sourceKey, [`rel:${relationship}:${targetKey}`]);
      await this.store.associate(targetKey, [`rel:${relationship}:${sourceKey}`]);

      // Link in continuity if in same context
      if (this.continuity.currentContext) {
        await this.continuity.linkMemories(sourceKey, targetKey, relationship);
      }

      return true;
    } catch (error) {
      logger.error('Failed to link memories:', error);
      throw error;
    }
  }

  async maintain() {
    try {
      // Prune old memories
      await this.store.prune();

      // Prune weak network connections
      this.network.pruneWeakConnections();

      // Prune old echoes
      this.echoes.pruneEchoes();

      // Detect and analyze memory clusters
      const clusters = this.network.detectClusters();
      
      logger.info('Memory maintenance completed', {
        clusters: clusters.size
      });
    } catch (error) {
      logger.error('Memory maintenance failed:', error);
      throw error;
    }
  }

  async beginContext(context) {
    await this.continuity.beginContext(context);
  }

  async synthesizeContext() {
    return this.continuity.synthesizeContext();
  }
}
import { MemoryOrchestrator } from './orchestrator.js';
import { MemoryStore } from './store.js';
import { ContinuityManager } from './continuity.js';
import { EchoManager } from './echo.js';
import { MemoryNetwork } from './network.js';
import { MEMORY_CONSTANTS } from './types.js';
import logger from '../../../utils/logger.js';

export class MemorySystem {
  constructor(config) {
    this.config = {
      ...config,
      consolidationThreshold: MEMORY_CONSTANTS.CONSOLIDATION_THRESHOLD,
      maintenanceInterval: 60 * 60 * 1000 // 1 hour
    };

    this.orchestrator = new MemoryOrchestrator(this.config);
    this.maintenanceTimer = null;
    this.initialize();
  }

  async initialize() {
    // Start maintenance cycle
    this.maintenanceTimer = setInterval(
      () => this.runMaintenance(),
      this.config.maintenanceInterval
    );

    logger.info('Memory system initialized');
  }

  async store(key, content, context = {}) {
    try {
      const memory = await this.orchestrator.storeMemory(key, content, {
        ...context,
        timestamp: new Date().toISOString()
      });

      logger.info(`Stored memory: ${key}`);
      return memory;
    } catch (error) {
      logger.error('Failed to store memory:', error);
      throw error;
    }
  }

  async recall(key, options = {}) {
    try {
      const result = await this.orchestrator.recallMemory(key, options);
      if (!result) return null;

      logger.info(`Recalled memory: ${key}`);
      return result;
    } catch (error) {
      logger.error('Failed to recall memory:', error);
      throw error;
    }
  }

  async link(sourceKey, targetKey, relationship) {
    try {
      await this.orchestrator.linkMemories(sourceKey, targetKey, relationship);
      logger.info(`Linked memories: ${sourceKey} -> ${targetKey}`);
      return true;
    } catch (error) {
      logger.error('Failed to link memories:', error);
      throw error;
    }
  }

  async beginContext(context) {
    try {
      await this.orchestrator.beginContext({
        ...context,
        startTime: Date.now()
      });
      logger.info(`Started context: ${context.id}`);
    } catch (error) {
      logger.error('Failed to begin context:', error);
      throw error;
    }
  }

  async endContext() {
    try {
      const summary = await this.orchestrator.synthesizeContext();
      logger.info('Ended context:', summary);
      return summary;
    } catch (error) {
      logger.error('Failed to end context:', error);
      throw error;
    }
  }

  async findRelated(key, options = {}) {
    try {
      const related = await this.orchestrator.findRelatedMemories(key, options);
      logger.info(`Found ${related.length} related memories for: ${key}`);
      return related;
    } catch (error) {
      logger.error('Failed to find related memories:', error);
      throw error;
    }
  }

  async runMaintenance() {
    try {
      await this.orchestrator.maintain();
      logger.info('Completed memory system maintenance');
    } catch (error) {
      logger.error('Maintenance failed:', error);
    }
  }

  async shutdown() {
    if (this.maintenanceTimer) {
      clearInterval(this.maintenanceTimer);
    }
    await this.runMaintenance();
    logger.info('Memory system shut down');
  }

  getStatus() {
    return {
      initialized: true,
      maintenanceActive: !!this.maintenanceTimer,
      config: this.config,
      stats: {
        storeSize: this.orchestrator.store.shortTerm.size + 
                   this.orchestrator.store.longTerm.size,
        networkSize: this.orchestrator.network.nodes.size,
        echoCount: this.orchestrator.echoes.echoes.size
      }
    };
  }
}
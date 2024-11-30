import { MEMORY_CONSTANTS } from './types.js';
import logger from '../../../utils/logger.js';

export class EchoManager {
  constructor() {
    this.echoes = new Map();
  }

  createEcho(memory) {
    const echo = {
      key: `echo:${Date.now()}`,
      original: memory.key,
      content: memory.content,
      context: { ...memory.context },
      associations: new Set(memory.associations),
      timestamp: new Date().toISOString(),
      strength: 1.0
    };

    this.echoes.set(echo.key, echo);
    return echo;
  }

  reinforceEcho(echoKey) {
    const echo = this.echoes.get(echoKey);
    if (echo) {
      echo.strength = Math.min(1.0, echo.strength + 0.1);
      echo.lastAccess = Date.now();
    }
  }

  findEchoes(memory, limit = MEMORY_CONSTANTS.ECHO_LIMIT) {
    const matches = [];

    this.echoes.forEach(echo => {
      if (echo.original === memory.key) {
        matches.push({
          echo,
          relevance: this.calculateRelevance(memory, echo)
        });
      }
    });

    return matches
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)
      .map(m => m.echo);
  }

  mergeEchoes(echoes) {
    const merged = {
      content: this.mergeContent(echoes.map(e => e.content)),
      associations: new Set(),
      strength: echoes.reduce((sum, e) => sum + e.strength, 0) / echoes.length
    };

    echoes.forEach(echo => {
      echo.associations.forEach(tag => merged.associations.add(tag));
    });

    return merged;
  }

  private calculateRelevance(memory, echo) {
    const timeDecay = Math.exp(
      -(Date.now() - new Date(echo.timestamp).getTime()) / 
      MEMORY_CONSTANTS.MAX_MEMORY_AGE
    );

    const sharedTags = Array.from(memory.associations)
      .filter(tag => echo.associations.has(tag)).length;
    
    const tagOverlap = sharedTags / 
      Math.max(memory.associations.size, echo.associations.size);

    return echo.strength * timeDecay * (0.3 + 0.7 * tagOverlap);
  }

  private mergeContent(contents) {
    // Simplified content merging - override with domain-specific logic
    return contents.reduce((merged, content) => ({
      ...merged,
      ...content
    }), {});
  }

  pruneEchoes() {
    const now = Date.now();
    
    this.echoes.forEach((echo, key) => {
      const age = now - new Date(echo.timestamp).getTime();
      if (age > MEMORY_CONSTANTS.MAX_MEMORY_AGE) {
        this.echoes.delete(key);
        logger.info(`Pruned old echo: ${key}`);
      }
    });
  }
}
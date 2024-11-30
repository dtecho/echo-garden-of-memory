import { MEMORY_CONSTANTS } from './types.js';

export class PatternDetector {
  constructor() {
    this.patterns = new Map();
  }

  detectPatterns(memories) {
    const patterns = new Map();
    
    // Analyze tag co-occurrences
    memories.forEach(memory => {
      const tags = Array.from(memory.associations);
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const pattern = `${tags[i]}:${tags[j]}`;
          patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
        }
      }
    });

    // Calculate pattern strengths
    const maxCount = Math.max(...patterns.values());
    const significantPatterns = new Map();

    patterns.forEach((count, pattern) => {
      const strength = count / maxCount;
      if (strength >= MEMORY_CONSTANTS.PATTERN_THRESHOLD) {
        significantPatterns.set(pattern, strength);
      }
    });

    return significantPatterns;
  }

  updatePatterns(newPatterns) {
    newPatterns.forEach((strength, pattern) => {
      const currentStrength = this.patterns.get(pattern) || 0;
      this.patterns.set(
        pattern,
        (currentStrength + strength) / 2
      );
    });
  }

  findRelatedPatterns(tags) {
    const related = new Map();

    this.patterns.forEach((strength, pattern) => {
      const [tag1, tag2] = pattern.split(':');
      if (tags.includes(tag1) || tags.includes(tag2)) {
        related.set(pattern, strength);
      }
    });

    return related;
  }

  getStrongestPatterns(limit = 10) {
    return Array.from(this.patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }
}
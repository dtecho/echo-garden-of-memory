import { encodeTokens } from '../utils/tokenizer.js';
import logger from '../utils/logger.js';

export class BatchProcessor {
  constructor(batchSize) {
    this.batchSize = batchSize;
  }

  createBatches(data) {
    // Shuffle data before creating batches
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    
    const batches = [];
    for (let i = 0; i < shuffled.length; i += this.batchSize) {
      batches.push(shuffled.slice(i, Math.min(i + this.batchSize, shuffled.length)));
    }
    
    logger.info(`Created ${batches.length} batches of size ${this.batchSize}`);
    return batches;
  }

  processBatch(batch, vocabulary) {
    return batch.map(item => ({
      encodedTokens: encodeTokens(item.tokens, vocabulary),
      label: item.label,
      original: item.original
    }));
  }
}
import logger from '../../../utils/logger.js';

export class BatchProcessor {
  constructor(batchSize) {
    this.batchSize = batchSize;
  }

  createBatches(data) {
    // Shuffle data
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    
    // Create batches
    const batches = [];
    for (let i = 0; i < shuffled.length; i += this.batchSize) {
      batches.push(
        shuffled.slice(i, Math.min(i + this.batchSize, shuffled.length))
      );
    }

    logger.info(`Created ${batches.length} batches of size ${this.batchSize}`);
    return batches;
  }

  processBatch(batch, vocabulary) {
    return batch.map(item => ({
      tokens: this.encodeBatchTokens(item.tokens, vocabulary),
      label: item.label,
      original: item.original
    }));
  }

  encodeBatchTokens(tokens, vocabulary) {
    return tokens
      .map(token => vocabulary.indexOf(token))
      .filter(index => index !== -1);
  }

  validateBatch(batch) {
    if (!Array.isArray(batch)) {
      throw new Error('Batch must be an array');
    }

    batch.forEach((item, index) => {
      if (!item.tokens || !Array.isArray(item.tokens)) {
        throw new Error(`Invalid tokens in batch item ${index}`);
      }
      if (!item.label) {
        throw new Error(`Missing label in batch item ${index}`);
      }
    });

    return true;
  }
}
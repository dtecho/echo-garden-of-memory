import { BatchProcessor } from './batch.js';
import { TrainingMetrics } from './metrics.js';
import logger from '../utils/logger.js';

export class CrossValidator {
  constructor(numFolds = 5) {
    this.numFolds = numFolds;
    this.batchProcessor = new BatchProcessor(32);
  }

  createFolds(data) {
    const foldSize = Math.floor(data.length / this.numFolds);
    const folds = [];
    
    // Create shuffled copy
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    
    // Split into folds
    for (let i = 0; i < this.numFolds; i++) {
      const start = i * foldSize;
      const end = i === this.numFolds - 1 ? data.length : start + foldSize;
      folds.push(shuffled.slice(start, end));
    }
    
    return folds;
  }

  async validate(model, data, vocabulary) {
    const folds = this.createFolds(data);
    const metrics = new TrainingMetrics();
    
    logger.info(`Starting ${this.numFolds}-fold cross validation`);
    
    const results = [];
    
    for (let i = 0; i < this.numFolds; i++) {
      // Use current fold as validation, rest as training
      const validationData = folds[i];
      const trainingData = folds
        .filter((_, index) => index !== i)
        .flat();
      
      // Train on training data
      const trainBatches = this.batchProcessor.createBatches(trainingData);
      for (const batch of trainBatches) {
        const processed = this.batchProcessor.processBatch(batch, vocabulary);
        for (const item of processed) {
          const embeddings = model.forward(item.encodedTokens);
          const predictions = model.predict(embeddings);
          metrics.updateMetrics(0.5, predictions, item.label);
        }
      }
      
      // Evaluate on validation data
      metrics.reset();
      const validationBatch = this.batchProcessor.processBatch(
        validationData,
        vocabulary
      );
      
      for (const item of validationBatch) {
        const embeddings = model.forward(item.encodedTokens);
        const predictions = model.predict(embeddings);
        metrics.updateMetrics(0.5, predictions, item.label);
      }
      
      const foldMetrics = metrics.getMetrics();
      results.push(foldMetrics);
      
      logger.info(`Fold ${i + 1} metrics:`, foldMetrics);
    }
    
    // Calculate average metrics across folds
    const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / this.numFolds;
    const avgLoss = results.reduce((sum, r) => sum + r.averageLoss, 0) / this.numFolds;
    
    return {
      averageAccuracy: avgAccuracy,
      averageLoss: avgLoss,
      foldResults: results
    };
  }
}
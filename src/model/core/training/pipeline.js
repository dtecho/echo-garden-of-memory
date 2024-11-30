import { BatchProcessor } from './batch.js';
import { MetricsTracker } from '../metrics/tracker.js';
import { TrainingMonitor } from '../metrics/monitor.js';
import logger from '../../../utils/logger.js';

export class TrainingPipeline {
  constructor(config) {
    this.config = config;
    this.batchProcessor = new BatchProcessor(config.batchSize);
    this.metricsTracker = new MetricsTracker();
    this.monitor = new TrainingMonitor(config);
  }

  async execute(model, trainer, trainData, validationData) {
    try {
      logger.info('Starting training pipeline');

      for (let epoch = 0; epoch < this.config.epochs; epoch++) {
        // Process epoch
        const epochMetrics = await this.processEpoch(
          model,
          trainer,
          trainData,
          epoch
        );

        // Handle validation
        if (validationData) {
          const validationMetrics = await this.validate(
            model,
            trainer,
            validationData
          );

          // Check early stopping
          if (this.monitor.check(validationMetrics)) {
            logger.info('Early stopping triggered');
            break;
          }
        }
      }

      return {
        finalMetrics: this.metricsTracker.getBestMetrics(),
        history: this.metricsTracker.history
      };

    } catch (error) {
      logger.error('Training pipeline failed:', error);
      throw error;
    }
  }

  async processEpoch(model, trainer, trainData, epoch) {
    this.metricsTracker.reset();

    // Create and process batches
    const batches = this.batchProcessor.createBatches(trainData);
    
    for (const batch of batches) {
      await this.processBatch(model, trainer, batch);
    }

    // Get and log metrics
    const metrics = this.metricsTracker.getEpochMetrics();
    logger.info(`Epoch ${epoch + 1}, Metrics:`, metrics);
    
    return metrics;
  }

  async processBatch(model, trainer, batch) {
    // Forward pass
    const batchResults = await Promise.all(
      batch.map(async item => {
        const output = await model.forward(item.tokens, true);
        return {
          item,
          output,
          loss: trainer.calculateLoss(output.predictions, item.label)
        };
      })
    );

    // Update model
    await trainer.updateModelFromBatch(model, batchResults);

    // Update metrics
    batchResults.forEach(result => {
      this.metricsTracker.update(
        result.loss,
        result.output.predictions,
        result.item.label
      );
    });
  }

  async validate(model, trainer, validationData) {
    const batches = this.batchProcessor.createBatches(validationData);
    const validationMetrics = new MetricsTracker();

    for (const batch of batches) {
      const results = await Promise.all(
        batch.map(async item => {
          const output = await model.forward(item.tokens, false);
          return {
            predictions: output.predictions,
            label: item.label,
            loss: trainer.calculateLoss(output.predictions, item.label)
          };
        })
      );

      results.forEach(result => {
        validationMetrics.update(
          result.loss,
          result.predictions,
          result.label
        );
      });
    }

    return validationMetrics.getEpochMetrics();
  }
}
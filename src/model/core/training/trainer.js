import { MetricsTracker } from '../metrics/tracker.js';
import { TrainingMonitor } from '../metrics/monitor.js';
import { ModelValidator } from '../evaluation/validator.js';
import { ModelEvaluator } from '../evaluation/evaluator.js';
import { Optimizer } from '../optimization/optimizer.js';
import { LearningRateScheduler } from '../optimization/scheduler.js';
import logger from '../../../utils/logger.js';

export class ModelTrainer {
  constructor(config) {
    this.config = config;
    this.metricsTracker = new MetricsTracker();
    this.monitor = new TrainingMonitor(config);
    this.validator = new ModelValidator(config);
    this.evaluator = new ModelEvaluator(config);
    this.optimizer = new Optimizer(config);
    this.scheduler = new LearningRateScheduler(config);
  }

  async train(model, trainData, validationData) {
    try {
      // Validate inputs
      this.validator.validateArchitecture(model);
      this.validator.validateTrainingData(trainData);

      logger.info('Starting training process');

      for (let epoch = 0; epoch < this.config.epochs; epoch++) {
        // Reset metrics for new epoch
        this.metricsTracker.reset();

        // Train on batches
        await this.trainEpoch(model, trainData);

        // Get epoch metrics
        const epochMetrics = this.metricsTracker.getEpochMetrics();
        logger.info(`Epoch ${epoch + 1}, Metrics:`, epochMetrics);

        // Evaluate on validation set
        if (validationData) {
          const validationResults = this.evaluator.evaluate(model, validationData);
          this.monitor.check(validationResults);

          // Update learning rate
          const newLr = this.scheduler.step(validationResults.averageLoss);
          this.optimizer.learningRate = newLr;
        }

        // Check early stopping
        if (this.monitor.shouldStop) {
          logger.info('Early stopping triggered');
          break;
        }
      }

      return {
        finalMetrics: this.metricsTracker.getBestMetrics(),
        history: this.metricsTracker.history
      };

    } catch (error) {
      logger.error('Training failed:', error);
      throw error;
    }
  }

  async trainEpoch(model, trainData) {
    // Shuffle training data
    const shuffled = [...trainData].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i += this.config.batchSize) {
      const batch = shuffled.slice(i, i + this.config.batchSize);
      await this.trainBatch(model, batch);
    }
  }

  async trainBatch(model, batch) {
    // Forward pass
    const batchResults = batch.map(item => {
      const output = model.forward(item.tokens, true);
      return {
        item,
        output,
        loss: this.calculateLoss(output.predictions, item.label)
      };
    });

    // Calculate gradients
    const gradients = this.calculateGradients(batchResults);

    // Update model parameters
    this.updateModel(model, gradients);

    // Update metrics
    batchResults.forEach(result => {
      this.metricsTracker.update(
        result.loss,
        result.output.predictions,
        result.item.label
      );
    });
  }

  calculateLoss(predictions, actualLabel) {
    const actualProb = predictions.find(p => p.label === actualLabel).probability;
    return -Math.log(actualProb + 1e-10);
  }

  calculateGradients(batchResults) {
    // Simplified gradient calculation for demo
    return {
      embeddings: batchResults.map(() => 
        Array(this.config.embeddingDim).fill(0.1)
      ),
      attention: {
        query: Array(this.config.embeddingDim).fill(0.1),
        key: Array(this.config.embeddingDim).fill(0.1),
        value: Array(this.config.embeddingDim).fill(0.1)
      },
      normalization: {
        gamma: Array(this.config.embeddingDim).fill(0.1),
        beta: Array(this.config.embeddingDim).fill(0.1)
      }
    };
  }

  updateModel(model, gradients) {
    // Update embeddings
    model.embedding.embeddings = model.embedding.embeddings.map(
      (embedding, i) => this.optimizer.step(
        embedding,
        gradients.embeddings[i] || gradients.embeddings[0],
        `embedding_${i}`
      )
    );

    // Update attention weights
    model.attention.queryWeight = this.optimizer.step(
      model.attention.queryWeight,
      gradients.attention.query,
      'attention_query'
    );

    // Update normalization parameters
    model.normalization.updateNormParameters(
      gradients.normalization,
      this.optimizer.learningRate
    );
  }
}
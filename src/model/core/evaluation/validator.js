import logger from '../../../utils/logger.js';

export class ModelValidator {
  constructor(config) {
    this.config = config;
    this.validationSplit = config.validationSplit || 0.2;
    this.metrics = new Map();
  }

  validateArchitecture(model) {
    // Check required components
    if (!model.embedding || !model.attention || !model.prediction) {
      throw new Error('Model missing required components');
    }

    // Validate dimensions
    if (!model.config.embeddingDim || !model.config.vocabSize) {
      throw new Error('Invalid model dimensions');
    }

    // Validate embedding matrix shape
    if (model.embedding.embeddings.length !== model.config.vocabSize ||
        model.embedding.embeddings[0].length !== model.config.embeddingDim) {
      throw new Error('Invalid embedding matrix dimensions');
    }

    return true;
  }

  validatePredictions(predictions, labels) {
    predictions.forEach(pred => {
      if (!pred.label || !labels.includes(pred.label)) {
        throw new Error(`Invalid prediction label: ${pred.label}`);
      }
      if (typeof pred.probability !== 'number' ||
          pred.probability < 0 || 
          pred.probability > 1) {
        throw new Error('Invalid prediction probability');
      }
    });

    const sumProb = predictions.reduce((sum, p) => sum + p.probability, 0);
    if (Math.abs(sumProb - 1) > 1e-6) {
      throw new Error('Prediction probabilities must sum to 1');
    }

    return true;
  }

  validateTrainingData(data) {
    if (!Array.isArray(data)) {
      throw new Error('Training data must be an array');
    }

    data.forEach((item, index) => {
      if (!item.tokens || !Array.isArray(item.tokens)) {
        throw new Error(`Item ${index} missing tokens array`);
      }
      if (!item.label) {
        throw new Error(`Item ${index} missing label`);
      }
    });

    return true;
  }

  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(value);
  }

  getMetricStats(name) {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;

    return {
      mean,
      stdDev: Math.sqrt(variance),
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  reset() {
    this.metrics.clear();
  }
}
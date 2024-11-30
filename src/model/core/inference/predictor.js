import logger from '../../../utils/logger.js';

export class ModelPredictor {
  constructor(config) {
    this.config = config;
    this.batchSize = config.batchSize || 32;
  }

  async predict(model, input) {
    try {
      // Validate input
      if (!input.tokens || !Array.isArray(input.tokens)) {
        throw new Error('Invalid input format');
      }

      // Forward pass
      const output = await model.forward(input.tokens, false);

      // Get top prediction
      const prediction = output.predictions.reduce((max, p) => 
        p.probability > max.probability ? p : max
      );

      return {
        label: prediction.label,
        probability: prediction.probability,
        confidence: this.calculateConfidence(output.predictions),
        attention: output.contextVectors
      };
    } catch (error) {
      logger.error('Prediction failed:', error);
      throw error;
    }
  }

  async batchPredict(model, inputs) {
    // Process in batches
    const results = [];
    for (let i = 0; i < inputs.length; i += this.batchSize) {
      const batch = inputs.slice(i, i + this.batchSize);
      const batchResults = await Promise.all(
        batch.map(input => this.predict(model, input))
      );
      results.push(...batchResults);
    }
    return results;
  }

  calculateConfidence(predictions) {
    // Calculate entropy-based confidence
    const entropy = -predictions.reduce((sum, p) => 
      sum + (p.probability * Math.log2(p.probability + 1e-10)), 0
    );
    const maxEntropy = Math.log2(predictions.length);
    return 1 - (entropy / maxEntropy);
  }

  getTopK(predictions, k = 3) {
    return predictions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, k);
  }
}
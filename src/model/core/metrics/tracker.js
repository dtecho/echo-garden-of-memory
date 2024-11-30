import logger from '../../../utils/logger.js';

export class MetricsTracker {
  constructor() {
    this.reset();
  }

  reset() {
    this.epochLoss = 0;
    this.batchCount = 0;
    this.correctPredictions = 0;
    this.totalPredictions = 0;
    this.labelMetrics = {};
    this.history = [];
  }

  update(loss, predictions, actualLabel) {
    // Update running loss
    this.epochLoss += loss;
    this.batchCount += 1;

    // Update accuracy metrics
    const predictedLabel = predictions.reduce((max, p) => 
      p.probability > max.probability ? p : max
    ).label;

    if (predictedLabel === actualLabel) {
      this.correctPredictions += 1;
    }
    this.totalPredictions += 1;

    // Update per-label metrics
    if (!this.labelMetrics[actualLabel]) {
      this.labelMetrics[actualLabel] = {
        truePositives: 0,
        falsePositives: 0,
        falseNegatives: 0
      };
    }

    if (predictedLabel === actualLabel) {
      this.labelMetrics[actualLabel].truePositives += 1;
    } else {
      this.labelMetrics[actualLabel].falseNegatives += 1;
      if (this.labelMetrics[predictedLabel]) {
        this.labelMetrics[predictedLabel].falsePositives += 1;
      }
    }
  }

  getEpochMetrics() {
    const accuracy = this.correctPredictions / this.totalPredictions;
    const averageLoss = this.epochLoss / this.batchCount;

    // Calculate per-label precision, recall, and F1
    const labelMetrics = {};
    Object.entries(this.labelMetrics).forEach(([label, metrics]) => {
      const precision = metrics.truePositives / 
        (metrics.truePositives + metrics.falsePositives) || 0;
      const recall = metrics.truePositives / 
        (metrics.truePositives + metrics.falseNegatives) || 0;
      const f1 = 2 * (precision * recall) / (precision + recall) || 0;
      
      labelMetrics[label] = { precision, recall, f1 };
    });

    const epochMetrics = {
      accuracy,
      averageLoss,
      totalSamples: this.totalPredictions,
      labelMetrics
    };

    this.history.push(epochMetrics);
    return epochMetrics;
  }

  getBestMetrics() {
    if (this.history.length === 0) return null;
    
    return this.history.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );
  }

  logMetrics(epoch) {
    const metrics = this.getEpochMetrics();
    logger.info(`Epoch ${epoch}, Metrics:`, metrics);
    return metrics;
  }
}
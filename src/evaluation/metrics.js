import { validateModel } from '../utils/validation.js';
import logger from '../utils/logger.js';

export class ModelEvaluator {
  constructor(model) {
    validateModel(model);
    this.model = model;
  }

  calculateConfusionMatrix(predictions, actualLabels) {
    const labels = this.model.labels;
    const matrix = {};
    
    labels.forEach(actual => {
      matrix[actual] = {};
      labels.forEach(predicted => {
        matrix[actual][predicted] = 0;
      });
    });

    predictions.forEach((pred, i) => {
      const predicted = pred.label;
      const actual = actualLabels[i];
      matrix[actual][predicted]++;
    });

    return matrix;
  }

  calculatePerLabelMetrics(confusionMatrix) {
    const metrics = {};
    
    this.model.labels.forEach(label => {
      const tp = confusionMatrix[label][label];
      let fp = 0, fn = 0;
      
      this.model.labels.forEach(otherLabel => {
        if (otherLabel !== label) {
          fp += confusionMatrix[otherLabel][label];
          fn += confusionMatrix[label][otherLabel];
        }
      });

      const precision = tp / (tp + fp) || 0;
      const recall = tp / (tp + fn) || 0;
      const f1 = 2 * (precision * recall) / (precision + recall) || 0;

      metrics[label] = { precision, recall, f1 };
    });

    return metrics;
  }

  evaluateModel(testData) {
    const predictions = [];
    const actualLabels = [];
    let totalLoss = 0;

    testData.forEach(item => {
      const prediction = this.predictSingle(item);
      predictions.push(prediction);
      actualLabels.push(item.label);
      totalLoss += this.calculateLoss(prediction, item.label);
    });

    const confusionMatrix = this.calculateConfusionMatrix(predictions, actualLabels);
    const labelMetrics = this.calculatePerLabelMetrics(confusionMatrix);
    
    const accuracy = predictions.filter((p, i) => 
      p.label === actualLabels[i]
    ).length / predictions.length;

    const avgLoss = totalLoss / testData.length;

    const results = {
      accuracy,
      averageLoss: avgLoss,
      confusionMatrix,
      labelMetrics,
      sampleCount: testData.length
    };

    logger.info('Model evaluation completed', results);
    return results;
  }

  predictSingle(item) {
    // Simplified prediction for demo
    const randomIndex = Math.floor(Math.random() * this.model.labels.length);
    return {
      label: this.model.labels[randomIndex],
      probability: Math.random()
    };
  }

  calculateLoss(prediction, actualLabel) {
    // Cross-entropy loss
    const labelIndex = this.model.labels.indexOf(actualLabel);
    return -Math.log(prediction.probability + 1e-10);
  }
}
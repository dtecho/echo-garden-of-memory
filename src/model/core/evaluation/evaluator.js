import logger from '../../../utils/logger.js';

export class ModelEvaluator {
  constructor(config) {
    this.config = config;
    this.history = [];
  }

  evaluate(model, testData) {
    const results = {
      accuracy: 0,
      averageLoss: 0,
      confusionMatrix: this.initializeConfusionMatrix(model.prediction.labels),
      labelMetrics: {},
      sampleCount: testData.length
    };

    let totalLoss = 0;
    let correctPredictions = 0;

    testData.forEach(item => {
      const output = model.forward(item.tokens);
      const predictedLabel = this.getPredictedLabel(output.predictions);
      
      // Update confusion matrix
      results.confusionMatrix[item.label][predictedLabel]++;
      
      // Update accuracy
      if (predictedLabel === item.label) {
        correctPredictions++;
      }
      
      // Calculate loss
      const loss = -Math.log(
        output.predictions.find(p => p.label === item.label).probability + 1e-10
      );
      totalLoss += loss;
    });

    // Calculate final metrics
    results.accuracy = correctPredictions / testData.length;
    results.averageLoss = totalLoss / testData.length;
    results.labelMetrics = this.calculateLabelMetrics(results.confusionMatrix);

    this.history.push(results);
    logger.info('Model evaluation completed', results);
    return results;
  }

  initializeConfusionMatrix(labels) {
    const matrix = {};
    labels.forEach(actual => {
      matrix[actual] = {};
      labels.forEach(predicted => {
        matrix[actual][predicted] = 0;
      });
    });
    return matrix;
  }

  getPredictedLabel(predictions) {
    return predictions.reduce((max, p) => 
      p.probability > max.probability ? p : max
    ).label;
  }

  calculateLabelMetrics(confusionMatrix) {
    const metrics = {};
    
    Object.keys(confusionMatrix).forEach(label => {
      let tp = confusionMatrix[label][label];
      let fp = 0, fn = 0;
      
      Object.keys(confusionMatrix).forEach(otherLabel => {
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

  getHistory() {
    return this.history;
  }

  getBestResult() {
    if (this.history.length === 0) return null;
    return this.history.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );
  }
}
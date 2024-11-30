import logger from '../../../utils/logger.js';

export class TrainingMonitor {
  constructor(config) {
    this.patience = config.patience || 5;
    this.minDelta = config.minDelta || 0.001;
    this.counter = 0;
    this.bestLoss = null;
    this.shouldStop = false;
    this.history = [];
  }

  check(metrics) {
    this.history.push(metrics);
    const currentLoss = metrics.averageLoss;

    if (this.bestLoss === null || currentLoss < this.bestLoss - this.minDelta) {
      this.bestLoss = currentLoss;
      this.counter = 0;
      return false;
    }

    this.counter += 1;
    if (this.counter >= this.patience) {
      logger.info(
        `Early stopping triggered after ${this.counter} epochs ` +
        `without improvement`
      );
      this.shouldStop = true;
      return true;
    }

    return false;
  }

  getProgress() {
    if (this.history.length < 2) return null;

    const current = this.history[this.history.length - 1];
    const previous = this.history[this.history.length - 2];

    return {
      lossChange: previous.averageLoss - current.averageLoss,
      accuracyChange: current.accuracy - previous.accuracy,
      isImproving: current.averageLoss < previous.averageLoss
    };
  }

  reset() {
    this.counter = 0;
    this.bestLoss = null;
    this.shouldStop = false;
    this.history = [];
  }
}
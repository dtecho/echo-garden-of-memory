import logger from '../utils/logger.js';

export class EarlyStopping {
  constructor(patience = 5, minDelta = 0.001) {
    this.patience = patience;
    this.minDelta = minDelta;
    this.counter = 0;
    this.bestLoss = null;
    this.shouldStop = false;
  }

  check(currentLoss) {
    if (this.bestLoss === null) {
      this.bestLoss = currentLoss;
      return false;
    }

    if (currentLoss < this.bestLoss - this.minDelta) {
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

  reset() {
    this.counter = 0;
    this.bestLoss = null;
    this.shouldStop = false;
  }
}
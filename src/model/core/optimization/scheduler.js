export class LearningRateScheduler {
  constructor(config) {
    this.initialLr = config.learningRate;
    this.decay = config.lrDecay || 0.1;
    this.patience = config.patience || 5;
    this.minLr = config.minLr || 1e-6;
    this.counter = 0;
    this.bestLoss = null;
  }

  step(loss) {
    if (this.bestLoss === null || loss < this.bestLoss) {
      this.bestLoss = loss;
      this.counter = 0;
      return this.initialLr;
    }

    this.counter += 1;
    if (this.counter >= this.patience) {
      this.initialLr = Math.max(
        this.initialLr * (1 - this.decay),
        this.minLr
      );
      this.counter = 0;
    }

    return this.initialLr;
  }

  reset() {
    this.counter = 0;
    this.bestLoss = null;
  }
}
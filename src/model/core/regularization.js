import { BaseModel } from './base.js';

export class RegularizationModel extends BaseModel {
  constructor(config) {
    super(config);
    this.dropoutRate = config.dropoutRate || 0.1;
    this.l2Lambda = config.l2Lambda || 0.01;
  }

  dropout(embeddings, training = true) {
    if (!training || this.dropoutRate === 0) {
      return embeddings;
    }

    return embeddings.map(embedding =>
      embedding.map(val =>
        Math.random() > this.dropoutRate ? 
        val / (1 - this.dropoutRate) : 0
      )
    );
  }

  l2Regularization(weights) {
    const squaredSum = weights.reduce((sum, row) =>
      sum + row.reduce((rowSum, val) =>
        rowSum + val * val, 0
      ), 0
    );
    
    return this.l2Lambda * squaredSum / 2;
  }

  gradientClipping(gradients, maxNorm = 5) {
    const totalNorm = Math.sqrt(
      gradients.reduce((sum, row) =>
        sum + row.reduce((rowSum, val) =>
          rowSum + val * val, 0
        ), 0
      )
    );

    if (totalNorm > maxNorm) {
      const scale = maxNorm / totalNorm;
      return gradients.map(row =>
        row.map(val => val * scale)
      );
    }

    return gradients;
  }
}
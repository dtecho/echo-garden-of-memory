import { BaseModel } from './base.js';
import { vectorAdd, vectorScale } from './utils/math.js';

export class NormalizationModel extends BaseModel {
  constructor(config) {
    super(config);
    this.layerNorm = this.initializeLayerNorm();
  }

  initializeLayerNorm() {
    return {
      gamma: Array(this.config.embeddingDim).fill(1),
      beta: Array(this.config.embeddingDim).fill(0)
    };
  }

  normalize(embeddings) {
    return embeddings.map(embedding => {
      const mean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
      const variance = embedding.reduce((sum, val) => 
        sum + Math.pow(val - mean, 2), 0
      ) / embedding.length;

      const normalized = embedding.map((val, i) => 
        this.layerNorm.gamma[i] * (val - mean) / 
        Math.sqrt(variance + 1e-10) + this.layerNorm.beta[i]
      );

      return normalized;
    });
  }

  updateNormParameters(gradients, learningRate) {
    this.layerNorm.gamma = vectorAdd(
      this.layerNorm.gamma,
      vectorScale(gradients.gamma, -learningRate)
    );
    
    this.layerNorm.beta = vectorAdd(
      this.layerNorm.beta,
      vectorScale(gradients.beta, -learningRate)
    );
  }
}
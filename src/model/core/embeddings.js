import { BaseModel } from './base.js';

export class EmbeddingModel extends BaseModel {
  constructor(config) {
    super(config);
    this.embeddings = this.initializeEmbeddings();
  }

  initializeEmbeddings() {
    const scale = Math.sqrt(2.0 / (this.config.vocabSize + this.config.embeddingDim));
    return Array(this.config.vocabSize).fill(0).map(() =>
      Array(this.config.embeddingDim).fill(0).map(() =>
        (Math.random() * 2 - 1) * scale
      )
    );
  }

  forward(tokenIndices) {
    return tokenIndices.map(index => this.embeddings[index]);
  }

  updateEmbedding(tokenIndex, gradients, learningRate) {
    this.embeddings[tokenIndex] = this.embeddings[tokenIndex].map(
      (value, i) => value - learningRate * gradients[i]
    );
  }
}
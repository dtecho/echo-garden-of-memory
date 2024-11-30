import { multiply, dot } from 'mathjs';
import logger from '../utils/logger.js';

export class AttentionMechanism {
  constructor(embeddingDim) {
    this.embeddingDim = embeddingDim;
    this.queryWeight = this.initializeWeight();
    this.keyWeight = this.initializeWeight();
    this.valueWeight = this.initializeWeight();
  }

  initializeWeight() {
    // Xavier/Glorot initialization
    const scale = Math.sqrt(2.0 / (this.embeddingDim + this.embeddingDim));
    return Array(this.embeddingDim).fill(0).map(() =>
      Array(this.embeddingDim).fill(0).map(() =>
        (Math.random() * 2 - 1) * scale
      )
    );
  }

  calculateAttentionScores(embeddings) {
    // Calculate Query, Key, Value matrices
    const queries = embeddings.map(emb => multiply(emb, this.queryWeight));
    const keys = embeddings.map(emb => multiply(emb, this.keyWeight));
    const values = embeddings.map(emb => multiply(emb, this.valueWeight));

    // Calculate attention scores
    const scores = queries.map(q => 
      keys.map(k => dot(q, k) / Math.sqrt(this.embeddingDim))
    );

    return { scores, values };
  }

  softmax(scores) {
    const maxScore = Math.max(...scores.flat());
    const expScores = scores.map(row =>
      row.map(score => Math.exp(score - maxScore))
    );

    const sumExp = expScores.map(row =>
      row.reduce((sum, exp) => sum + exp, 0)
    );

    return expScores.map((row, i) =>
      row.map(exp => exp / (sumExp[i] + 1e-10))
    );
  }

  applyAttention(embeddings) {
    const { scores, values } = this.calculateAttentionScores(embeddings);
    const attentionWeights = this.softmax(scores);

    // Apply attention weights to values
    const weightedValues = attentionWeights.map((weights, i) =>
      values.map((value, j) =>
        value.map(v => v * weights[j])
      )
    );

    // Sum weighted values for each position
    const contextVectors = weightedValues.map(weighted =>
      weighted.reduce((sum, curr) =>
        sum.map((val, i) => val + curr[i]),
        new Array(this.embeddingDim).fill(0)
      )
    );

    return {
      contextVectors,
      attentionWeights
    };
  }

  updateWeights(gradients, learningRate) {
    const updateMatrix = (weight, gradient) =>
      weight.map((row, i) =>
        row.map((val, j) => val - learningRate * gradient[i][j])
      );

    this.queryWeight = updateMatrix(this.queryWeight, gradients.query);
    this.keyWeight = updateMatrix(this.keyWeight, gradients.key);
    this.valueWeight = updateMatrix(this.valueWeight, gradients.value);
  }
}
import { BaseModel } from './base.js';
import { multiply, dot } from 'mathjs';

export class AttentionModel extends BaseModel {
  constructor(config) {
    super(config);
    this.queryWeight = this.initializeWeight();
    this.keyWeight = this.initializeWeight();
    this.valueWeight = this.initializeWeight();
  }

  initializeWeight() {
    const scale = Math.sqrt(2.0 / (this.config.embeddingDim + this.config.embeddingDim));
    return Array(this.config.embeddingDim).fill(0).map(() =>
      Array(this.config.embeddingDim).fill(0).map(() =>
        (Math.random() * 2 - 1) * scale
      )
    );
  }

  forward(embeddings) {
    const queries = embeddings.map(emb => multiply(emb, this.queryWeight));
    const keys = embeddings.map(emb => multiply(emb, this.keyWeight));
    const values = embeddings.map(emb => multiply(emb, this.valueWeight));

    const scores = queries.map(q => 
      keys.map(k => dot(q, k) / Math.sqrt(this.config.embeddingDim))
    );

    const weights = this.softmax(scores);
    return this.computeContext(weights, values);
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

  computeContext(weights, values) {
    return weights.map((weightRow, i) =>
      values.reduce((context, value, j) =>
        context.map((c, k) => c + value[k] * weightRow[j]),
        new Array(this.config.embeddingDim).fill(0)
      )
    );
  }
}
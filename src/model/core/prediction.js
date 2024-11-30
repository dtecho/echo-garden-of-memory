import { BaseModel } from './base.js';

export class PredictionModel extends BaseModel {
  constructor(config) {
    super(config);
    this.labels = config.labels || ['greeting', 'farewell', 'question'];
  }

  predict(embeddings) {
    const avgEmbedding = embeddings.reduce((sum, emb) =>
      sum.map((val, i) => val + emb[i]),
      new Array(this.config.embeddingDim).fill(0)
    ).map(val => val / embeddings.length);

    const scores = this.labels.map(label => ({
      label,
      score: Math.random() // Simplified scoring for demo
    }));

    const maxScore = Math.max(...scores.map(s => s.score));
    const expScores = scores.map(s => ({
      ...s,
      score: Math.exp(s.score - maxScore)
    }));

    const sumExp = expScores.reduce((sum, s) => sum + s.score, 0);
    
    return expScores.map(s => ({
      label: s.label,
      probability: s.score / sumExp
    }));
  }
}
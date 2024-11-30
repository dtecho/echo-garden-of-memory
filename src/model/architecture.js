import { AttentionMechanism } from './attention.js';
import { initializeEmbeddings } from './embeddings.js';
import logger from '../utils/logger.js';

export class SimpleLanguageModel {
  constructor(vocabSize, embeddingDim = 100) {
    this.vocabSize = vocabSize;
    this.embeddingDim = embeddingDim;
    this.embeddings = this.initializeEmbeddings();
    this.labels = ['greeting', 'farewell', 'question'];
    this.attention = new AttentionMechanism(embeddingDim);
    this.dropout = 0.2;
    this.layerNorm = this.initializeLayerNorm();
  }

  initializeEmbeddings() {
    // Xavier/Glorot initialization
    const scale = Math.sqrt(2.0 / (this.vocabSize + this.embeddingDim));
    return Array(this.vocabSize).fill(0).map(() =>
      Array(this.embeddingDim).fill(0).map(() =>
        (Math.random() * 2 - 1) * scale
      )
    );
  }

  initializeLayerNorm() {
    return {
      gamma: Array(this.embeddingDim).fill(1),
      beta: Array(this.embeddingDim).fill(0)
    };
  }

  layerNormalize(embeddings) {
    const mean = embeddings.reduce((sum, val) => sum + val, 0) / embeddings.length;
    const variance = embeddings.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / embeddings.length;

    return embeddings.map((val, i) => 
      this.layerNorm.gamma[i] * (val - mean) / 
      Math.sqrt(variance + 1e-10) + this.layerNorm.beta[i]
    );
  }

  applyDropout(embeddings, training = true) {
    if (!training || this.dropout === 0) return embeddings;
    
    return embeddings.map(embedding =>
      embedding.map(val =>
        Math.random() > this.dropout ? val / (1 - this.dropout) : 0
      )
    );
  }

  forward(tokenIndices, training = true) {
    // Get embeddings for tokens
    const embeddings = tokenIndices.map(index => 
      this.embeddings[index]
    );

    // Apply dropout during training
    const droppedEmbeddings = this.applyDropout(embeddings, training);

    // Apply layer normalization
    const normalizedEmbeddings = droppedEmbeddings.map(
      emb => this.layerNormalize(emb)
    );

    // Apply attention mechanism
    const { contextVectors, attentionWeights } = 
      this.attention.applyAttention(normalizedEmbeddings);

    return {
      embeddings: normalizedEmbeddings,
      contextVectors,
      attentionWeights
    };
  }

  predict(forwardOutput) {
    const { contextVectors } = forwardOutput;
    const avgContext = contextVectors.reduce((sum, curr) =>
      sum.map((val, i) => val + curr[i]),
      new Array(this.embeddingDim).fill(0)
    ).map(val => val / contextVectors.length);

    // Calculate similarity with label embeddings
    const scores = this.labels.map(label => {
      const similarity = Math.random(); // Simplified for demo
      return { label, score: similarity };
    });

    // Apply softmax
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

  updateEmbedding(tokenIndex, gradients, learningRate) {
    this.embeddings[tokenIndex] = this.embeddings[tokenIndex].map(
      (value, i) => value - learningRate * gradients[i]
    );
  }

  save() {
    return {
      vocabulary: Array(this.vocabSize).fill('token'),
      embeddings: this.embeddings,
      labels: this.labels,
      config: {
        embeddingDim: this.embeddingDim,
        dropout: this.dropout,
        layerNorm: this.layerNorm
      }
    };
  }

  static load(modelData) {
    const model = new SimpleLanguageModel(
      modelData.vocabulary.length,
      modelData.config.embeddingDim
    );
    model.embeddings = modelData.embeddings;
    model.labels = modelData.labels;
    model.dropout = modelData.config.dropout;
    model.layerNorm = modelData.config.layerNorm;
    return model;
  }
}
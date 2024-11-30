import { BaseModel } from './base.js';
import { EmbeddingModel } from './embeddings.js';
import { AttentionModel } from './attention.js';
import { NormalizationModel } from './normalization.js';
import { RegularizationModel } from './regularization.js';
import { PredictionModel } from './prediction.js';

export class CompositeLanguageModel extends BaseModel {
  constructor(config) {
    super(config);
    this.embedding = new EmbeddingModel(config);
    this.attention = new AttentionModel(config);
    this.normalization = new NormalizationModel(config);
    this.regularization = new RegularizationModel(config);
    this.prediction = new PredictionModel(config);
  }

  forward(tokenIndices, training = true) {
    // Get embeddings
    let embeddings = this.embedding.forward(tokenIndices);

    // Apply dropout during training
    embeddings = this.regularization.dropout(embeddings, training);

    // Apply layer normalization
    embeddings = this.normalization.normalize(embeddings);

    // Apply attention mechanism
    const contextVectors = this.attention.forward(embeddings);

    return {
      embeddings,
      contextVectors,
      predictions: this.prediction.predict(contextVectors)
    };
  }

  backward(gradients, learningRate) {
    // Clip gradients
    const clippedGradients = this.regularization.gradientClipping(gradients);

    // Update embeddings
    gradients.tokenIndices.forEach((tokenIndex, i) => {
      this.embedding.updateEmbedding(
        tokenIndex,
        clippedGradients.embeddings[i],
        learningRate
      );
    });

    // Update normalization parameters
    this.normalization.updateNormParameters(
      gradients.normalization,
      learningRate
    );
  }

  save() {
    return {
      ...super.save(),
      embedding: this.embedding.embeddings,
      attention: {
        queryWeight: this.attention.queryWeight,
        keyWeight: this.attention.keyWeight,
        valueWeight: this.attention.valueWeight
      },
      normalization: this.normalization.layerNorm,
      config: {
        ...this.config,
        dropoutRate: this.regularization.dropoutRate,
        l2Lambda: this.regularization.l2Lambda
      }
    };
  }

  static load(data) {
    const model = new CompositeLanguageModel(data.config);
    model.embedding.embeddings = data.embedding;
    model.attention.queryWeight = data.attention.queryWeight;
    model.attention.keyWeight = data.attention.keyWeight;
    model.attention.valueWeight = data.attention.valueWeight;
    model.normalization.layerNorm = data.normalization;
    return model;
  }
}
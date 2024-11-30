import { expect, test } from 'vitest';
import { CompositeLanguageModel } from '../composite.js';

test('CompositeLanguageModel should initialize all components', () => {
  const config = {
    embeddingDim: 3,
    vocabSize: 100,
    dropoutRate: 0.1,
    l2Lambda: 0.01
  };
  
  const model = new CompositeLanguageModel(config);
  
  expect(model.embedding).toBeDefined();
  expect(model.attention).toBeDefined();
  expect(model.normalization).toBeDefined();
  expect(model.regularization).toBeDefined();
  expect(model.prediction).toBeDefined();
});

test('forward should process through all components', () => {
  const config = {
    embeddingDim: 3,
    vocabSize: 100,
    dropoutRate: 0.1
  };
  
  const model = new CompositeLanguageModel(config);
  const tokenIndices = [0, 1];
  
  const output = model.forward(tokenIndices);
  
  expect(output.embeddings).toBeDefined();
  expect(output.contextVectors).toBeDefined();
  expect(output.predictions).toBeDefined();
  expect(output.predictions).toHaveLength(model.prediction.labels.length);
});

test('backward should update all components', () => {
  const config = {
    embeddingDim: 3,
    vocabSize: 100,
    dropoutRate: 0.1
  };
  
  const model = new CompositeLanguageModel(config);
  const gradients = {
    tokenIndices: [0],
    embeddings: [[0.1, 0.1, 0.1]],
    normalization: {
      gamma: [0.1, 0.1, 0.1],
      beta: [0.1, 0.1, 0.1]
    }
  };
  
  const originalEmbedding = [...model.embedding.embeddings[0]];
  const originalGamma = [...model.normalization.layerNorm.gamma];
  
  model.backward(gradients, 0.1);
  
  expect(model.embedding.embeddings[0]).not.toEqual(originalEmbedding);
  expect(model.normalization.layerNorm.gamma).not.toEqual(originalGamma);
});

test('save and load should preserve model state', () => {
  const config = {
    embeddingDim: 3,
    vocabSize: 100,
    dropoutRate: 0.1
  };
  
  const model = new CompositeLanguageModel(config);
  const saved = model.save();
  const loaded = CompositeLanguageModel.load(saved);
  
  expect(loaded.config).toEqual(model.config);
  expect(loaded.embedding.embeddings).toEqual(model.embedding.embeddings);
  expect(loaded.normalization.layerNorm).toEqual(model.normalization.layerNorm);
});
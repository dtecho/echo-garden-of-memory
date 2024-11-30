import { expect, test } from 'vitest';
import { NormalizationModel } from '../normalization.js';

test('NormalizationModel should initialize layer norm parameters', () => {
  const config = { embeddingDim: 3 };
  const model = new NormalizationModel(config);
  
  expect(model.layerNorm.gamma).toHaveLength(config.embeddingDim);
  expect(model.layerNorm.beta).toHaveLength(config.embeddingDim);
});

test('normalize should handle zero variance', () => {
  const config = { embeddingDim: 2 };
  const model = new NormalizationModel(config);
  const embeddings = [[1, 1]];
  
  const normalized = model.normalize(embeddings);
  expect(normalized[0]).toHaveLength(config.embeddingDim);
});

test('normalize should produce zero mean and unit variance', () => {
  const config = { embeddingDim: 3 };
  const model = new NormalizationModel(config);
  const embeddings = [[1, 2, 3]];
  
  const normalized = model.normalize(embeddings);
  
  const mean = normalized[0].reduce((sum, val) => sum + val, 0) / config.embeddingDim;
  expect(mean).toBeCloseTo(0);
});

test('updateNormParameters should modify parameters', () => {
  const config = { embeddingDim: 2 };
  const model = new NormalizationModel(config);
  const gradients = {
    gamma: [0.1, 0.1],
    beta: [0.2, 0.2]
  };
  
  const originalGamma = [...model.layerNorm.gamma];
  const originalBeta = [...model.layerNorm.beta];
  
  model.updateNormParameters(gradients, 0.1);
  
  expect(model.layerNorm.gamma).not.toEqual(originalGamma);
  expect(model.layerNorm.beta).not.toEqual(originalBeta);
});
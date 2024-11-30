import { expect, test } from 'vitest';
import { EmbeddingModel } from '../embeddings.js';

test('EmbeddingModel should initialize embeddings correctly', () => {
  const config = { embeddingDim: 3, vocabSize: 2 };
  const model = new EmbeddingModel(config);
  
  expect(model.embeddings).toHaveLength(config.vocabSize);
  expect(model.embeddings[0]).toHaveLength(config.embeddingDim);
});

test('EmbeddingModel forward should return correct embeddings', () => {
  const config = { embeddingDim: 3, vocabSize: 2 };
  const model = new EmbeddingModel(config);
  const tokenIndices = [0, 1];
  
  const embeddings = model.forward(tokenIndices);
  
  expect(embeddings).toHaveLength(tokenIndices.length);
  expect(embeddings[0]).toHaveLength(config.embeddingDim);
});

test('EmbeddingModel should update embeddings correctly', () => {
  const config = { embeddingDim: 2, vocabSize: 1 };
  const model = new EmbeddingModel(config);
  const originalEmbedding = [...model.embeddings[0]];
  
  model.updateEmbedding(0, [0.1, 0.1], 0.1);
  
  expect(model.embeddings[0]).not.toEqual(originalEmbedding);
  expect(model.embeddings[0].length).toBe(config.embeddingDim);
});
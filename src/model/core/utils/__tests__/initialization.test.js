import { expect, test } from 'vitest';
import { initializeEmbeddings, initializeAttentionWeights, initializeLayerNorm } from '../initialization.js';

test('initializeEmbeddings should create correct size matrix', () => {
  const vocabSize = 3;
  const embeddingDim = 2;
  const embeddings = initializeEmbeddings(vocabSize, embeddingDim);
  
  expect(embeddings).toHaveLength(vocabSize);
  expect(embeddings[0]).toHaveLength(embeddingDim);
});

test('initializeAttentionWeights should create all weight matrices', () => {
  const dim = 3;
  const weights = initializeAttentionWeights(dim);
  
  expect(weights.query).toHaveLength(dim);
  expect(weights.key).toHaveLength(dim);
  expect(weights.value).toHaveLength(dim);
  expect(weights.query[0]).toHaveLength(dim);
});

test('initializeLayerNorm should create gamma and beta vectors', () => {
  const dim = 3;
  const norm = initializeLayerNorm(dim);
  
  expect(norm.gamma).toHaveLength(dim);
  expect(norm.beta).toHaveLength(dim);
  expect(norm.gamma.every(val => val === 1)).toBe(true);
  expect(norm.beta.every(val => val === 0)).toBe(true);
});
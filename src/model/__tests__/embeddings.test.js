import { expect, test } from 'vitest';
import { initializeEmbeddings, updateEmbedding, calculateCosineSimilarity } from '../embeddings.js';

test('initializeEmbeddings should create correct size matrix', () => {
  const vocabSize = 3;
  const embeddingDim = 2;
  const embeddings = initializeEmbeddings(vocabSize, embeddingDim);
  
  expect(embeddings.length).toBe(vocabSize);
  expect(embeddings[0].length).toBe(embeddingDim);
});

test('updateEmbedding should apply gradients correctly', () => {
  const embedding = [0.5, -0.5];
  const gradients = [0.1, 0.1];
  const learningRate = 0.1;
  
  const updated = updateEmbedding(embedding, gradients, learningRate);
  
  expect(updated[0]).toBeCloseTo(0.49);
  expect(updated[1]).toBeCloseTo(-0.51);
});

test('calculateCosineSimilarity should handle identical vectors', () => {
  const vec = [1, 0, 1];
  expect(calculateCosineSimilarity(vec, vec)).toBeCloseTo(1);
});

test('calculateCosineSimilarity should handle orthogonal vectors', () => {
  const vec1 = [1, 0];
  const vec2 = [0, 1];
  expect(calculateCosineSimilarity(vec1, vec2)).toBeCloseTo(0);
});

test('calculateCosineSimilarity should handle opposite vectors', () => {
  const vec1 = [1, 1];
  const vec2 = [-1, -1];
  expect(calculateCosineSimilarity(vec1, vec2)).toBeCloseTo(-1);
});
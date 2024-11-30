import { expect, test } from 'vitest';
import { AttentionModel } from '../attention.js';

test('AttentionModel should initialize weights correctly', () => {
  const config = { embeddingDim: 3 };
  const model = new AttentionModel(config);
  
  expect(model.queryWeight).toHaveLength(config.embeddingDim);
  expect(model.keyWeight).toHaveLength(config.embeddingDim);
  expect(model.valueWeight).toHaveLength(config.embeddingDim);
});

test('AttentionModel softmax should handle numerical stability', () => {
  const config = { embeddingDim: 2 };
  const model = new AttentionModel(config);
  const scores = [[1000, -1000], [-1000, 1000]];
  
  const weights = model.softmax(scores);
  
  expect(weights).toHaveLength(2);
  weights.forEach(row => {
    const sum = row.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1);
    row.forEach(weight => {
      expect(weight).toBeGreaterThanOrEqual(0);
      expect(weight).toBeLessThanOrEqual(1);
    });
  });
});

test('AttentionModel should compute context vectors', () => {
  const config = { embeddingDim: 2 };
  const model = new AttentionModel(config);
  const embeddings = [[1, 0], [0, 1]];
  
  const context = model.forward(embeddings);
  
  expect(context).toHaveLength(embeddings.length);
  context.forEach(vector => {
    expect(vector).toHaveLength(config.embeddingDim);
  });
});
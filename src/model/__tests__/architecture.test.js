import { expect, test } from 'vitest';
import { SimpleLanguageModel } from '../architecture.js';

test('SimpleLanguageModel initialization', () => {
  const vocabSize = 5;
  const embeddingDim = 3;
  const model = new SimpleLanguageModel(vocabSize, embeddingDim);
  
  expect(model.embeddings.length).toBe(vocabSize);
  expect(model.embeddings[0].length).toBe(embeddingDim);
  expect(model.labels).toEqual(['greeting', 'farewell', 'question']);
});

test('forward pass should return correct embeddings', () => {
  const model = new SimpleLanguageModel(3, 2);
  const tokenIndices = [0, 2];
  
  const embeddings = model.forward(tokenIndices);
  
  expect(embeddings.length).toBe(tokenIndices.length);
  expect(embeddings[0].length).toBe(2);
});

test('predict should return probabilities for all labels', () => {
  const model = new SimpleLanguageModel(3, 2);
  const embeddings = [[0.1, 0.2], [0.3, 0.4]];
  
  const predictions = model.predict(embeddings);
  
  expect(predictions.length).toBe(model.labels.length);
  predictions.forEach(pred => {
    expect(pred).toHaveProperty('label');
    expect(pred).toHaveProperty('probability');
    expect(pred.probability).toBeGreaterThanOrEqual(0);
    expect(pred.probability).toBeLessThanOrEqual(1);
  });
});

test('updateEmbedding should modify embeddings', () => {
  const model = new SimpleLanguageModel(2, 2);
  const originalEmbedding = [...model.embeddings[0]];
  
  model.updateEmbedding(0, [0.1, 0.1], 0.1);
  
  expect(model.embeddings[0]).not.toEqual(originalEmbedding);
});
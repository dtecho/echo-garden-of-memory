import { expect, test } from 'vitest';
import { PredictionModel } from '../prediction.js';

test('PredictionModel should initialize with default labels', () => {
  const config = { embeddingDim: 3 };
  const model = new PredictionModel(config);
  expect(model.labels).toEqual(['greeting', 'farewell', 'question']);
});

test('PredictionModel should initialize with custom labels', () => {
  const config = { 
    embeddingDim: 3,
    labels: ['custom1', 'custom2']
  };
  const model = new PredictionModel(config);
  expect(model.labels).toEqual(['custom1', 'custom2']);
});

test('PredictionModel should return valid probabilities', () => {
  const config = { embeddingDim: 3 };
  const model = new PredictionModel(config);
  const embeddings = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]];
  
  const predictions = model.predict(embeddings);
  
  expect(predictions).toHaveLength(model.labels.length);
  
  let sumProb = 0;
  predictions.forEach(pred => {
    expect(pred).toHaveProperty('label');
    expect(pred).toHaveProperty('probability');
    expect(pred.probability).toBeGreaterThanOrEqual(0);
    expect(pred.probability).toBeLessThanOrEqual(1);
    sumProb += pred.probability;
  });
  
  expect(sumProb).toBeCloseTo(1);
});
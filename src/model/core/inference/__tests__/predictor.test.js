import { expect, test } from 'vitest';
import { ModelPredictor } from '../predictor.js';
import { CompositeLanguageModel } from '../../composite.js';

test('ModelPredictor should make predictions', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10,
    batchSize: 2
  };

  const predictor = new ModelPredictor(config);
  const model = new CompositeLanguageModel(config);
  
  const input = { tokens: [0, 1] };
  const result = await predictor.predict(model, input);
  
  expect(result).toHaveProperty('label');
  expect(result).toHaveProperty('probability');
  expect(result).toHaveProperty('confidence');
  expect(result).toHaveProperty('attention');
});

test('ModelPredictor should handle batch predictions', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10,
    batchSize: 2
  };

  const predictor = new ModelPredictor(config);
  const model = new CompositeLanguageModel(config);
  
  const inputs = [
    { tokens: [0, 1] },
    { tokens: [1, 2] },
    { tokens: [2, 3] }
  ];
  
  const results = await predictor.batchPredict(model, inputs);
  expect(results).toHaveLength(inputs.length);
});

test('ModelPredictor should calculate confidence', () => {
  const predictor = new ModelPredictor({});
  const predictions = [
    { label: 'A', probability: 0.8 },
    { label: 'B', probability: 0.2 }
  ];
  
  const confidence = predictor.calculateConfidence(predictions);
  expect(confidence).toBeGreaterThan(0);
  expect(confidence).toBeLessThanOrEqual(1);
});

test('ModelPredictor should get top K predictions', () => {
  const predictor = new ModelPredictor({});
  const predictions = [
    { label: 'A', probability: 0.5 },
    { label: 'B', probability: 0.3 },
    { label: 'C', probability: 0.2 }
  ];
  
  const topK = predictor.getTopK(predictions, 2);
  expect(topK).toHaveLength(2);
  expect(topK[0].label).toBe('A');
  expect(topK[1].label).toBe('B');
});
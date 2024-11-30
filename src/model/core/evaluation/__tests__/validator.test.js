import { expect, test } from 'vitest';
import { ModelValidator } from '../validator.js';

test('ModelValidator should validate model architecture', () => {
  const validator = new ModelValidator({});
  const validModel = {
    config: {
      embeddingDim: 100,
      vocabSize: 1000
    },
    embedding: {
      embeddings: Array(1000).fill().map(() => Array(100).fill(0))
    },
    attention: {},
    prediction: {}
  };
  
  expect(() => validator.validateArchitecture(validModel)).not.toThrow();
});

test('ModelValidator should validate predictions', () => {
  const validator = new ModelValidator({});
  const validPredictions = [
    { label: 'A', probability: 0.7 },
    { label: 'B', probability: 0.3 }
  ];
  
  expect(() => validator.validatePredictions(validPredictions, ['A', 'B']))
    .not.toThrow();
});

test('ModelValidator should validate training data', () => {
  const validator = new ModelValidator({});
  const validData = [
    { tokens: ['hello'], label: 'greeting' }
  ];
  
  expect(() => validator.validateTrainingData(validData)).not.toThrow();
});

test('ModelValidator should track metrics', () => {
  const validator = new ModelValidator({});
  
  validator.recordMetric('accuracy', 0.8);
  validator.recordMetric('accuracy', 0.9);
  
  const stats = validator.getMetricStats('accuracy');
  expect(stats.mean).toBe(0.85);
  expect(stats.min).toBe(0.8);
  expect(stats.max).toBe(0.9);
});
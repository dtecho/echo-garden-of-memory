import { expect, test } from 'vitest';
import { ModelTrainer } from '../trainer.js';
import { CompositeLanguageModel } from '../../composite.js';

test('ModelTrainer should initialize components', () => {
  const config = {
    epochs: 10,
    batchSize: 32,
    learningRate: 0.01,
    embeddingDim: 100,
    vocabSize: 1000
  };
  
  const trainer = new ModelTrainer(config);
  
  expect(trainer.metricsTracker).toBeDefined();
  expect(trainer.monitor).toBeDefined();
  expect(trainer.validator).toBeDefined();
  expect(trainer.evaluator).toBeDefined();
  expect(trainer.optimizer).toBeDefined();
  expect(trainer.scheduler).toBeDefined();
});

test('ModelTrainer should train model', async () => {
  const config = {
    epochs: 2,
    batchSize: 2,
    learningRate: 0.01,
    embeddingDim: 2,
    vocabSize: 10,
    labels: ['A', 'B']
  };
  
  const trainer = new ModelTrainer(config);
  const model = new CompositeLanguageModel(config);
  
  const trainData = [
    { tokens: [0, 1], label: 'A' },
    { tokens: [1, 2], label: 'B' }
  ];
  
  const result = await trainer.train(model, trainData);
  
  expect(result.finalMetrics).toBeDefined();
  expect(result.history).toBeDefined();
});

test('ModelTrainer should handle validation data', async () => {
  const config = {
    epochs: 2,
    batchSize: 2,
    learningRate: 0.01,
    embeddingDim: 2,
    vocabSize: 10
  };
  
  const trainer = new ModelTrainer(config);
  const model = new CompositeLanguageModel(config);
  
  const trainData = [
    { tokens: [0, 1], label: 'A' },
    { tokens: [1, 2], label: 'B' }
  ];
  
  const validationData = [
    { tokens: [2, 3], label: 'A' }
  ];
  
  const result = await trainer.train(model, trainData, validationData);
  expect(result.finalMetrics).toBeDefined();
});

test('ModelTrainer should calculate loss correctly', () => {
  const config = { learningRate: 0.01 };
  const trainer = new ModelTrainer(config);
  
  const predictions = [
    { label: 'A', probability: 0.7 },
    { label: 'B', probability: 0.3 }
  ];
  
  const loss = trainer.calculateLoss(predictions, 'A');
  expect(loss).toBeGreaterThan(0);
});

test('ModelTrainer should update model parameters', () => {
  const config = {
    learningRate: 0.01,
    embeddingDim: 2,
    vocabSize: 2
  };
  
  const trainer = new ModelTrainer(config);
  const model = new CompositeLanguageModel(config);
  
  const gradients = {
    embeddings: [[0.1, 0.1]],
    attention: {
      query: [0.1, 0.1],
      key: [0.1, 0.1],
      value: [0.1, 0.1]
    },
    normalization: {
      gamma: [0.1, 0.1],
      beta: [0.1, 0.1]
    }
  };
  
  const originalEmbedding = [...model.embedding.embeddings[0]];
  trainer.updateModel(model, gradients);
  
  expect(model.embedding.embeddings[0]).not.toEqual(originalEmbedding);
});
import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SimpleLanguageModel } from '../../model/architecture.js';
import { BatchProcessor } from '../batch.js';
import { TrainingMetrics } from '../metrics.js';
import { ModelValidator } from '../../model/validation.js';

const TEST_DATA = [
  {
    original: 'hello world',
    tokens: ['hello', 'world'],
    label: 'greeting'
  },
  {
    original: 'goodbye friend',
    tokens: ['goodbye', 'friend'], 
    label: 'farewell'
  }
];

test('Full training pipeline should work end-to-end', async () => {
  // Initialize components
  const vocabulary = ['hello', 'world', 'goodbye', 'friend'];
  const model = new SimpleLanguageModel(vocabulary.length, 10);
  const batchProcessor = new BatchProcessor(2);
  const metrics = new TrainingMetrics();
  const validator = new ModelValidator();

  // Validate initial state
  expect(() => validator.validateModelState(model)).not.toThrow();
  expect(() => validator.validateTrainingData(TEST_DATA)).not.toThrow();

  // Process batch
  const batches = batchProcessor.createBatches(TEST_DATA);
  expect(batches).toHaveLength(1);

  const processed = batchProcessor.processBatch(batches[0], vocabulary);
  expect(processed).toHaveLength(2);

  // Training iteration
  for (const item of processed) {
    const embeddings = model.forward(item.encodedTokens);
    const predictions = model.predict(embeddings);
    
    // Validate predictions
    expect(() => validator.validatePredictions(predictions, model))
      .not.toThrow();
    
    metrics.updateMetrics(0.5, predictions, item.label);
  }

  // Check metrics
  const results = metrics.getMetrics();
  expect(results).toHaveProperty('accuracy');
  expect(results).toHaveProperty('averageLoss');
  expect(results).toHaveProperty('labelMetrics');
});
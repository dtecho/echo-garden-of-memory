import { expect, test } from 'vitest';
import { ModelPipeline } from '../pipeline.js';
import { CompositeLanguageModel } from '../../composite.js';

test('ModelPipeline should train and save model', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10,
    batchSize: 2,
    epochs: 2
  };

  const pipeline = new ModelPipeline(config);
  const model = new CompositeLanguageModel(config);

  const trainData = [
    { tokens: [0, 1], label: 'A' },
    { tokens: [1, 2], label: 'B' }
  ];

  const result = await pipeline.train(model, trainData);
  
  expect(result.trainingResults).toBeDefined();
  expect(result.evaluationResults).toBeDefined();
  expect(result.version).toBeDefined();
});

test('ModelPipeline should load and compare versions', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10
  };

  const pipeline = new ModelPipeline(config);
  const model = new CompositeLanguageModel(config);

  // Save two versions
  await pipeline.saveModel(model, { accuracy: 0.7 });
  await pipeline.saveModel(model, { accuracy: 0.8 });

  const comparison = await pipeline.compareVersions(1, 2);
  expect(comparison.accuracyDiff).toBe(0.1);
});

test('ModelPipeline should get latest model', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10
  };

  const pipeline = new ModelPipeline(config);
  const model = new CompositeLanguageModel(config);

  await pipeline.saveModel(model, { accuracy: 0.8 });
  const latest = await pipeline.getLatestModel();
  
  expect(latest).toBeDefined();
  expect(latest.config.embeddingDim).toBe(config.embeddingDim);
});
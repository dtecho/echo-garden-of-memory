import { expect, test } from 'vitest';
import { TrainingPipeline } from '../pipeline.js';
import { CompositeLanguageModel } from '../../composite.js';
import { ModelTrainer } from '../trainer.js';

test('TrainingPipeline should execute training process', async () => {
  const config = {
    epochs: 2,
    batchSize: 2,
    embeddingDim: 2,
    vocabSize: 10
  };

  const pipeline = new TrainingPipeline(config);
  const model = new CompositeLanguageModel(config);
  const trainer = new ModelTrainer(config);

  const trainData = [
    { tokens: [0, 1], label: 'A' },
    { tokens: [1, 2], label: 'B' }
  ];

  const result = await pipeline.execute(model, trainer, trainData);
  
  expect(result.finalMetrics).toBeDefined();
  expect(result.history).toBeDefined();
});

test('TrainingPipeline should handle validation data', async () => {
  const config = {
    epochs: 2,
    batchSize: 2,
    embeddingDim: 2,
    vocabSize: 10
  };

  const pipeline = new TrainingPipeline(config);
  const model = new CompositeLanguageModel(config);
  const trainer = new ModelTrainer(config);

  const trainData = [
    { tokens: [0, 1], label: 'A' },
    { tokens: [1, 2], label: 'B' }
  ];

  const validationData = [
    { tokens: [2, 3], label: 'A' }
  ];

  const result = await pipeline.execute(
    model,
    trainer,
    trainData,
    validationData
  );

  expect(result.finalMetrics).toBeDefined();
});

test('TrainingPipeline should track metrics', async () => {
  const config = {
    epochs: 1,
    batchSize: 2,
    embeddingDim: 2,
    vocabSize: 10
  };

  const pipeline = new TrainingPipeline(config);
  const model = new CompositeLanguageModel(config);
  const trainer = new ModelTrainer(config);

  const trainData = [
    { tokens: [0, 1], label: 'A' },
    { tokens: [1, 2], label: 'B' }
  ];

  await pipeline.execute(model, trainer, trainData);
  
  expect(pipeline.metricsTracker.history).toHaveLength(1);
  expect(pipeline.metricsTracker.history[0]).toHaveProperty('accuracy');
  expect(pipeline.metricsTracker.history[0]).toHaveProperty('averageLoss');
});
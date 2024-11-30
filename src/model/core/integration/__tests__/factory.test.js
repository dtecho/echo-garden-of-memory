import { expect, test } from 'vitest';
import { ModelFactory } from '../factory.js';

test('ModelFactory should create new model', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10
  };

  const factory = new ModelFactory(config);
  const model = await factory.createModel();
  
  expect(model.config.embeddingDim).toBe(config.embeddingDim);
  expect(model.config.vocabSize).toBe(config.vocabSize);
});

test('ModelFactory should load existing model', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10
  };

  const factory = new ModelFactory(config);
  
  // Create and save model first
  const model = await factory.createModel();
  await factory.pipeline.saveModel(model, { accuracy: 0.8 });

  // Load model
  const loaded = await factory.loadExistingModel(1);
  expect(loaded.config).toEqual(model.config);
});

test('ModelFactory should create server', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10,
    server: {
      port: 3000,
      host: 'localhost'
    }
  };

  const factory = new ModelFactory(config);
  const model = await factory.createModel();
  
  const { server, monitor } = await factory.createServer(model);
  
  expect(server).toBeDefined();
  expect(monitor).toBeDefined();
  expect(server.model).toBe(model);
});

test('ModelFactory should deploy model', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10,
    server: {
      port: 3000,
      host: 'localhost'
    }
  };

  const factory = new ModelFactory(config);
  const model = await factory.createModel();
  
  const deployment = await factory.deployModel(model, {
    healthCheckInterval: 1000
  });
  
  expect(deployment.server).toBeDefined();
  expect(deployment.monitor).toBeDefined();
  expect(deployment.healthCheckInterval).toBeDefined();
  
  clearInterval(deployment.healthCheckInterval);
});
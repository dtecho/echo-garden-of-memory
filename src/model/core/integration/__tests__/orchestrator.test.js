import { expect, test } from 'vitest';
import { ModelOrchestrator } from '../orchestrator.js';

test('ModelOrchestrator should train and deploy model', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10,
    minDeployAccuracy: 0.7,
    server: {
      port: 3000,
      host: 'localhost'
    }
  };

  const orchestrator = new ModelOrchestrator(config);
  
  const trainData = [
    { tokens: [0, 1], label: 'A' },
    { tokens: [1, 2], label: 'B' }
  ];

  const result = await orchestrator.trainAndDeploy(trainData);
  
  expect(result.model).toBeDefined();
  expect(result.trainingResults).toBeDefined();
  expect(result.evaluationResults).toBeDefined();
  expect(result.version).toBeDefined();

  if (result.deployment) {
    expect(result.deployment.server).toBeDefined();
    expect(result.deployment.monitor).toBeDefined();
    await orchestrator.stopDeployment(result.version.version);
  }
});

test('ModelOrchestrator should handle rollback', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10,
    server: {
      port: 3000,
      host: 'localhost'
    }
  };

  const orchestrator = new ModelOrchestrator(config);
  
  // Create and save initial version
  const model = await orchestrator.factory.createModel();
  await orchestrator.pipeline.saveModel(model, { accuracy: 0.8 });

  const rollback = await orchestrator.rollback(1);
  expect(rollback.model).toBeDefined();
  expect(rollback.deployment).toBeDefined();

  await orchestrator.stopDeployment(1);
});

test('ModelOrchestrator should get deployment status', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10,
    server: {
      port: 3000,
      host: 'localhost'
    }
  };

  const orchestrator = new ModelOrchestrator(config);
  const model = await orchestrator.factory.createModel();
  
  const deployment = await orchestrator.factory.deployModel(model);
  orchestrator.deployments.set(1, deployment);

  const status = orchestrator.getDeploymentStatus(1);
  expect(status.version).toBe(1);
  expect(status.health).toBeDefined();
  expect(status.metrics).toBeDefined();

  await orchestrator.cleanup();
});
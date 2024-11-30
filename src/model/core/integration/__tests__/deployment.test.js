import { expect, test } from 'vitest';
import { DeploymentManager } from '../deployment.js';
import { CompositeLanguageModel } from '../../composite.js';

test('DeploymentManager should deploy model', async () => {
  const config = {
    server: {
      port: 3000,
      host: 'localhost'
    },
    corsOrigins: ['http://localhost:3000']
  };

  const manager = new DeploymentManager(config);
  const model = new CompositeLanguageModel({
    embeddingDim: 2,
    vocabSize: 10
  });

  const deployment = await manager.deploy(model, 1, {
    healthCheckInterval: 1000
  });

  expect(deployment.server).toBeDefined();
  expect(deployment.monitor).toBeDefined();
  expect(deployment.healthCheckInterval).toBeDefined();

  await manager.stop(1);
});

test('DeploymentManager should track deployment status', async () => {
  const config = {
    server: {
      port: 3000,
      host: 'localhost'
    },
    corsOrigins: ['http://localhost:3000']
  };

  const manager = new DeploymentManager(config);
  const model = new CompositeLanguageModel({
    embeddingDim: 2,
    vocabSize: 10
  });

  await manager.deploy(model, 1);
  const status = manager.getStatus(1);

  expect(status.version).toBe(1);
  expect(status.status).toBeDefined();
  expect(status.health).toBeDefined();
  expect(status.metrics).toBeDefined();
  expect(status.uptime).toBeGreaterThan(0);

  await manager.stop(1);
});

test('DeploymentManager should stop all deployments', async () => {
  const config = {
    server: {
      port: 3000,
      host: 'localhost'
    },
    corsOrigins: ['http://localhost:3000']
  };

  const manager = new DeploymentManager(config);
  const model = new CompositeLanguageModel({
    embeddingDim: 2,
    vocabSize: 10
  });

  await manager.deploy(model, 1);
  await manager.deploy(model, 2);

  expect(manager.deployments.size).toBe(2);
  await manager.stopAll();
  expect(manager.deployments.size).toBe(0);
});
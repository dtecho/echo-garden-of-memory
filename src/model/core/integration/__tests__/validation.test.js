import { expect, test } from 'vitest';
import { 
  validatePipelineConfig,
  validateDeploymentConfig,
  validateModelData
} from '../validation.js';
import { PipelineError, DeploymentError, FactoryError } from '../errors.js';

test('validatePipelineConfig should validate required fields', () => {
  const validConfig = {
    model: {
      embeddingDim: 100,
      vocabSize: 1000
    },
    training: {
      epochs: 10
    }
  };

  expect(() => validatePipelineConfig(validConfig)).not.toThrow();
  expect(() => validatePipelineConfig({})).toThrow(PipelineError);
});

test('validateDeploymentConfig should validate server config', () => {
  const validConfig = {
    server: {
      port: 3000,
      host: 'localhost'
    },
    corsOrigins: ['http://localhost:3000']
  };

  expect(() => validateDeploymentConfig(validConfig)).not.toThrow();
  expect(() => validateDeploymentConfig({})).toThrow(DeploymentError);
});

test('validateModelData should validate model format', () => {
  const validData = {
    config: { embeddingDim: 100 },
    embeddings: [[0.1, 0.2]]
  };

  expect(() => validateModelData(validData)).not.toThrow();
  expect(() => validateModelData({})).toThrow(FactoryError);
});
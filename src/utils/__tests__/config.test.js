import { expect, test } from 'vitest';
import { validateConfig, getConfig } from '../config.js';

test('validateConfig should validate all required fields', () => {
  expect(() => validateConfig()).not.toThrow();
});

test('getConfig should return valid configuration', () => {
  const config = getConfig();
  expect(config).toHaveProperty('model');
  expect(config).toHaveProperty('training');
  expect(config).toHaveProperty('data');
  expect(config).toHaveProperty('server');
  expect(config).toHaveProperty('logging');
});

test('model config should have required fields', () => {
  const config = getConfig();
  expect(config.model).toHaveProperty('embeddingDim');
  expect(config.model).toHaveProperty('learningRate');
  expect(config.model).toHaveProperty('batchSize');
  expect(config.model).toHaveProperty('epochs');
});
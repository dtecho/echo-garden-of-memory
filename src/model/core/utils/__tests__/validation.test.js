import { expect, test } from 'vitest';
import { 
  validateModelConfig, 
  validateTrainingConfig,
  validateInput,
  validateBatch 
} from '../validation.js';
import { ConfigError, ValidationError } from '../../errors.js';

test('validateModelConfig should validate embedding dimension', () => {
  expect(() => validateModelConfig({
    embeddingDim: 0,
    vocabSize: 100
  })).toThrow(ConfigError);

  expect(() => validateModelConfig({
    embeddingDim: 100,
    vocabSize: 100
  })).not.toThrow();
});

test('validateTrainingConfig should validate epochs', () => {
  expect(() => validateTrainingConfig({
    epochs: 0
  })).toThrow(ConfigError);

  expect(() => validateTrainingConfig({
    epochs: 10
  })).not.toThrow();
});

test('validateInput should handle valid input', () => {
  const input = '  hello world  ';
  expect(validateInput(input)).toBe('hello world');
});

test('validateInput should throw on invalid input', () => {
  expect(() => validateInput('')).toThrow(ValidationError);
  expect(() => validateInput('   ')).toThrow(ValidationError);
  expect(() => validateInput(null)).toThrow(ValidationError);
});

test('validateBatch should validate batch structure', () => {
  const validBatch = [
    { tokens: ['hello'], label: 'greeting' }
  ];

  const invalidBatch = [
    { tokens: 'not-array', label: 'greeting' }
  ];

  expect(() => validateBatch(validBatch)).not.toThrow();
  expect(() => validateBatch(invalidBatch)).toThrow(ValidationError);
});
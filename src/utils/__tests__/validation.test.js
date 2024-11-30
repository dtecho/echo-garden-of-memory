import { expect, test } from 'vitest';
import { validateInput, validateModel } from '../validation.js';

test('validateInput should accept valid strings', () => {
  const input = 'hello world';
  expect(validateInput(input)).toBe(input);
});

test('validateInput should throw on empty string', () => {
  expect(() => validateInput('')).toThrow();
});

test('validateInput should throw on non-string input', () => {
  expect(() => validateInput(123)).toThrow();
  expect(() => validateInput(null)).toThrow();
  expect(() => validateInput(undefined)).toThrow();
});

test('validateInput should handle whitespace', () => {
  expect(validateInput('  hello  ')).toBe('hello');
  expect(() => validateInput('   ')).toThrow();
});

test('validateModel should accept valid model', () => {
  const model = {
    vocabulary: ['hello', 'world'],
    embeddings: [[0.1, 0.2], [0.3, 0.4]]
  };
  expect(validateModel(model)).toBe(true);
});

test('validateModel should throw on invalid model structure', () => {
  expect(() => validateModel(null)).toThrow();
  expect(() => validateModel({})).toThrow();
  expect(() => validateModel({ vocabulary: [] })).toThrow();
});

test('validateModel should throw on size mismatch', () => {
  const model = {
    vocabulary: ['hello', 'world'],
    embeddings: [[0.1, 0.2]]
  };
  expect(() => validateModel(model)).toThrow();
});

test('validateModel should check embedding dimensions', () => {
  const model = {
    vocabulary: ['hello', 'world'],
    embeddings: [[0.1, 0.2], [0.3]]
  };
  expect(() => validateModel(model)).toThrow();
});
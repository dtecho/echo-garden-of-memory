import { expect, test } from 'vitest';
import { calculateAccuracy, calculatePrecision, calculateRecall } from '../metrics.js';

test('calculateAccuracy should compute correct ratio', () => {
  const predictions = ['A', 'B', 'A', 'B'];
  const actual = ['A', 'B', 'B', 'B'];
  expect(calculateAccuracy(predictions, actual)).toBe(0.75);
});

test('calculateAccuracy should handle empty arrays', () => {
  expect(() => calculateAccuracy([], [])).toThrow();
});

test('calculateAccuracy should handle mismatched lengths', () => {
  const predictions = ['A', 'B'];
  const actual = ['A', 'B', 'C'];
  expect(() => calculateAccuracy(predictions, actual)).toThrow();
});

test('calculatePrecision should handle perfect predictions', () => {
  const predictions = ['A', 'B', 'A'];
  const actual = ['A', 'B', 'A'];
  expect(calculatePrecision(predictions, actual, 'A')).toBe(1);
});

test('calculatePrecision should handle no predictions', () => {
  const predictions = ['B', 'B', 'B'];
  const actual = ['A', 'A', 'A'];
  expect(calculatePrecision(predictions, actual, 'A')).toBe(0);
});

test('calculatePrecision should handle empty arrays', () => {
  expect(() => calculatePrecision([], [], 'A')).toThrow();
});

test('calculateRecall should handle perfect recall', () => {
  const predictions = ['A', 'A', 'A'];
  const actual = ['A', 'A', 'A'];
  expect(calculateRecall(predictions, actual, 'A')).toBe(1);
});

test('calculateRecall should handle no actual positives', () => {
  const predictions = ['A', 'A', 'A'];
  const actual = ['B', 'B', 'B'];
  expect(calculateRecall(predictions, actual, 'A')).toBe(0);
});

test('calculateRecall should handle mixed cases', () => {
  const predictions = ['A', 'B', 'A', 'B', 'A'];
  const actual = ['A', 'B', 'B', 'A', 'A'];
  expect(calculateRecall(predictions, actual, 'A')).toBe(2/3);
});
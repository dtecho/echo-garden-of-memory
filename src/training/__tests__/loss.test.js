import { expect, test } from 'vitest';
import { calculateLoss, calculateGradients } from '../loss.js';

test('calculateLoss should handle perfect prediction', () => {
  const predictions = [1, 0, 0];
  const actual = [0];
  const loss = calculateLoss(predictions, actual);
  expect(loss).toBeCloseTo(0);
});

test('calculateLoss should handle worst prediction', () => {
  const predictions = [0, 1, 0];
  const actual = [0];
  const loss = calculateLoss(predictions, actual);
  expect(loss).toBeGreaterThan(0);
});

test('calculateLoss should handle numerical stability', () => {
  const predictions = [0.0000001, 0.9999999, 0];
  const actual = [0];
  expect(() => calculateLoss(predictions, actual)).not.toThrow();
});

test('calculateGradients should return correct shape', () => {
  const predictions = [0.7, 0.2, 0.1];
  const actual = [0];
  const embeddings = [[1, 2], [3, 4]];
  
  const gradients = calculateGradients(predictions, actual, embeddings);
  
  expect(gradients.length).toBe(embeddings.length);
  expect(gradients[0].length).toBe(embeddings[0].length);
});

test('calculateGradients should handle zero predictions', () => {
  const predictions = [0, 0, 0];
  const actual = [0];
  const embeddings = [[1, 2]];
  
  expect(() => calculateGradients(predictions, actual, embeddings)).not.toThrow();
});
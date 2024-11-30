import { expect, test } from 'vitest';
import { softmax, relu, reluDerivative, tanh, tanhDerivative } from '../activation.js';

test('softmax should sum to 1', () => {
  const logits = [[1, 2], [3, 4]];
  const probs = softmax(logits);
  
  probs.forEach(row => {
    const sum = row.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1);
  });
});

test('relu should handle positive and negative values', () => {
  expect(relu(1)).toBe(1);
  expect(relu(-1)).toBe(0);
  expect(relu(0)).toBe(0);
});

test('reluDerivative should return correct gradients', () => {
  expect(reluDerivative(1)).toBe(1);
  expect(reluDerivative(-1)).toBe(0);
  expect(reluDerivative(0)).toBe(0);
});

test('tanh should be bounded between -1 and 1', () => {
  expect(tanh(0)).toBe(0);
  expect(tanh(100)).toBeCloseTo(1);
  expect(tanh(-100)).toBeCloseTo(-1);
});

test('tanhDerivative should match analytical derivative', () => {
  const x = 0.5;
  const h = 1e-7;
  const numerical = (tanh(x + h) - tanh(x)) / h;
  expect(tanhDerivative(x)).toBeCloseTo(numerical);
});
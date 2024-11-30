import { expect, test } from 'vitest';
import { TrainingMetrics } from '../metrics.js';

test('TrainingMetrics should initialize with zero values', () => {
  const metrics = new TrainingMetrics();
  const current = metrics.getMetrics();
  
  expect(current.averageLoss).toBe(0);
  expect(current.accuracy).toBe(0);
  expect(current.totalSamples).toBe(0);
});

test('TrainingMetrics should update correctly', () => {
  const metrics = new TrainingMetrics();
  
  metrics.updateMetrics(0.5, [
    { label: 'A', probability: 0.7 },
    { label: 'B', probability: 0.3 }
  ], 'A');
  
  const current = metrics.getMetrics();
  expect(current.averageLoss).toBe(0.5);
  expect(current.accuracy).toBe(1);
  expect(current.totalSamples).toBe(1);
});

test('TrainingMetrics should reset correctly', () => {
  const metrics = new TrainingMetrics();
  
  metrics.updateMetrics(0.5, [
    { label: 'A', probability: 0.7 }
  ], 'A');
  
  metrics.reset();
  const current = metrics.getMetrics();
  
  expect(current.averageLoss).toBe(0);
  expect(current.accuracy).toBe(0);
  expect(current.totalSamples).toBe(0);
});
import { expect, test } from 'vitest';
import { MetricsTracker } from '../tracker.js';

test('MetricsTracker should initialize with zero values', () => {
  const tracker = new MetricsTracker();
  const metrics = tracker.getEpochMetrics();
  
  expect(metrics.accuracy).toBe(0);
  expect(metrics.averageLoss).toBe(0);
  expect(metrics.totalSamples).toBe(0);
});

test('MetricsTracker should update metrics correctly', () => {
  const tracker = new MetricsTracker();
  
  tracker.update(0.5, [
    { label: 'A', probability: 0.7 },
    { label: 'B', probability: 0.3 }
  ], 'A');
  
  const metrics = tracker.getEpochMetrics();
  expect(metrics.accuracy).toBe(1);
  expect(metrics.averageLoss).toBe(0.5);
  expect(metrics.totalSamples).toBe(1);
});

test('MetricsTracker should calculate per-label metrics', () => {
  const tracker = new MetricsTracker();
  
  // True positive for A
  tracker.update(0.5, [
    { label: 'A', probability: 0.7 },
    { label: 'B', probability: 0.3 }
  ], 'A');
  
  // False negative for A, false positive for B
  tracker.update(0.5, [
    { label: 'B', probability: 0.7 },
    { label: 'A', probability: 0.3 }
  ], 'A');
  
  const metrics = tracker.getEpochMetrics();
  expect(metrics.labelMetrics.A.precision).toBe(1);
  expect(metrics.labelMetrics.A.recall).toBe(0.5);
  expect(metrics.labelMetrics.A.f1).toBeCloseTo(0.67, 2);
});

test('MetricsTracker should maintain history', () => {
  const tracker = new MetricsTracker();
  
  tracker.update(0.5, [{ label: 'A', probability: 1 }], 'A');
  tracker.getEpochMetrics();
  
  tracker.reset();
  tracker.update(0.3, [{ label: 'A', probability: 1 }], 'A');
  tracker.getEpochMetrics();
  
  const best = tracker.getBestMetrics();
  expect(best.averageLoss).toBe(0.3);
});
import { expect, test } from 'vitest';
import { TrainingMonitor } from '../monitor.js';

test('TrainingMonitor should detect improvement', () => {
  const monitor = new TrainingMonitor({ patience: 2 });
  
  const shouldStop1 = monitor.check({ averageLoss: 1.0 });
  const shouldStop2 = monitor.check({ averageLoss: 0.8 });
  
  expect(shouldStop1).toBe(false);
  expect(shouldStop2).toBe(false);
  expect(monitor.counter).toBe(0);
});

test('TrainingMonitor should trigger early stopping', () => {
  const monitor = new TrainingMonitor({ patience: 2 });
  
  monitor.check({ averageLoss: 1.0 });
  monitor.check({ averageLoss: 1.1 });
  const shouldStop = monitor.check({ averageLoss: 1.2 });
  
  expect(shouldStop).toBe(true);
  expect(monitor.shouldStop).toBe(true);
});

test('TrainingMonitor should track progress', () => {
  const monitor = new TrainingMonitor({});
  
  monitor.check({ averageLoss: 1.0, accuracy: 0.5 });
  monitor.check({ averageLoss: 0.8, accuracy: 0.6 });
  
  const progress = monitor.getProgress();
  expect(progress.lossChange).toBe(0.2);
  expect(progress.accuracyChange).toBe(0.1);
  expect(progress.isImproving).toBe(true);
});

test('TrainingMonitor reset should restore initial state', () => {
  const monitor = new TrainingMonitor({});
  
  monitor.check({ averageLoss: 1.0 });
  monitor.check({ averageLoss: 1.1 });
  monitor.reset();
  
  expect(monitor.counter).toBe(0);
  expect(monitor.bestLoss).toBe(null);
  expect(monitor.shouldStop).toBe(false);
  expect(monitor.history).toEqual([]);
});
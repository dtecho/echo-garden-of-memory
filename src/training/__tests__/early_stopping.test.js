import { expect, test } from 'vitest';
import { EarlyStopping } from '../early_stopping.js';

test('EarlyStopping should initialize correctly', () => {
  const earlyStopping = new EarlyStopping(5, 0.001);
  expect(earlyStopping.patience).toBe(5);
  expect(earlyStopping.minDelta).toBe(0.001);
  expect(earlyStopping.counter).toBe(0);
  expect(earlyStopping.bestLoss).toBe(null);
});

test('EarlyStopping should track best loss', () => {
  const earlyStopping = new EarlyStopping(5);
  
  expect(earlyStopping.check(1.0)).toBe(false);
  expect(earlyStopping.bestLoss).toBe(1.0);
  
  expect(earlyStopping.check(0.8)).toBe(false);
  expect(earlyStopping.bestLoss).toBe(0.8);
});

test('EarlyStopping should trigger after patience exceeded', () => {
  const earlyStopping = new EarlyStopping(2);
  
  expect(earlyStopping.check(1.0)).toBe(false);
  expect(earlyStopping.check(1.1)).toBe(false);
  expect(earlyStopping.check(1.2)).toBe(true);
  expect(earlyStopping.shouldStop).toBe(true);
});

test('EarlyStopping should reset correctly', () => {
  const earlyStopping = new EarlyStopping(2);
  
  earlyStopping.check(1.0);
  earlyStopping.check(1.1);
  earlyStopping.check(1.2);
  
  earlyStopping.reset();
  expect(earlyStopping.counter).toBe(0);
  expect(earlyStopping.bestLoss).toBe(null);
  expect(earlyStopping.shouldStop).toBe(false);
});
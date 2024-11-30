import { expect, test } from 'vitest';
import { LearningRateScheduler } from '../scheduler.js';

test('Scheduler should maintain initial learning rate for better loss', () => {
  const scheduler = new LearningRateScheduler({
    learningRate: 0.1,
    patience: 2
  });
  
  const lr1 = scheduler.step(1.0);
  const lr2 = scheduler.step(0.9);
  
  expect(lr1).toBe(0.1);
  expect(lr2).toBe(0.1);
});

test('Scheduler should decay learning rate after patience steps', () => {
  const scheduler = new LearningRateScheduler({
    learningRate: 0.1,
    patience: 2,
    lrDecay: 0.5
  });
  
  scheduler.step(1.0);
  scheduler.step(1.1);
  scheduler.step(1.2);
  const newLr = scheduler.step(1.3);
  
  expect(newLr).toBe(0.05);
});

test('Scheduler should not decay below minimum learning rate', () => {
  const scheduler = new LearningRateScheduler({
    learningRate: 0.1,
    patience: 1,
    lrDecay: 0.9,
    minLr: 0.01
  });
  
  let lr = scheduler.step(1.0);
  for (let i = 0; i < 10; i++) {
    lr = scheduler.step(1.0 + i);
  }
  
  expect(lr).toBe(0.01);
});

test('Scheduler reset should restore initial state', () => {
  const scheduler = new LearningRateScheduler({
    learningRate: 0.1
  });
  
  scheduler.step(1.0);
  scheduler.step(1.1);
  scheduler.reset();
  
  expect(scheduler.counter).toBe(0);
  expect(scheduler.bestLoss).toBe(null);
});
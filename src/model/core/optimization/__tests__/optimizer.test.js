import { expect, test } from 'vitest';
import { Optimizer } from '../optimizer.js';

test('Optimizer should initialize with default values', () => {
  const optimizer = new Optimizer({});
  expect(optimizer.learningRate).toBe(0.01);
  expect(optimizer.beta1).toBe(0.9);
  expect(optimizer.beta2).toBe(0.999);
});

test('Optimizer step should update parameters', () => {
  const optimizer = new Optimizer({ learningRate: 0.1 });
  const params = [1.0, 2.0];
  const gradients = [0.1, 0.2];
  
  const updated = optimizer.step(params, gradients, 'test');
  
  expect(updated).toHaveLength(params.length);
  expect(updated[0]).not.toBe(params[0]);
  expect(updated[1]).not.toBe(params[1]);
});

test('Optimizer should maintain state across steps', () => {
  const optimizer = new Optimizer({ learningRate: 0.1 });
  const params = [1.0];
  const gradients = [0.1];
  
  optimizer.step(params, gradients, 'test');
  expect(optimizer.moments.has('test')).toBe(true);
  expect(optimizer.velocities.has('test')).toBe(true);
});

test('Optimizer reset should clear state', () => {
  const optimizer = new Optimizer({ learningRate: 0.1 });
  const params = [1.0];
  const gradients = [0.1];
  
  optimizer.step(params, gradients, 'test');
  optimizer.reset();
  
  expect(optimizer.moments.size).toBe(0);
  expect(optimizer.velocities.size).toBe(0);
  expect(optimizer.t).toBe(0);
});
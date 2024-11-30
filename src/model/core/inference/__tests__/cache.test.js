import { expect, test } from 'vitest';
import { PredictionCache } from '../cache.js';

test('PredictionCache should store and retrieve values', () => {
  const cache = new PredictionCache({ cacheSize: 2 });
  
  cache.set('key1', 'value1');
  expect(cache.get('key1')).toBe('value1');
});

test('PredictionCache should respect max size', () => {
  const cache = new PredictionCache({ cacheSize: 2 });
  
  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  cache.set('key3', 'value3');
  
  expect(cache.get('key1')).toBeNull();
  expect(cache.get('key2')).toBe('value2');
  expect(cache.get('key3')).toBe('value3');
});

test('PredictionCache should update access order', () => {
  const cache = new PredictionCache({ cacheSize: 2 });
  
  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  cache.get('key1'); // Updates access order
  cache.set('key3', 'value3');
  
  expect(cache.get('key1')).toBe('value1');
  expect(cache.get('key2')).toBeNull();
  expect(cache.get('key3')).toBe('value3');
});

test('PredictionCache should provide stats', () => {
  const cache = new PredictionCache({ cacheSize: 3 });
  
  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  
  const stats = cache.getStats();
  expect(stats.size).toBe(2);
  expect(stats.maxSize).toBe(3);
  expect(stats.hitRate).toBeGreaterThanOrEqual(0);
});
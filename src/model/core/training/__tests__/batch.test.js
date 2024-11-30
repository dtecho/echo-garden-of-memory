import { expect, test } from 'vitest';
import { BatchProcessor } from '../batch.js';

test('BatchProcessor should create correct number of batches', () => {
  const processor = new BatchProcessor(2);
  const data = [1, 2, 3, 4, 5];
  
  const batches = processor.createBatches(data);
  
  expect(batches).toHaveLength(3);
  expect(batches[0]).toHaveLength(2);
  expect(batches[1]).toHaveLength(2);
  expect(batches[2]).toHaveLength(1);
});

test('BatchProcessor should process batch correctly', () => {
  const processor = new BatchProcessor(2);
  const vocabulary = ['hello', 'world'];
  const batch = [
    { tokens: ['hello'], label: 'greeting' },
    { tokens: ['world'], label: 'other' }
  ];
  
  const processed = processor.processBatch(batch, vocabulary);
  
  expect(processed).toHaveLength(2);
  expect(processed[0].tokens).toEqual([0]);
  expect(processed[1].tokens).toEqual([1]);
});

test('BatchProcessor should validate batch data', () => {
  const processor = new BatchProcessor(2);
  
  const validBatch = [
    { tokens: ['hello'], label: 'greeting' }
  ];
  
  const invalidBatch = [
    { tokens: 'not-an-array', label: 'greeting' }
  ];
  
  expect(() => processor.validateBatch(validBatch)).not.toThrow();
  expect(() => processor.validateBatch(invalidBatch)).toThrow();
});

test('BatchProcessor should handle unknown tokens', () => {
  const processor = new BatchProcessor(2);
  const vocabulary = ['hello', 'world'];
  const batch = [
    { tokens: ['hello', 'unknown'], label: 'greeting' }
  ];
  
  const processed = processor.processBatch(batch, vocabulary);
  expect(processed[0].tokens).toEqual([0]);
});
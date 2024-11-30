import { expect, test } from 'vitest';
import { splitDataset } from '../pipeline.js';

test('splitDataset should split data correctly', async () => {
  const testData = Array(100).fill().map((_, i) => ({
    original: `text ${i}`,
    tokens: [`token${i}`],
    label: 'test'
  }));
  
  const { trainData, validationData } = await splitDataset(
    testData,
    0.2
  );
  
  expect(trainData).toHaveLength(80);
  expect(validationData).toHaveLength(20);
  
  // Check that all items maintain their structure
  trainData.forEach(item => {
    expect(item).toHaveProperty('original');
    expect(item).toHaveProperty('tokens');
    expect(item).toHaveProperty('label');
  });
});

test('splitDataset should handle empty data', async () => {
  const { trainData, validationData } = await splitDataset([]);
  
  expect(trainData).toHaveLength(0);
  expect(validationData).toHaveLength(0);
});

test('splitDataset should handle custom split ratios', async () => {
  const testData = Array(100).fill().map((_, i) => ({
    original: `text ${i}`,
    tokens: [`token${i}`],
    label: 'test'
  }));
  
  const { trainData, validationData } = await splitDataset(
    testData,
    0.3
  );
  
  expect(trainData).toHaveLength(70);
  expect(validationData).toHaveLength(30);
});
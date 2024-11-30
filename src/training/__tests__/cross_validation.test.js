import { expect, test } from 'vitest';
import { CrossValidator } from '../cross_validation.js';
import { SimpleLanguageModel } from '../../model/architecture.js';

const TEST_DATA = Array(50).fill().map((_, i) => ({
  original: `text ${i}`,
  tokens: [`token${i}`],
  label: i % 2 === 0 ? 'greeting' : 'farewell'
}));

test('CrossValidator should create correct number of folds', () => {
  const validator = new CrossValidator(5);
  const folds = validator.createFolds(TEST_DATA);
  
  expect(folds).toHaveLength(5);
  expect(folds[0]).toHaveLength(10);
});

test('CrossValidator should not have overlapping examples between folds', () => {
  const validator = new CrossValidator(5);
  const folds = validator.createFolds(TEST_DATA);
  
  const examples = new Set();
  folds.forEach(fold => {
    fold.forEach(example => {
      const key = example.original;
      expect(examples.has(key)).toBe(false);
      examples.add(key);
    });
  });
});

test('CrossValidator should perform full validation', async () => {
  const validator = new CrossValidator(3);
  const vocabulary = Array(50).fill().map((_, i) => `token${i}`);
  const model = new SimpleLanguageModel(vocabulary.length, 10);
  
  const results = await validator.validate(model, TEST_DATA, vocabulary);
  
  expect(results).toHaveProperty('averageAccuracy');
  expect(results).toHaveProperty('averageLoss');
  expect(results.foldResults).toHaveLength(3);
});
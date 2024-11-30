import { expect, test } from 'vitest';
import { ModelValidator } from '../validation.js';

test('ModelValidator should validate embedding dimensions', () => {
  const validator = new ModelValidator();
  
  const validModel = {
    vocabulary: ['hello', 'world'],
    embeddings: [[0.1, 0.2], [0.3, 0.4]],
    labels: ['greeting', 'farewell']
  };
  
  expect(() => validator.validateEmbeddings(validModel)).not.toThrow();
  
  const invalidModel = {
    vocabulary: ['hello', 'world'],
    embeddings: [[0.1], [0.3, 0.4]],
    labels: ['greeting', 'farewell']
  };
  
  expect(() => validator.validateEmbeddings(invalidModel)).toThrow();
});

test('ModelValidator should validate vocabulary-embeddings alignment', () => {
  const validator = new ModelValidator();
  
  const misalignedModel = {
    vocabulary: ['hello', 'world', 'extra'],
    embeddings: [[0.1, 0.2], [0.3, 0.4]],
    labels: ['greeting', 'farewell']
  };
  
  expect(() => validator.validateAlignment(misalignedModel)).toThrow();
});

test('ModelValidator should validate label consistency', () => {
  const validator = new ModelValidator();
  
  const model = {
    vocabulary: ['hello'],
    embeddings: [[0.1, 0.2]],
    labels: ['greeting', 'farewell']
  };
  
  const predictions = [
    { label: 'unknown', probability: 0.5 }
  ];
  
  expect(() => validator.validatePredictions(predictions, model)).toThrow();
});
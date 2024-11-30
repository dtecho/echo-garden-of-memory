import { expect, test } from 'vitest';
import { ModelEvaluator } from '../metrics.js';

const mockModel = {
  labels: ['greeting', 'farewell', 'question'],
  vocabulary: ['hello', 'goodbye'],
  embeddings: [[0.1, 0.2], [0.3, 0.4]]
};

test('ModelEvaluator should calculate confusion matrix correctly', () => {
  const evaluator = new ModelEvaluator(mockModel);
  
  const predictions = [
    { label: 'greeting' },
    { label: 'farewell' },
    { label: 'greeting' }
  ];
  
  const actualLabels = [
    'greeting',
    'farewell',
    'farewell'
  ];
  
  const matrix = evaluator.calculateConfusionMatrix(predictions, actualLabels);
  
  expect(matrix.greeting.greeting).toBe(1);
  expect(matrix.farewell.greeting).toBe(1);
  expect(matrix.farewell.farewell).toBe(1);
});

test('ModelEvaluator should calculate per-label metrics correctly', () => {
  const evaluator = new ModelEvaluator(mockModel);
  
  const confusionMatrix = {
    greeting: {
      greeting: 2,
      farewell: 1,
      question: 0
    },
    farewell: {
      greeting: 1,
      farewell: 3,
      question: 1
    },
    question: {
      greeting: 0,
      farewell: 1,
      question: 2
    }
  };
  
  const metrics = evaluator.calculatePerLabelMetrics(confusionMatrix);
  
  expect(metrics.greeting.precision).toBeCloseTo(0.67, 2);
  expect(metrics.farewell.recall).toBeCloseTo(0.6, 2);
  expect(metrics.question.f1).toBeCloseTo(0.67, 2);
});

test('ModelEvaluator should evaluate model on test data', () => {
  const evaluator = new ModelEvaluator(mockModel);
  
  const testData = [
    { tokens: ['hello'], label: 'greeting' },
    { tokens: ['goodbye'], label: 'farewell' }
  ];
  
  const results = evaluator.evaluateModel(testData);
  
  expect(results).toHaveProperty('accuracy');
  expect(results).toHaveProperty('averageLoss');
  expect(results).toHaveProperty('confusionMatrix');
  expect(results).toHaveProperty('labelMetrics');
  expect(results.sampleCount).toBe(2);
});
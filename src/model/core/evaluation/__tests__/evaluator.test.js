import { expect, test } from 'vitest';
import { ModelEvaluator } from '../evaluator.js';

test('ModelEvaluator should initialize confusion matrix', () => {
  const evaluator = new ModelEvaluator({});
  const labels = ['A', 'B'];
  const matrix = evaluator.initializeConfusionMatrix(labels);
  
  expect(matrix.A.A).toBe(0);
  expect(matrix.A.B).toBe(0);
  expect(matrix.B.A).toBe(0);
  expect(matrix.B.B).toBe(0);
});

test('ModelEvaluator should calculate label metrics', () => {
  const evaluator = new ModelEvaluator({});
  const confusionMatrix = {
    A: { A: 2, B: 1 },
    B: { A: 1, B: 2 }
  };
  
  const metrics = evaluator.calculateLabelMetrics(confusionMatrix);
  
  expect(metrics.A.precision).toBe(2/3);
  expect(metrics.A.recall).toBe(2/3);
  expect(metrics.A.f1).toBeCloseTo(2/3);
});

test('ModelEvaluator should evaluate model', () => {
  const evaluator = new ModelEvaluator({});
  const mockModel = {
    forward: () => ({
      predictions: [
        { label: 'A', probability: 0.7 },
        { label: 'B', probability: 0.3 }
      ]
    }),
    prediction: {
      labels: ['A', 'B']
    }
  };
  
  const testData = [
    { tokens: ['x'], label: 'A' },
    { tokens: ['y'], label: 'B' }
  ];
  
  const results = evaluator.evaluate(mockModel, testData);
  
  expect(results).toHaveProperty('accuracy');
  expect(results).toHaveProperty('averageLoss');
  expect(results).toHaveProperty('confusionMatrix');
  expect(results).toHaveProperty('labelMetrics');
});

test('ModelEvaluator should track best result', () => {
  const evaluator = new ModelEvaluator({});
  
  evaluator.history.push({ accuracy: 0.8 });
  evaluator.history.push({ accuracy: 0.9 });
  
  const best = evaluator.getBestResult();
  expect(best.accuracy).toBe(0.9);
});
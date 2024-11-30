import { expect, test } from 'vitest';
import { RegularizationModel } from '../regularization.js';

test('dropout should zero out values during training', () => {
  const config = { dropoutRate: 0.5 };
  const model = new RegularizationModel(config);
  const embeddings = [[1, 1, 1, 1]];
  
  const dropped = model.dropout(embeddings, true);
  const nonZeroCount = dropped[0].filter(x => x !== 0).length;
  
  expect(nonZeroCount).toBeLessThan(embeddings[0].length);
});

test('dropout should scale values correctly', () => {
  const config = { dropoutRate: 0.5 };
  const model = new RegularizationModel(config);
  const embeddings = [[1, 1]];
  
  const dropped = model.dropout(embeddings, true);
  dropped[0].forEach(val => {
    expect(val === 0 || val === 2).toBe(true);
  });
});

test('l2Regularization should calculate penalty correctly', () => {
  const config = { l2Lambda: 0.1 };
  const model = new RegularizationModel(config);
  const weights = [[1, 1], [1, 1]];
  
  const penalty = model.l2Regularization(weights);
  expect(penalty).toBe(0.2); // 0.1 * (4 * 1^2) / 2
});

test('gradientClipping should respect max norm', () => {
  const config = {};
  const model = new RegularizationModel(config);
  const gradients = [[3, 4]]; // norm = 5
  const maxNorm = 1;
  
  const clipped = model.gradientClipping(gradients, maxNorm);
  const norm = Math.sqrt(
    clipped.reduce((sum, row) =>
      sum + row.reduce((rowSum, val) =>
        rowSum + val * val, 0
      ), 0
    )
  );
  
  expect(norm).toBeCloseTo(maxNorm);
});
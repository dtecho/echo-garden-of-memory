import { expect, test } from 'vitest';
import { xavier, createMatrix, vectorAdd, vectorScale, matrixMultiply } from '../math.js';

test('xavier initialization should be within reasonable bounds', () => {
  const init = xavier(100, 100);
  const values = Array(1000).fill(0).map(init);
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
  
  expect(Math.abs(mean)).toBeLessThan(0.1);
  expect(variance).toBeGreaterThan(0);
  expect(variance).toBeLessThan(1);
});

test('createMatrix should create matrix of correct dimensions', () => {
  const rows = 3, cols = 2;
  const matrix = createMatrix(rows, cols, () => 1);
  
  expect(matrix).toHaveLength(rows);
  expect(matrix[0]).toHaveLength(cols);
  expect(matrix.flat().every(val => val === 1)).toBe(true);
});

test('vectorAdd should add vectors correctly', () => {
  const vec1 = [1, 2, 3];
  const vec2 = [4, 5, 6];
  const result = vectorAdd(vec1, vec2);
  
  expect(result).toEqual([5, 7, 9]);
});

test('vectorScale should scale vector correctly', () => {
  const vec = [1, 2, 3];
  const result = vectorScale(vec, 2);
  
  expect(result).toEqual([2, 4, 6]);
});

test('matrixMultiply should multiply matrices correctly', () => {
  const mat1 = [[1, 2], [3, 4]];
  const mat2 = [[5, 6], [7, 8]];
  const result = matrixMultiply(mat1, mat2);
  
  expect(result).toEqual([[19, 22], [43, 50]]);
});
import { xavier, createMatrix } from './math.js';

export function initializeEmbeddings(vocabSize, embeddingDim) {
  return createMatrix(
    vocabSize,
    embeddingDim,
    xavier(vocabSize, embeddingDim)
  );
}

export function initializeAttentionWeights(dim) {
  return {
    query: createMatrix(dim, dim, xavier(dim, dim)),
    key: createMatrix(dim, dim, xavier(dim, dim)),
    value: createMatrix(dim, dim, xavier(dim, dim))
  };
}

export function initializeLayerNorm(dim) {
  return {
    gamma: Array(dim).fill(1),
    beta: Array(dim).fill(0)
  };
}
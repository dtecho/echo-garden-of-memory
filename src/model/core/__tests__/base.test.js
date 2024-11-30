import { expect, test } from 'vitest';
import { BaseModel } from '../base.js';

test('BaseModel should initialize with config', () => {
  const config = { embeddingDim: 100, vocabSize: 1000 };
  const model = new BaseModel(config);
  expect(model.config).toEqual(config);
});

test('BaseModel validation should check required fields', () => {
  const invalidConfig = { embeddingDim: 100 };
  const model = new BaseModel(invalidConfig);
  expect(() => model.validate()).toThrow('vocabSize is required');
});

test('BaseModel should save with timestamp', () => {
  const config = { embeddingDim: 100, vocabSize: 1000 };
  const model = new BaseModel(config);
  const saved = model.save();
  
  expect(saved.config).toEqual(config);
  expect(saved.timestamp).toBeDefined();
  expect(new Date(saved.timestamp)).toBeInstanceOf(Date);
});

test('BaseModel should load from saved data', () => {
  const config = { embeddingDim: 100, vocabSize: 1000 };
  const saved = {
    config,
    timestamp: new Date().toISOString()
  };
  
  const loaded = BaseModel.load(saved);
  expect(loaded.config).toEqual(config);
});
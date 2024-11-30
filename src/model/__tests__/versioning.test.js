import { expect, test, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ModelVersionManager } from '../versioning.js';

const TEST_DIR = 'test_models';

beforeEach(() => {
  // Setup test directory
  fs.mkdirSync(TEST_DIR, { recursive: true });
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  // Cleanup test directory
  fs.rmSync(TEST_DIR, { recursive: true });
});

test('ModelVersionManager should initialize versions file', () => {
  const manager = new ModelVersionManager();
  expect(fs.existsSync(manager.versionsFile)).toBe(true);
  
  const versions = JSON.parse(
    fs.readFileSync(manager.versionsFile, 'utf-8')
  );
  expect(versions).toHaveProperty('versions');
  expect(versions).toHaveProperty('currentVersion');
});

test('ModelVersionManager should save new version', async () => {
  const manager = new ModelVersionManager();
  
  const mockModel = {
    vocabulary: ['test'],
    embeddings: [[0.1]],
    labels: ['label1']
  };
  
  const mockMetrics = {
    accuracy: 0.8,
    averageLoss: 0.2
  };
  
  const mockConfig = {
    embeddingDim: 100
  };
  
  const version = await manager.saveVersion(
    mockModel,
    mockMetrics,
    mockConfig
  );
  
  expect(version.version).toBe(1);
  expect(version).toHaveProperty('timestamp');
  expect(version).toHaveProperty('modelFile');
  
  const modelPath = path.join(
    manager.config.data.modelsDir,
    version.modelFile
  );
  expect(fs.existsSync(modelPath)).toBe(true);
});

test('ModelVersionManager should load specific version', async () => {
  const manager = new ModelVersionManager();
  
  // Save two versions
  const mockModel1 = { version: 1 };
  const mockModel2 = { version: 2 };
  
  await manager.saveVersion(
    mockModel1,
    { accuracy: 0.7 },
    {}
  );
  
  await manager.saveVersion(
    mockModel2,
    { accuracy: 0.8 },
    {}
  );
  
  const loaded = await manager.loadVersion(1);
  expect(loaded.model).toEqual(mockModel1);
});

test('ModelVersionManager should compare versions', async () => {
  const manager = new ModelVersionManager();
  
  await manager.saveVersion(
    { version: 1 },
    { accuracy: 0.7, averageLoss: 0.3 },
    {}
  );
  
  await manager.saveVersion(
    { version: 2 },
    { accuracy: 0.8, averageLoss: 0.2 },
    {}
  );
  
  const comparison = await manager.compareVersions(1, 2);
  expect(comparison.accuracyDiff).toBe(0.1);
  expect(comparison.lossDiff).toBe(-0.1);
});
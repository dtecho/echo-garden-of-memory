import { expect, test, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ModelSerializer } from '../serializer.js';

const TEST_DIR = 'test_models';

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true });
});

test('ModelSerializer should save model correctly', async () => {
  const serializer = new ModelSerializer({
    data: { modelsDir: TEST_DIR }
  });

  const mockModel = {
    config: { embeddingDim: 100 },
    embedding: { embeddings: [[0.1]] },
    attention: {
      queryWeight: [[0.1]],
      keyWeight: [[0.1]],
      valueWeight: [[0.1]]
    },
    normalization: { layerNorm: { gamma: [1], beta: [0] } },
    prediction: { labels: ['A', 'B'] }
  };

  const filepath = await serializer.saveModel(mockModel, 1, { accuracy: 0.8 });
  expect(fs.existsSync(filepath)).toBe(true);
});

test('ModelSerializer should load model correctly', async () => {
  const serializer = new ModelSerializer({
    data: { modelsDir: TEST_DIR }
  });

  const mockModel = {
    version: 1,
    config: { embeddingDim: 100 }
  };

  fs.writeFileSync(
    path.join(TEST_DIR, 'model_v1.json'),
    JSON.stringify(mockModel)
  );

  const loaded = await serializer.loadModel(1);
  expect(loaded.version).toBe(1);
  expect(loaded.config.embeddingDim).toBe(100);
});

test('ModelSerializer should list versions', async () => {
  const serializer = new ModelSerializer({
    data: { modelsDir: TEST_DIR }
  });

  const models = [
    { version: 1, timestamp: '2024-01-01', metrics: { accuracy: 0.8 } },
    { version: 2, timestamp: '2024-01-02', metrics: { accuracy: 0.9 } }
  ];

  for (const model of models) {
    fs.writeFileSync(
      path.join(TEST_DIR, `model_v${model.version}.json`),
      JSON.stringify(model)
    );
  }

  const versions = await serializer.listVersions();
  expect(versions).toHaveLength(2);
  expect(versions[0].version).toBe(2);
});

test('ModelSerializer should delete version', async () => {
  const serializer = new ModelSerializer({
    data: { modelsDir: TEST_DIR }
  });

  const filepath = path.join(TEST_DIR, 'model_v1.json');
  fs.writeFileSync(filepath, '{}');

  await serializer.deleteVersion(1);
  expect(fs.existsSync(filepath)).toBe(false);
});
import { expect, test, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { VersionManager } from '../versioning.js';

const TEST_DIR = 'test_models';

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true });
});

test('VersionManager should initialize versions file', () => {
  const manager = new VersionManager({
    data: { modelsDir: TEST_DIR }
  });

  const versionsFile = path.join(TEST_DIR, 'versions.json');
  expect(fs.existsSync(versionsFile)).toBe(true);
});

test('VersionManager should add new version', async () => {
  const manager = new VersionManager({
    data: { modelsDir: TEST_DIR }
  });

  await manager.addVersion(1, { accuracy: 0.8 }, {});
  const versions = manager.loadVersions();

  expect(versions.versions).toHaveLength(1);
  expect(versions.currentVersion).toBe(1);
});

test('VersionManager should compare versions', async () => {
  const manager = new VersionManager({
    data: { modelsDir: TEST_DIR }
  });

  await manager.addVersion(1, { accuracy: 0.7, averageLoss: 0.3 }, {});
  await manager.addVersion(2, { accuracy: 0.8, averageLoss: 0.2 }, {});

  const comparison = await manager.compareVersions(1, 2);
  expect(comparison.accuracyDiff).toBe(0.1);
  expect(comparison.lossDiff).toBe(-0.1);
});

test('VersionManager should prune old versions', async () => {
  const manager = new VersionManager({
    data: { modelsDir: TEST_DIR }
  });

  // Add 6 versions
  for (let i = 1; i <= 6; i++) {
    await manager.addVersion(i, { accuracy: 0.8 }, {});
    fs.writeFileSync(
      path.join(TEST_DIR, `model_v${i}.json`),
      '{}'
    );
  }

  await manager.pruneOldVersions(3);
  const versions = manager.loadVersions();

  expect(versions.versions).toHaveLength(3);
  expect(fs.readdirSync(TEST_DIR).filter(f => f.startsWith('model_v')))
    .toHaveLength(3);
});
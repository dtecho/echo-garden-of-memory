import { expect, test, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CheckpointManager } from '../checkpoint.js';

const TEST_DIR = 'test_checkpoints';

beforeEach(() => {
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TEST_DIR, { recursive: true });
});

test('CheckpointManager should save checkpoint correctly', () => {
  const manager = new CheckpointManager(TEST_DIR);
  const model = {
    embeddings: [[1, 2], [3, 4]],
    labels: ['a', 'b']
  };
  
  manager.saveCheckpoint(model, ['word1', 'word2'], 1, { loss: 0.5 });
  
  const files = fs.readdirSync(TEST_DIR);
  expect(files).toHaveLength(1);
  expect(files[0]).toMatch(/checkpoint_epoch_1/);
});

test('CheckpointManager should load latest checkpoint', () => {
  const manager = new CheckpointManager(TEST_DIR);
  
  // Create multiple checkpoints
  const checkpoints = [
    { epoch: 1, data: 'first' },
    { epoch: 2, data: 'second' }
  ];
  
  checkpoints.forEach(cp => {
    fs.writeFileSync(
      path.join(TEST_DIR, `checkpoint_epoch_${cp.epoch}.json`),
      JSON.stringify(cp)
    );
  });
  
  const latest = manager.loadLatestCheckpoint();
  expect(latest.epoch).toBe(2);
});
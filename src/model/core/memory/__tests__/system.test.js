import { expect, test, beforeEach, afterEach } from 'vitest';
import { MemorySystem } from '../system.js';

let system;

beforeEach(() => {
  system = new MemorySystem({
    maintenanceInterval: 1000 // 1 second for testing
  });
});

afterEach(async () => {
  await system.shutdown();
});

test('MemorySystem should store and recall memories', async () => {
  const memory = await system.store(
    'test1',
    { text: 'Hello world' },
    { tags: ['greeting'] }
  );
  
  expect(memory.content.text).toBe('Hello world');
  
  const recalled = await system.recall('test1');
  expect(recalled.memory.content.text).toBe('Hello world');
});

test('MemorySystem should link memories', async () => {
  await system.store('key1', { text: 'First' });
  await system.store('key2', { text: 'Second' });
  
  await system.link('key1', 'key2', 'related');
  
  const related = await system.findRelated('key1');
  expect(related).toHaveLength(1);
  expect(related[0].memory.content.text).toBe('Second');
});

test('MemorySystem should manage context', async () => {
  await system.beginContext({ id: 'test-context' });
  
  await system.store('key1', { text: 'In context' });
  await system.store('key2', { text: 'Also in context' });
  
  const summary = await system.endContext();
  expect(summary.id).toBe('test-context');
  expect(summary.memoryCount).toBe(2);
});

test('MemorySystem should run maintenance', async () => {
  // Store some test data
  await system.store('key1', { text: 'Test 1' });
  await system.store('key2', { text: 'Test 2' });
  
  // Run maintenance
  await system.runMaintenance();
  
  // Check system status
  const status = system.getStatus();
  expect(status.initialized).toBe(true);
  expect(status.stats.storeSize).toBeGreaterThan(0);
});

test('MemorySystem should handle errors gracefully', async () => {
  // Try to recall non-existent memory
  const result = await system.recall('nonexistent');
  expect(result).toBeNull();
  
  // Try to link non-existent memories
  await expect(
    system.link('nonexistent1', 'nonexistent2', 'related')
  ).rejects.toThrow();
});
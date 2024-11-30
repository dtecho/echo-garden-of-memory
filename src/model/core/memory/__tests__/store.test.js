import { expect, test } from 'vitest';
import { MemoryStore } from '../store.js';

test('MemoryStore should store and recall memories', async () => {
  const store = new MemoryStore({ consolidationThreshold: 3 });
  
  const memory = { text: 'test memory' };
  const context = { tags: ['test'] };
  
  await store.store('key1', memory, context);
  const recalled = await store.recall('key1');
  
  expect(recalled.content).toEqual(memory);
  expect(recalled.context).toEqual(context);
  expect(recalled.accessCount).toBe(1);
});

test('MemoryStore should build associations', async () => {
  const store = new MemoryStore({});
  
  await store.store('key1', { text: 'memory 1' }, { tags: ['tag1', 'tag2'] });
  await store.store('key2', { text: 'memory 2' }, { tags: ['tag2', 'tag3'] });
  
  const similar = await store.findSimilar('key1');
  expect(similar).toHaveLength(1);
  expect(similar[0].content.text).toBe('memory 2');
});

test('MemoryStore should consolidate frequently accessed memories', async () => {
  const store = new MemoryStore({ consolidationThreshold: 2 });
  
  await store.store('key1', { text: 'test' });
  
  // Access multiple times
  await store.recall('key1');
  await store.recall('key1');
  
  expect(store.shortTerm.has('key1')).toBe(false);
  expect(store.longTerm.has('key1')).toBe(true);
});

test('MemoryStore should prune old memories', async () => {
  const store = new MemoryStore({});
  
  await store.store('key1', { text: 'old' });
  store.lastAccess.set('key1', Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
  
  await store.prune();
  
  expect(store.shortTerm.has('key1')).toBe(false);
  expect(store.lastAccess.has('key1')).toBe(false);
});
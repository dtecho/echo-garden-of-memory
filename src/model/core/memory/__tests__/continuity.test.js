import { expect, test } from 'vitest';
import { ContinuityManager } from '../continuity.js';

test('ContinuityManager should manage context', async () => {
  const manager = new ContinuityManager({});
  
  await manager.beginContext({ id: 'test-context' });
  
  await manager.recordMemory('key1', { text: 'memory 1' }, ['tag1']);
  await manager.recordMemory('key2', { text: 'memory 2' }, ['tag2']);
  
  const context = await manager.synthesizeContext();
  expect(context.id).toBe('test-context');
  expect(context.memoryCount).toBe(2);
});

test('ContinuityManager should link memories', async () => {
  const manager = new ContinuityManager({});
  
  await manager.beginContext({ id: 'test' });
  
  await manager.recordMemory('key1', { text: 'source' });
  await manager.recordMemory('key2', { text: 'target' });
  
  await manager.linkMemories('key1', 'key2', 'references');
  
  const memories = await manager.findContextualMemories('test');
  expect(memories).toHaveLength(2);
});

test('ContinuityManager should find contextual memories', async () => {
  const manager = new ContinuityManager({});
  
  await manager.beginContext({ id: 'context1' });
  await manager.recordMemory('key1', { text: 'memory 1' });
  
  await manager.beginContext({ id: 'context2' });
  await manager.recordMemory('key2', { text: 'memory 2' });
  
  const memories1 = await manager.findContextualMemories('context1');
  const memories2 = await manager.findContextualMemories('context2');
  
  expect(memories1).toHaveLength(1);
  expect(memories2).toHaveLength(1);
  expect(memories1[0].content.text).toBe('memory 1');
  expect(memories2[0].content.text).toBe('memory 2');
});

test('ContinuityManager should summarize memories', async () => {
  const manager = new ContinuityManager({});
  
  await manager.beginContext({ id: 'test' });
  
  await manager.recordMemory('key1', { text: 'memory 1' }, ['topic:A']);
  await manager.recordMemory('key2', { text: 'memory 2' }, ['topic:A']);
  await manager.recordMemory('key3', { text: 'memory 3' }, ['topic:B']);
  
  const context = await manager.synthesizeContext();
  expect(context.summary).toHaveLength(2); // Two topics
  expect(context.summary[0].count).toBe(2); // Two memories in topic A
});
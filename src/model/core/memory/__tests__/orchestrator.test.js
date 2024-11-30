import { expect, test } from 'vitest';
import { MemoryOrchestrator } from '../orchestrator.js';

test('MemoryOrchestrator should store and recall memories', async () => {
  const orchestrator = new MemoryOrchestrator({
    consolidationThreshold: 2
  });
  
  const memory = await orchestrator.storeMemory(
    'key1',
    { text: 'test memory' },
    { tags: ['test'] }
  );
  
  expect(memory.content.text).toBe('test memory');
  
  const recalled = await orchestrator.recallMemory('key1');
  expect(recalled.memory.content.text).toBe('test memory');
  expect(recalled.related).toHaveLength(0);
});

test('MemoryOrchestrator should find related memories', async () => {
  const orchestrator = new MemoryOrchestrator({});
  
  await orchestrator.storeMemory('key1', { text: 'memory 1' }, { tags: ['tag1'] });
  await orchestrator.storeMemory('key2', { text: 'memory 2' }, { tags: ['tag1'] });
  
  await orchestrator.linkMemories('key1', 'key2', 'related');
  
  const related = await orchestrator.findRelatedMemories('key1');
  expect(related).toHaveLength(1);
  expect(related[0].memory.content.text).toBe('memory 2');
});

test('MemoryOrchestrator should manage context', async () => {
  const orchestrator = new MemoryOrchestrator({});
  
  await orchestrator.beginContext({ id: 'test-context' });
  
  await orchestrator.storeMemory('key1', { text: 'memory 1' });
  await orchestrator.storeMemory('key2', { text: 'memory 2' });
  
  const context = await orchestrator.synthesizeContext();
  expect(context.id).toBe('test-context');
  expect(context.memoryCount).toBe(2);
});

test('MemoryOrchestrator should maintain memory system', async () => {
  const orchestrator = new MemoryOrchestrator({});
  
  // Create some test data
  await orchestrator.storeMemory('key1', { text: 'memory 1' });
  await orchestrator.storeMemory('key2', { text: 'memory 2' });
  await orchestrator.linkMemories('key1', 'key2', 'related');
  
  // Run maintenance
  await orchestrator.maintain();
  
  // Verify system state
  const recalled = await orchestrator.recallMemory('key1');
  expect(recalled).toBeDefined();
});
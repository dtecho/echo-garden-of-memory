import { expect, test } from 'vitest';
import { MemoryNetwork } from '../network.js';

test('MemoryNetwork should add and connect nodes', () => {
  const network = new MemoryNetwork({});
  
  network.addNode('key1', { content: 'memory1' });
  network.addNode('key2', { content: 'memory2' });
  
  const edge = network.addEdge('key1', 'key2', 'related');
  
  expect(network.nodes.size).toBe(2);
  expect(network.edges.size).toBe(1);
  expect(edge.source).toBe('key1');
  expect(edge.target).toBe('key2');
});

test('MemoryNetwork should strengthen connections', () => {
  const network = new MemoryNetwork({});
  
  network.addNode('key1', { content: 'memory1' });
  network.addNode('key2', { content: 'memory2' });
  network.addEdge('key1', 'key2', 'related');
  
  const originalStrength = network.nodes.get('key1').strength;
  network.strengthenConnections('key1');
  
  expect(network.nodes.get('key1').strength)
    .toBeGreaterThan(originalStrength);
});

test('MemoryNetwork should find related memories', () => {
  const network = new MemoryNetwork({});
  
  network.addNode('key1', { content: 'memory1' });
  network.addNode('key2', { content: 'memory2' });
  network.addNode('key3', { content: 'memory3' });
  
  network.addEdge('key1', 'key2', 'related', 0.8);
  network.addEdge('key1', 'key3', 'different', 0.6);
  
  const related = network.findRelated('key1', 'related');
  expect(related).toHaveLength(1);
  expect(related[0].key).toBe('key2');
});

test('MemoryNetwork should detect memory clusters', () => {
  const network = new MemoryNetwork({});
  
  // Create a cluster
  network.addNode('key1', { content: 'memory1', associations: new Set(['tag1']) });
  network.addNode('key2', { content: 'memory2', associations: new Set(['tag1']) });
  network.addNode('key3', { content: 'memory3', associations: new Set(['tag2']) });
  
  network.addEdge('key1', 'key2', 'related', 0.8);
  network.addEdge('key2', 'key3', 'related', 0.8);
  
  const clusters = network.detectClusters();
  expect(clusters.size).toBe(1);
  
  const firstCluster = clusters.get('cluster_0');
  expect(firstCluster.size).toBe(3);
});

test('MemoryNetwork should prune weak connections', () => {
  const network = new MemoryNetwork({});
  
  network.addNode('key1', { content: 'memory1' });
  network.addNode('key2', { content: 'memory2' });
  
  const edge = network.addEdge('key1', 'key2', 'related', 0.05);
  network.pruneWeakConnections();
  
  expect(network.edges.size).toBe(0);
  expect(network.nodes.get('key1').connections.size).toBe(0);
});
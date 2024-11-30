import { expect, test } from 'vitest';
import { EchoManager } from '../echo.js';

test('EchoManager should create and find echoes', () => {
  const manager = new EchoManager();
  
  const memory = {
    key: 'mem1',
    content: { text: 'test' },
    context: { source: 'test' },
    associations: new Set(['tag1', 'tag2'])
  };
  
  const echo = manager.createEcho(memory);
  expect(echo.original).toBe(memory.key);
  expect(echo.strength).toBe(1.0);
  
  const found = manager.findEchoes(memory);
  expect(found).toHaveLength(1);
  expect(found[0].key).toBe(echo.key);
});

test('EchoManager should reinforce echoes', () => {
  const manager = new EchoManager();
  
  const memory = {
    key: 'mem1',
    content: { text: 'test' },
    associations: new Set(['tag1'])
  };
  
  const echo = manager.createEcho(memory);
  const originalStrength = echo.strength;
  
  manager.reinforceEcho(echo.key);
  expect(echo.strength).toBeGreaterThan(originalStrength);
});

test('EchoManager should merge echoes', () => {
  const manager = new EchoManager();
  
  const echoes = [
    {
      content: { a: 1 },
      associations: new Set(['tag1']),
      strength: 0.8
    },
    {
      content: { b: 2 },
      associations: new Set(['tag2']),
      strength: 0.6
    }
  ];
  
  const merged = manager.mergeEchoes(echoes);
  expect(merged.content).toHaveProperty('a', 1);
  expect(merged.content).toHaveProperty('b', 2);
  expect(merged.associations.size).toBe(2);
  expect(merged.strength).toBe(0.7);
});

test('EchoManager should prune old echoes', () => {
  const manager = new EchoManager();
  
  const memory = {
    key: 'mem1',
    content: { text: 'test' },
    associations: new Set(['tag1'])
  };
  
  const echo = manager.createEcho(memory);
  echo.timestamp = new Date(
    Date.now() - 31 * 24 * 60 * 60 * 1000
  ).toISOString(); // 31 days old
  
  manager.pruneEchoes();
  expect(manager.echoes.has(echo.key)).toBe(false);
});
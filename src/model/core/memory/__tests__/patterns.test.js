import { expect, test } from 'vitest';
import { PatternDetector } from '../patterns.js';

test('PatternDetector should detect tag co-occurrences', () => {
  const detector = new PatternDetector();
  
  const memories = [
    { associations: new Set(['A', 'B']) },
    { associations: new Set(['B', 'C']) },
    { associations: new Set(['A', 'B']) }
  ];
  
  const patterns = detector.detectPatterns(memories);
  expect(patterns.get('A:B')).toBeGreaterThan(patterns.get('B:C'));
});

test('PatternDetector should update pattern strengths', () => {
  const detector = new PatternDetector();
  
  const newPatterns = new Map([
    ['A:B', 0.8],
    ['B:C', 0.6]
  ]);
  
  detector.updatePatterns(newPatterns);
  expect(detector.patterns.get('A:B')).toBe(0.8);
});

test('PatternDetector should find related patterns', () => {
  const detector = new PatternDetector();
  
  detector.patterns.set('A:B', 0.8);
  detector.patterns.set('B:C', 0.6);
  detector.patterns.set('D:E', 0.7);
  
  const related = detector.findRelatedPatterns(['A']);
  expect(related.has('A:B')).toBe(true);
  expect(related.has('D:E')).toBe(false);
});

test('PatternDetector should get strongest patterns', () => {
  const detector = new PatternDetector();
  
  detector.patterns.set('A:B', 0.8);
  detector.patterns.set('B:C', 0.6);
  detector.patterns.set('C:D', 0.9);
  
  const strongest = detector.getStrongestPatterns(2);
  expect(strongest).toHaveLength(2);
  expect(strongest[0][0]).toBe('C:D');
});
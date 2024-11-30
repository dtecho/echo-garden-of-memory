import { expect, test } from 'vitest';
import { tokenize, createVocabulary, encodeTokens } from '../tokenizer.js';

test('tokenize should split text into lowercase tokens', () => {
  const input = 'Hello World!';
  const expected = ['hello', 'world'];
  expect(tokenize(input)).toEqual(expected);
});

test('tokenize should handle empty strings', () => {
  expect(tokenize('')).toEqual([]);
});

test('tokenize should remove punctuation', () => {
  const input = 'Hello, World! How are you?';
  const expected = ['hello', 'world', 'how', 'are', 'you'];
  expect(tokenize(input)).toEqual(expected);
});

test('createVocabulary should create unique token list', () => {
  const tokens = ['hello', 'world', 'hello', 'there'];
  const expected = ['hello', 'world', 'there'];
  expect(createVocabulary(tokens)).toEqual(expected);
});

test('encodeTokens should convert tokens to indices', () => {
  const vocabulary = ['hello', 'world', 'there'];
  const tokens = ['hello', 'there'];
  const expected = [0, 2];
  expect(encodeTokens(tokens, vocabulary)).toEqual(expected);
});

test('encodeTokens should handle unknown tokens', () => {
  const vocabulary = ['hello', 'world'];
  const tokens = ['hello', 'unknown'];
  const encoded = encodeTokens(tokens, vocabulary);
  expect(encoded).toEqual([0]);
});
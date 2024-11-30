import { expect, test, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { DataPreprocessor } from '../preprocessor.js';

let preprocessor;
const testDir = 'test_data';
const rawDir = path.join(testDir, 'raw');
const processedDir = path.join(testDir, 'processed');

beforeEach(() => {
  // Create test directories
  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync(processedDir, { recursive: true });
  
  preprocessor = new DataPreprocessor();
  preprocessor.rawDir = rawDir;
  preprocessor.processedDir = processedDir;
});

afterEach(() => {
  // Clean up test directories
  fs.rmSync(testDir, { recursive: true, force: true });
});

test('readInputFile should parse CSV correctly', async () => {
  const testFile = path.join(rawDir, 'test.csv');
  const content = 'text,label\nhello world,greeting\nbye now,farewell';
  
  fs.writeFileSync(testFile, content);
  
  const data = await preprocessor.readInputFile(testFile);
  expect(data).toEqual([
    { text: 'hello world', label: 'greeting' },
    { text: 'bye now', label: 'farewell' }
  ]);
});

test('processData should tokenize text correctly', async () => {
  const input = [
    { text: 'hello world', label: 'greeting' }
  ];
  
  const processed = await preprocessor.processData(input);
  expect(processed[0]).toEqual({
    original: 'hello world',
    tokens: ['hello', 'world'],
    label: 'greeting'
  });
});

test('saveProcessedData should create valid JSON', async () => {
  const data = [{
    original: 'hello world',
    tokens: ['hello', 'world'],
    label: 'greeting'
  }];
  
  const outputFile = path.join(processedDir, 'output.json');
  await preprocessor.saveProcessedData(outputFile, data);
  
  const saved = JSON.parse(
    fs.readFileSync(outputFile, 'utf-8')
  );
  expect(saved).toEqual(data);
});

test('validateData should check required fields', async () => {
  const validData = [{
    original: 'hello world',
    tokens: ['hello', 'world'],
    label: 'greeting'
  }];
  
  expect(await preprocessor.validateData(validData)).toBe(true);
  
  const invalidData = [{
    original: 'hello world',
    // missing tokens
    label: 'greeting'
  }];
  
  await expect(preprocessor.validateData(invalidData))
    .rejects
    .toThrow('Missing required field');
});

test('preprocessFile should handle complete workflow', async () => {
  const inputFile = path.join(rawDir, 'input.csv');
  const content = 'text,label\nhello world,greeting';
  fs.writeFileSync(inputFile, content);
  
  const result = await preprocessor.preprocessFile('input.csv');
  
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    original: 'hello world',
    tokens: ['hello', 'world'],
    label: 'greeting'
  });
  
  const outputFile = path.join(
    processedDir,
    'input.json'
  );
  expect(fs.existsSync(outputFile)).toBe(true);
});
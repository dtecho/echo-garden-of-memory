import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { tokenize } from '../utils/tokenizer.js';

const INPUT_FILE = 'data/raw/vocabulary.csv';
const OUTPUT_FILE = 'data/processed/tokens.json';

async function prepareData() {
  // Create directories if they don't exist
  const dirs = ['data/raw', 'data/processed', 'models'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Move sample.csv to correct location if it exists
  if (fs.existsSync('src/data/sample.csv')) {
    fs.copyFileSync('src/data/sample.csv', INPUT_FILE);
  }

  const vocabulary = [];
  
  fs.createReadStream(INPUT_FILE)
    .pipe(csv())
    .on('data', (row) => {
      const tokens = tokenize(row.text);
      vocabulary.push({
        original: row.text,
        tokens,
        label: row.label
      });
    })
    .on('end', () => {
      fs.writeFileSync(
        OUTPUT_FILE,
        JSON.stringify(vocabulary, null, 2)
      );
      console.log('Data preparation completed');
    })
    .on('error', (error) => {
      console.error('Error processing data:', error);
    });
}

prepareData();
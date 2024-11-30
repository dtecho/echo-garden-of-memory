import fs from 'fs';
import path from 'path';
import { tokenize } from '../utils/tokenizer.js';
import { getConfig } from '../utils/config.js';
import logger from '../utils/logger.js';

const config = getConfig();

export class DataPreprocessor {
  constructor() {
    this.rawDir = config.data.rawDir;
    this.processedDir = config.data.processedDir;
  }

  async preprocessFile(filename) {
    logger.info(`Starting preprocessing of file: ${filename}`);
    
    const inputPath = path.join(this.rawDir, filename);
    const outputPath = path.join(
      this.processedDir, 
      filename.replace('.csv', '.json')
    );

    try {
      const data = await this.readInputFile(inputPath);
      const processed = await this.processData(data);
      await this.saveProcessedData(outputPath, processed);
      
      logger.info(`Successfully preprocessed ${filename}`);
      return processed;
    } catch (error) {
      logger.error(`Error preprocessing ${filename}:`, error);
      throw error;
    }
  }

  async readInputFile(filepath) {
    const content = await fs.promises.readFile(filepath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Skip header
    const [header, ...dataLines] = lines;
    const [textField, labelField] = header.split(',');

    return dataLines.map(line => {
      const [text, label] = line.split(',');
      return { text: text.trim(), label: label.trim() };
    });
  }

  async processData(data) {
    return data.map(item => ({
      original: item.text,
      tokens: tokenize(item.text),
      label: item.label
    }));
  }

  async saveProcessedData(filepath, data) {
    const dirPath = path.dirname(filepath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.writeFile(
      filepath,
      JSON.stringify(data, null, 2)
    );
  }

  async validateData(data) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    const requiredFields = ['original', 'tokens', 'label'];
    
    data.forEach((item, index) => {
      requiredFields.forEach(field => {
        if (!item[field]) {
          throw new Error(
            `Missing required field "${field}" at index ${index}`
          );
        }
      });

      if (!Array.isArray(item.tokens)) {
        throw new Error(
          `Tokens must be an array at index ${index}`
        );
      }
    });

    return true;
  }
}
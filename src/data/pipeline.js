import { DataPreprocessor } from './preprocessor.js';
import { getConfig } from '../utils/config.js';
import logger from '../utils/logger.js';

export async function runPreprocessingPipeline() {
  const config = getConfig();
  const preprocessor = new DataPreprocessor();

  try {
    logger.info('Starting data preprocessing pipeline');

    // Process vocabulary file
    const processed = await preprocessor.preprocessFile('vocabulary.csv');
    
    logger.info(`Processed ${processed.length} examples`);
    
    // Validate processed data
    await preprocessor.validateData(processed);
    
    logger.info('Data preprocessing completed successfully');
    return processed;
  } catch (error) {
    logger.error('Error in preprocessing pipeline:', error);
    throw error;
  }
}

export async function splitDataset(data, validationSplit = 0.2) {
  const config = getConfig();
  
  try {
    logger.info('Splitting dataset into train/validation sets');
    
    // Shuffle data
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    
    const splitIndex = Math.floor(
      data.length * (1 - validationSplit)
    );
    
    const trainData = shuffled.slice(0, splitIndex);
    const validationData = shuffled.slice(splitIndex);
    
    logger.info(
      `Split dataset: ${trainData.length} train, ` +
      `${validationData.length} validation examples`
    );
    
    return { trainData, validationData };
  } catch (error) {
    logger.error('Error splitting dataset:', error);
    throw error;
  }
}
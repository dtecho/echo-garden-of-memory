import config from '../config/default.js';
import logger from './logger.js';

export function validateConfig() {
  const requiredFields = {
    model: ['embeddingDim', 'learningRate', 'batchSize', 'epochs'],
    training: ['checkpointInterval', 'validationSplit', 'earlyStoppingPatience'],
    data: ['rawDir', 'processedDir', 'modelsDir'],
    server: ['port', 'host'],
    logging: ['level', 'format', 'directory']
  };

  for (const [section, fields] of Object.entries(requiredFields)) {
    if (!config[section]) {
      throw new Error(`Missing config section: ${section}`);
    }

    for (const field of fields) {
      if (config[section][field] === undefined) {
        throw new Error(`Missing config field: ${section}.${field}`);
      }
    }
  }

  logger.info('Configuration validated successfully');
  return config;
}

export function getConfig() {
  return validateConfig();
}
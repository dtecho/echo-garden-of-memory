import { MODEL_CONSTANTS, TRAINING_CONSTANTS } from '../constants.js';
import { ConfigError, ValidationError } from '../errors.js';

export function validateModelConfig(config) {
  if (!config.embeddingDim || 
      config.embeddingDim < MODEL_CONSTANTS.MIN_EMBEDDING_DIM ||
      config.embeddingDim > MODEL_CONSTANTS.MAX_EMBEDDING_DIM) {
    throw new ConfigError(
      `Embedding dimension must be between ${MODEL_CONSTANTS.MIN_EMBEDDING_DIM} and ${MODEL_CONSTANTS.MAX_EMBEDDING_DIM}`
    );
  }

  if (!config.vocabSize || config.vocabSize < 1) {
    throw new ConfigError('Vocabulary size must be positive');
  }

  if (config.batchSize &&
      (config.batchSize < MODEL_CONSTANTS.MIN_BATCH_SIZE ||
       config.batchSize > MODEL_CONSTANTS.MAX_BATCH_SIZE)) {
    throw new ConfigError(
      `Batch size must be between ${MODEL_CONSTANTS.MIN_BATCH_SIZE} and ${MODEL_CONSTANTS.MAX_BATCH_SIZE}`
    );
  }

  return config;
}

export function validateTrainingConfig(config) {
  if (config.epochs &&
      (config.epochs < TRAINING_CONSTANTS.MIN_EPOCHS ||
       config.epochs > TRAINING_CONSTANTS.MAX_EPOCHS)) {
    throw new ConfigError(
      `Epochs must be between ${TRAINING_CONSTANTS.MIN_EPOCHS} and ${TRAINING_CONSTANTS.MAX_EPOCHS}`
    );
  }

  if (config.patience &&
      (config.patience < TRAINING_CONSTANTS.MIN_PATIENCE ||
       config.patience > TRAINING_CONSTANTS.MAX_PATIENCE)) {
    throw new ConfigError(
      `Patience must be between ${TRAINING_CONSTANTS.MIN_PATIENCE} and ${TRAINING_CONSTANTS.MAX_PATIENCE}`
    );
  }

  return config;
}

export function validateInput(input) {
  if (!input || typeof input !== 'string') {
    throw new ValidationError('Input must be a non-empty string');
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('Input cannot be empty or only whitespace');
  }

  return trimmed;
}

export function validateBatch(batch) {
  if (!Array.isArray(batch)) {
    throw new ValidationError('Batch must be an array');
  }

  batch.forEach((item, index) => {
    if (!item.tokens || !Array.isArray(item.tokens)) {
      throw new ValidationError(`Invalid tokens in batch item ${index}`);
    }
    if (!item.label) {
      throw new ValidationError(`Missing label in batch item ${index}`);
    }
  });

  return true;
}
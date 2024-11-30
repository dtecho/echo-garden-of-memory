import logger from '../utils/logger.js';

export class ModelValidator {
  validateEmbeddings(model) {
    if (!model.embeddings || !Array.isArray(model.embeddings)) {
      throw new Error('Model must have embeddings array');
    }

    const embeddingDim = model.embeddings[0]?.length;
    if (!embeddingDim) {
      throw new Error('Embeddings must have consistent dimensions');
    }

    const invalidEmbedding = model.embeddings.find(
      emb => !Array.isArray(emb) || emb.length !== embeddingDim
    );

    if (invalidEmbedding) {
      throw new Error('All embeddings must have same dimension');
    }

    return true;
  }

  validateAlignment(model) {
    if (model.vocabulary.length !== model.embeddings.length) {
      throw new Error(
        'Vocabulary size must match number of embeddings'
      );
    }

    return true;
  }

  validatePredictions(predictions, model) {
    const invalidPrediction = predictions.find(
      pred => !model.labels.includes(pred.label)
    );

    if (invalidPrediction) {
      throw new Error(
        `Invalid prediction label: ${invalidPrediction.label}`
      );
    }

    const invalidProbability = predictions.find(
      pred => pred.probability < 0 || pred.probability > 1
    );

    if (invalidProbability) {
      throw new Error(
        'Prediction probabilities must be between 0 and 1'
      );
    }

    return true;
  }

  validateTrainingData(data) {
    if (!Array.isArray(data)) {
      throw new Error('Training data must be an array');
    }

    data.forEach((item, index) => {
      if (!item.tokens || !Array.isArray(item.tokens)) {
        throw new Error(
          `Training example ${index} must have tokens array`
        );
      }

      if (!item.label) {
        throw new Error(
          `Training example ${index} must have a label`
        );
      }
    });

    return true;
  }

  validateModelState(model) {
    this.validateEmbeddings(model);
    this.validateAlignment(model);
    
    if (!model.labels || !Array.isArray(model.labels)) {
      throw new Error('Model must have labels array');
    }

    return true;
  }
}
/**
 * @typedef {Object} ModelConfig
 * @property {number} embeddingDim - Dimension of embeddings
 * @property {number} vocabSize - Size of vocabulary
 * @property {number} [batchSize=32] - Training batch size
 * @property {number} [learningRate=0.01] - Learning rate
 * @property {number} [epochs=10] - Number of training epochs
 * @property {number} [dropoutRate=0.1] - Dropout rate
 * @property {number} [l2Lambda=0.01] - L2 regularization coefficient
 */

/**
 * @typedef {Object} TrainingConfig
 * @property {number} [patience=5] - Early stopping patience
 * @property {number} [minDelta=0.001] - Minimum improvement for early stopping
 * @property {number} [validationSplit=0.2] - Validation data split ratio
 */

/**
 * @typedef {Object} ServerConfig
 * @property {number} port - Server port
 * @property {string} host - Server host
 * @property {string[]} corsOrigins - Allowed CORS origins
 */

export const defaultConfig = {
  model: {
    embeddingDim: 100,
    batchSize: 32,
    learningRate: 0.01,
    epochs: 10,
    dropoutRate: 0.1,
    l2Lambda: 0.01
  },
  training: {
    patience: 5,
    minDelta: 0.001,
    validationSplit: 0.2
  },
  server: {
    port: 3000,
    host: 'localhost',
    corsOrigins: ['http://localhost:3000']
  }
};
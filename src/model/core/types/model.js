/**
 * @typedef {Object} ModelState
 * @property {number[][]} embeddings - Token embeddings matrix
 * @property {Object} attention - Attention weights
 * @property {Object} normalization - Layer normalization parameters
 * @property {string[]} labels - Model labels
 */

/**
 * @typedef {Object} ModelCheckpoint
 * @property {number} epoch - Checkpoint epoch
 * @property {string} timestamp - Checkpoint timestamp
 * @property {ModelState} state - Model state
 * @property {Object} metrics - Training metrics
 */

/**
 * @typedef {Object} ModelVersion
 * @property {number} version - Version number
 * @property {string} timestamp - Version timestamp
 * @property {Object} config - Model configuration
 * @property {Object} metrics - Evaluation metrics
 * @property {string} modelFile - Model file path
 */
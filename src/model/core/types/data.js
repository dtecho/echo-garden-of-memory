/**
 * @typedef {Object} TrainingExample
 * @property {number[]} tokens - Token indices
 * @property {string} label - Example label
 * @property {string} [original] - Original text
 */

/**
 * @typedef {Object} Prediction
 * @property {string} label - Predicted label
 * @property {number} probability - Prediction probability
 */

/**
 * @typedef {Object} ModelOutput
 * @property {number[][]} embeddings - Token embeddings
 * @property {number[][]} contextVectors - Context vectors
 * @property {Prediction[]} predictions - Label predictions
 */

/**
 * @typedef {Object} EvaluationMetrics
 * @property {number} accuracy - Model accuracy
 * @property {number} averageLoss - Average loss
 * @property {Object} labelMetrics - Per-label metrics
 * @property {number} sampleCount - Number of examples
 */
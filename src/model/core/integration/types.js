/**
 * @typedef {Object} PipelineConfig
 * @property {Object} model - Model configuration
 * @property {Object} training - Training configuration
 * @property {Object} evaluation - Evaluation configuration
 */

/**
 * @typedef {Object} PipelineResult
 * @property {Object} trainingResults - Training results
 * @property {Object} evaluationResults - Evaluation results
 * @property {Object} version - Model version info
 */

/**
 * @typedef {Object} DeploymentConfig
 * @property {number} [healthCheckInterval] - Health check interval in ms
 * @property {number} [maxRetries] - Maximum retry attempts
 * @property {number} [timeout] - Request timeout in ms
 */

/**
 * @typedef {Object} DeploymentResult
 * @property {Object} server - Model server instance
 * @property {Object} monitor - Deployment monitor instance
 * @property {number} healthCheckInterval - Health check interval ID
 */
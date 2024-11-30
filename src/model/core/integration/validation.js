import { PipelineError, FactoryError, DeploymentError } from './errors.js';

export function validatePipelineConfig(config) {
  if (!config.model || !config.training) {
    throw new PipelineError('Missing required pipeline configuration');
  }

  if (!config.model.embeddingDim || !config.model.vocabSize) {
    throw new PipelineError('Invalid model configuration');
  }

  return config;
}

export function validateDeploymentConfig(config) {
  if (!config.server || !config.server.port || !config.server.host) {
    throw new DeploymentError('Missing server configuration');
  }

  if (!config.corsOrigins || !Array.isArray(config.corsOrigins)) {
    throw new DeploymentError('Invalid CORS configuration');
  }

  return config;
}

export function validateModelData(data) {
  if (!data || !data.config || !data.embeddings) {
    throw new FactoryError('Invalid model data format');
  }

  return data;
}
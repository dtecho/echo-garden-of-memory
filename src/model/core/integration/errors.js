export class PipelineError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PipelineError';
  }
}

export class FactoryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FactoryError';
  }
}

export class DeploymentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DeploymentError';
  }
}
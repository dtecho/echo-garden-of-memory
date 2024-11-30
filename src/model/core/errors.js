export class ModelError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ModelError';
  }
}

export class ConfigError extends ModelError {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class ValidationError extends ModelError {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TrainingError extends ModelError {
  constructor(message) {
    super(message);
    this.name = 'TrainingError';
  }
}

export class InferenceError extends ModelError {
  constructor(message) {
    super(message);
    this.name = 'InferenceError';
  }
}

export class SerializationError extends ModelError {
  constructor(message) {
    super(message);
    this.name = 'SerializationError';
  }
}
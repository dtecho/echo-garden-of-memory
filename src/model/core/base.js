export class BaseModel {
  constructor(config) {
    this.config = config;
  }

  validate() {
    if (!this.config.embeddingDim) {
      throw new Error('embeddingDim is required');
    }
    if (!this.config.vocabSize) {
      throw new Error('vocabSize is required');
    }
  }

  save() {
    return {
      config: this.config,
      timestamp: new Date().toISOString()
    };
  }

  static load(data) {
    return new BaseModel(data.config);
  }
}
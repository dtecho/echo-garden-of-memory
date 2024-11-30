import { ModelTrainer } from '../training/trainer.js';
import { ModelEvaluator } from '../evaluation/evaluator.js';
import { ModelSerializer } from '../serialization/serializer.js';
import { VersionManager } from '../serialization/versioning.js';
import logger from '../../../utils/logger.js';

export class ModelPipeline {
  constructor(config) {
    this.config = config;
    this.trainer = new ModelTrainer(config);
    this.evaluator = new ModelEvaluator(config);
    this.serializer = new ModelSerializer(config);
    this.versionManager = new VersionManager(config);
  }

  async train(model, trainData, validationData) {
    try {
      // Train model
      const trainingResults = await this.trainer.train(
        model, 
        trainData,
        validationData
      );

      // Evaluate model
      const evaluationResults = this.evaluator.evaluate(
        model,
        validationData || trainData
      );

      // Save model and version
      const version = await this.saveModel(
        model,
        evaluationResults
      );

      return {
        trainingResults,
        evaluationResults,
        version
      };
    } catch (error) {
      logger.error('Model pipeline failed:', error);
      throw error;
    }
  }

  async saveModel(model, metrics) {
    // Get next version number
    const versions = await this.versionManager.loadVersions();
    const nextVersion = versions.versions.length + 1;

    // Save model file
    await this.serializer.saveModel(model, nextVersion, metrics);

    // Add version to registry
    const versionInfo = await this.versionManager.addVersion(
      nextVersion,
      metrics,
      model.config
    );

    // Prune old versions
    await this.versionManager.pruneOldVersions();

    return versionInfo;
  }

  async loadModel(version) {
    const modelData = await this.serializer.loadModel(version);
    return modelData;
  }

  async getLatestModel() {
    const latestVersion = await this.versionManager.getLatestVersion();
    if (!latestVersion) return null;
    return this.loadModel(latestVersion);
  }

  async compareVersions(version1, version2) {
    return this.versionManager.compareVersions(version1, version2);
  }
}
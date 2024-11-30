import { ModelPipeline } from './pipeline.js';
import { ModelFactory } from './factory.js';
import { DeploymentMonitor } from '../deployment/monitor.js';
import logger from '../../../utils/logger.js';

export class ModelOrchestrator {
  constructor(config) {
    this.config = config;
    this.pipeline = new ModelPipeline(config);
    this.factory = new ModelFactory(config);
    this.deployments = new Map();
  }

  async trainAndDeploy(trainData, validationData, deployConfig = {}) {
    try {
      // Create new model
      const model = await this.factory.createModel();

      // Train model
      const { trainingResults, evaluationResults, version } = 
        await this.pipeline.train(model, trainData, validationData);

      // Deploy if metrics are good
      if (evaluationResults.accuracy >= this.config.minDeployAccuracy) {
        const deployment = await this.factory.deployModel(model, deployConfig);
        this.deployments.set(version.version, deployment);

        logger.info(`Deployed model version ${version.version}`);
        return { model, trainingResults, evaluationResults, version, deployment };
      }

      logger.warn('Model accuracy below deployment threshold');
      return { model, trainingResults, evaluationResults, version };

    } catch (error) {
      logger.error('Training and deployment failed:', error);
      throw error;
    }
  }

  async rollback(toVersion) {
    try {
      // Load previous version
      const model = await this.factory.loadExistingModel(toVersion);
      
      // Deploy rollback version
      const deployment = await this.factory.deployModel(model);
      this.deployments.set(toVersion, deployment);

      logger.info(`Rolled back to version ${toVersion}`);
      return { model, deployment };

    } catch (error) {
      logger.error('Rollback failed:', error);
      throw error;
    }
  }

  async stopDeployment(version) {
    const deployment = this.deployments.get(version);
    if (!deployment) return;

    clearInterval(deployment.healthCheckInterval);
    this.deployments.delete(version);
    logger.info(`Stopped deployment of version ${version}`);
  }

  getDeploymentStatus(version) {
    const deployment = this.deployments.get(version);
    if (!deployment) return null;

    return {
      version,
      health: deployment.monitor.checkHealth(),
      metrics: deployment.monitor.getMetrics()
    };
  }

  async cleanup() {
    // Stop all deployments
    for (const [version, deployment] of this.deployments) {
      await this.stopDeployment(version);
    }

    // Prune old model versions
    await this.pipeline.versionManager.pruneOldVersions();
  }
}
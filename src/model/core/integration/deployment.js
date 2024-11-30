import { ModelServer } from '../deployment/server.js';
import { DeploymentMonitor } from '../deployment/monitor.js';
import { validateDeploymentConfig } from './validation.js';
import { DeploymentError } from './errors.js';
import logger from '../../../utils/logger.js';

export class DeploymentManager {
  constructor(config) {
    this.config = validateDeploymentConfig(config);
    this.deployments = new Map();
    this.healthChecks = new Map();
  }

  async deploy(model, version, options = {}) {
    try {
      const server = new ModelServer(this.config);
      const monitor = new DeploymentMonitor(this.config);

      server.setModel(model);

      // Add monitoring middleware
      server.app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
          const duration = Date.now() - start;
          monitor.recordRequest(duration);
          
          if (res.statusCode >= 400) {
            monitor.recordError(new Error(`HTTP ${res.statusCode}`));
          }
        });
        next();
      });

      // Start server
      server.start();

      // Setup health checks
      const healthCheckInterval = setInterval(() => {
        const health = monitor.checkHealth();
        if (!health.healthy) {
          logger.warn('Unhealthy deployment:', {
            version,
            metrics: health.metrics
          });
        }
      }, options.healthCheckInterval || 60000);

      const deployment = { server, monitor, healthCheckInterval };
      this.deployments.set(version, deployment);
      this.healthChecks.set(version, healthCheckInterval);

      logger.info(`Deployed model version ${version}`);
      return deployment;

    } catch (error) {
      logger.error('Deployment failed:', error);
      throw new DeploymentError(`Failed to deploy version ${version}: ${error.message}`);
    }
  }

  async stop(version) {
    const deployment = this.deployments.get(version);
    if (!deployment) {
      throw new DeploymentError(`No deployment found for version ${version}`);
    }

    // Clear health check interval
    clearInterval(this.healthChecks.get(version));
    this.healthChecks.delete(version);

    // Stop server
    await new Promise(resolve => deployment.server.app.close(resolve));
    
    this.deployments.delete(version);
    logger.info(`Stopped deployment of version ${version}`);
  }

  async stopAll() {
    const versions = Array.from(this.deployments.keys());
    await Promise.all(versions.map(version => this.stop(version)));
  }

  getStatus(version) {
    const deployment = this.deployments.get(version);
    if (!deployment) return null;

    const health = deployment.monitor.checkHealth();
    const metrics = deployment.monitor.getMetrics();

    return {
      version,
      status: health.healthy ? 'healthy' : 'unhealthy',
      health,
      metrics,
      uptime: process.uptime()
    };
  }

  getAllStatuses() {
    return Array.from(this.deployments.keys()).map(version => 
      this.getStatus(version)
    );
  }
}
import { CompositeLanguageModel } from '../composite.js';
import { ModelPipeline } from './pipeline.js';
import { ModelServer } from '../deployment/server.js';
import { DeploymentMonitor } from '../deployment/monitor.js';
import logger from '../../../utils/logger.js';

export class ModelFactory {
  constructor(config) {
    this.config = config;
    this.pipeline = new ModelPipeline(config);
  }

  async createModel(options = {}) {
    const modelConfig = {
      ...this.config,
      ...options
    };

    const model = new CompositeLanguageModel(modelConfig);
    logger.info('Created new model instance');
    return model;
  }

  async loadExistingModel(version) {
    const modelData = await this.pipeline.loadModel(version);
    const model = await this.createModel(modelData.config);
    return CompositeLanguageModel.load(modelData);
  }

  async createServer(model) {
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

    return {
      server,
      monitor
    };
  }

  async deployModel(model, options = {}) {
    const { server, monitor } = await this.createServer(model);
    
    server.start();
    
    // Start health checks
    const healthCheckInterval = setInterval(() => {
      const health = monitor.checkHealth();
      if (!health.healthy) {
        logger.warn('Unhealthy deployment metrics:', health.metrics);
      }
    }, options.healthCheckInterval || 60000);

    return {
      server,
      monitor,
      healthCheckInterval
    };
  }
}
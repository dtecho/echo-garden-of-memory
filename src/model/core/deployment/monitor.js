import logger from '../../../utils/logger.js';

export class DeploymentMonitor {
  constructor(config) {
    this.config = config;
    this.metrics = {
      requests: 0,
      errors: 0,
      latencies: [],
      lastError: null
    };
  }

  recordRequest(duration) {
    this.metrics.requests++;
    this.metrics.latencies.push(duration);
    
    // Keep only recent latencies
    if (this.metrics.latencies.length > 1000) {
      this.metrics.latencies.shift();
    }
  }

  recordError(error) {
    this.metrics.errors++;
    this.metrics.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }

  getMetrics() {
    const latencies = this.metrics.latencies;
    const avgLatency = latencies.length > 0 ?
      latencies.reduce((sum, val) => sum + val, 0) / latencies.length : 0;

    return {
      totalRequests: this.metrics.requests,
      errorRate: this.metrics.errors / this.metrics.requests || 0,
      averageLatency: avgLatency,
      lastError: this.metrics.lastError
    };
  }

  checkHealth() {
    const metrics = this.getMetrics();
    const healthy = metrics.errorRate < 0.1 && metrics.averageLatency < 1000;

    if (!healthy) {
      logger.warn('Unhealthy deployment metrics:', metrics);
    }

    return {
      healthy,
      metrics
    };
  }

  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      latencies: [],
      lastError: null
    };
  }
}
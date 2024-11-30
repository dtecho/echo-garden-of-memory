import { expect, test } from 'vitest';
import { DeploymentMonitor } from '../monitor.js';

test('DeploymentMonitor should track requests', () => {
  const monitor = new DeploymentMonitor({});
  
  monitor.recordRequest(100);
  monitor.recordRequest(200);
  
  const metrics = monitor.getMetrics();
  expect(metrics.totalRequests).toBe(2);
  expect(metrics.averageLatency).toBe(150);
});

test('DeploymentMonitor should track errors', () => {
  const monitor = new DeploymentMonitor({});
  
  monitor.recordRequest(100);
  monitor.recordError(new Error('Test error'));
  
  const metrics = monitor.getMetrics();
  expect(metrics.errorRate).toBe(1);
  expect(metrics.lastError).toBeDefined();
  expect(metrics.lastError.message).toBe('Test error');
});

test('DeploymentMonitor should check health', () => {
  const monitor = new DeploymentMonitor({});
  
  // Healthy case
  monitor.recordRequest(100);
  let health = monitor.checkHealth();
  expect(health.healthy).toBe(true);
  
  // Unhealthy case
  monitor.recordRequest(2000);
  monitor.recordError(new Error('Error'));
  health = monitor.checkHealth();
  expect(health.healthy).toBe(false);
});

test('DeploymentMonitor should reset metrics', () => {
  const monitor = new DeploymentMonitor({});
  
  monitor.recordRequest(100);
  monitor.recordError(new Error('Test error'));
  monitor.reset();
  
  const metrics = monitor.getMetrics();
  expect(metrics.totalRequests).toBe(0);
  expect(metrics.errorRate).toBe(0);
  expect(metrics.averageLatency).toBe(0);
});
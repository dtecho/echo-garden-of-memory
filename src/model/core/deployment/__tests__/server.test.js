import { expect, test } from 'vitest';
import request from 'supertest';
import { ModelServer } from '../server.js';
import { CompositeLanguageModel } from '../../composite.js';

test('ModelServer should handle status request', async () => {
  const config = {
    batchSize: 32,
    cacheSize: 1000,
    corsOrigins: ['http://localhost:3000'],
    server: { port: 3000, host: 'localhost' }
  };

  const server = new ModelServer(config);
  const response = await request(server.app).get('/status');
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('status', 'ready');
  expect(response.body).toHaveProperty('config');
  expect(response.body).toHaveProperty('cache');
});

test('ModelServer should handle prediction request', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10,
    batchSize: 32,
    cacheSize: 1000,
    corsOrigins: ['http://localhost:3000'],
    server: { port: 3000, host: 'localhost' }
  };

  const server = new ModelServer(config);
  const model = new CompositeLanguageModel(config);
  server.setModel(model);

  const response = await request(server.app)
    .post('/predict')
    .send({ text: 'hello world' });
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('label');
  expect(response.body).toHaveProperty('probability');
  expect(response.body).toHaveProperty('confidence');
});

test('ModelServer should handle batch prediction request', async () => {
  const config = {
    embeddingDim: 2,
    vocabSize: 10,
    batchSize: 32,
    cacheSize: 1000,
    corsOrigins: ['http://localhost:3000'],
    server: { port: 3000, host: 'localhost' }
  };

  const server = new ModelServer(config);
  const model = new CompositeLanguageModel(config);
  server.setModel(model);

  const response = await request(server.app)
    .post('/batch-predict')
    .send({ texts: ['hello world', 'goodbye'] });
  
  expect(response.status).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body).toHaveLength(2);
});

test('ModelServer should handle errors', async () => {
  const config = {
    corsOrigins: ['http://localhost:3000'],
    server: { port: 3000, host: 'localhost' }
  };

  const server = new ModelServer(config);
  
  const response = await request(server.app)
    .post('/predict')
    .send({});
  
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('error');
});
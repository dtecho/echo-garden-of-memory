export default {
  model: {
    embeddingDim: 100,
    learningRate: 0.01,
    batchSize: 32,
    epochs: 10
  },
  training: {
    checkpointInterval: 5,
    validationSplit: 0.2,
    earlyStoppingPatience: 3
  },
  data: {
    rawDir: 'data/raw',
    processedDir: 'data/processed',
    modelsDir: 'models'
  },
  server: {
    port: 3000,
    host: 'localhost',
    corsOrigins: ['http://localhost:3000']
  },
  logging: {
    level: 'info',
    format: 'json',
    directory: 'logs'
  }
}
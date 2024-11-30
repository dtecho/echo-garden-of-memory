import express from 'express';
import { ModelPredictor } from '../inference/predictor.js';
import { PredictionCache } from '../inference/cache.js';
import logger from '../../../utils/logger.js';

export class ModelServer {
  constructor(config) {
    this.config = config;
    this.predictor = new ModelPredictor(config);
    this.cache = new PredictionCache(config);
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    
    // CORS middleware
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (this.config.corsOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        query: req.query,
        body: req.body
      });
      next();
    });
  }

  setupRoutes() {
    this.app.get('/status', (req, res) => {
      res.json({
        status: 'ready',
        config: {
          batchSize: this.config.batchSize,
          cacheSize: this.config.cacheSize
        },
        cache: this.cache.getStats()
      });
    });

    this.app.post('/predict', async (req, res) => {
      try {
        const { text } = req.body;
        if (!text) {
          throw new Error('Missing text input');
        }

        // Check cache
        const cacheKey = text.toLowerCase();
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return res.json({
            ...cached,
            cached: true
          });
        }

        // Make prediction
        const result = await this.predictor.predict(
          this.model,
          { tokens: text.split(' ') }
        );

        // Cache result
        this.cache.set(cacheKey, result);

        res.json(result);
      } catch (error) {
        logger.error('Prediction error:', error);
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/batch-predict', async (req, res) => {
      try {
        const { texts } = req.body;
        if (!Array.isArray(texts)) {
          throw new Error('Input must be an array of texts');
        }

        const inputs = texts.map(text => ({
          tokens: text.split(' ')
        }));

        const results = await this.predictor.batchPredict(
          this.model,
          inputs
        );

        res.json(results);
      } catch (error) {
        logger.error('Batch prediction error:', error);
        res.status(400).json({ error: error.message });
      }
    });
  }

  setModel(model) {
    this.model = model;
  }

  start() {
    const { port, host } = this.config.server;
    this.app.listen(port, host, () => {
      logger.info(`Model server running at http://${host}:${port}`);
    });
  }
}
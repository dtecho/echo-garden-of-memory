import express from 'express';
import fs from 'fs';
import path from 'path';
import { tokenize, encodeTokens } from '../utils/tokenizer.js';
import { validateInput, validateModel } from '../utils/validation.js';
import { calculateCosineSimilarity } from '../model/embeddings.js';
import { getConfig } from '../utils/config.js';
import logger from '../utils/logger.js';

const config = getConfig();
const app = express();
const MODEL_PATH = path.join(config.data.modelsDir, 'language_model.json');

// Ensure models directory exists
if (!fs.existsSync(config.data.modelsDir)) {
  fs.mkdirSync(config.data.modelsDir, { recursive: true });
}

// Initialize model state
let model = null;

// Try to load existing model
try {
  if (fs.existsSync(MODEL_PATH)) {
    model = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf-8'));
    validateModel(model);
    logger.info('Model loaded successfully');
  } else {
    logger.warn('No existing model found. Please train the model first.');
  }
} catch (error) {
  logger.error('Error loading model:', error.message);
}

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (config.server.corsOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});

app.get('/status', (req, res) => {
  logger.info('Status check requested');
  res.json({
    status: model ? 'ready' : 'not_trained',
    message: model ? 'Model is loaded and ready' : 'Model needs to be trained'
  });
});

app.post('/predict', (req, res) => {
  if (!model) {
    logger.warn('Prediction attempted without trained model');
    return res.status(503).json({
      error: 'Model is not trained yet. Please run training first.'
    });
  }

  try {
    const { text } = req.body;
    const validatedText = validateInput(text);
    
    // Process input
    const tokens = tokenize(validatedText);
    const encodedTokens = encodeTokens(
      tokens,
      model.vocabulary
    );

    // Generate embeddings
    const embeddings = encodedTokens.map(index => 
      model.embeddings[index]
    );

    // Find most similar words
    const similarities = model.vocabulary.map((word, i) => ({
      word,
      similarity: calculateCosineSimilarity(
        embeddings[0],
        model.embeddings[i]
      )
    }));

    const topSimilar = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    logger.info(`Successful prediction for input: "${text}"`);
    res.json({
      tokens,
      embeddings,
      similarWords: topSimilar
    });
  } catch (error) {
    logger.error('Prediction error:', error.message);
    res.status(400).json({
      error: error.message
    });
  }
});

const port = config.server.port;
const host = config.server.host;

app.listen(port, host, () => {
  logger.info(`Server running at http://${host}:${port}`);
  logger.info(`Model status: ${model ? 'loaded' : 'not trained'}`);
});
import fs from 'fs';
import path from 'path';
import { ModelEvaluator } from './metrics.js';
import { getConfig } from '../utils/config.js';
import logger from '../utils/logger.js';

const config = getConfig();
const MODEL_PATH = path.join(config.data.modelsDir, 'language_model.json');
const TEST_DATA = path.join(config.data.processedDir, 'tokens.json');

async function evaluate() {
  try {
    // Load model and test data
    const model = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf-8'));
    const testData = JSON.parse(fs.readFileSync(TEST_DATA, 'utf-8'));

    logger.info(`Loaded model and ${testData.length} test examples`);

    // Create evaluator and run evaluation
    const evaluator = new ModelEvaluator(model);
    const results = evaluator.evaluateModel(testData);

    // Save evaluation results
    const outputPath = path.join(config.data.modelsDir, 'evaluation_results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    // Log summary
    logger.info('Evaluation Summary:', {
      accuracy: results.accuracy,
      averageLoss: results.averageLoss,
      sampleCount: results.sampleCount
    });

    // Print detailed per-label metrics
    Object.entries(results.labelMetrics).forEach(([label, metrics]) => {
      logger.info(`Metrics for ${label}:`, metrics);
    });

  } catch (error) {
    logger.error('Evaluation failed:', error);
    process.exit(1);
  }
}

evaluate();
import fs from 'fs';
import { SimpleLanguageModel } from '../model/architecture.js';
import { createVocabulary, encodeTokens } from '../utils/tokenizer.js';
import { calculateLoss, calculateGradients } from './loss.js';
import { validateInput, validateModel } from '../utils/validation.js';
import { getConfig } from '../utils/config.js';
import logger from '../utils/logger.js';
import { BatchProcessor } from './batch.js';
import { CheckpointManager } from './checkpoint.js';
import { TrainingMetrics } from './metrics.js';
import { ModelVersionManager } from '../model/versioning.js';
import { EarlyStopping } from './early_stopping.js';
import { CrossValidator } from './cross_validation.js';
import { DataAugmenter } from '../data/augmentation.js';

const config = getConfig();
const TRAINING_DATA = `${config.data.processedDir}/tokens.json`;

async function train() {
  try {
    logger.info('Starting training process');
    
    // Initialize components
    const data = JSON.parse(fs.readFileSync(TRAINING_DATA, 'utf-8'));
    data.forEach(item => validateInput(item.original));
    logger.info(`Loaded ${data.length} training examples`);

    // Data augmentation
    const augmenter = new DataAugmenter();
    const augmentedData = augmenter.augment(data, 2);
    logger.info(`Augmented data to ${augmentedData.length} examples`);

    // Initialize model and training components
    const allTokens = augmentedData.flatMap(item => item.tokens);
    const vocabulary = createVocabulary(allTokens);
    const model = new SimpleLanguageModel(vocabulary.length, config.model.embeddingDim);
    const batchProcessor = new BatchProcessor(config.model.batchSize);
    const checkpointManager = new CheckpointManager(config.data.modelsDir);
    const metrics = new TrainingMetrics();
    const versionManager = new ModelVersionManager();
    const earlyStopping = new EarlyStopping(config.training.earlyStoppingPatience);
    const crossValidator = new CrossValidator(5);

    logger.info(`Initialized model with vocabulary size ${vocabulary.length}`);

    // Cross-validation
    const validationResults = await crossValidator.validate(
      model,
      augmentedData,
      vocabulary
    );
    logger.info('Cross-validation results:', validationResults);

    let bestAccuracy = 0;
    let bestModel = null;

    // Training loop
    for (let epoch = 0; epoch < config.model.epochs; epoch++) {
      metrics.reset();
      const batches = batchProcessor.createBatches(augmentedData);
      
      for (const batch of batches) {
        const processed = batchProcessor.processBatch(batch, vocabulary);
        const batchLoss = trainBatch(processed, model, config.model.learningRate, metrics);
      }

      const epochMetrics = metrics.getMetrics();
      logger.info(`Epoch ${epoch + 1}, Metrics:`, epochMetrics);

      // Early stopping check
      if (earlyStopping.check(epochMetrics.averageLoss)) {
        logger.info('Early stopping triggered');
        break;
      }

      // Save checkpoint if improved
      if (epochMetrics.accuracy > bestAccuracy) {
        bestAccuracy = epochMetrics.accuracy;
        bestModel = {
          vocabulary,
          embeddings: model.embeddings,
          labels: model.labels
        };
      }

      if ((epoch + 1) % config.training.checkpointInterval === 0) {
        checkpointManager.saveCheckpoint(model, vocabulary, epoch + 1, epochMetrics);
      }
    }

    // Save final model version
    const finalMetrics = metrics.getMetrics();
    await versionManager.saveVersion(
      bestModel || {
        vocabulary,
        embeddings: model.embeddings,
        labels: model.labels
      },
      finalMetrics,
      {
        embeddingDim: config.model.embeddingDim,
        epochs: config.model.epochs,
        batchSize: config.model.batchSize,
        learningRate: config.model.learningRate
      }
    );

    logger.info('Training completed successfully');
  } catch (error) {
    logger.error('Training failed:', error);
    process.exit(1);
  }
}

function trainBatch(processedBatch, model, learningRate, metrics) {
  let batchLoss = 0;
  
  for (const item of processedBatch) {
    const forwardOutput = model.forward(item.encodedTokens);
    const predictions = model.predict(forwardOutput);
    
    const loss = calculateLoss(
      predictions.map(p => p.probability),
      [model.labels.indexOf(item.label)]
    );
    
    const gradients = calculateGradients(
      predictions.map(p => p.probability),
      [model.labels.indexOf(item.label)],
      forwardOutput.embeddings
    );

    // Update embeddings and attention weights
    item.encodedTokens.forEach((tokenIndex, i) => {
      model.updateEmbedding(tokenIndex, gradients[i], learningRate);
    });

    if (forwardOutput.attentionWeights) {
      model.attention.updateWeights({
        query: gradients,
        key: gradients,
        value: gradients
      }, learningRate);
    }
    
    metrics.updateMetrics(loss, predictions, item.label);
    batchLoss += loss;
  }
  
  return batchLoss / processedBatch.length;
}

train().catch(error => {
  logger.error('Training failed:', error);
  process.exit(1);
});
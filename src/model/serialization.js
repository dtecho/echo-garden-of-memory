import fs from 'fs';
import path from 'path';
import { getConfig } from '../utils/config.js';
import { validateModel } from '../utils/validation.js';
import logger from '../utils/logger.js';

const config = getConfig();

export async function saveModel(model, filename) {
  const modelPath = path.join(config.data.modelsDir, filename);
  
  try {
    // Validate model before saving
    validateModel(model);
    
    // Ensure models directory exists
    await fs.promises.mkdir(config.data.modelsDir, { recursive: true });
    
    // Save model with metadata
    const modelData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      config: {
        embeddingDim: model.embeddingDim,
        vocabSize: model.vocabSize,
        labels: model.labels
      },
      model: {
        vocabulary: model.vocabulary,
        embeddings: model.embeddings,
        labels: model.labels
      }
    };
    
    await fs.promises.writeFile(
      modelPath,
      JSON.stringify(modelData, null, 2)
    );
    
    logger.info(`Model saved successfully to ${modelPath}`);
    return modelPath;
  } catch (error) {
    logger.error('Error saving model:', error);
    throw error;
  }
}

export async function loadModel(filename) {
  const modelPath = path.join(config.data.modelsDir, filename);
  
  try {
    const modelData = JSON.parse(
      await fs.promises.readFile(modelPath, 'utf-8')
    );
    
    // Validate model structure
    validateModel(modelData.model);
    
    logger.info(`Model loaded successfully from ${modelPath}`);
    return {
      ...modelData.model,
      config: modelData.config,
      version: modelData.version,
      timestamp: modelData.timestamp
    };
  } catch (error) {
    logger.error('Error loading model:', error);
    throw error;
  }
}

export async function listModels() {
  try {
    const files = await fs.promises.readdir(config.data.modelsDir);
    const models = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const modelPath = path.join(config.data.modelsDir, file);
        const stats = await fs.promises.stat(modelPath);
        
        try {
          const modelData = JSON.parse(
            await fs.promises.readFile(modelPath, 'utf-8')
          );
          
          models.push({
            filename: file,
            version: modelData.version,
            timestamp: modelData.timestamp,
            config: modelData.config,
            size: stats.size
          });
        } catch (error) {
          logger.warn(`Invalid model file: ${file}`);
        }
      }
    }
    
    return models;
  } catch (error) {
    logger.error('Error listing models:', error);
    throw error;
  }
}
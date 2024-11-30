import fs from 'fs';
import path from 'path';
import logger from '../../../utils/logger.js';

export class ModelSerializer {
  constructor(config) {
    this.config = config;
    this.modelsDir = config.data.modelsDir;
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.modelsDir)) {
      fs.mkdirSync(this.modelsDir, { recursive: true });
    }
  }

  async saveModel(model, version, metrics) {
    const modelData = {
      version,
      timestamp: new Date().toISOString(),
      config: model.config,
      embedding: model.embedding.embeddings,
      attention: {
        queryWeight: model.attention.queryWeight,
        keyWeight: model.attention.keyWeight,
        valueWeight: model.attention.valueWeight
      },
      normalization: model.normalization.layerNorm,
      labels: model.prediction.labels,
      metrics
    };

    const filename = `model_v${version}.json`;
    const filepath = path.join(this.modelsDir, filename);

    try {
      await fs.promises.writeFile(
        filepath,
        JSON.stringify(modelData, null, 2)
      );
      logger.info(`Saved model version ${version}`);
      return filepath;
    } catch (error) {
      logger.error('Error saving model:', error);
      throw error;
    }
  }

  async loadModel(version) {
    const filename = `model_v${version}.json`;
    const filepath = path.join(this.modelsDir, filename);

    try {
      const data = JSON.parse(
        await fs.promises.readFile(filepath, 'utf-8')
      );
      logger.info(`Loaded model version ${version}`);
      return data;
    } catch (error) {
      logger.error('Error loading model:', error);
      throw error;
    }
  }

  async listVersions() {
    try {
      const files = await fs.promises.readdir(this.modelsDir);
      const versions = [];

      for (const file of files) {
        if (file.startsWith('model_v') && file.endsWith('.json')) {
          const data = JSON.parse(
            await fs.promises.readFile(
              path.join(this.modelsDir, file),
              'utf-8'
            )
          );
          versions.push({
            version: data.version,
            timestamp: data.timestamp,
            metrics: data.metrics,
            filename: file
          });
        }
      }

      return versions.sort((a, b) => b.version - a.version);
    } catch (error) {
      logger.error('Error listing versions:', error);
      throw error;
    }
  }

  async deleteVersion(version) {
    const filename = `model_v${version}.json`;
    const filepath = path.join(this.modelsDir, filename);

    try {
      await fs.promises.unlink(filepath);
      logger.info(`Deleted model version ${version}`);
    } catch (error) {
      logger.error('Error deleting version:', error);
      throw error;
    }
  }
}
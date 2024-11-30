import fs from 'fs';
import path from 'path';
import { getConfig } from '../utils/config.js';
import logger from '../utils/logger.js';

export class CheckpointManager {
  constructor(modelDir) {
    this.modelDir = modelDir;
    this.checkpointInterval = 5;
    this.maxCheckpoints = 3;
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.modelDir)) {
      fs.mkdirSync(this.modelDir, { recursive: true });
    }
  }

  saveCheckpoint(model, vocabulary, epoch, metrics) {
    const checkpoint = {
      epoch,
      timestamp: new Date().toISOString(),
      vocabulary,
      embeddings: model.embeddings,
      labels: model.labels,
      metrics,
      config: {
        embeddingDim: model.embeddingDim,
        dropout: model.dropout
      }
    };

    const filename = `checkpoint_epoch_${epoch}.json`;
    const filepath = path.join(this.modelDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(checkpoint, null, 2));
    logger.info(`Saved checkpoint for epoch ${epoch} to ${filepath}`);

    // Cleanup old checkpoints
    this.cleanupOldCheckpoints();
  }

  loadLatestCheckpoint() {
    const checkpoints = fs.readdirSync(this.modelDir)
      .filter(file => file.startsWith('checkpoint_'))
      .sort()
      .reverse();

    if (checkpoints.length === 0) {
      return null;
    }

    const latestCheckpoint = checkpoints[0];
    const filepath = path.join(this.modelDir, latestCheckpoint);
    
    logger.info(`Loading checkpoint from ${filepath}`);
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  }

  cleanupOldCheckpoints() {
    const checkpoints = fs.readdirSync(this.modelDir)
      .filter(file => file.startsWith('checkpoint_'))
      .sort()
      .reverse();

    if (checkpoints.length > this.maxCheckpoints) {
      checkpoints
        .slice(this.maxCheckpoints)
        .forEach(file => {
          const filepath = path.join(this.modelDir, file);
          fs.unlinkSync(filepath);
          logger.info(`Removed old checkpoint: ${file}`);
        });
    }
  }

  shouldSaveCheckpoint(epoch) {
    return epoch % this.checkpointInterval === 0;
  }
}
import fs from 'fs';
import path from 'path';
import { getConfig } from '../utils/config.js';
import logger from '../utils/logger.js';

export class ModelVersionManager {
  constructor() {
    this.config = getConfig();
    this.versionsFile = path.join(this.config.data.modelsDir, 'versions.json');
    this.initializeVersions();
  }

  initializeVersions() {
    if (!fs.existsSync(this.config.data.modelsDir)) {
      fs.mkdirSync(this.config.data.modelsDir, { recursive: true });
    }

    if (!fs.existsSync(this.versionsFile)) {
      fs.writeFileSync(this.versionsFile, JSON.stringify({
        versions: [],
        currentVersion: null
      }, null, 2));
    }
  }

  async saveVersion(model, metrics, config) {
    const versions = this._loadVersions();
    const versionNumber = versions.versions.length + 1;
    
    const versionInfo = {
      version: versionNumber,
      timestamp: new Date().toISOString(),
      metrics,
      config,
      modelFile: `model_v${versionNumber}.json`
    };

    // Save model file
    const modelPath = path.join(
      this.config.data.modelsDir,
      versionInfo.modelFile
    );
    
    fs.writeFileSync(modelPath, JSON.stringify(model, null, 2));

    // Update versions registry
    versions.versions.push(versionInfo);
    versions.currentVersion = versionNumber;
    
    fs.writeFileSync(
      this.versionsFile,
      JSON.stringify(versions, null, 2)
    );

    logger.info(`Saved model version ${versionNumber}`);
    return versionInfo;
  }

  loadVersion(versionNumber) {
    const versions = this._loadVersions();
    const versionInfo = versions.versions.find(
      v => v.version === versionNumber
    );

    if (!versionInfo) {
      throw new Error(`Version ${versionNumber} not found`);
    }

    const modelPath = path.join(
      this.config.data.modelsDir,
      versionInfo.modelFile
    );

    if (!fs.existsSync(modelPath)) {
      throw new Error(
        `Model file for version ${versionNumber} not found`
      );
    }

    const model = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
    return { model, versionInfo };
  }

  loadLatestVersion() {
    const versions = this._loadVersions();
    if (!versions.currentVersion) {
      throw new Error('No model versions found');
    }
    return this.loadVersion(versions.currentVersion);
  }

  compareVersions(version1, version2) {
    const v1 = this.loadVersion(version1);
    const v2 = this.loadVersion(version2);

    return {
      accuracyDiff: v2.versionInfo.metrics.accuracy - 
                    v1.versionInfo.metrics.accuracy,
      lossDiff: v2.versionInfo.metrics.averageLoss - 
                v1.versionInfo.metrics.averageLoss,
      timestamp1: v1.versionInfo.timestamp,
      timestamp2: v2.versionInfo.timestamp
    };
  }

  // Internal method to load versions file
  _loadVersions() {
    try {
      return JSON.parse(fs.readFileSync(this.versionsFile, 'utf-8'));
    } catch (error) {
      logger.error('Error loading versions file:', error);
      throw new Error('Failed to load versions file');
    }
  }
}
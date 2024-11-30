import fs from 'fs';
import path from 'path';
import logger from '../../../utils/logger.js';

export class VersionManager {
  constructor(config) {
    this.config = config;
    this.versionsFile = path.join(config.data.modelsDir, 'versions.json');
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

  async addVersion(version, metrics, config) {
    const versions = this.loadVersions();
    
    const versionInfo = {
      version,
      timestamp: new Date().toISOString(),
      metrics,
      config,
      modelFile: `model_v${version}.json`
    };

    versions.versions.push(versionInfo);
    versions.currentVersion = version;

    await fs.promises.writeFile(
      this.versionsFile,
      JSON.stringify(versions, null, 2)
    );

    logger.info(`Added version ${version} to registry`);
    return versionInfo;
  }

  loadVersions() {
    try {
      return JSON.parse(fs.readFileSync(this.versionsFile, 'utf-8'));
    } catch (error) {
      logger.error('Error loading versions:', error);
      throw error;
    }
  }

  async compareVersions(version1, version2) {
    const versions = this.loadVersions();
    const v1 = versions.versions.find(v => v.version === version1);
    const v2 = versions.versions.find(v => v.version === version2);

    if (!v1 || !v2) {
      throw new Error('Version not found');
    }

    return {
      accuracyDiff: v2.metrics.accuracy - v1.metrics.accuracy,
      lossDiff: v2.metrics.averageLoss - v1.metrics.averageLoss,
      timestamp1: v1.timestamp,
      timestamp2: v2.timestamp
    };
  }

  async getLatestVersion() {
    const versions = this.loadVersions();
    return versions.currentVersion;
  }

  async pruneOldVersions(keepCount = 5) {
    const versions = this.loadVersions();
    
    if (versions.versions.length <= keepCount) return;

    const sortedVersions = versions.versions
      .sort((a, b) => b.version - a.version);
    
    const toDelete = sortedVersions.slice(keepCount);
    versions.versions = sortedVersions.slice(0, keepCount);

    await fs.promises.writeFile(
      this.versionsFile,
      JSON.stringify(versions, null, 2)
    );

    for (const version of toDelete) {
      const filepath = path.join(
        this.config.data.modelsDir,
        version.modelFile
      );
      try {
        await fs.promises.unlink(filepath);
        logger.info(`Deleted old version: ${version.version}`);
      } catch (error) {
        logger.warn(`Failed to delete file for version ${version.version}`);
      }
    }
  }
}
import logger from '../utils/logger.js';

export class DataAugmenter {
  constructor() {
    this.techniques = [
      this.dropTokens,
      this.shuffleTokens,
      this.substituteTokens
    ];
  }

  augment(examples, augmentationFactor = 2) {
    logger.info(`Augmenting ${examples.length} examples`);
    
    const augmented = [];
    
    for (const example of examples) {
      // Add original example
      augmented.push(example);
      
      // Add augmented versions
      for (let i = 0; i < augmentationFactor - 1; i++) {
        const technique = this.techniques[
          Math.floor(Math.random() * this.techniques.length)
        ];
        
        const augmentedExample = technique(example);
        augmented.push(augmentedExample);
      }
    }

    logger.info(
      `Created ${augmented.length} examples after augmentation`
    );
    return augmented;
  }

  dropTokens(example) {
    const dropRate = 0.2;
    const tokens = example.tokens.filter(() => 
      Math.random() > dropRate
    );
    
    return {
      original: example.original,
      tokens: tokens.length > 0 ? tokens : example.tokens,
      label: example.label
    };
  }

  shuffleTokens(example) {
    const tokens = [...example.tokens];
    for (let i = tokens.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
    }
    
    return {
      original: example.original,
      tokens,
      label: example.label
    };
  }

  substituteTokens(example) {
    const substitutionRate = 0.2;
    const tokens = example.tokens.map(token =>
      Math.random() < substitutionRate ? 
        this.findSimilarToken(token) : 
        token
    );
    
    return {
      original: example.original,
      tokens,
      label: example.label
    };
  }

  findSimilarToken(token) {
    // Simplified similar token lookup
    const similarTokens = {
      'hello': ['hi', 'hey'],
      'goodbye': ['bye', 'farewell'],
      'friend': ['buddy', 'pal']
    };
    
    const options = similarTokens[token] || [token];
    return options[Math.floor(Math.random() * options.length)];
  }
}
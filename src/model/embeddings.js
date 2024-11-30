export function initializeEmbeddings(vocabSize, embeddingDim) {
  // Xavier/Glorot initialization
  const scale = Math.sqrt(2.0 / (vocabSize + embeddingDim));
  return Array(vocabSize).fill(0).map(() =>
    Array(embeddingDim).fill(0).map(() =>
      (Math.random() * 2 - 1) * scale
    )
  );
}

export function updateEmbedding(embedding, gradients, learningRate = 0.01) {
  return embedding.map(
    (value, i) => value - learningRate * gradients[i]
  );
}

export function calculateCosineSimilarity(embedding1, embedding2) {
  const dotProduct = embedding1.reduce((sum, val, i) => 
    sum + val * embedding2[i], 0
  );
  
  const norm1 = Math.sqrt(embedding1.reduce((sum, val) => 
    sum + val * val, 0
  ));
  
  const norm2 = Math.sqrt(embedding2.reduce((sum, val) => 
    sum + val * val, 0
  ));
  
  return dotProduct / (norm1 * norm2);
}
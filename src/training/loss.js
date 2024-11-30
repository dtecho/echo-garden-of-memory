export function calculateLoss(predictions, actual) {
  // Cross-entropy loss for single label
  const targetIndex = actual[0];
  const prediction = Math.max(predictions[targetIndex], 1e-10); // Prevent log(0)
  return -Math.log(prediction);
}

export function calculateGradients(predictions, actual, embeddings) {
  const targetIndex = actual[0];
  const gradients = embeddings.map(embedding => {
    // Calculate gradient for each dimension
    return embedding.map(val => {
      const predictionError = predictions[targetIndex] - 1;
      return predictionError * val;
    });
  });
  return gradients;
}
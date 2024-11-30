import { encodeTokens } from './tokenizer.js';

export function calculateAccuracy(predictions, actual) {
  const correct = predictions.filter((pred, i) => pred === actual[i]).length;
  return correct / predictions.length;
}

export function calculatePrecision(predictions, actual, label) {
  const truePositives = predictions.filter((pred, i) => 
    pred === label && actual[i] === label
  ).length;
  
  const predictedPositives = predictions.filter(pred => 
    pred === label
  ).length;
  
  return predictedPositives === 0 ? 0 : truePositives / predictedPositives;
}

export function calculateRecall(predictions, actual, label) {
  const truePositives = predictions.filter((pred, i) => 
    pred === label && actual[i] === label
  ).length;
  
  const actualPositives = actual.filter(label => 
    label === label
  ).length;
  
  return actualPositives === 0 ? 0 : truePositives / actualPositives;
}
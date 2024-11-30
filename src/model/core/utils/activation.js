export function softmax(logits) {
  const maxLogit = Math.max(...logits.flat());
  const expScores = logits.map(row =>
    row.map(val => Math.exp(val - maxLogit))
  );
  
  const sumExp = expScores.map(row =>
    row.reduce((sum, exp) => sum + exp, 0)
  );
  
  return expScores.map((row, i) =>
    row.map(exp => exp / (sumExp[i] + 1e-10))
  );
}

export function relu(x) {
  return Math.max(0, x);
}

export function reluDerivative(x) {
  return x > 0 ? 1 : 0;
}

export function tanh(x) {
  return Math.tanh(x);
}

export function tanhDerivative(x) {
  const t = Math.tanh(x);
  return 1 - t * t;
}
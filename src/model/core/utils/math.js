export function xavier(fanIn, fanOut) {
  const scale = Math.sqrt(2.0 / (fanIn + fanOut));
  return () => (Math.random() * 2 - 1) * scale;
}

export function createMatrix(rows, cols, initializer) {
  return Array(rows).fill(0).map(() =>
    Array(cols).fill(0).map(initializer)
  );
}

export function vectorAdd(vec1, vec2) {
  return vec1.map((val, i) => val + vec2[i]);
}

export function vectorScale(vec, scalar) {
  return vec.map(val => val * scalar);
}

export function matrixMultiply(mat1, mat2) {
  const result = Array(mat1.length).fill(0).map(() =>
    Array(mat2[0].length).fill(0)
  );
  
  for (let i = 0; i < mat1.length; i++) {
    for (let j = 0; j < mat2[0].length; j++) {
      for (let k = 0; k < mat2.length; k++) {
        result[i][j] += mat1[i][k] * mat2[k][j];
      }
    }
  }
  
  return result;
}
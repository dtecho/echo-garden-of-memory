export function validateInput(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input must be a non-empty string');
  }
  
  if (text.trim().length === 0) {
    throw new Error('Input cannot be empty or only whitespace');
  }
  
  return text.trim();
}

export function validateModel(model) {
  if (!model || !model.vocabulary || !model.embeddings) {
    throw new Error('Invalid model structure');
  }
  
  if (model.vocabulary.length !== model.embeddings.length) {
    throw new Error('Vocabulary and embeddings size mismatch');
  }
  
  return true;
}
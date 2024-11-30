import natural from 'natural';

const tokenizer = new natural.WordTokenizer();

export function tokenize(text) {
  // Convert to lowercase and tokenize
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Remove punctuation and numbers
  return tokens.filter(token => 
    token.match(/^[a-zA-Z]+$/)
  );
}

export function createVocabulary(tokens) {
  const vocabulary = new Set();
  tokens.forEach(token => vocabulary.add(token));
  return Array.from(vocabulary);
}

export function encodeTokens(tokens, vocabulary) {
  return tokens.map(token => 
    vocabulary.indexOf(token)
  ).filter(index => index !== -1);
}
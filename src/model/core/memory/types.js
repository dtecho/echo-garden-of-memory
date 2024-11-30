/**
 * @typedef {Object} MemoryEntry
 * @property {any} content - Memory content
 * @property {Object} context - Memory context
 * @property {string} timestamp - Creation timestamp
 * @property {number} accessCount - Number of times accessed
 * @property {Set<string>} associations - Associated tags and relationships
 * @property {number} version - Memory version
 * @property {number} [strength] - Memory strength (0-1)
 * @property {string[]} [echoes] - Related memory echoes
 */

/**
 * @typedef {Object} MemoryContext
 * @property {string} id - Context identifier
 * @property {string[]} tags - Context tags
 * @property {string} source - Memory source/origin
 * @property {Object} metadata - Additional context metadata
 */

/**
 * @typedef {Object} MemoryLink
 * @property {string} source - Source memory key
 * @property {string} target - Target memory key
 * @property {string} relationship - Link relationship type
 * @property {number} strength - Link strength (0-1)
 */

/**
 * @typedef {Object} ContextSummary
 * @property {string} id - Context identifier
 * @property {number} duration - Context duration in ms
 * @property {number} memoryCount - Number of memories
 * @property {Object[]} summary - Grouped memory summary
 * @property {Map<string, number>} patterns - Detected patterns
 */

export const MEMORY_CONSTANTS = {
  CONSOLIDATION_THRESHOLD: 5,
  MIN_LINK_STRENGTH: 0.1,
  MAX_MEMORY_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days
  ECHO_LIMIT: 10,
  PATTERN_THRESHOLD: 0.7
};
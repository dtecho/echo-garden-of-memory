import { PatternDetector } from './patterns.js';
import { MEMORY_CONSTANTS } from './types.js';
import logger from '../../../utils/logger.js';

export class MemoryNetwork {
  constructor(config) {
    this.config = config;
    this.nodes = new Map();
    this.edges = new Map();
    this.patterns = new PatternDetector();
    this.clusters = new Map();
  }

  addNode(key, memory) {
    this.nodes.set(key, {
      memory,
      connections: new Set(),
      strength: 1.0,
      lastAccess: Date.now()
    });
  }

  addEdge(sourceKey, targetKey, relationship, strength = 0.5) {
    const edge = {
      source: sourceKey,
      target: targetKey,
      relationship,
      strength,
      timestamp: Date.now()
    };

    const edgeKey = `${sourceKey}:${targetKey}:${relationship}`;
    this.edges.set(edgeKey, edge);

    // Update node connections
    this.nodes.get(sourceKey)?.connections.add(edgeKey);
    this.nodes.get(targetKey)?.connections.add(edgeKey);

    return edge;
  }

  strengthenConnections(key) {
    const node = this.nodes.get(key);
    if (!node) return;

    // Update node strength and access time
    node.strength = Math.min(1.0, node.strength + 0.1);
    node.lastAccess = Date.now();

    // Strengthen connected edges
    node.connections.forEach(edgeKey => {
      const edge = this.edges.get(edgeKey);
      if (edge) {
        edge.strength = Math.min(1.0, edge.strength + 0.05);
      }
    });
  }

  findRelated(key, relationship = null, limit = 5) {
    const node = this.nodes.get(key);
    if (!node) return [];

    const related = [];
    node.connections.forEach(edgeKey => {
      const edge = this.edges.get(edgeKey);
      if (edge && (!relationship || edge.relationship === relationship)) {
        const relatedKey = edge.source === key ? edge.target : edge.source;
        const relatedNode = this.nodes.get(relatedKey);
        if (relatedNode) {
          related.push({
            key: relatedKey,
            memory: relatedNode.memory,
            strength: edge.strength,
            relationship: edge.relationship
          });
        }
      }
    });

    return related
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }

  detectClusters() {
    // Reset clusters
    this.clusters.clear();
    const visited = new Set();

    // Find connected components using DFS
    this.nodes.forEach((node, key) => {
      if (!visited.has(key)) {
        const cluster = this.exploreCluster(key, visited);
        if (cluster.size > 1) {
          this.clusters.set(
            `cluster_${this.clusters.size}`,
            cluster
          );
        }
      }
    });

    // Analyze patterns within clusters
    this.clusters.forEach((members, clusterId) => {
      const memories = Array.from(members).map(key => 
        this.nodes.get(key).memory
      );
      const patterns = this.patterns.detectPatterns(memories);
      
      if (patterns.size > 0) {
        logger.info(`Detected patterns in cluster ${clusterId}:`, 
          Array.from(patterns.entries())
        );
      }
    });

    return this.clusters;
  }

  private exploreCluster(startKey, visited) {
    const cluster = new Set();
    const queue = [startKey];
    
    while (queue.length > 0) {
      const key = queue.shift();
      if (visited.has(key)) continue;
      
      visited.add(key);
      cluster.add(key);
      
      // Add connected nodes to queue
      const node = this.nodes.get(key);
      node.connections.forEach(edgeKey => {
        const edge = this.edges.get(edgeKey);
        if (edge && edge.strength >= MEMORY_CONSTANTS.MIN_LINK_STRENGTH) {
          const nextKey = edge.source === key ? edge.target : edge.source;
          if (!visited.has(nextKey)) {
            queue.push(nextKey);
          }
        }
      });
    }
    
    return cluster;
  }

  pruneWeakConnections() {
    const now = Date.now();
    
    // Remove weak or old edges
    this.edges.forEach((edge, key) => {
      const age = now - edge.timestamp;
      if (edge.strength < MEMORY_CONSTANTS.MIN_LINK_STRENGTH || 
          age > MEMORY_CONSTANTS.MAX_MEMORY_AGE) {
        this.edges.delete(key);
        
        // Update node connections
        const sourceNode = this.nodes.get(edge.source);
        const targetNode = this.nodes.get(edge.target);
        sourceNode?.connections.delete(key);
        targetNode?.connections.delete(key);
      }
    });

    // Detect and update clusters after pruning
    this.detectClusters();
  }
}
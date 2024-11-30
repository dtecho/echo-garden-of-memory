import { vectorScale } from '../utils/math.js';

export class Optimizer {
  constructor(config) {
    this.learningRate = config.learningRate || 0.01;
    this.beta1 = config.beta1 || 0.9; // For Adam
    this.beta2 = config.beta2 || 0.999;
    this.epsilon = config.epsilon || 1e-8;
    this.moments = new Map();
    this.velocities = new Map();
    this.t = 0;
  }

  step(params, gradients, paramId) {
    this.t += 1;
    
    if (!this.moments.has(paramId)) {
      this.moments.set(paramId, Array(gradients.length).fill(0));
      this.velocities.set(paramId, Array(gradients.length).fill(0));
    }

    const m = this.moments.get(paramId);
    const v = this.velocities.get(paramId);

    // Update biased first moment estimate
    const newM = m.map((val, i) => 
      this.beta1 * val + (1 - this.beta1) * gradients[i]
    );

    // Update biased second raw moment estimate
    const newV = v.map((val, i) => 
      this.beta2 * val + (1 - this.beta2) * gradients[i] * gradients[i]
    );

    // Compute bias-corrected first moment estimate
    const mHat = newM.map(val => 
      val / (1 - Math.pow(this.beta1, this.t))
    );

    // Compute bias-corrected second raw moment estimate
    const vHat = newV.map(val =>
      val / (1 - Math.pow(this.beta2, this.t))
    );

    // Update parameters
    const updates = mHat.map((m, i) =>
      -this.learningRate * m / (Math.sqrt(vHat[i]) + this.epsilon)
    );

    this.moments.set(paramId, newM);
    this.velocities.set(paramId, newV);

    return params.map((param, i) => param + updates[i]);
  }

  reset() {
    this.moments.clear();
    this.velocities.clear();
    this.t = 0;
  }
}
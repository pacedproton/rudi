/**
 * ParticleSystem - Visual feedback effects for Flinki
 *
 * Creates celebratory particles when correct answers are given
 * Ported from prototype.html lines 281-314
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;  // velocity x
  vy: number;  // velocity y
  life: number;  // 0-1, particles fade out as life decreases
  color: string;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly colors = ['#FFD700', '#FF6347', '#7CFC00', '#00BFFF'];

  /**
   * Spawn particles at a specific location
   * @param x X coordinate
   * @param y Y coordinate
   * @param count Number of particles to spawn (default: 20)
   */
  spawnParticles(x: number, y: number, count = 20): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 15,  // Random horizontal velocity
        vy: (Math.random() - 0.5) * 15,  // Random vertical velocity
        life: 1.0,
        color: this.colors[Math.floor(Math.random() * this.colors.length)]
      });
    }
  }

  /**
   * Update all particles (called each frame)
   * Applies physics and removes dead particles
   */
  update(): void {
    // Update each particle
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5;  // Gravity
      p.life -= 0.03;  // Fade out
    });

    // Remove dead particles
    this.particles = this.particles.filter(p => p.life > 0);
  }

  /**
   * Render all particles to canvas
   * @param ctx Canvas rendering context
   * @param scale Scale factor for responsive rendering
   */
  render(ctx: CanvasRenderingContext2D, scale: number): void {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * Get current particle count (for debugging)
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Check if particles are active
   */
  isActive(): boolean {
    return this.particles.length > 0;
  }
}

// Singleton instance
export const particleSystem = new ParticleSystem();

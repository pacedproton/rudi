/**
 * Rendering utilities for Lern-Rudi
 *
 * Common rendering functions used across the app
 */

import type { RenderContext } from '$lib/core/CanvasManager';
import { colors } from '$lib/data/colors';
import { get } from 'svelte/store';
import { totalKeys } from '$lib/core/StateManager';

/**
 * Render background (sky gradient + grass)
 * Ported from prototype.html lines 772-779
 */
export function renderBackground(ctx: RenderContext): void {
  const { width, height, scale } = ctx;
  const horizonY = height * 0.45;

  // Sky gradient
  const skyGradient = ctx.ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGradient.addColorStop(0, colors.sky);
  skyGradient.addColorStop(1, '#b5e8f7');
  ctx.ctx.fillStyle = skyGradient;
  ctx.ctx.fillRect(0, 0, width, horizonY);

  // Grass
  ctx.ctx.fillStyle = colors.grass;
  ctx.ctx.fillRect(0, horizonY, width, height - horizonY);
}

/**
 * Render HUD (score display with keys)
 * Shows compact score badge in top-left corner
 */
export function renderHUD(ctx: RenderContext): void {
  const { scale } = ctx;
  const keys = get(totalKeys);
  const padding = 15 * scale;

  // Compact pill-shaped score badge in top-left
  const badgeWidth = 80 * scale;
  const badgeHeight = 36 * scale;

  // Background pill
  ctx.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  drawRoundedRect(ctx.ctx, padding, padding, badgeWidth, badgeHeight, badgeHeight / 2);

  // Key icon and count
  ctx.ctx.font = `bold ${18 * scale}px Arial`;
  ctx.ctx.fillStyle = '#fff';
  ctx.ctx.textAlign = 'left';
  ctx.ctx.textBaseline = 'middle';
  ctx.ctx.fillText('🗝️', padding + 10 * scale, padding + badgeHeight / 2);
  ctx.ctx.fillText(`${keys}`, padding + 40 * scale, padding + badgeHeight / 2);
}

/**
 * Draw a rounded rectangle
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

/**
 * Rendering utilities for Poldi
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
 * Ported from prototype.html lines 802-817
 */
export function renderHUD(ctx: RenderContext): void {
  const { width, scale } = ctx;
  const keys = get(totalKeys);
  const sx = width - 50 * scale;

  // Background box
  ctx.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  drawRoundedRect(ctx.ctx, sx - 100 * scale, 10 * scale, 140 * scale, 50 * scale, 25 * scale);

  // Text
  ctx.ctx.font = `${24 * scale}px Arial`;
  ctx.ctx.fillStyle = '#fff';
  ctx.ctx.textAlign = 'right';
  ctx.ctx.textBaseline = 'middle';
  ctx.ctx.fillText(`x ${keys}`, sx, 35 * scale);
  ctx.ctx.fillText('🗝️', sx - 60 * scale, 35 * scale);
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

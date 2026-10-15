import type { BotiState, Direction, Position } from "../types/game";
import type { LevelConfig } from "../types/level";
import type { IRenderer, RenderOptions, RendererDimensions } from "./types";
import { getAvatarTheme } from "@/components/profile/avatars";

export class CanvasRenderer implements IRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly config: LevelConfig;
  private lastState: BotiState;
  private lastOptions: RenderOptions = {};
  private animFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, config: LevelConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to obtain 2D rendering context for Canvas");
    }
    this.ctx = ctx;
    this.config = config;

    this.lastState = {
      position: { x: config.start.x, y: config.start.y },
      direction: config.start.direction,
    };

    this.setupResizeHandling();
    this.resize();
    this.render(this.lastState);
  }

  public getLevelConfig(): LevelConfig {
    return this.config;
  }

  private setupResizeHandling(): void {
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
        this.render(this.lastState, this.lastOptions);
      });
      if (this.canvas.parentElement) {
        this.resizeObserver.observe(this.canvas.parentElement);
      }
    }
  }

  /**
   * Resizes internal canvas bitmap to match its display CSS dimensions
   * with high-DPI scaling.
   */
  public resize(): void {
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    const displayWidth = Math.max(rect.width, 280);
    const displayHeight = Math.max(rect.height || (displayWidth * 0.6), 200);

    this.canvas.width = Math.floor(displayWidth * dpr);
    this.canvas.height = Math.floor(displayHeight * dpr);
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  private calculateDimensions(): RendererDimensions {
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 260;

    const padding = 24;
    const availableWidth = Math.max(width - padding * 2, 100);
    const availableHeight = Math.max(height - padding * 2, 100);

    const tileW = availableWidth / this.config.grid.width;
    const tileH = availableHeight / this.config.grid.height;
    const tileSize = Math.floor(Math.min(tileW, tileH));

    const gridPixelWidth = tileSize * this.config.grid.width;
    const gridPixelHeight = tileSize * this.config.grid.height;

    const offsetX = Math.floor((width - gridPixelWidth) / 2);
    const offsetY = Math.floor((height - gridPixelHeight) / 2);

    return {
      width,
      height,
      tileSize,
      offsetX,
      offsetY,
    };
  }

  /**
   * Renders the game board, grid, obstacles, goal, and Boti state.
   */
  public render(state: BotiState, options: RenderOptions = {}): void {
    this.lastState = {
      position: { ...state.position },
      direction: state.direction,
    };
    this.lastOptions = { ...options };

    const dims = this.calculateDimensions();
    const ctx = this.ctx;

    // Clear entire viewport
    ctx.clearRect(0, 0, dims.width, dims.height);

    // 1. Draw Grid Background Board
    this.drawBoardBackground(dims);

    // 2. Draw Grid Tiles
    this.drawTiles(dims);

    // 3. Draw Start Indicator
    this.drawStartMarker(this.config.start, dims);

    // 4. Draw Goal
    this.drawGoal(this.config.goal, dims, options.isGoal);

    // 5. Draw Obstacles
    for (const obstacle of this.config.obstacles) {
      this.drawObstacle(obstacle, dims);
    }

    // 6. Draw Boti
    this.drawBoti(state.position, state.direction, dims, options);
  }

  private drawBoardBackground(dims: RendererDimensions): void {
    const ctx = this.ctx;
    const cornerRadius = 16;
    const x = dims.offsetX - 8;
    const y = dims.offsetY - 8;
    const w = dims.tileSize * this.config.grid.width + 16;
    const h = dims.tileSize * this.config.grid.height + 16;

    ctx.save();
    ctx.fillStyle = "#f8fafc"; // Soft slate backdrop
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;

    this.roundRect(ctx, x, y, w, h, cornerRadius);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawTiles(dims: RendererDimensions): void {
    const ctx = this.ctx;
    const { width: gw, height: gh } = this.config.grid;
    const ts = dims.tileSize;

    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        const x = dims.offsetX + gx * ts;
        const y = dims.offsetY + gy * ts;
        const pad = 3;

        ctx.save();
        // Warm adventure terrain tiles
        const isAlternate = (gx + gy) % 2 === 0;
        ctx.fillStyle = isAlternate ? "#FFFFFF" : "#F7F4E9";
        ctx.strokeStyle = "#E5DFD1";
        ctx.lineWidth = 1.5;

        this.roundRect(ctx, x + pad, y + pad, ts - pad * 2, ts - pad * 2, 8);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }
  }

  private drawStartMarker(start: { x: number; y: number }, dims: RendererDimensions): void {
    const ctx = this.ctx;
    const ts = dims.tileSize;
    const cx = dims.offsetX + start.x * ts + ts / 2;
    const cy = dims.offsetY + start.y * ts + ts / 2;

    ctx.save();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, ts * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawGoal(goal: Position, dims: RendererDimensions, isReached?: boolean): void {
    const ctx = this.ctx;
    const ts = dims.tileSize;
    const cx = dims.offsetX + goal.x * ts + ts / 2;
    const cy = dims.offsetY + goal.y * ts + ts / 2;
    const r = ts * 0.32;

    ctx.save();

    // Goal aura / base
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
    ctx.fillStyle = isReached ? "rgba(34, 197, 94, 0.25)" : "rgba(245, 158, 11, 0.2)";
    ctx.fill();

    // Golden star / apple target
    ctx.fillStyle = isReached ? "#22c55e" : "#f59e0b";
    ctx.strokeStyle = isReached ? "#16a34a" : "#d97706";
    ctx.lineWidth = 2;

    this.drawStar(ctx, cx, cy, 5, r, r * 0.5);
    ctx.fill();
    ctx.stroke();

    // Sparkle effect if reached
    if (isReached) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawObstacle(obstacle: Position, dims: RendererDimensions): void {
    const ctx = this.ctx;
    const ts = dims.tileSize;
    const cx = dims.offsetX + obstacle.x * ts + ts / 2;
    const cy = dims.offsetY + obstacle.y * ts + ts / 2;
    const r = ts * 0.35;

    ctx.save();
    ctx.fillStyle = "#64748b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;

    // Rounded rock / bush obstacle
    this.roundRect(ctx, cx - r, cy - r, r * 2, r * 2, r * 0.35);
    ctx.fill();
    ctx.stroke();

    // Obstacle cross symbol
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.4, cy - r * 0.4);
    ctx.lineTo(cx + r * 0.4, cy + r * 0.4);
    ctx.moveTo(cx + r * 0.4, cy - r * 0.4);
    ctx.lineTo(cx - r * 0.4, cy + r * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  private drawBoti(
    pos: Position,
    direction: Direction,
    dims: RendererDimensions,
    options: RenderOptions
  ): void {
    const ctx = this.ctx;
    const ts = dims.tileSize;
    const cx = dims.offsetX + pos.x * ts + ts / 2;
    const cy = dims.offsetY + pos.y * ts + ts / 2;
    const r = ts * 0.34;

    ctx.save();
    ctx.translate(cx, cy);

    // Rotate according to Boti's direction:
    // "EAST" is 0 rad (right), "SOUTH" is PI/2 (down), "WEST" is PI (left), "NORTH" is -PI/2 (up)
    const angleMap: Record<Direction, number> = {
      EAST: 0,
      SOUTH: Math.PI / 2,
      WEST: Math.PI,
      NORTH: -Math.PI / 2,
    };
    ctx.rotate(angleMap[direction]);

    const theme = getAvatarTheme(options.avatarId);

    // 1. Soft Shadow
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.85, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(38, 68, 59, 0.12)";
    ctx.fill();

    // 2. Robot Ears / Antennae
    ctx.fillStyle = options.isColliding ? "#EF4444" : theme.earColor;
    ctx.beginPath();
    ctx.arc(0, -r * 0.85, r * 0.22, 0, Math.PI * 2);
    ctx.arc(0, r * 0.85, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // 3. Main Robot Head/Body (Curved Friendly Pod)
    ctx.fillStyle = options.isColliding ? "#FEE2E2" : options.isGoal ? "#DCFCE7" : theme.headColor;
    ctx.strokeStyle = options.isColliding ? "#EF4444" : options.isGoal ? "#16A34A" : theme.earColor;
    ctx.lineWidth = 2.5;

    this.roundRect(ctx, -r * 0.75, -r * 0.75, r * 1.5, r * 1.5, r * 0.45);
    ctx.fill();
    ctx.stroke();

    // 4. Face Screen (Dark Display Visor)
    ctx.fillStyle = options.isColliding ? "#7F1D1D" : theme.faceColor;
    this.roundRect(ctx, -r * 0.25, -r * 0.55, r * 0.95, r * 1.1, r * 0.3);
    ctx.fill();

    // 5. Expressive Eyes
    if (options.isColliding) {
      // Confused / dizzy X eyes
      ctx.strokeStyle = "#F87171";
      ctx.lineWidth = 2;
      this.drawCross(ctx, r * 0.2, -r * 0.25, r * 0.12);
      this.drawCross(ctx, r * 0.2, r * 0.25, r * 0.12);
    } else if (options.isGoal) {
      // Happy curve eyes ^_^
      ctx.strokeStyle = "#4ADE80";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(r * 0.2, -r * 0.25, r * 0.12, Math.PI * 1.1, Math.PI * 1.9);
      ctx.arc(r * 0.2, r * 0.25, r * 0.12, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      // Normal friendly glow eyes looking forward
      ctx.fillStyle = theme.eyeGlowColor;
      ctx.beginPath();
      ctx.arc(r * 0.25, -r * 0.25, r * 0.14, 0, Math.PI * 2);
      ctx.arc(r * 0.25, r * 0.25, r * 0.14, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(r * 0.28, -r * 0.28, r * 0.05, 0, Math.PI * 2);
      ctx.arc(r * 0.28, r * 0.22, r * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Direction Pointer / Beak
    ctx.fillStyle = options.isGoal ? "#22C55E" : theme.antennaColor;
    ctx.beginPath();
    ctx.moveTo(r * 0.75, 0);
    ctx.lineTo(r * 0.98, -r * 0.16);
    ctx.lineTo(r * 0.98, r * 0.16);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.beginPath();
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.stroke();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerR: number,
    innerR: number
  ): void {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerR;
      y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ): void {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}

import type { BotiState } from "../types/game";
import type { LevelConfig } from "../types/level";

export type RenderOptions = {
  isColliding?: boolean;
  isGoal?: boolean;
  isMoving?: boolean;
  avatarId?: string;
};

export type RendererDimensions = {
  width: number;
  height: number;
  tileSize: number;
  offsetX: number;
  offsetY: number;
};

export interface IRenderer {
  render(state: BotiState, options?: RenderOptions): void;
  resize(): void;
  destroy(): void;
  getLevelConfig(): LevelConfig;
}

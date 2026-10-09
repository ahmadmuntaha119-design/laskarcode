import { z } from "zod";
import type { Direction, GameAction, Position } from "./game";

export type GridSize = {
  width: number;
  height: number;
};

export type LevelStartConfig = {
  x: number;
  y: number;
  direction: Direction;
};

export type LevelConfig = {
  grid: GridSize;
  start: LevelStartConfig;
  goal: Position;
  obstacles: Position[];
  availableBlocks: GameAction[];
  maxActions: number;
};

export const positionSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
});

export const directionSchema = z.enum(["NORTH", "EAST", "SOUTH", "WEST"]);

export const gameActionSchema = z.enum(["MOVE", "TURN_LEFT", "TURN_RIGHT"]);

export const gridSizeSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const levelStartSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  direction: directionSchema,
});

export const levelConfigSchema = z
  .object({
    grid: gridSizeSchema,
    start: levelStartSchema,
    goal: positionSchema,
    obstacles: z.array(positionSchema),
    availableBlocks: z.array(gameActionSchema).min(1),
    maxActions: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    // Validate start inside grid
    if (data.start.x >= data.grid.width || data.start.y >= data.grid.height) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Start position (${data.start.x}, ${data.start.y}) is outside grid (${data.grid.width}x${data.grid.height})`,
        path: ["start"],
      });
    }

    // Validate goal inside grid
    if (data.goal.x >= data.grid.width || data.goal.y >= data.grid.height) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Goal position (${data.goal.x}, ${data.goal.y}) is outside grid (${data.grid.width}x${data.grid.height})`,
        path: ["goal"],
      });
    }

    // Validate obstacles inside grid
    data.obstacles.forEach((obstacle, index) => {
      if (obstacle.x >= data.grid.width || obstacle.y >= data.grid.height) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Obstacle at index ${index} (${obstacle.x}, ${obstacle.y}) is outside grid (${data.grid.width}x${data.grid.height})`,
          path: ["obstacles", index],
        });
      }
    });

    // Validate start is not on obstacle
    const startOnObstacle = data.obstacles.some(
      (o) => o.x === data.start.x && o.y === data.start.y
    );
    if (startOnObstacle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Start position (${data.start.x}, ${data.start.y}) collides with an obstacle`,
        path: ["start"],
      });
    }

    // Validate goal is not on obstacle
    const goalOnObstacle = data.obstacles.some(
      (o) => o.x === data.goal.x && o.y === data.goal.y
    );
    if (goalOnObstacle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Goal position (${data.goal.x}, ${data.goal.y}) collides with an obstacle`,
        path: ["goal"],
      });
    }
  });

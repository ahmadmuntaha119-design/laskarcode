import { z } from "zod";
import type { GameAction, Position } from "../types/game";
import type { GridSize, LevelStartConfig } from "../types/level";
import {
  gameActionSchema,
  gridSizeSchema,
  levelStartSchema,
  positionSchema,
} from "../types/level";

export type LevelType = "Learn" | "Practice" | "Debugging" | "Mastery Check";

export type LevelDefinition = {
  code: string;
  islandSlug: string;
  title: string;
  description: string;
  levelType: LevelType;
  orderIndex: number;
  difficulty: number;
  concepts: string[];
  grid: GridSize;
  start: LevelStartConfig;
  goal: Position;
  obstacles: Position[];
  availableBlocks: GameAction[];
  maxActions: number;
};

export type IslandDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  orderIndex: number;
  levelCodes: string[];
};

export const levelTypeSchema = z.enum(["Learn", "Practice", "Debugging", "Mastery Check"]);

export const levelDefinitionSchema = z
  .object({
    code: z.string().min(1),
    islandSlug: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    levelType: levelTypeSchema,
    orderIndex: z.number().int().positive(),
    difficulty: z.number().int().min(1).max(5),
    concepts: z.array(z.string()).min(1),
    grid: gridSizeSchema,
    start: levelStartSchema,
    goal: positionSchema,
    obstacles: z.array(positionSchema),
    availableBlocks: z.array(gameActionSchema).min(1),
    maxActions: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    // Validate start position inside grid
    if (data.start.x >= data.grid.width || data.start.y >= data.grid.height) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Start position (${data.start.x}, ${data.start.y}) is outside grid (${data.grid.width}x${data.grid.height})`,
        path: ["start"],
      });
    }

    // Validate goal position inside grid
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

    // Validate start does not collide with an obstacle
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

    // Validate goal does not collide with an obstacle
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

    // Validate start is not identical to goal
    if (data.start.x === data.goal.x && data.start.y === data.goal.y) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Start position cannot be the same as Goal position`,
        path: ["goal"],
      });
    }
  });

export const islandDefinitionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  orderIndex: z.number().int().positive(),
  levelCodes: z.array(z.string()).min(1),
});

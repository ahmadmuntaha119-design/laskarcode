import { describe, expect, it } from "vitest";
import {
  InvalidLevelConfigError,
  validateLevelConfig,
} from "@/game/engine/validation";
import type { LevelConfig } from "@/game/types/level";

describe("Level Config Validation", () => {
  const validConfig: LevelConfig = {
    grid: { width: 5, height: 3 },
    start: { x: 0, y: 0, direction: "EAST" },
    goal: { x: 4, y: 2 },
    obstacles: [
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
      { x: 4, y: 1 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 12,
  };

  it("should validate and return a valid level config", () => {
    const validated = validateLevelConfig(validConfig);
    expect(validated).toEqual(validConfig);
  });

  it("should reject start position outside grid bounds", () => {
    const invalid = {
      ...validConfig,
      start: { x: 5, y: 0, direction: "EAST" },
    };
    expect(() => validateLevelConfig(invalid)).toThrowError(
      InvalidLevelConfigError
    );
    expect(() => validateLevelConfig(invalid)).toThrow(
      /Start position.*is outside grid/
    );
  });

  it("should reject goal position outside grid bounds", () => {
    const invalid = {
      ...validConfig,
      goal: { x: 4, y: 3 },
    };
    expect(() => validateLevelConfig(invalid)).toThrowError(
      InvalidLevelConfigError
    );
    expect(() => validateLevelConfig(invalid)).toThrow(
      /Goal position.*is outside grid/
    );
  });

  it("should reject obstacles placed outside grid bounds", () => {
    const invalid = {
      ...validConfig,
      obstacles: [{ x: 5, y: 2 }],
    };
    expect(() => validateLevelConfig(invalid)).toThrowError(
      InvalidLevelConfigError
    );
    expect(() => validateLevelConfig(invalid)).toThrow(
      /Obstacle at index 0.*is outside grid/
    );
  });

  it("should reject start position colliding with an obstacle", () => {
    const invalid = {
      ...validConfig,
      start: { x: 2, y: 0, direction: "EAST" },
    };
    expect(() => validateLevelConfig(invalid)).toThrowError(
      InvalidLevelConfigError
    );
    expect(() => validateLevelConfig(invalid)).toThrow(
      /Start position.*collides with an obstacle/
    );
  });

  it("should reject goal position colliding with an obstacle", () => {
    const invalid = {
      ...validConfig,
      goal: { x: 2, y: 0 },
    };
    expect(() => validateLevelConfig(invalid)).toThrowError(
      InvalidLevelConfigError
    );
    expect(() => validateLevelConfig(invalid)).toThrow(
      /Goal position.*collides with an obstacle/
    );
  });

  it("should reject invalid direction string", () => {
    const invalid = {
      ...validConfig,
      start: { x: 0, y: 0, direction: "UPWARD" },
    };
    expect(() => validateLevelConfig(invalid)).toThrowError(
      InvalidLevelConfigError
    );
  });

  it("should reject zero or negative grid dimensions", () => {
    const invalid = {
      ...validConfig,
      grid: { width: 0, height: 3 },
    };
    expect(() => validateLevelConfig(invalid)).toThrowError(
      InvalidLevelConfigError
    );
  });

  it("should reject zero or negative maxActions", () => {
    const invalid = {
      ...validConfig,
      maxActions: 0,
    };
    expect(() => validateLevelConfig(invalid)).toThrowError(
      InvalidLevelConfigError
    );
  });

  it("should reject empty availableBlocks", () => {
    const invalid = {
      ...validConfig,
      availableBlocks: [],
    };
    expect(() => validateLevelConfig(invalid)).toThrowError(
      InvalidLevelConfigError
    );
  });
});

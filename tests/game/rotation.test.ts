import { describe, expect, it } from "vitest";
import { rotate, rotateLeft, rotateRight } from "@/game/engine/rotation";
import type { Direction } from "@/game/types/game";

describe("Rotation Engine", () => {
  describe("rotateRight (Clockwise)", () => {
    it("should rotate NORTH -> EAST", () => {
      expect(rotateRight("NORTH")).toBe("EAST");
    });

    it("should rotate EAST -> SOUTH", () => {
      expect(rotateRight("EAST")).toBe("SOUTH");
    });

    it("should rotate SOUTH -> WEST", () => {
      expect(rotateRight("SOUTH")).toBe("WEST");
    });

    it("should rotate WEST -> NORTH", () => {
      expect(rotateRight("WEST")).toBe("NORTH");
    });

    it("should complete a full 360-degree rotation back to original direction", () => {
      let dir: Direction = "NORTH";
      for (let i = 0; i < 4; i++) {
        dir = rotateRight(dir);
      }
      expect(dir).toBe("NORTH");
    });
  });

  describe("rotateLeft (Counter-Clockwise)", () => {
    it("should rotate NORTH -> WEST", () => {
      expect(rotateLeft("NORTH")).toBe("WEST");
    });

    it("should rotate WEST -> SOUTH", () => {
      expect(rotateLeft("WEST")).toBe("SOUTH");
    });

    it("should rotate SOUTH -> EAST", () => {
      expect(rotateLeft("SOUTH")).toBe("EAST");
    });

    it("should rotate EAST -> NORTH", () => {
      expect(rotateLeft("EAST")).toBe("NORTH");
    });

    it("should complete a full 360-degree counter-clockwise rotation back to original direction", () => {
      let dir: Direction = "NORTH";
      for (let i = 0; i < 4; i++) {
        dir = rotateLeft(dir);
      }
      expect(dir).toBe("NORTH");
    });
  });

  describe("rotate dispatcher", () => {
    it("should delegate to rotateLeft on TURN_LEFT", () => {
      expect(rotate("NORTH", "TURN_LEFT")).toBe("WEST");
      expect(rotate("EAST", "TURN_LEFT")).toBe("NORTH");
    });

    it("should delegate to rotateRight on TURN_RIGHT", () => {
      expect(rotate("NORTH", "TURN_RIGHT")).toBe("EAST");
      expect(rotate("WEST", "TURN_RIGHT")).toBe("NORTH");
    });
  });
});

import type * as Blockly from "blockly";
import type { GameAction } from "../types/game";

export const BLOCK_IDS = {
  MOVE: "boti_move",
  TURN_LEFT: "boti_turn_left",
  TURN_RIGHT: "boti_turn_right",
} as const;

export const BLOCK_DEFINITIONS = [
  {
    type: BLOCK_IDS.MOVE,
    message0: "Maju 🐾",
    previousStatement: null,
    nextStatement: null,
    colour: 142, // Vibrant emerald green
    tooltip: "Cipi bergerak maju 1 langkah ke arah depan.",
    helpUrl: "",
  },
  {
    type: BLOCK_IDS.TURN_LEFT,
    message0: "Belok Kiri ↺",
    previousStatement: null,
    nextStatement: null,
    colour: 200, // Sky blue
    tooltip: "Cipi berputar 90 derajat ke kiri.",
    helpUrl: "",
  },
  {
    type: BLOCK_IDS.TURN_RIGHT,
    message0: "Belok Kanan ↻",
    previousStatement: null,
    nextStatement: null,
    colour: 220, // Indigo blue
    tooltip: "Cipi berputar 90 derajat ke kanan.",
    helpUrl: "",
  },
];

/**
 * Maps block type string to corresponding GameAction.
 * Supports both custom block names ('boti_move', 'cipi_move') and uppercase names ('MOVE').
 */
export function blockTypeToAction(type: string): GameAction | null {
  switch (type) {
    case BLOCK_IDS.MOVE:
    case "cipi_move":
    case "MOVE":
    case "move":
      return "MOVE";
    case BLOCK_IDS.TURN_LEFT:
    case "cipi_turn_left":
    case "TURN_LEFT":
    case "turn_left":
      return "TURN_LEFT";
    case BLOCK_IDS.TURN_RIGHT:
    case "cipi_turn_right":
    case "TURN_RIGHT":
    case "turn_right":
      return "TURN_RIGHT";
    default:
      return null;
  }
}

/**
 * Maps GameAction to Blockly block type.
 */
export function actionToBlockType(action: GameAction): string {
  switch (action) {
    case "MOVE":
      return BLOCK_IDS.MOVE;
    case "TURN_LEFT":
      return BLOCK_IDS.TURN_LEFT;
    case "TURN_RIGHT":
      return BLOCK_IDS.TURN_RIGHT;
  }
}

/**
 * Generates dynamic Blockly toolbox definition based on available blocks.
 */
export function createToolbox(
  availableBlocks: readonly GameAction[]
): Blockly.utils.toolbox.ToolboxInfo {
  const contents: Blockly.utils.toolbox.ToolboxItemInfo[] = availableBlocks.map((action) => ({
    kind: "block",
    type: actionToBlockType(action),
  }));

  return {
    kind: "flyoutToolbox",
    contents,
  };
}

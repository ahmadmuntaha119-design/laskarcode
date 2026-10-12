import type { GameAction } from "../types/game";

export type BlockType = "boti_move" | "boti_turn_left" | "boti_turn_right" | "MOVE" | "TURN_LEFT" | "TURN_RIGHT";

export type ParseErrorCode =
  | "EMPTY_WORKSPACE"
  | "UNAVAILABLE_BLOCK"
  | "UNKNOWN_BLOCK"
  | "DISCONNECTED_BLOCKS";

export type ParseError = {
  code: ParseErrorCode;
  message: string;
  blockType?: string;
};

export type ParseResult =
  | {
      success: true;
      actions: GameAction[];
    }
  | {
      success: false;
      error: ParseError;
    };

export interface BlockLike {
  type: string;
  getNextBlock(): BlockLike | null;
}

export interface WorkspaceLike {
  getTopBlocks(ordered?: boolean): BlockLike[];
}

import type { GameAction } from "../types/game";
import { blockTypeToAction } from "./blocks";
import type { BlockLike, ParseResult, WorkspaceLike } from "./types";

export type ParseOptions = {
  /**
   * List of allowed GameActions for the current level.
   * If provided, any block not in this list will be rejected with UNAVAILABLE_BLOCK.
   */
  availableBlocks?: readonly GameAction[];
  /**
   * If true, errors if more than one disconnected stack exists in the workspace.
   * Defaults to false (traverses the primary top block).
   */
  strictSingleStack?: boolean;
};

export class BlocklyParser {
  /**
   * Parses a Blockly workspace or block-like structure into a sequence of GameActions.
   */
  public static parseWorkspace(
    workspace: WorkspaceLike | null | undefined,
    options?: ParseOptions
  ): ParseResult {
    if (!workspace) {
      return {
        success: false,
        error: {
          code: "EMPTY_WORKSPACE",
          message: "Workspace kosong. Susun blok instruksi sebelum menjalankan!",
        },
      };
    }

    const topBlocks = workspace.getTopBlocks(true);
    if (!topBlocks || topBlocks.length === 0) {
      return {
        success: false,
        error: {
          code: "EMPTY_WORKSPACE",
          message: "Workspace kosong. Susun blok instruksi sebelum menjalankan!",
        },
      };
    }

    if (options?.strictSingleStack && topBlocks.length > 1) {
      return {
        success: false,
        error: {
          code: "DISCONNECTED_BLOCKS",
          message: "Terdapat blok yang belum terhubung. Sambungkan semua blok menjadi satu urutan langkah!",
        },
      };
    }

    // Traverse the primary connected stack from top to bottom
    const blockTypes: string[] = [];
    let currentBlock: BlockLike | null = topBlocks[0];

    while (currentBlock) {
      blockTypes.push(currentBlock.type);
      currentBlock = currentBlock.getNextBlock();
    }

    return BlocklyParser.parseBlockSequence(blockTypes, options);
  }

  /**
   * Parses an array of block type strings directly into a sequence of GameActions.
   */
  public static parseBlockSequence(
    blockTypes: readonly string[],
    options?: ParseOptions
  ): ParseResult {
    if (!blockTypes || blockTypes.length === 0) {
      return {
        success: false,
        error: {
          code: "EMPTY_WORKSPACE",
          message: "Tidak ada blok yang disusun. Tambahkan blok ke area kode!",
        },
      };
    }

    const actions: GameAction[] = [];

    for (const type of blockTypes) {
      const action = blockTypeToAction(type);

      if (!action) {
        return {
          success: false,
          error: {
            code: "UNKNOWN_BLOCK",
            message: `Blok tidak dikenal: '${type}'.`,
            blockType: type,
          },
        };
      }

      if (options?.availableBlocks && !options.availableBlocks.includes(action)) {
        return {
          success: false,
          error: {
            code: "UNAVAILABLE_BLOCK",
            message: `Blok '${action}' tidak diizinkan untuk level ini.`,
            blockType: type,
          },
        };
      }

      actions.push(action);
    }

    return {
      success: true,
      actions,
    };
  }
}

import type { BotiState, GameAction } from "./game";

export type GameEventType =
  | "ACTION_EXECUTED"
  | "OBSTACLE_COLLISION"
  | "BOUNDARY_COLLISION"
  | "GOAL_REACHED"
  | "MAX_ACTIONS_REACHED"
  | "RESET";

export type GameEvent = {
  type: GameEventType;
  action?: GameAction;
  actionIndex?: number;
  state: BotiState;
  payload?: Record<string, unknown>;
};

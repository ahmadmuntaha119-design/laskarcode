export type Position = {
  x: number;
  y: number;
};

export type Direction = "NORTH" | "EAST" | "SOUTH" | "WEST";

export type BotiState = {
  position: Position;
  direction: Direction;
};

export type GameAction = "MOVE" | "TURN_LEFT" | "TURN_RIGHT";

export type ExecutionState =
  | "IDLE"
  | "RUNNING"
  | "PAUSED"
  | "SUCCESS"
  | "FAILED";

export type GameResult = {
  status: "SUCCESS" | "FAILED";
  completed: boolean;
  actionsExecuted: number;
  collisions: number;
  finalPosition: Position;
  finalState?: BotiState;
};

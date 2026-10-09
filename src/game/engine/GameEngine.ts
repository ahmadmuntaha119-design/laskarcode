import type {
  BotiState,
  ExecutionState,
  GameAction,
  GameResult,
  Position,
} from "../types/game";
import type { GameEvent, GameEventType } from "../types/events";
import type { LevelConfig } from "../types/level";
import { checkCollision } from "./collision";
import { isGoalReached } from "./goal";
import { getNextPosition } from "./movement";
import { rotate } from "./rotation";
import { validateLevelConfig } from "./validation";

export type StepResult = {
  action: GameAction;
  actionIndex: number;
  previousState: BotiState;
  currentState: BotiState;
  event: GameEvent;
  executionState: ExecutionState;
};

export class GameEngine {
  private readonly config: LevelConfig;
  private state: BotiState;
  private executionState: ExecutionState = "IDLE";
  private collisions = 0;
  private actionsExecuted = 0;
  private events: GameEvent[] = [];

  constructor(rawConfig: unknown) {
    this.config = validateLevelConfig(rawConfig);
    this.state = this.createInitialBotiState();
  }

  private createInitialBotiState(): BotiState {
    return {
      position: {
        x: this.config.start.x,
        y: this.config.start.y,
      },
      direction: this.config.start.direction,
    };
  }

  /**
   * Returns a copy of the current Boti state (position and direction).
   */
  public getState(): BotiState {
    return {
      position: { ...this.state.position },
      direction: this.state.direction,
    };
  }

  /**
   * Returns current execution lifecycle state.
   */
  public getExecutionState(): ExecutionState {
    return this.executionState;
  }

  /**
   * Returns the validated LevelConfig.
   */
  public getLevelConfig(): LevelConfig {
    return {
      ...this.config,
      grid: { ...this.config.grid },
      start: { ...this.config.start },
      goal: { ...this.config.goal },
      obstacles: this.config.obstacles.map((o) => ({ ...o })),
      availableBlocks: [...this.config.availableBlocks],
    };
  }

  /**
   * Returns total collision count in current run.
   */
  public getCollisions(): number {
    return this.collisions;
  }

  /**
   * Returns number of actions executed so far.
   */
  public getActionsExecuted(): number {
    return this.actionsExecuted;
  }

  /**
   * Returns the list of recorded game events.
   */
  public getEvents(): readonly GameEvent[] {
    return [...this.events];
  }

  /**
   * Resets the game to the level's initial state:
   * - Restores initial Boti position and direction
   * - Clears collision count and actions counter
   * - Sets execution state to IDLE
   * - Records a RESET event
   */
  public reset(): void {
    this.state = this.createInitialBotiState();
    this.executionState = "IDLE";
    this.collisions = 0;
    this.actionsExecuted = 0;
    this.events = [];

    const resetEvent: GameEvent = {
      type: "RESET",
      state: this.getState(),
    };
    this.events.push(resetEvent);
  }

  /**
   * Executes a single game action step-by-step.
   */
  public step(action: GameAction): StepResult {
    // If already in terminal state, return current status without mutation
    if (this.executionState === "SUCCESS" || this.executionState === "FAILED") {
      const lastEvent = this.events[this.events.length - 1];
      return {
        action,
        actionIndex: this.actionsExecuted,
        previousState: this.getState(),
        currentState: this.getState(),
        event: lastEvent ?? {
          type: this.executionState === "SUCCESS" ? "GOAL_REACHED" : "MAX_ACTIONS_REACHED",
          state: this.getState(),
        },
        executionState: this.executionState,
      };
    }

    this.executionState = "RUNNING";
    const previousState = this.getState();
    const actionIndex = this.actionsExecuted;
    this.actionsExecuted += 1;

    let eventType: GameEventType = "ACTION_EXECUTED";
    let payload: Record<string, unknown> | undefined;

    switch (action) {
      case "TURN_LEFT":
      case "TURN_RIGHT": {
        this.state = {
          position: { ...this.state.position },
          direction: rotate(this.state.direction, action),
        };
        break;
      }

      case "MOVE": {
        const candidatePosition: Position = getNextPosition(
          this.state.position,
          this.state.direction
        );

        const collision = checkCollision(
          candidatePosition,
          this.config.grid,
          this.config.obstacles
        );

        if (collision === "BOUNDARY") {
          this.collisions += 1;
          eventType = "BOUNDARY_COLLISION";
          payload = { attemptedPosition: candidatePosition };
          // Position does not change
        } else if (collision === "OBSTACLE") {
          this.collisions += 1;
          eventType = "OBSTACLE_COLLISION";
          payload = { attemptedPosition: candidatePosition };
          // Position does not change
        } else {
          // Valid move
          this.state = {
            position: candidatePosition,
            direction: this.state.direction,
          };
        }
        break;
      }
    }

    const event: GameEvent = {
      type: eventType,
      action,
      actionIndex,
      state: this.getState(),
      payload,
    };
    this.events.push(event);

    // Goal detection - if reached, execution terminates immediately with SUCCESS
    if (isGoalReached(this.state.position, this.config.goal)) {
      this.executionState = "SUCCESS";
      const goalEvent: GameEvent = {
        type: "GOAL_REACHED",
        action,
        actionIndex,
        state: this.getState(),
      };
      this.events.push(goalEvent);
    } else if (this.actionsExecuted >= this.config.maxActions) {
      // Max actions reached without reaching goal
      this.executionState = "FAILED";
      const maxActionEvent: GameEvent = {
        type: "MAX_ACTIONS_REACHED",
        action,
        actionIndex,
        state: this.getState(),
        payload: { maxActions: this.config.maxActions },
      };
      this.events.push(maxActionEvent);
    }

    return {
      action,
      actionIndex,
      previousState,
      currentState: this.getState(),
      event,
      executionState: this.executionState,
    };
  }

  /**
   * Executes a sequence of actions.
   * Execution stops immediately when goal is reached or max actions exceeded.
   */
  public execute(actions: readonly GameAction[]): GameResult {
    this.reset();

    // Check if initial position is already the goal
    if (isGoalReached(this.state.position, this.config.goal)) {
      this.executionState = "SUCCESS";
      this.events.push({
        type: "GOAL_REACHED",
        state: this.getState(),
      });
      return this.buildResult();
    }

    for (const action of actions) {
      this.step(action);

      // Stop execution immediately upon SUCCESS or FAILED
      if (this.executionState === "SUCCESS" || this.executionState === "FAILED") {
        break;
      }
    }

    // If all actions processed and goal was not reached, mark as FAILED
    if (this.executionState !== "SUCCESS") {
      this.executionState = "FAILED";
    }

    return this.buildResult();
  }

  private buildResult(): GameResult {
    const completed = this.executionState === "SUCCESS";
    return {
      status: completed ? "SUCCESS" : "FAILED",
      completed,
      actionsExecuted: this.actionsExecuted,
      collisions: this.collisions,
      finalPosition: { ...this.state.position },
      finalState: this.getState(),
    };
  }
}

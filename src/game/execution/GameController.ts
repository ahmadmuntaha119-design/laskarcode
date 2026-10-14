import { GameEngine, type StepResult } from "../engine/GameEngine";
import type { BotiState, GameAction, GameResult } from "../types/game";
import type { LevelConfig } from "../types/level";

export type ControllerStatus = "IDLE" | "RUNNING" | "SUCCESS" | "FAILED";

export type ControllerCallbacks = {
  onStep?: (result: StepResult) => void;
  onComplete?: (result: GameResult) => void;
  onReset?: (initialState: BotiState) => void;
  onError?: (error: string) => void;
};

export type RunOptions = {
  stepDelayMs?: number;
};

export class GameController {
  private readonly engine: GameEngine;
  private status: ControllerStatus = "IDLE";
  private isCancelled = false;
  private activeTimerId: ReturnType<typeof setTimeout> | null = null;
  private delayResolver: (() => void) | null = null;
  private callbacks: ControllerCallbacks = {};

  constructor(rawConfig: LevelConfig | unknown) {
    this.engine = new GameEngine(rawConfig);
  }

  public setCallbacks(callbacks: ControllerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public getStatus(): ControllerStatus {
    return this.status;
  }

  public getState(): BotiState {
    return this.engine.getState();
  }

  public getEngine(): GameEngine {
    return this.engine;
  }

  public getLevelConfig(): LevelConfig {
    return this.engine.getLevelConfig();
  }

  public getCollisions(): number {
    return this.engine.getCollisions();
  }

  public getActionsExecuted(): number {
    return this.engine.getActionsExecuted();
  }

  /**
   * Resets execution state, cancels any pending animations,
   * and restores Boti to initial level coordinates.
   */
  public reset(): void {
    this.cancelExecution();
    this.engine.reset();
    this.status = "IDLE";
    this.callbacks.onReset?.(this.engine.getState());
  }

  /**
   * Cancels in-flight execution loop without throwing.
   */
  public cancelExecution(): void {
    this.isCancelled = true;
    if (this.status === "RUNNING") {
      this.status = "IDLE";
    }
    if (this.activeTimerId !== null) {
      clearTimeout(this.activeTimerId);
      this.activeTimerId = null;
    }
    if (this.delayResolver !== null) {
      this.delayResolver();
      this.delayResolver = null;
    }
  }

  /**
   * Executes a sequence of actions step-by-step with delay.
   * Prevents concurrent runs.
   */
  public async run(actions: readonly GameAction[], options: RunOptions = {}): Promise<GameResult> {
    if (this.status === "RUNNING") {
      throw new Error("Game is already running. Please wait or reset first.");
    }

    this.cancelExecution();
    this.isCancelled = false;
    this.status = "RUNNING";

    const stepDelay = options.stepDelayMs ?? 400;

    // Reset engine before run starts
    this.engine.reset();

    // Check if start is already goal
    if (this.engine.getExecutionState() === "SUCCESS") {
      this.status = "SUCCESS";
      const finalResult: GameResult = {
        status: "SUCCESS",
        completed: true,
        actionsExecuted: 0,
        collisions: 0,
        finalPosition: this.engine.getState().position,
        finalState: this.engine.getState(),
      };
      this.callbacks.onComplete?.(finalResult);
      return finalResult;
    }

    for (let i = 0; i < actions.length; i++) {
      if (this.isCancelled) {
        break;
      }

      const action = actions[i];
      const result = this.engine.step(action);

      this.callbacks.onStep?.(result);

      // Check if reached terminal state
      if (result.executionState === "SUCCESS" || result.executionState === "FAILED") {
        this.status = result.executionState;
        break;
      }

      // If more actions remain, wait stepDelay
      if (i < actions.length - 1) {
        await this.delay(stepDelay);
        if (this.isCancelled) {
          break;
        }
      }
    }

    // Determine final status if loop finished without terminal state
    if (!this.isCancelled) {
      if (this.engine.getExecutionState() === "SUCCESS") {
        this.status = "SUCCESS";
      } else {
        this.status = "FAILED";
      }
    }

    const finalResult: GameResult = {
      status: this.status === "SUCCESS" ? "SUCCESS" : "FAILED",
      completed: this.status === "SUCCESS",
      actionsExecuted: this.engine.getActionsExecuted(),
      collisions: this.engine.getCollisions(),
      finalPosition: this.engine.getState().position,
      finalState: this.engine.getState(),
    };

    if (!this.isCancelled) {
      this.callbacks.onComplete?.(finalResult);
    }

    return finalResult;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.delayResolver = resolve;
      this.activeTimerId = setTimeout(() => {
        this.activeTimerId = null;
        this.delayResolver = null;
        resolve();
      }, ms);
    });
  }
}

import { levelConfigSchema, type LevelConfig } from "../types/level";

export class InvalidLevelConfigError extends Error {
  constructor(message: string, public readonly issues?: unknown[]) {
    super(message);
    this.name = "InvalidLevelConfigError";
  }
}

/**
 * Validates level configuration against strict schema rules.
 * Throws InvalidLevelConfigError with detailed message if validation fails.
 */
export function validateLevelConfig(config: unknown): LevelConfig {
  const result = levelConfigSchema.safeParse(config);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    throw new InvalidLevelConfigError(
      `Invalid level configuration: ${errorDetails}`,
      result.error.issues
    );
  }

  return result.data;
}

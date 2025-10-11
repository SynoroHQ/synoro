/**
 * Типизированные ошибки для EventLogService
 * Упрощают обработку и отладку ошибок
 */

export class EventLogError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "EventLogError";
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

export class EventLogValidationError extends EventLogError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "EventLogValidationError";
  }
}

export class EventLogNotFoundError extends EventLogError {
  constructor(id: string) {
    super(`Event log not found: ${id}`, "NOT_FOUND", { id });
    this.name = "EventLogNotFoundError";
  }
}

export class EventLogStatusTransitionError extends EventLogError {
  constructor(from: string, to: string, allowedTransitions: string[]) {
    super(
      `Invalid status transition from '${from}' to '${to}'. Allowed: ${allowedTransitions.join(", ")}`,
      "INVALID_TRANSITION",
      { from, to, allowedTransitions },
    );
    this.name = "EventLogStatusTransitionError";
  }
}

export class EventLogRateLimitError extends EventLogError {
  constructor(source: string, chatId: string, limit: number) {
    super(
      `Rate limit exceeded for ${source}:${chatId}. Maximum ${limit} events per minute.`,
      "RATE_LIMIT_EXCEEDED",
      { source, chatId, limit },
    );
    this.name = "EventLogRateLimitError";
  }
}

export class EventLogDatabaseError extends EventLogError {
  constructor(operation: string, originalError: unknown) {
    const message =
      originalError instanceof Error
        ? originalError.message
        : String(originalError);
    super(`Database error during ${operation}: ${message}`, "DATABASE_ERROR", {
      operation,
      originalError:
        originalError instanceof Error
          ? {
              message: originalError.message,
              stack: originalError.stack,
            }
          : originalError,
    });
    this.name = "EventLogDatabaseError";
  }
}

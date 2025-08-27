/**
 * Телеметрия для AI функций
 */
export interface Telemetry {
  functionId: string;
  metadata?: Record<string, unknown>;
}

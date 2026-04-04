/**
 * backendService.ts
 * Provides a lazy-initialized backend singleton for use in non-hook contexts.
 * Call `getBackend()` to get the backendInterface instance.
 */
import type { backendInterface } from "./backend";
import { createActorWithConfig } from "./config";

let _backendPromise: Promise<backendInterface> | null = null;

export function getBackend(): Promise<backendInterface> {
  if (!_backendPromise) {
    _backendPromise = createActorWithConfig();
  }
  return _backendPromise;
}

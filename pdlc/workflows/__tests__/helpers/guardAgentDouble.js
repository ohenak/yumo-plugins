/**
 * Canonical guard agent test double (PROP-COMPAT-06, PLAN TASK-P2-03, DEC-ODW-03).
 *
 * All test files that exercise a guard-agent call path MUST import from this canonical path.
 * Per-test ad-hoc stubs are prohibited.
 *
 * Usage:
 *   import { createGuardAgentDouble } from './helpers/guardAgentDouble.js';
 *
 *   const guardDouble = createGuardAgentDouble({ ok: true });
 *   // or
 *   const guardDouble = createGuardAgentDouble({ ok: false, reason: 'file_not_found' });
 */

/**
 * Creates a mock guard agent function that resolves with the given response.
 *
 * @param {{ ok: boolean, reason?: 'file_not_found' | 'file_empty' | 'path_invalid' }} response
 * @returns {function(): Promise<{ ok: boolean, reason?: string }>}
 */
export function createGuardAgentDouble({ ok, reason } = { ok: true }) {
  return async function guardAgent(_path) {
    if (ok) {
      return { ok: true };
    }
    return { ok: false, reason: reason ?? "file_not_found" };
  };
}

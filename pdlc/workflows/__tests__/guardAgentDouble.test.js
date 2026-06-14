/**
 * Tests for guardAgentDouble helper (PROP-COMPAT-06, DEC-ODW-03, PLAN TASK-P2-03)
 */

import { createGuardAgentDouble } from "./helpers/guardAgentDouble.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("createGuardAgentDouble — PROP-COMPAT-06", () => {
  it("returns ok: true when configured with ok: true", async () => {
    const double = createGuardAgentDouble({ ok: true });
    const result = await double("guard", "check-exists:docs/feature/REQ.md");
    expect(result).toEqual({ ok: true });
  });

  it("returns ok: false, reason: file_not_found when configured", async () => {
    const double = createGuardAgentDouble({
      ok: false,
      reason: "file_not_found",
    });
    const result = await double("guard", "check-exists:docs/feature/REQ.md");
    expect(result).toEqual({ ok: false, reason: "file_not_found" });
  });

  it("returns ok: false, reason: file_empty when configured", async () => {
    const double = createGuardAgentDouble({ ok: false, reason: "file_empty" });
    const result = await double("guard", "check-exists:docs/feature/REQ.md");
    expect(result).toEqual({ ok: false, reason: "file_empty" });
  });

  it("returns ok: false, reason: path_invalid when configured", async () => {
    const double = createGuardAgentDouble({
      ok: false,
      reason: "path_invalid",
    });
    const result = await double("guard", "check-exists:docs/feature/REQ.md");
    expect(result).toEqual({ ok: false, reason: "path_invalid" });
  });

  it("defaults to file_not_found when ok:false but no reason given", async () => {
    const double = createGuardAgentDouble({ ok: false });
    const result = await double("guard", "check-exists:");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("file_not_found");
  });

  it("is an async function", async () => {
    const double = createGuardAgentDouble({ ok: true });
    expect(typeof double).toBe("function");
    const p = double("guard", "path");
    expect(p instanceof Promise).toBe(true);
    await p;
  });

  // PROP-COMPAT-06: canonical path check — the guard double file must exist at the right path
  it("guardAgentDouble.js exists at canonical path helpers/guardAgentDouble.js", () => {
    const canonicalPath = resolve(__dirname, "helpers/guardAgentDouble.js");
    expect(() => readFileSync(canonicalPath, "utf8")).not.toThrow();
  });
});

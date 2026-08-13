// M-ENG-09 guard-measurement gate (TSPEC §6.5, DEC-ENG-04, PLAN T29).
//
// Pure logic lives here so PROP-GUARD-20/21/22 can be exercised over fixture
// baseline text without touching the filesystem or the real repo state; the
// suite-integration half (reading the real baseline file for the real
// `process.platform`) lives in `__tests__/m-eng-09.test.js`, which is exactly
// the hermetic-suite member this gate is meant to fail (TSPEC §6.5's
// "unrecorded is red, not silent").

const SECTION_HEADING = "## M-ENG-09";
export const GUARD_MEASUREMENT_OPT_IN_COMMAND =
  "PDLC_LIVE=1 node --test __tests__/live/guard-measurement.test.js";

/**
 * Parses every M-ENG-09 data row out of the baseline doc's own section
 * (`## M-ENG-09` up to the next `## ` heading, or EOF). Columns, in order:
 * date | platform | transport | sdkVersion | denyFired. A row missing any
 * column is dropped — PROP-GUARD-22 requires all five present, and a
 * malformed row must never satisfy the obligation silently.
 */
function parseRows(baselineText) {
  const headingIndex = baselineText.indexOf(SECTION_HEADING);
  if (headingIndex === -1) return [];

  const rest = baselineText.slice(headingIndex + SECTION_HEADING.length);
  const nextHeadingMatch = rest.match(/\n##[^#]/);
  const section = nextHeadingMatch ? rest.slice(0, nextHeadingMatch.index) : rest;

  const rows = [];
  for (const rawLine of section.split("\n")) {
    const line = rawLine.trim();
    if (!line.startsWith("|") || !line.endsWith("|")) continue;
    const cells = line
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());
    if (cells.length !== 5) continue;
    const [date, platform, transport, sdkVersion, denyFired] = cells;
    if (/^date$/i.test(date)) continue; // header row
    if (/^-+$/.test(date.replace(/[: ]/g, "")) && cells.every((c) => /^:?-+:?$/.test(c))) continue; // separator row
    if (!date || !platform || !transport || !sdkVersion || !denyFired) continue; // incomplete row
    rows.push({ date, platform, transport, sdkVersion, denyFired });
  }
  return rows;
}

/**
 * The gate itself (PROP-GUARD-20/21/22, NEG-23):
 *  - no row for `platform`               -> red, "missing" message
 *  - row present, denyFired: no,
 *    hookCarrierShipped: true            -> red, "negative" message (DEC-ENG-04)
 *  - row present, denyFired: yes         -> green
 *  - row present, denyFired: no,
 *    hookCarrierShipped: false           -> green (posture moved off the hook carrier)
 */
export function checkGuardMeasurement({ baselineText, platform, hookCarrierShipped }) {
  const rows = parseRows(baselineText);
  const row = rows.find((r) => r.platform === platform);

  if (!row) {
    return {
      ok: false,
      messageId: "guard.measurement-missing",
      params: { platform, command: GUARD_MEASUREMENT_OPT_IN_COMMAND },
    };
  }

  const denyFired = row.denyFired === "yes";
  if (!denyFired && hookCarrierShipped) {
    return {
      ok: false,
      messageId: "guard.measurement-negative",
      params: { platform },
    };
  }

  return { ok: true, messageId: null, params: null, row };
}

/**
 * Real-code signal for `hookCarrierShipped`: true once `lib/transport.mjs`
 * exports the §6.2 PreToolUse hook-carrier builder (landed at T36); false
 * beforehand, and false if the mechanism is ever migrated off the hook
 * carrier (DEC-ENG-04's second branch) under a differently-named export.
 * Never throws: an import failure means the carrier is not shipped.
 */
export async function detectHookCarrierShipped() {
  try {
    const mod = await import("./transport.mjs");
    return typeof mod.buildGuardHooksOption === "function";
  } catch {
    return false;
  }
}

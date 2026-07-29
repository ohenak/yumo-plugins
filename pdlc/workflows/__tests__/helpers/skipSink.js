/**
 * skipSink.js — Run-scoped sink for capability skips, plus the comparator that checks them
 * against the named uid-0 skip inventory (TSPEC §1.3 ∪ PROPERTIES §11.1, TE F-10).
 *
 * WHY A SINK AND NOT A PLAIN ASSERTION
 * ------------------------------------
 * Jest gives every test *file* its own module registry, and test files may run in separate
 * worker processes. A module-level `Set` (`REGISTERED_SKIPS` in `driftCapabilities.js`) is
 * therefore per-file: an assertion inside `driftHelpers.test.js` could only ever observe skips
 * registered by that same file — i.e. always empty, and any subset check over it vacuously
 * true. So registration is *also* appended to a run-scoped sink file, and the comparator runs
 * once, in `globalTeardown`, over every worker's records (see `skipSinkSetup.js` /
 * `skipSinkTeardown.js`). Failing the run from `globalTeardown` is what makes it binding.
 *
 * DOMAIN — STATED DELIBERATELY
 * ----------------------------
 * The comparator's domain is **skips registered through `describeOrSkip` / `itOrSkip`** — the
 * capability-gated skips the inventory describes. It is NOT "every skip jest reports":
 * `it.skip` / `it.skip.each` / `describe.skip` written directly by a suite (e.g. the 70
 * `it.skip.each` rows in `guardMatrix.test.js`) never reach these helpers, so they never reach
 * the sink and are not checked here.
 *
 * WHAT IS ENFORCED (each of these fails the run)
 * ----------------------------------------------
 *   C1 structural — every registered skip has a non-empty `name`, a `capability` built only
 *      from known capability keys, and a non-empty `unverifiedInvariants` array of non-empty
 *      strings. (`assertInvariants` in `driftCapabilities.js` already throws at the call site
 *      on an empty/absent list; C1 is the end-of-run backstop for the same rule, and also
 *      covers non-string members, which the call-site check does not.)
 *   C2 inventory agreement — a registered skip whose `name` matches a `SKIP_INVENTORY` entry
 *      must agree with that entry verbatim on `capability` and on the invariant list, so a
 *      call site cannot drift away from the inventory row it claims to be.
 *   C3 inventory well-formedness — every `SKIP_INVENTORY` entry itself has a unique non-empty
 *      name, a known capability, and a non-empty invariant list. C3 is checked on every run,
 *      independently of whether anything skipped, so it is never vacuous.
 *
 * WHAT IS NOT ENFORCED, AND WHY
 * -----------------------------
 * Closure ("every registered uid-0 skip is a member of the inventory") is deliberately NOT
 * enforced. `SKIP_INVENTORY` is spec-derived — exactly TSPEC §1.3's table plus PROPERTIES
 * §11.1's two leaves — while several suites legitimately gate other fixtures on `uid-nonroot`
 * with their own invariant strings (e.g. `driftFault`'s unreadable-file case, `driftLadder`'s
 * rungs, `driftHelpers`' `chmod 000` cleanup case). Asserting closure would fail the whole run
 * on any root runner for skips that are correct, so membership is enforced in the agreement
 * direction (C2) rather than as closure. Widening the inventory past the spec to close the gap
 * would misrepresent TSPEC §1.3 and is a spec change, not a test change.
 */

import { appendFileSync, readFileSync, existsSync } from "fs";

/** Env var carrying the run-scoped sink path; set by `globalSetup`, inherited by every worker. */
export const SKIP_SINK_ENV = "PDLC_SKIP_SINK";

/** The four capability keys `driftCapabilities.js` probes (TSPEC §1.3 clause 1). */
export const KNOWN_CAPABILITY_KEYS = Object.freeze(["bash", "git", "hash", "uid-nonroot"]);

export function skipSinkPath() {
  return process.env[SKIP_SINK_ENV] || null;
}

/**
 * Appends one skip record to the run-scoped sink, as a single JSON line.
 *
 * Cross-process safety: workers append concurrently, so this is an append-only (`flag: "a"`,
 * i.e. `O_APPEND`) write of exactly one short line per call — atomic on POSIX for writes below
 * `PIPE_BUF`. A record is a few hundred bytes at most. Never throws: a sink write failure must
 * not turn a passing test into a failing one (the teardown reports what it finds; a missing
 * sink means no records, and `globalSetup` failing would fail the run on its own).
 */
export function appendSkipRecord(record) {
  const path = skipSinkPath();
  if (!path) return false;
  try {
    appendFileSync(path, JSON.stringify(record) + "\n", { flag: "a" });
    return true;
  } catch {
    return false;
  }
}

/** Reads the sink back as an array of records; unparseable lines are surfaced as violations. */
export function readSkipRecords(path) {
  if (!path || !existsSync(path)) return { records: [], malformedLines: [] };
  const raw = readFileSync(path, "utf8");
  const records = [];
  const malformedLines = [];
  for (const line of raw.split("\n")) {
    if (line.trim() === "") continue;
    try {
      records.push(JSON.parse(line));
    } catch {
      malformedLines.push(line);
    }
  }
  return { records, malformedLines };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function capabilityKeys(capability) {
  return String(capability)
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);
}

function sameStrings(a, b) {
  return (
    Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i])
  );
}

/**
 * The comparator. Returns an array of human-readable violation strings — empty means the run's
 * capability skips are all accounted for. Pure: takes the records and the inventory, so it is
 * unit-testable directly (`driftHelpers.test.js` clause (a)) as well as run-wide via teardown.
 */
export function validateSkipRecords(records, inventory) {
  const violations = [];

  // C3 — inventory well-formedness (checked every run, records or not).
  const seenNames = new Set();
  for (const entry of inventory || []) {
    const label = isNonEmptyString(entry && entry.name) ? entry.name : JSON.stringify(entry);
    if (!isNonEmptyString(entry && entry.name)) {
      violations.push(`SKIP_INVENTORY entry has no name: ${label}`);
      continue;
    }
    if (seenNames.has(entry.name)) {
      violations.push(`SKIP_INVENTORY has a duplicate entry name: "${entry.name}"`);
    }
    seenNames.add(entry.name);
    const unknown = capabilityKeys(entry.capability).filter(
      (k) => !KNOWN_CAPABILITY_KEYS.includes(k)
    );
    if (capabilityKeys(entry.capability).length === 0 || unknown.length > 0) {
      violations.push(
        `SKIP_INVENTORY entry "${entry.name}" names an unknown capability: "${entry.capability}"`
      );
    }
    if (
      !Array.isArray(entry.unverifiedInvariants) ||
      entry.unverifiedInvariants.length === 0 ||
      !entry.unverifiedInvariants.every(isNonEmptyString)
    ) {
      violations.push(
        `SKIP_INVENTORY entry "${entry.name}" has an empty or non-string invariant list`
      );
    }
  }

  const byName = new Map(
    (inventory || []).filter((e) => e && isNonEmptyString(e.name)).map((e) => [e.name, e])
  );

  for (const record of records || []) {
    const where = record && record.origin ? ` (registered by ${record.origin})` : "";
    const label = isNonEmptyString(record && record.name) ? `"${record.name}"` : JSON.stringify(record);

    // C1 — structural.
    if (!isNonEmptyString(record && record.name)) {
      violations.push(`registered skip has no name${where}: ${JSON.stringify(record)}`);
      continue;
    }
    const keys = capabilityKeys(record.capability);
    const unknown = keys.filter((k) => !KNOWN_CAPABILITY_KEYS.includes(k));
    if (keys.length === 0 || unknown.length > 0) {
      violations.push(
        `registered skip ${label} names an unknown capability "${record.capability}"${where}`
      );
    }
    if (
      !Array.isArray(record.unverifiedInvariants) ||
      record.unverifiedInvariants.length === 0 ||
      !record.unverifiedInvariants.every(isNonEmptyString)
    ) {
      violations.push(
        `registered skip ${label} has an empty or non-string invariant list${where} — ` +
          "a generic skip line is exactly what FSPEC §10 O-11 forbids"
      );
    }

    // C2 — inventory agreement for a skip that claims an inventory row by name.
    const entry = byName.get(record.name);
    if (entry) {
      if (String(entry.capability) !== String(record.capability)) {
        violations.push(
          `registered skip ${label} declares capability "${record.capability}" but ` +
            `SKIP_INVENTORY names "${entry.capability}"${where}`
        );
      }
      if (!sameStrings(entry.unverifiedInvariants, record.unverifiedInvariants)) {
        violations.push(
          `registered skip ${label} does not carry SKIP_INVENTORY's invariant list verbatim` +
            `${where} — expected ${JSON.stringify(entry.unverifiedInvariants)}, got ` +
            JSON.stringify(record.unverifiedInvariants)
        );
      }
    }
  }

  return violations;
}

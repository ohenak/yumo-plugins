// Tests for pdlc/engine/lib/catalogue.mjs (TSPEC §3.5, C-8, AC-6.4, AT-ENG-61, AT-ENG-62).
// Scoped to the catalogue module in isolation: unknown id throws, missing param throws,
// severity is entry data (not the caller's choice), and messageIds() enumerates the
// registered set. The whole-suite emitted-ids-vs-messageIds() set-equality (PROP-MSG-1/2/3)
// is a separate, cross-process concern owned by the suite-wide assertion step (§7.0, §7.4)
// and is out of scope here.

import { test } from "node:test";
import assert from "node:assert/strict";

import { MESSAGES, message, messageIds } from "../lib/catalogue.mjs";

// ── unknown id throws (BR-MSG-1, EC-REP-4) ─────────────────────────────────────

test("message() throws on an id absent from the registered catalogue", () => {
  assert.throws(() => message("no.such.id"), /no\.such\.id/);
});

test("message() throws on an unknown id even when params are supplied", () => {
  assert.throws(() => message("also.unregistered", { foo: "bar" }));
});

// ── missing param throws (BR-MSG-2 totality; a template with a hole must not silently emit) ───

test("message() throws when a template's required param is missing", () => {
  const ids = messageIds();
  assert.ok(ids.length > 0, "catalogue must register at least one entry to exercise this test");

  // Find a registered entry whose template references at least one param placeholder.
  const withParam = ids
    .map((id) => ({ id, entry: MESSAGES[id] }))
    .find(({ entry }) => typeof entry.template === "string" && /\{[a-zA-Z0-9_]+\}/.test(entry.template));

  assert.ok(withParam, "catalogue must register at least one parameterised entry to exercise this test");
  // Calling with no params at all must throw rather than emit a string with a literal "{param}" hole.
  assert.throws(() => message(withParam.id));
});

test("message() does not throw when all required params are supplied", () => {
  const ids = messageIds();
  const withParam = ids
    .map((id) => ({ id, entry: MESSAGES[id] }))
    .find(({ entry }) => typeof entry.template === "string" && /\{[a-zA-Z0-9_]+\}/.test(entry.template));
  assert.ok(withParam, "catalogue must register at least one parameterised entry to exercise this test");

  const names = [...withParam.entry.template.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]);
  const params = Object.fromEntries(names.map((n) => [n, "x"]));
  assert.doesNotThrow(() => message(withParam.id, params));
});

// ── severity is entry data, not the caller's choice (§3.5) ─────────────────────

test("every registered entry carries its own severity; the same id is never emitted at two severities", () => {
  const ids = messageIds();
  for (const id of ids) {
    const entry = MESSAGES[id];
    assert.ok(entry, `messageIds() returned ${id} with no matching MESSAGES entry`);
    assert.ok(
      typeof entry.severity === "string" && entry.severity.length > 0,
      `${id} must carry a non-empty severity as entry data`,
    );
  }
});

test("MESSAGES is frozen, so severity cannot be mutated per call site", () => {
  assert.equal(Object.isFrozen(MESSAGES), true);
});

// ── messageIds() (§3.5) ─────────────────────────────────────────────────────────

test("messageIds() returns exactly the registered keys of MESSAGES, with no duplicates", () => {
  const ids = messageIds();
  assert.deepEqual([...ids].sort(), Object.keys(MESSAGES).sort());
  assert.equal(new Set(ids).size, ids.length);
});

test("messageIds() is total and stable across repeated calls", () => {
  assert.deepEqual(messageIds(), messageIds());
});

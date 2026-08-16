# EVIDENCE-AT-4.4 — the anti-echo observation

**Task:** PLAN T56. **Criterion:** FSPEC AT-4.4 *(AC-4.4)* — the anti-echo half of F-6's
provenance agreement: *"reported values agree with the installed engine's and installed
plugin's own reported versions for every run... with a different plugin version made
current, the reported pair changes correspondingly on the next run, and reverting restores
the original pair — so a hardcoded constant that happens to match once fails the second
observation"* (FSPEC:309-312, BR-5.4).

**Recorded:** 2026-08-16, on branch `feat-pdlc-engine-distribution` at commit
`30773d0cf5399b5c2191ea0d76a29851cb99e09f`, `node v20.20.1`, macOS (fixture-machine
capability gating — `docker` / `real-spawn` / `npm-pack` — not required for this leg; see
§3).

## 1. What was observed

The **reported pair** is the engine/plugin pair `pdlc doctor` already prints today
(M-ENG-13: "the engine/plugin pair already exists in the CLI's returned report";
`pdlc/engine/bin/cli.mjs:624` — `plugin:   pdlc v${plugin.pluginVersion} (engine requires
${plugin.range})`, preceded by the `pdlc-engine v${resolvedEngineVersion}` line).
`readPluginVersion` reads the plugin-half of that pair straight out of
`{pluginRoot}/.claude-plugin/plugin.json`'s `version` field, and `pluginRoot` is resolved
from the `--plugin-root <path>` flag (`cli.mjs:162`, `startupFor`), which "always wins"
over dev/env resolution (`lib/skills.mjs:201`). The engine-half compat range is read from
the engine's own `package.json` `pdlcPluginCompat` field (currently `^0.23.0`,
`pdlc/engine/package.json:18`) and threaded through `startup.mjs`'s `engineCompat` →
`checkCompat(engineCompat, pluginVersionResolved)` (`lib/startup.mjs:392`).

That gives a two-plugin-version, one-revert observation with no new carrier, exactly as
FSPEC §8 states AT-4.4 is writable today (`FSPEC:793`, "no carrier is missing"): a single
fixture directory plays the "currently installed plugin", its `.claude-plugin/plugin.json`
`version` field is edited between runs to change "which plugin version is current" without
moving `--plugin-root`, and `pdlc doctor --plugin-root <fixture>` is run three times.

Fixture root: `/tmp/pdlc-fixture-AT44/` — `.claude-plugin/plugin.json` (name/description/
author held constant across all three runs, only `version` and `displayName`'s
parenthetical differ) plus an empty `skills/` directory (required for the plugin-root rung
to resolve at all; `dispatchable-set` was not supplied, so AC-3.5's set-equality check is
skipped on every run and does not participate in this observation). Command:

```
node pdlc/engine/bin/pdlc.mjs doctor --plugin-root /tmp/pdlc-fixture-AT44
```

Each fixture version used a `0.23.x` value so the version-handshake rung (C-10) itself
**passes** against the engine's current `^0.23.0` compat range at this commit — the point
of this observation is the reported pair's tracking behaviour, not the handshake's
pass/fail rung, so the fixture values were chosen to keep that rung green throughout and
not confound the two.

## 2. The three runs

### Run 1 — plugin version P

`.claude-plugin/plugin.json` `version: "0.23.1-at44-P"`. Timestamp `2026-08-16T05:17:14Z`.

```
pdlc-engine v0.1.0
plugin:   pdlc v0.23.1-at44-P (engine requires ^0.23.0)
          root: /tmp/pdlc-fixture-AT44
...
PASS  version handshake (C-10)
      plugin 0.23.1-at44-P satisfies engine range ^0.23.0
...
doctor: all checks passed. No dispatch was performed.
```

**Reported pair (run 1): `{engineVersion: "0.1.0", pluginVersion: "0.23.1-at44-P"}`.**

### Run 2 — a different plugin version P′ made current (same `--plugin-root` path)

Between run 1 and run 2, only `/tmp/pdlc-fixture-AT44/.claude-plugin/plugin.json` was
overwritten in place — the fixture's `version` field changed from `0.23.1-at44-P` to
`0.23.7-at44-Pprime`; the path passed to `--plugin-root` did not change, matching AT-4.4's
"a different plugin version is made current", not a different root. Timestamp
`2026-08-16T05:17:20Z`.

```
pdlc-engine v0.1.0
plugin:   pdlc v0.23.7-at44-Pprime (engine requires ^0.23.0)
          root: /tmp/pdlc-fixture-AT44
...
PASS  version handshake (C-10)
      plugin 0.23.7-at44-Pprime satisfies engine range ^0.23.0
...
doctor: all checks passed. No dispatch was performed.
```

**Reported pair (run 2): `{engineVersion: "0.1.0", pluginVersion: "0.23.7-at44-Pprime"}`.**

**Comparison, run 1 → run 2:** `engineVersion` unchanged (`"0.1.0"` both runs — nothing
about the engine changed); `pluginVersion` changed (`"0.23.1-at44-P"` →
`"0.23.7-at44-Pprime"`), tracking the fixture edit. The pair changed correspondingly, as
BR-5.4 requires.

### Run 3 — reverted to plugin version P

`/tmp/pdlc-fixture-AT44/.claude-plugin/plugin.json` was overwritten again, `version`
restored to the exact string used in run 1, `0.23.1-at44-P`. Timestamp
`2026-08-16T05:17:23Z`.

```
pdlc-engine v0.1.0
plugin:   pdlc v0.23.1-at44-P (engine requires ^0.23.0)
          root: /tmp/pdlc-fixture-AT44
...
PASS  version handshake (C-10)
      plugin 0.23.1-at44-P satisfies engine range ^0.23.0
...
doctor: all checks passed. No dispatch was performed.
```

**Reported pair (run 3): `{engineVersion: "0.1.0", pluginVersion: "0.23.1-at44-P"}`.**

**Comparison, run 3 vs. run 1:** identical — `{engineVersion: "0.1.0", pluginVersion:
"0.23.1-at44-P"}` both times. The revert restored the original pair exactly.

## 3. Why this is the falsifier PLAN T56 names, not a weaker test

A hard-coded constant standing in for the reported pair passes run 1 by construction (it
was presumably set to match something) and is falsified at the **second** observation, not
the first: run 2's `pluginVersion` differs from run 1's, which a constant cannot reproduce
unless it happens to already equal `"0.23.7-at44-Pprime"` — and even then run 3's *revert*
back to `"0.23.1-at44-P"` immediately falsifies it, since a constant cannot track a change
away and back. All three transcribed pairs above are needed for that reason: two pairs
(P, P′) show the value tracks a change; the third pair, equal to the first, shows it also
tracks a change *back*, which two observations alone could not distinguish from "the
constant happened to equal P′ on run 2 too" if there were no run 3.

This observation is exactly what PLAN T56 says it stops from being satisfiable elsewhere by
a hardcoded constant that matches once: the provenance stream (T20, T27, T29, T35, T36,
T38, T39, T42, T44) that plumbs `pluginVersion` through `buildProvenance` and into
committed artifacts. Those tasks' own unit tests assert `provenance.pluginVersion` equals
whatever fixture value their test doubles supply — which a constant implementation would
also satisfy — so this document is the one place in the feature where the value is checked
against the **actual reading path** (`readPluginVersion` → real filesystem →
`--plugin-root`), changed, and changed back, rather than against an injected double.

## 4. The stated limit (PM round-2 F-03) — this is a one-time observation, not a regression guard

This document is dated and does not re-run. It shows that `readPluginVersion` was reading
the plugin manifest correctly, and not returning a hardcoded constant, **at the moment this
observation was recorded** — 2026-08-16, commit
`30773d0cf5399b5c2191ea0d76a29851cb99e09f`. It does not, and cannot, show that the code
reading that field will still be non-constant tomorrow: nothing in the test suite re-runs
this three-run/one-revert sequence, so a future edit to `readPluginVersion`,
`handshake.mjs`'s `checkCompat`, or `startupFor`'s flag wiring that silently hardcoded
`pluginVersion` to `"0.23.1-at44-P"` (or any other fixed string) would pass every unit test
that injects a fixture double and would **not** be caught by this document, because this
document is not re-executed by anything. The constant a run-3 revert would catch today is
caught once, here, and never again (PLAN:219, echoing T51's identical limit on AT-6.2 —
PLAN:427). §1.2 of PLAN states this narrowing in product terms: AC-4.4 is delivered as a
one-time observation with no regression guard, not as a discriminating test.

**Note on the compat range's own drift:** the engine's `pdlcPluginCompat` value (`cli.mjs`'s
"engine requires" clause) changed from `^0.22.0` at this document's first recording to
`^0.23.0` at this re-recording — itself a small illustration of the limit above: a document
transcribes what the reading path returned at one commit, and a later commit can shift the
surrounding compat data without this document knowing. The fixture versions here (`0.23.x`)
were chosen to satisfy the range **at this commit**; they carry no meaning beyond it.

## 5. Scope note

This document observes AT-4.4 only — the plugin half of F-6's provenance pair, read via
`--plugin-root` and `pdlc doctor`'s existing reporting surface. It says nothing about AC-4.1
(run report), AC-4.2 (POSTMORTEM emission, blocked on O-9), AC-4.3 (artifact
distinguishability) or AC-4.5 (no back-fill), all of which are separately scoped in FSPEC
§8's AT-4 group and are not this task's file set (T56 owns exactly this file).

# OPERATOR-OBSERVATIONS — pdlc-plugin-retirement (T33)

Captured: 2026-08-18
Scope: Operator observations that no automated suite can make — AT-3.1's transcript half,
AT-3.2, AT-3.4, AT-3.5, AT-3.6, AT-5.3 (REQ §6.3 AC-3.1…AC-3.6, §6.5 AC-5.3, G-5).

Every acceptance test below requires a human operator, a real consumer repo with the plugin and
engine actually installed, and (for AT-3.1/AT-3.2/AT-3.5/AT-3.6) a live engine dispatch through
Claude. None of these are scriptable from this automated pass; all are recorded as
**PENDING-OPERATOR** with exact steps so the operator can discharge them directly against this
evidence document.

## AT-3.1 (AC-3.1) — engine-side dispatch transcript, length-1 sequence

*Who:* operator in a consumer repo with plugin and engine installed.

Steps:
1. Seed a ready row in the consumer repo's `docs/_queue/QUEUE.md`.
2. Invoke `/pdlc:orchestrate-queue`.
3. From the session transcript, confirm the tool-invocation **sequence** for the dispatched skill
   is length **1** — a single engine CLI call. (Sequence, not set: a second identical invocation
   reds this, collapsing into one member is not sufficient.)
4. Confirm the engine's run report carries a **non-empty dispatch record** — positive proof the
   phase decision was made engine-side.
5. Confirm the skill's response reproduces the report's fields without dropping, renaming, or
   recomputing any of them.
6. Statically confirm "no pipeline decision inside the plugin": the delegator skill files contain
   no queue selection, readiness evaluation, dispatch, verdict-parsing, or queue-row-write logic
   (BR-DEL-1, BR-DEL-2). This half is static and can be done by grep/read of the skill files —
   record it here if performed.

**Status: PENDING-OPERATOR** (the live-dispatch half; the static half may be dischargeable
without a live run — not attempted in this pass).

## AT-3.2 (AC-3.2 — regression guard, pre-satisfied at HEAD, re-asserted after sweep)

*Who:* operator in a consumer repo with plugin **not** installed.

Steps:
1. With a ready queue row present, invoke the engine directly from the terminal.
2. Confirm it refuses to dispatch any skill-driven phase, naming the missing plugin as cause.
3. This must be re-asserted **after** the sweep (i.e. at post-sweep HEAD), not just carried
   forward from the pre-sweep regression-guard measurement.

**Status: PENDING-OPERATOR.**

## AT-3.4 (AC-3.4) — Ptah skill-path resolution

*Who:* a Ptah-configured consumer.

Steps:
1. At HEAD, resolve each configured skill path via the consumer's `ptah.config.json`
   `agents[].skill_path` entries.
2. Confirm every path exists.

**Status: PENDING-OPERATOR** (requires a Ptah-configured consumer environment this pass does not
have).

## AT-3.5 (AC-3.5 — regression guard) — post-sweep version-handshake positive case

*Who:* operator.

Steps:
1. With the published engine at BL-07's declared post-sweep plugin-version range, and the plugin
   installed inside that range, dispatch a skill through the engine.
2. Confirm the skill's run report carries the installed plugin's version alongside the engine's
   version — no engine-side snapshot skew against the plugin.

**Status: PENDING-OPERATOR.**

## AT-3.6 (AC-3.6 — regression guard) — post-sweep version-handshake refusal case

*Who:* operator.

Steps:
1. Install the plugin at a version outside the engine's declared compatible range.
2. Invoke the engine.
3. Confirm it refuses before dispatching any skill, performs no pipeline action, and its terminal
   output (banner plus refusal together) carries the engine version, the plugin version, and the
   expected range.
4. Confirm the run report carries the same three values (BR-VER-3).

**Status: PENDING-OPERATOR.**

## AT-5.3 (AC-5.3, G-5) — probe CLI survives at its build-produced path

*Who:* operator.

Steps:
1. At HEAD after the sweep, invoke the probe CLI at its surviving repo path directly, from a
   checkout of a consuming project.
2. Confirm it answers exactly as it did before the sweep, and that its path is still produced by
   the build step (`node pdlc/workflows/build-runtime.mjs`) rather than hand-maintained.

**Status: PENDING-OPERATOR** (requires a consuming-project checkout this pass does not have; the
build-step provenance half could be checked by re-running `build-runtime.mjs --check` — not
attempted in this pass, left to the operator alongside the live probe-CLI invocation so both
halves of this AT are discharged together).

## Summary — PENDING-OPERATOR ledger for this document

| AT | Requires | Status |
|---|---|---|
| AT-3.1 | live consumer repo, plugin+engine installed, live dispatch | PENDING-OPERATOR |
| AT-3.2 | live consumer repo, plugin absent, post-sweep re-assertion | PENDING-OPERATOR |
| AT-3.4 | Ptah-configured consumer | PENDING-OPERATOR |
| AT-3.5 | live consumer repo, post-sweep plugin in-range, live dispatch | PENDING-OPERATOR |
| AT-3.6 | live consumer repo, plugin out-of-range, live invocation | PENDING-OPERATOR |
| AT-5.3 | consuming-project checkout, probe CLI invocation | PENDING-OPERATOR |

None of these are disposed of by T31's replay sweep or by the retroactive-substitute engine runs
proposed in `POSTSWEEP-RUN-pdlc-plugin-retirement.md` (T32) — they are a distinct, operator-only
class of observation per FSPEC §7/PLAN T33's own framing ("Operator observations that no suite
can make"), not evidence gaps introduced by this pass.

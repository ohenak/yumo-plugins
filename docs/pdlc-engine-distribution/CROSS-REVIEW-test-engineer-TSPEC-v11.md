# Cross-Review: test-engineer — TSPEC (delta round, frozen)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md (v0.11)
**Date:** 2026-08-13
**Iteration:** 11
**Scope:** Delta confirmation of the round-10 findings (TE F-45 High, F-46, F-47) under
decision freeze. Not a whole-document re-review; nothing settled in rounds 1–9 re-opened.

## Delta disposition

Diff read: `85ecb399..HEAD` on the file (seven commits, `3da19d51`…`0dcda6b2`). Every edit is
additive except §5.1's closing paragraph, §6.2's one clause, §6.5's oracle paragraph, §12.1's
unit row and the v0.10 changelog row's count/citation repair.

| # | Round-10 finding | Landed? | Grounding checked at HEAD |
|---|---|---|---|
| 1 | F-45 (High) — AC-5.6's oracle not writable against any named seam | **Yes** | §6.5 extends the shipped return to `{ok, root, source, reason, tried, notices}` and says so as an *extension*, quoting HEAD correctly: `resolvePluginRoot`'s JSDoc `@returns` names exactly the five shipped keys (`pdlc/engine/lib/skills.mjs:200-201`), and the function's shipped params are `{env, override, home, fs}` (`:204-209`) — S-7's signature adds only `devDeclared`. §10.1 gains the missing seam row (S-7 `PluginRootResolver`); §3.1's two rows now agree — startup *surfaces*, `skills.mjs` *decides and renders* |
| 2 | F-46 — honour direction unasserted | **Yes** | §6.5's oracle drives all four rows, and row 1 (`devDeclared: true` × set) asserts resolved root `===` env value, `source` unchanged and `notices` empty. The `source` literal is transcribed, not derived: HEAD builds `` `explicit override (${PLUGIN_ROOT_ENV})` `` with `PLUGIN_ROOT_ENV = "PDLC_PLUGIN_ROOT"` (`skills.mjs:217`, `:54`), so the spec's literal string matches the shipped one. This is DEC-EDIST-04's assertion 2 (DECISIONS `:336`) transcribed in full |
| 3 | F-47 — `AC-1.4's exit-code contract` cited a non-existent authority | **Yes** | §6.2 now cites `exitCodeFor`'s refusal/crash-1, halt/block-2 mapping (`pdlc/engine/lib/run.mjs:290`, pinned by `PROP-EXIT-1` at `__tests__/exit-loop.test.js:88`) and states explicitly that AC-1.4 is the version-triple criterion and says nothing about exit codes. The sibling DECISIONS §7 carries the same correction at HEAD (`DECISIONS:468-470`), so the two documents no longer disagree, and the stale phrase inside the v0.10 changelog row is repaired |

No previously-approved material was broken. I checked the one mechanical risk the `notices`
extension creates — a shipped test pinning the resolver's return by key-set equality would go
red on an added key. There is none: every shipped assertion on that return is field-wise
(`__tests__/skills.test.js:110-205` uses `assert.equal`/`assert.match` on `ok`, `root`,
`source`, `reason`, `tried`; `preflight.test.js:100` asserts only `typeof`). The extension is
therefore additive against the suite as well as against the signature.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-48 | Medium | Local | **The surfacing hop names its source precisely and its destination not at all, and the two `notices` shapes differ.** §6.5 and §3.1 say `runStartupChecks` "passes the returned `notices` into the run's notices … exactly as `bin/pdlc.mjs` already drains `readEngineConfig`'s `notices`". Both halves of that citation are true at HEAD — `readEngineConfig` returns `{config, notices}` (`lib/run.mjs:174`) and `bin/pdlc.mjs:262-263` prints each line — but that channel is `notices: string[]` (the JSDoc says so, and the TSPEC quotes it), while the resolver's new `notices` is `{id, text}` records. `runStartupChecks`'s own return at HEAD is `{ok, rungs, banner, pluginRoot, pluginVersion, versions, baseUrl, auth, reason}` (`lib/startup.mjs:315-317`) — **no `notices` key**, so "the run's notices" on the startup path is a destination this TSPEC does not name: the implementer must decide whether startup gains a tenth return key, folds the records into `banner`, or renders `text` to a string on the way out. Not blocking, and deliberately so — AC-5.6's oracle is now entirely resolver-side and is writable and falsifiable without this hop being settled; a wrong choice here costs one line in one test, not the oracle. But it is one sentence of PLAN-time ambiguity that §10.1's S-7 row could close by naming the key the surfacing writes to | §6.5, §3.1, §10.1 (S-7) |

## Deferred

DEFERRED: Name the destination key the startup surfacing writes to (§10.1 S-7), and whether `{id, text}` records are rendered to strings before joining `readEngineConfig`'s `string[]` notices channel — F-48, PLAN-time detail, not gating.

## Questions

| ID | Question |
|----|---------|
| Q-26 | Does the ignore branch's `notices` record survive a *refusal* return — `devDeclared: false` × variable set × discovery then finding no plugin root (`skills.mjs:250-256`)? §6.5's table is written over the honour/ignore axis only, and the refusal leg returns a different object literal, so an implementer adding `notices` to the two success returns and not the refusal one satisfies the four-row oracle. One clause either way settles it; no answer is needed to write the four rows as specified. |

## Positive Observations

- **F-45's repair took the harder half of the fix.** The cheap resolution was to assert the
  notice one level up in `startup.mjs`, which would have satisfied the words of the finding
  while re-creating exactly the path-blindness §6.5's own two preceding paragraphs spend their
  length explaining. Instead the branch, its decision and its rendering were all put in the
  resolver, which is what makes the oracle a single-unit, injection-free test — and the
  extension was made in the shape §10.1 already applies to S-2, "the shipped function's,
  extended, not a new one", rather than inventing a parallel signature.
- **The honour row is a real second direction, not a restated absence.** Three positive
  conjuncts on row 1 (root identity, `source` unchanged, `notices` empty) plus the two
  variable-unset rows means the ignore branch cannot be satisfied by an always-emitted notice
  *and* cannot be satisfied by an implementation that ignores the variable unconditionally.
  That is the shape DEC-EDIST-04's two assertions asked for, transcribed rather than
  paraphrased.
- **F-47 was repaired in both places at once.** The wrong citation lived in this TSPEC and in
  the sibling DECISIONS §7; both now name `exitCodeFor`/`PROP-EXIT-1`, and §6.2 explicitly
  declines to restate the reasoning that belongs to DEC-EDIST-06. The exact-number `128 +
  signum` oracle is unchanged by the repair, which is the right outcome — the decision was
  always sound, only its authority was misnamed.
- **PM F-02's repair resisted an easy overreach.** §5.1 now claims only that no engineering
  work remains on blocker 1, states that O-8's owner field in REQ and FSPEC is untouched, and
  keeps AC-3.1's real-channel gate. A downstream document correcting its upstream by assertion
  is exactly the erratum-routing failure the protocol exists to prevent; this edit stopped
  short of it.

## Recommendation

**Approved**

All three round-10 findings — including the High — land against HEAD as specified, verified
against `skills.mjs`, `startup.mjs`, `run.mjs`, `catalogue.mjs` and the shipped suite rather
than against the TSPEC's prose. The delta is additive, breaks nothing previously approved,
re-opens no rounds-1–9 decision and absorbs no new requirement. The one Medium (F-48) is a
PLAN-time naming gap on a hop the oracle does not depend on; it is recorded, not gating, and
Q-26 is a clarification rather than a defect.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 1, "low": 0}


APPROVAL-HASH: sha256:4e8b26ca7dbd497f9ee9e49af5012a49ee2cd2d2521e8b4e3d9b1b78466ec13a
APPROVAL-HASH-NORMALIZED: sha256:95ea76ea704653140db1982801bd313ba518daa2420d0067a5e687d25457cad5
REVIEWED-COMMIT: e6f519924cd47d693d32fb56d5c21b24f8b073ed

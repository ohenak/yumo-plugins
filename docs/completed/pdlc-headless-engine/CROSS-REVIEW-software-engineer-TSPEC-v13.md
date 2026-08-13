# Cross-Review: software-engineer — TSPEC (Delta Confirmation, erratum round 11)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md
**Date:** 2026-08-12
**Iteration:** 13
**Scope:** Delta confirmation only — erratum round 11 (§4.1 `DispatchDescriptor.model` vs
PROP-MODEL-9 contradiction). Not a re-review of the whole document. Prior approval (v12, TSPEC
v1.10) stands except as confirmed below.

## Erratum item

`ERRATUM: TSPEC: §4.1 DispatchDescriptor.model "never defaulted here" conflicted with
PROP-MODEL-9's sentinel — resolved in favour of PROPERTIES (later document; the TSPEC clause was
self-contradictory for EC-DISP-4).`

The clause as written was internally unsatisfiable, not merely inconsistent with a sibling
document. §4.1 types `model` as `string`; "verbatim from the module's `opts.model`; never defaulted
here" therefore has no admissible value for EC-DISP-4's model-less dispatch, where `opts.model` is
`undefined`. PROPERTIES PROP-MODEL-9 supplies the missing value — the literal `"unpinned"` — and is
the later document. Production follows PROPERTIES. This disposition was ruled by the orchestrator
and is recorded here, not re-litigated.

## Delta reviewed — exact before/after

**Working tree against `53265e18ae39bce7a8d48092cead102fdb6e2dbb`.** One document file changed
(`TSPEC-pdlc-headless-engine.md`, +29/−2), plus the production and test files the ruling names.

### 1. §4.1 descriptor comment

Before (`TSPEC:905`, at the reviewed commit):

```
  model: string,          // verbatim from the module's opts.model; never defaulted here
```

After (`TSPEC:919-921`, re-read at HEAD):

```
  model: string,          // verbatim from the module's opts.model when the module pins one;
                          // the literal string "unpinned" otherwise (PROP-MODEL-9);
                          // never a fabricated model name
```

### 2. §4.1 narrative reconciliation

Before: no paragraph in §4.1 addressed the model-less case; the only `model` sentence in the
surrounding narrative was the incidental `model ? { model } : undefined` citation inside the
`label` paragraph, which named the model-less dispatch without saying what the descriptor records
for it.

After (`TSPEC:931-938`, inserted immediately ahead of the `label` paragraph, which is otherwise
untouched):

> **`model` carries the module's value when a module pins one, and the sentinel `"unpinned"` when
> none does.** A model-less dispatch is reachable by construction — the general dispatcher passes
> `model ? { model } : undefined` (`orchestrate-dev.js:7124`), which is EC-DISP-4's case — and the
> descriptor's `string` type admits no `null`, so the adapter records the literal `"unpinned"`
> there and the transport's own default applies (PROP-MODEL-9). This is not a defaulting step: the
> engine still holds no model table and substitutes no model name (PROP-MODEL-1); `"unpinned"`
> names the absence rather than standing in for a model, and M-ENG-07's column holds no such
> member, so an unpinned corpus dispatch fails §7.4's set-equality rather than passing quietly.

### 3. Lineage header

Version `1.10` → `1.11`; one new changelog entry recording the erratum, stating upstream pins
unchanged (REQ v0.10, FSPEC v1.7). Prior changelog entries were not edited — the same convention
v1.10 recorded. No other line of the TSPEC changed.

## Re-grounding against HEAD (DEC-ERR-01)

Every citation below was re-derived by reading the edited section at HEAD, not taken from the
edit's own assertion:

- `TSPEC:919-921` — the descriptor's `model` row. Re-read: the type is still `string`, and the
  comment now names both branches. The contradiction is gone at the source, not papered over
  downstream.
- `TSPEC:931-938` — the new paragraph. Re-read: it asserts the sentinel, cites EC-DISP-4 and
  PROP-MODEL-9, and explicitly denies that the sentinel is a defaulted model (PROP-MODEL-1). No
  claim in it contradicts §7.4's set-equality; it strengthens it by naming why `"unpinned"` is not
  an M-ENG-07 member.
- `TSPEC:940` — the `label` paragraph opener is unchanged and still begins the next block. The
  insertion did not split or re-scope it.
- `PROPERTIES:230` (PROP-MODEL-9) — re-read at HEAD, unchanged: *"A module pinning **no** model for
  a dispatch **must** yield a descriptor recording `"unpinned"` rather than a fabricated value, and
  the transport's own default applies."* The TSPEC now says exactly this. No PROPERTIES row was
  edited in this round.
- `pdlc/engine/lib/adapter.mjs:389` — re-read at HEAD: `model: dispatchOpts.model ?? "unpinned",`
  (was `?? null`), with a three-line comment above it at `:386-388` citing TSPEC §4.1 and
  PROP-MODEL-9. The transport option itself is still set only when defined (`adapter.mjs:352`), so
  the sentinel never reaches the transport — the transport's own default applies, as both documents
  now say.

## Code alignment confirmed

| Site | Before | After | Re-read at HEAD |
|---|---|---|---|
| `pdlc/engine/lib/adapter.mjs` | `model: dispatchOpts.model ?? null` | `model: dispatchOpts.model ?? "unpinned"` | `:389` |
| `pdlc/engine/__tests__/adapter-descriptor.test.js` | asserted `r.model === null` **and** `assert.notEqual(r.model, "unpinned")` | asserts `r.model === "unpinned"`; the anti-assertion is removed | `:192`, `:199` |
| `pdlc/engine/__tests__/_assert-suite-wide.mjs` | comment: unpinned case is `model: null` | comment: unpinned case is `model: "unpinned"` | `:267` |
| `pdlc/engine/__tests__/corpus-model-map.test.js` | forward-direction fixture injected `model: null` | injects `model: "unpinned"` | `:444`, `:450` |

The `adapter-descriptor.test.js` change is the load-bearing one: the old test carried an explicit
`assert.notEqual(r.model, "unpinned")` whose comment named PROPERTIES as wrong. That assertion was
the contradiction made executable, and it is gone. The `corpus-model-map.test.js` change keeps the
forward-direction oracle honest for the value production actually emits — injecting `null` would
have proved nothing about the sentinel once the sentinel became the real value. `M-ENG-07` itself
was **not** widened: `"unpinned"` remains a non-member, so an unpinned corpus dispatch still fails
the set-equality (PROP-MODEL-7's "never a loosened oracle" bar is respected).

## Verification performed

- `npm test` in `pdlc/engine` (the suite's own runner, `__tests__/_run-suite.mjs`): **exit 0**,
  579 tests, 0 fail. The runner is required — a bare `node --test pdlc/engine` fails the two spine
  probes and `fs-observation` for want of the inherited `PDLC_TEST_RUN_DIR` (TSPEC §7.0), which is
  a harness fact, not a regression.
- `npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/'
  '/__tests__/fixtures/' 'documentOracles'` in `pdlc/workflows`: **exit 0**, 83 suites, 3485
  passed / 70 skipped.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| — | — | — | None. The delta resolves the erratum exactly, and introduces no new claim beyond the two documents' agreed rule. | — |

## Questions

| ID | Question |
|----|----------|
| — | None. |

## Positive Observations

- The fix removes the contradiction at its source rather than deleting the offending clause. A
  reader who arrives at §4.1 asking "what is recorded when nothing is pinned?" now gets an answer
  in the type comment itself, not two documents away.
- The new paragraph pre-empts the obvious misreading — that a sentinel is a default — and closes it
  with the two facts that make it not one: no model table (PROP-MODEL-1), and non-membership in
  M-ENG-07 (§7.4). That is the distinction the old "never defaulted here" clause was groping for
  and stated in a way that could not be satisfied.
- The oracle was tightened, not loosened. The corpus fixture now injects the value production
  really emits, so the forward direction is testing the case it claims to test.

## Recommendation

**Approved.** The delta fully resolves the erratum, introduces no High, Medium or Low findings, and
disturbs nothing previously approved. The v12 approval of the TSPEC carries forward to v1.11.

## Verdict

VERDICT: Approved

```json
{"high":0,"medium":0,"low":0}
```

APPROVAL-HASH: sha256:600804de8965f95e78371603db8cd0f3cab27236f3bbeaec51670ce0c3957246
REVIEWED-COMMIT: c78a240a53a8e0f9250a9f63733210deccf8ff3a

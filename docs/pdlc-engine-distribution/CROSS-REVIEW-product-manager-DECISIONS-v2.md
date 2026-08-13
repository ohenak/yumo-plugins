# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md` (v0.3, Phase T)
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** Delta re-review. Product lens only — whether my v1 findings are resolved and whether
the revision broke anything. Diffed `64670826..HEAD`; only changed sections were scanned for new
issues, and every `file:line` the revision added or repointed was opened at HEAD.

## Prior findings — disposition

| v1 ID | Sev | Disposition | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | §2 now prices the relocation as a five-consumer edit in a table. Consumer 4 is `MERGE_GUARD_DEFAULTS` — `export const MERGE_GUARD_DEFAULTS = Object.freeze([` at `orchestrate-dev.js:48`, literal `"pdlc/workflows/"` at `:49` (cited `:48-53`, correct). Consumer 5 is `consolidationRoute.test.js:108-110` — `expect(new Set(MERGE_GUARD_DEFAULTS)).toEqual(new Set([…four members…]))` at `:108-109`, correct. The merge-safety consequence is stated in the row and not left as a count ("a PR touching the workflow modules at their new path no longer trips the guard"). The two `build-runtime.mjs` citations are repointed to `:94-97` (four `readFileSync(resolve(HERE, …))` calls, verified) and `:531-533` (`QUEUE_SOURCES`/`DEV_SOURCES`/`CONS_SOURCES`, verified), with `:19`/`:48-49` explicitly re-labelled as comment and generated-banner text and `runtimeBundle.test.js:593-595` named as the banner's pin (verified: the `^\/\/ {3}pdlc\/workflows\/(\S+)$` match and its `toEqual`). §13's DEC-EDIST-01 row is mirrored — "five-consumer", the merge-guard site, and the AF-2 consequence. |
| F-02 | Medium | **Resolved** | §4's Context now names three criteria separately: AC-5.1 pinned (`REQ:397-403` — bullet runs 397→403, correct), AC-5.2 unpinned (`REQ:404-406`, correct), AC-5.5 absent-pin refusal (`REQ:419`, correct). The single-global-install rejection now reads "AC-5.1, AC-5.2 and AC-5.5 jointly unsatisfiable" and keeps AC-5.1's two-versions-resident wording as the residency forcer, which is exactly the correction asked for. §13's DEC-EDIST-03 row mirrors it. |
| F-03 | Medium | **Resolved** | §12 gains a preamble: blocker 1 is `"private": true` (`pdlc/engine/package.json:4`, verified), closed by TSPEC §5.1 with PF-3 asserting `private` absent (`TSPEC:1126`, verified — PF-3 is that row); blockers 2 and 3 are N-6 (scope) and N-2 (licence), matching TSPEC §14's numbering (`TSPEC:1948` region). The "three blockers stand / two rows here" gap a reader would otherwise hit is now accounted for in the table's own preamble. |
| F-04 | Medium | **Resolved, and better than asked** | §5's new subsection retracts the "covers it without a bespoke test" claim and grounds the retraction: `catalogue.test.js:71-74` compares `messageIds()` against `Object.keys(MESSAGES)` — verified, `assert.deepEqual(messageIds(), …)` at `:71-74`, a module against itself — and that file's header `:4-6` disclaims the emitted-ids equality as "a separate, cross-process concern… out of scope here" (verbatim at HEAD). `checkMessageCatalogue` is at `_assert-suite-wide.mjs:196` with both directions in `:196-210`, driven by `assert-suite-wide.test.js:165`/`:183` — verified. The entry then states the two assertions the branch actually needs, and both assert **rendered text**, which is AC-5.6's operator-visible deliverable. Assertion 1 is correctly framed as a positive assertion (resolves to the *discovered* root **and** the notice id is present) rather than an absence-only "no override applied". |
| F-05 | Low | **Resolved** | Version cell reads `0.3`; the changelog's newest row is `0.3`. Header and changelog agree, so the erratum protocol's version diff works again. |
| F-06 | Low | **Resolved** | §10 now reads "nine static imports (`pdlc/engine/bin/pdlc.mjs:22-31`) — three `node:` builtins at `:22-24` and six local modules at `:26-31`". Verified exactly: `:22` `node:fs`, `:23` `node:url`, `:24` `node:path`, `:26-31` the six local modules. |
| Q-01 | — | **Answered in the record** | §4 decides the surface: the announcement rides the `Provenance` value built once per run, so banner, run report and commit rows share one renderer, and an unpinned run carries `mode: "latest"`. Consistent with TSPEC §7.1, which already declares `mode`/`pin` on `Provenance` and pre-renders `line`/`block` ("one renderer, four placements") — so this is a surface decision recorded against a mechanism that exists, not a new mechanism invented in a DECISIONS file. |
| Q-02 | — | **Answered** | The "a newer version exists" probe is observed by the resolved child, with the reason given (the child prints the report; the launcher's ladder stays pure and total per §6.3). That is a decision about the launcher's surface, which is what Q-02 asked for. |

## Findings

No High findings. Two non-gating findings, both against text the revision added.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§13's DEC-EDIST-05 row now contradicts the entries.** §2 and §6 decide that `pdlc/engine/.npmignore` **is shipped**, carrying a negation for `vendor/workflows/`, so packing never depends on npm's precedence rule. The register's DEC-EDIST-05 row still reads, unchanged, "Principal option rejected: An `.npmignore` deny-list". Both statements are defensible in context — the entries explain the shipped file *negates* an ignore rather than acting as a deny-list — but §13 exists precisely so a reader can "find the entry that bears on the change in front of them without reading all ten", and a reader consulting only the register concludes that no `.npmignore` ships. That is the one wrong conclusion available from this table. Fix: add the shipped-negation clause to DEC-EDIST-05's *Consequence carried* cell (e.g. "…plus a one-purpose `.npmignore` negating `vendor/workflows/`, which does not reopen the allow-list choice"), or mirror it in DEC-EDIST-01's row where the decision is actually made. | AC-1.3, BR-8.1 |
| F-02 | Low | Local | **§2's restated re-evaluation trigger reads as already-satisfied on a first pass.** The trigger is now "**any new literal `pdlc/workflows/` path appearing outside the tree itself**". Two of the five enumerated consumers — `sync-workflows.sh` and `run.test.js:45-46` — are already outside that tree at HEAD, so the condition only works if "new" is read as "beyond the five enumerated above", which the sentence leaves to inference. This is the same failure the original trigger had (my v1 F-01 flagged it as dead on arrival), in a milder form: the intent is now checkable, the baseline is not stated. Fix: one clause — "beyond the five enumerated above" — which also makes the trigger something an oracle could grep for against a pinned baseline, as the sentence claims. | R-5, C-4 |

Neither finding asks for a different decision. I re-read §2, §4, §5, §6, §7, §8, §9, §10, §12 and
§13 — the sections the diff touches — against REQ and FSPEC and found no scope creep introduced by
the revision: every added paragraph either prices a rejected alternative, names an oracle, or
records a surface for a criterion that already existed (AC-5.1's announcement, AC-5.6's notice
text, AC-1.4's triple, AC-2.4's floor). The one operator-visible behaviour change in the feature
is still DEC-EDIST-08's newly-refusing row, still declared as such, and §8's new row (c) now gives
it a recovery path rather than leaving the operator in it.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §8's row (c) says `doctor` over an unreadable config prints branch 0's parse-error text "plus the store root and the installed versions". In that state the config is unparseable, so no pin can be read — does row (c)'s output also state *which* version would run (i.e. `mode: "unresolved"`-style wording), or only that the file is broken? An operator in the newly-refusing state wants both halves: why everything refuses, and what would have run. Not a defect in the decision — the mechanism is TSPEC's — but if the answer is "both", one clause in row (c) makes AC-1.4's one-triple promise visibly survive the corrupt-config case. |

## Positive Observations

- **Every repointed citation is exact, and the corrections are the honest kind.** I re-opened all
  of them: `orchestrate-dev.js:48-53`/`:49`, `consolidationRoute.test.js:108-110`,
  `build-runtime.mjs:94-97` and `:531-533`, `runtimeBundle.test.js:593-595`,
  `catalogue.test.js:71-74` and `:4-6`, `_assert-suite-wide.mjs:196-210`,
  `assert-suite-wide.test.js:165`/`:183`, `bin/pdlc.mjs:22-24`/`:26-31`/`:325`,
  `package.json:4`, `REQ:397-403`/`:404-406`/`:419`, `TSPEC:256`/`:1126`/`:1782`. All check out.
  More to the point, §2 and §5 name the *earlier draft's* error in the record instead of quietly
  overwriting it ("`build-runtime.mjs:19` is the file's usage **comment**"; "An earlier draft of
  this entry said… That was checked against HEAD and it is wrong in two ways"). A decisions record
  whose corrections are visible is one a future reader can trust the rest of.
- **F-04's fix converts a false coverage claim into two falsifiable assertions and says why the
  cheap one does not bite.** The distinction drawn — catalogue equality covers *registration*, and
  in reverse creates an obligation to emit, but is **path-blind** — is exactly the product-relevant
  point: the difference between this branch and the rejected "honour it silently" branch is *which
  path* emits, and a path-blind oracle cannot see it. Asserting rendered text rather than the id
  alone is what makes AC-5.6 covered rather than merely registered.
- **§7's signalled-child decision is a real product save, not a technicality.** `spawnSync` returns
  `status: null` on a signalled child, so the obvious implementation exits **0** on a Ctrl-C'd
  pipeline — under `stdio: "inherit"` the common interruption path — and a CI or `/loop` caller
  reads that as success, colliding with AC-1.4's exit-code contract. The entry names the collision,
  decides `128 + signum`, and pays for it with a positive assertion on the exact number rather than
  `!== 0`, which it explains would not distinguish the decided mapping from an accidental crash.
  That is the right test-shape argument made for the right product reason.
- **§8's row (c) closes the feature's only unrecoverable state.** DEC-EDIST-08 makes a corrupt
  config refuse even with no pin declared; once every command refuses, `doctor` is the only route
  out, and "an unenumerated composition is how a product becomes unrecoverable in exactly the state
  its diagnostic exists for" is the correct product framing. The cross-reference into §9's carve-out
  table means a reader arriving from either entry finds the composition.
- **§9's trigger is stated honestly rather than dressed up.** "An operator report… stated in that
  honest form, because the engine emits no telemetry and NG-3 forbids it fetching anything, so there
  is no mechanical observation that could produce this evidence" — and it contrasts itself with
  DEC-EDIST-09's mechanical trigger. A re-evaluation trigger that admits it is a judgement call is
  worth more than one that implies an oracle it does not have.
- **§6's "two independent reasons, and a future reader must not retire one while satisfying the
  other"** names a specific hazard (staging vendor rows without running `prepack` silently removing
  the only cover for the packing-precedence risk) rather than asserting importance. That is a
  durable shape, and it is the same one §2's AF-2 correction uses — the precondition *is* the
  coverage.

## Recommendation

**Approved with minor changes.**

My one v1 High (F-01) is resolved with evidence I re-verified line by line, and all five lesser
findings are resolved too. The revision introduced no High finding and broke nothing I had
previously approved: the entries it rewrote are more grounded than before, and the two corrections
it makes to its own earlier drafts are stated in the record rather than silently applied.

The two open items are non-gating and can be folded into the next edit of this document or carried
forward:

1. **F-01 (Medium)** — add the shipped-`.npmignore` clause to §13's DEC-EDIST-05 (or DEC-EDIST-01)
   row so the register does not tell a reader the opposite of what §2 and §6 decide.
2. **F-02 (Low)** — add "beyond the five enumerated above" to §2's re-evaluation trigger.

Three defects belong to the **TSPEC**, not to this document, and are raised as errata rather than
folded into this verdict — in each case the DECISIONS entry is correct and the upstream text it was
transcribed from is not:

- TSPEC §6.5 still carries the "covers it for free" sentence about `lib/catalogue.mjs`'s
  set-equality, which is false at HEAD for the two reasons §5 of this record now documents.
- TSPEC §6.2 still names signal handling among the behaviours that "need asserting" and then pays
  for exit code and stdio only, leaving `spawnSync`'s `status: null` undecided.
- TSPEC §5.1 authors no `.npmignore` and §5.4/D-5 state the allow-list was chosen "not an
  `.npmignore` deny-list", while DEC-EDIST-01/05 now decide one is shipped to negate the
  `vendor/` ignore. The mechanism needs to exist in the governing document.

All ten decisions still trace to a criterion or constraint I can find in REQ or FSPEC, and no entry
decides a product question the REQ has not already delegated.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

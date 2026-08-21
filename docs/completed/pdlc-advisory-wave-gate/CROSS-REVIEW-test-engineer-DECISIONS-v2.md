# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.11, `sha256:ef59893d…`)
**Date:** 2026-08-20
**Iteration:** 2

## Context

Delta re-review, per the protocol. I read my v1 (`CROSS-REVIEW-test-engineer-DECISIONS-v1.md`,
`VERDICT: Needs revision`, `{"high":3,"medium":2,"low":2}`) and diffed the document against the
commit I reviewed it at — `3604d465` ("docs(pdlc-advisory-wave-gate): DECISIONS v1.10") — through
HEAD `3143290a`. Eight commits touched it (`495fdf52`, `33353a55`, `75eb393d`, `76cf7065`,
`c1844f4a`, `c81eb6cf`, `2b549db4`, `3143290a`): +226/-48 lines, all of them inside the sites my
three Highs and PM's four findings named, plus the new v1.11 preamble note.

**Upstream is byte-identical to the state I reviewed against**, so nothing in this delta is
re-grounded on moved upstream:

| Document | sha256 at HEAD | Same as v1 round? |
|---|---|---|
| REQ | `c62cfc35…` | yes |
| FSPEC | `91ef2557…` | yes |
| TSPEC | `3fa21acf…` (v1.11) | yes |
| DECISIONS (under review) | `ef59893d…` (v1.11) | changed — the delta |

Scope of attention, per the protocol: the changed hunks only. `DEC-A6-01`…`DEC-A6-04`'s decision
sentences, the option tables' outcomes, and every section I approved unchanged at v1 are not
re-litigated here. What I did do is re-run, against the working tree, every *code* claim the delta
introduces — because the repairs are exactly the claims a PROPERTIES author transcribes into an
oracle, and a repair grounded on a second wrong reading would be worse than the defect it replaces.

## Options Considered

Two readings of "re-review the DECISIONS delta" were available.

- **Check that each prior finding's text changed, and stop.** Rejected. All three of my Highs were
  *false-ground* findings, not wording findings — the document said something a reader would
  transcribe, and the tree said otherwise. A repair to such a finding is only resolved if the *new*
  ground holds. Diff-shaped verification would pass a repair that swapped one unchecked premise for
  another, which is precisely the failure v1.10 shipped (`:52` claimed "all claims re-grounded
  against the working tree" while three claims were false).
- **Re-verify every code claim the delta introduces, against the module, the suite and the build
  and packaging scripts** (chosen). Each repair is treated as a fresh claim under my lens: does it
  hold at HEAD, and does the sentence, transcribed as written, yield a test that can fail?

Executing that, claim by claim, in the order the delta lands them.

**F-01 repair — the fail-closed split (`:412-427`).** Resolved, and the new text is correct on both
halves. `captureTreeSnapshot` routes every failed verb through `const fail = (verb) => {…; return
null;}`, optionally writing `failure.verb` on a caller-owned carrier
(`pdlc/workflows/orchestrate-dev.js:12572-12576`), and returns `fail(verb)` on all six verbs
(`:12578-12613`); the docstring states "Returns `null` on any `ok !== true` — never throws"
(`:12558`). `restoreTreeSnapshot` throws on each of its three verbs — `read-tree --reset -u`,
`clean -fd`, `reset --mixed` — with the failing argv and git's stderr in the message
(`:12641-12662`), and its docstring names the `__isRevertFailure` rethrow (`:12628-12631`). The
delta's sentence "Both halves end the wave; neither leaves a repair half-applied. That conjunction
is the property" is transcribable: it yields a rejection assertion on the restore path and a
`null`-return-plus-disposition assertion on the capture path, which is what the shipped suite
already proves. The reason clause for why capture cannot throw its way to a disposition — the
driver is never entered, so `__preDispatch` is unavailable — matches the docstring at `:12559-12561`.

**F-02 repair — OQ-7 settled at five sites (`:5`, `:195`, `:271-275`, `:286-292`, `:439-444`).**
Resolved. The `Upstream` cell now reads TSPEC v1.11 with `sha256:3fa21acf…`, which is the hash on
disk. Every OQ-7 site is now a transcription of the decided boundary rather than a hedge:
`TSPEC:1755` reads "**Closed upstream, answered *no***" and records that the transcription landed
in §2.5, §3.3, §5.2, §5.5 and §5.6 with "no upstream-pending flag remains"; `REQ:503` carries the
quoted exclusion verbatim — ignored paths "are operator files A6 never wrote and never restores
over". The re-evaluation trigger at `:286-292` is now a *reversal* trigger (BR-9's exclusion is
reopened) rather than a pending-event trigger, and it explicitly names the scoped arm as **not
built** — which is the observable form the trigger needed. The remaining `v1.10` mentions in the
document (`:44`, `:52`, `:112`, `:114`, `:151`, `:193`, `:283`, `:413`) are all historical narrative
about what a prior revision said; none of them is a live upstream binding.

**F-03 repair — the vendoring constraint (`:138-163`, option-B row `:193`).** Resolved, and the new
ground holds on every limb I could check. `MODULE_NAMES = ["orchestrate-dev.js",
"orchestrate-queue.js"]` with `copyFileSync` into `pdlc/engine/vendor/workflows/` and a
`VENDOR-MANIFEST.json` (`pdlc/engine/scripts/prepack.mjs:20`, `:39-47`); `WORKFLOW_MEMBERS`
(`publish-preflight.mjs:220-224`); `WORKFLOW_MODULE_NAMES` (`fixture-machine.mjs:426`, iterated
`:449`); `pdlc/OPERATIONS.md:97` states the vendoring and the never-loads-`.claude/workflows/` half
in the row the document paraphrases. The retired-channel evidence is equally solid:
`build-runtime.mjs:5-12` records the per-module runtime bundles as "retired along with the Claude
Code workflow runtime" and "now emits a single artifact: `pdlc-cli.mjs`", and
`pdlc/hooks/scripts/cleanup-consumer-workflows.sh:4-5` describes itself as removing "the retired
plugin-channel consumer copy … left behind by the now-deleted plugin-channel sync step". The
rejection is now **on merit** (co-location with the advisory-tier symbols, three-list cost) rather
than on impossibility, which is exactly the repair I asked for and no more. Option B's enforcement
ground likewise: `orchestrate-dev.js:20` carries `import * as fs from "fs"`, so the old "cannot use
`fs`" clause is correctly retired, and the surviving enforcement is the source scan at
`advisoryWaveGate.test.js:3183-3194`, whose forbidden set is exactly
`/\bprocess\b/, /\bDate\b/, /Math\.random/, /\brequire\(/, /\b_now\b/, /\bglobalThis\b/` —
the six tokens the document lists, in the same order.

**F-04 repair (`:279-285`).** Resolved: both functions are `export async function`
(`orchestrate-dev.js:12566`, `:12635`) and `advisoryWaveGate.test.js:280` destructures
`{ captureTreeSnapshot, restoreTreeSnapshot }` off the module.

**F-05 repair (`:517-530`).** Resolved in the form I asked for: the claim is now "**specified**, not
yet asserted", attributes the requirement to TSPEC §5.2, names A6-15 as owing the present-and-zero
conjunct, and — the part that matters — explicitly refuses to close the obligation ("recorded here
rather than closed, because a closed obligation is what stops the next reader looking"). The
underlying fixture gap is unchanged at HEAD (`advisoryWaveGate.test.js:1591-1619`), which is
implementation's to close, not this record's.

**F-06 / F-07 repairs (`:195`, `:174`, `:249-252`, `:7`).** Resolved. The two argv literals now
agree (`git add -A --` at both sites), the `-m` paragraph now says "with TSPEC §2.5's own elision"
and prints the shipped literal `A6 snapshot: wave {waveNum} pre-repair tree ({feature})`
(matching `orchestrate-dev.js:12596-12599`), and the `Cross-Reviews` cell now names the harvested
rounds as harvested and the current round as post-harvest round 1.

## Decision

**Approved with minor changes.** All three v1 Highs are resolved on verified ground, both v1 Mediums
and both v1 Lows are resolved, and the delta introduces no High. Two new findings, both non-gating,
both in text the delta added.

**Why the Highs are closed and not merely reworded.** Each of the three was a claim whose *ground*
was wrong, so I re-derived the new ground from the tree rather than from the document: capture's
`null`-return and restore's throw at `orchestrate-dev.js:12572-12613` / `:12641-12662`; OQ-7's
closure at `TSPEC:1755` and `REQ:503`; the vendoring lists at `prepack.mjs:20`,
`publish-preflight.mjs:220-224`, `fixture-machine.mjs:426`, plus `OPERATIONS.md:97` and
`build-runtime.mjs:5-12`. Every limb held. Notably, the F-03 repair resisted the tempting overreach:
it did not reopen "add a module" on merit, it converted an impossibility claim into a cost claim and
re-rejected on co-location — the decision outcome is untouched, which is what a decision record's
repair should look like.

**The one new Medium, and why it is the same shape as F-05 rather than a new class.** The delta
promotes the promotion commit's cardinality from an aside to a load-bearing claim: "one further
`commitPaths` call **per promoted task**", with "the cardinality is load-bearing, not a detail"
(`:296-307`). The claim is *true of the code* — `groupPromotedPaths` groups promoted paths by owning
task id into a `Map` that can hold more than one row (`orchestrate-dev.js:3329-3342`), and the wave
loop issues one `commitPaths` per row with `{promo.taskId}` in the message
(`:15471-15482`). What has not moved is the **oracle**. The entry's Reversibility paragraph still
says "the commit *message* is asserted, so a later reshaping is a test-visible change, not a silent
one" (`:322-323`) — and at HEAD the only assertion is a single-promotion fixture using containment:
`expect(commits).toContain("chore(test-feat): wave 1 advisory promotion (T2)")`
(`waveExecution.test.js:1347`), with one promoted task in the fixture. TSPEC §5.6's AT-04-5 row
identifies the promotion commit "by its `message` literal and its pathspec" (`TSPEC:1716`), also
singular. So the *cardinality* — two promoted tasks ⇒ two commits, each naming its own id — has no
falsifying test: a regression that emits one widened commit naming the first promoted task passes
`toContain` untouched, exactly the loss the entry says option A is rejected to prevent. This is F-05's
shape: a claim correctly decided here, whose upstream oracle is thinner than the claim, and where the
record's own "it is asserted" hedge is what stops the next reader from checking. Repair is the one
the author already applied at F-05 — say which conjunct is asserted (the message literal of a single
promotion) and which is not yet (the per-task cardinality, which wants a two-promotion fixture and a
**set-equality** over the observed `advisory promotion (…)` messages, not containment). Medium, not
High, because nothing here mis-specifies a property the way `:318` did at v1.10: a PROPERTIES author
transcribing `:296-307` writes a *correct* test that does not exist yet, rather than an incorrect one.

**The new Low is a cost count, not a direction.** Context's three-list figure (`:147-150`) counts the
production lists and omits the packed-set fixture `pdlc/engine/__tests__/_tspec-packed-set.mjs:51`,
which enumerates `vendor/workflows/orchestrate-queue.js` alongside its siblings and would go red on a
fourth vendored module. Since the whole point of the F-03 repair is that the cost is *countable*, the
count should be complete; the rejection stands either way.

**What I deliberately did not file.** `git add -A --` now appears at `:174`, `:195` and `:265` while
the shipped call is `["add", "-A"]` (`orchestrate-dev.js:12579`). That divergence is TSPEC §2.5's to
own, my v1 Q-02 asked it, and the document is now a faithful transcription of its upstream — which is
the right disposition for a decision record. I carry the question forward unchanged rather than
converting it into a finding against this document. Likewise the halt-message routing gap the entry
records at `:357-362`: at REQ v1.15 and FSPEC v1.6, `a6-snapshot`, "copy the ref" and "overwrit"
still match **zero** lines in either document, so the routing has not landed. The document is right
about its own gap and says so; the defect is upstream's, and it goes out as an erratum rather than
into this verdict.

## Consequences

**For the PROPERTIES author, at v1.11.** The document is now safe to transcribe, which it was not at
v1.10. The four oracle-bearing claims each yield a test that can fail:

- Fail-closed is a **pair** (`:412-427`): `assert.rejects` on all three restore verbs; `null` return
  plus a call-site-written capture-failure disposition on the capture path. The shipped suite already
  carries both shapes, so a property written from this text lands on existing ground.
- DEC-A6-02's message literal (`:296-300`) is transcribable as an exact string; its **cardinality**
  is transcribable as a set-equality over promotion-commit messages and is the one conjunct with no
  test at HEAD (F-08).
- DEC-A6-03's two-ref set-equality is unchanged and still asserted (`advisoryWaveGate.test.js:1624`,
  `:1662-1664`).
- DEC-A6-04's `waveBudgetPerRun: 0` present-and-zero conjunct is now correctly marked *specified,
  not asserted* (`:517-530`), so a PROPERTIES author knows it is work to do rather than work done.

**For the implementation phase (not findings against this document).** Two fixture gaps are now named
in the record and both are real at HEAD: A6-15's missing present-and-zero conjunct
(`advisoryWaveGate.test.js:1591-1619` drives `runWaveGateSeam` directly and never reaches the
report's advisory summary key), and the absent two-promotion fixture behind DEC-A6-02's cardinality
(`waveExecution.test.js:1340-1352`). Both are containment-versus-set-equality failures of the same
family: an enumerated contract — six advisory rows, N promotion commits — proved by `toContain`
cannot fail when a case is dropped. Whoever closes them should close them with set-equality over the
full enumeration, matching the instrument DEC-A6-03 already models at `advisoryWaveGate.test.js:1662`.

**For harvest.** The durable item from this round is the *method*, not a constraint: v1.10 asserted
"all claims re-grounded against the working tree" while three claims were false, and v1.11's preamble
now answers exactly that (`:114-119`) — the sweep was scoped, not exhaustive, and the three misses
share a signature: claims about **failure modes, visibility and impossibility**, none of them
falsifiable by the grep-shaped check that confirms a count. That signature is worth carrying into the
review checklist as a class, since it is the class this document got wrong twice. The retired-channel
half of F-03 remains the cross-feature item I flagged at v1: any sibling artifact still reasoning from
"one module, one bundle, synced to `.claude/workflows/`" is reasoning from a premise
`build-runtime.mjs:5-12` and `cleanup-consumer-workflows.sh:4-5` falsified.

**No decision entry moved, and none needed to.** All four rejections stand on the same side they
stood on at v1.10; what changed is the ground under three claims and the staleness of four
citations. That is the correct outcome for a decision record under review — the findings were never
design objections.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-08 | Medium | Local | **DEC-A6-02's newly load-bearing cardinality has no falsifying test, and the entry's reversibility caveat reads as though it has one.** The delta promotes "one `commitPaths` call **per promoted task** … the cardinality is load-bearing, not a detail" (`:296-307`), which is true of the code (`groupPromotedPaths` groups by owning task id into a multi-row `Map`, `orchestrate-dev.js:3329-3342`; the loop issues one call per row, `:15471-15482`). But the Reversibility paragraph still says "the commit *message* is asserted, so a later reshaping is a test-visible change, not a silent one" (`:322-323`), and at HEAD the only oracle is a **single-promotion** fixture using **containment** — `expect(commits).toContain("chore(test-feat): wave 1 advisory promotion (T2)")` (`waveExecution.test.js:1347`); TSPEC §5.6's AT-04-5 row is singular too (`TSPEC:1716`). A regression to one widened commit naming the first promoted task passes untouched — precisely the per-task attribution option A is rejected to protect. **Fix:** split the caveat exactly as F-05's repair split its claim — the *message literal* of a single promotion is asserted; the *per-task cardinality* is specified and not yet asserted, and wants a two-promotion fixture with **set-equality** over the observed `advisory promotion (…)` messages rather than `toContain` | `DEC-A6-02` `:296-307` and `:320-330` |
| F-09 | Low | Local | **Context's three-list cost omits the packed-set fixture, so the countable cost is undercounted by one.** `:147-150` names `MODULE_NAMES` (`prepack.mjs:20`), `WORKFLOW_MEMBERS` (`publish-preflight.mjs:220-224`) and `WORKFLOW_MODULE_NAMES` (`fixture-machine.mjs:426`) as the three hardcoded lists a new module must be added to. A fourth enumeration would redden on the same edit: `pdlc/engine/__tests__/_tspec-packed-set.mjs:51` lists `vendor/workflows/orchestrate-queue.js` among the expected packed members. Since the F-03 repair's whole point is that this is a *countable cost* rather than an impossibility, the count should be complete. (`lib/run.mjs:70-73`'s `MODULE_FILE_NAMES` is correctly **not** in the list — it enumerates entrypoint kinds, and `rootResolves` (`:77-79`) only requires those two to be present, so a vendored helper module does not touch it.) **Fix:** "three production lists plus the packed-set fixture" | `## Context` `:147-150` |

Prior-round findings, all verified resolved against the tree: F-01 (`:412-427`), F-02 (`:5`, `:195`,
`:271-275`, `:286-292`, `:439-444`), F-03 (`:138-163`, `:193`), F-04 (`:279-285`), F-05 (`:517-530`),
F-06 (`:174`, `:195`, `:249-252`), F-07 (`:7`).

## Questions

| ID | Question |
|----|---------|
| Q-01 | (Carried from v1 Q-02, unchanged, and now clearly *not* this document's defect.) `TSPEC:477`'s capture block specifies `git add -A --`; the shipped call is `["add", "-A"]` (`orchestrate-dev.js:12579`). v1.11 correctly aligned all three of its own sites (`:174`, `:195`, `:265`) on TSPEC's literal, so the record is faithful — but the divergence from shipped argv is still live, and no oracle ranges over the trailing `--` (§5.2's argv assertions match on `argv[0]`). Is the `--` a load-bearing pathspec terminator the implementation is one token short of, or documentation intent TSPEC can relax? Either answer is upstream's; I ask it here only so the next round does not re-derive it. |
| Q-02 | The v1.11 note says the three v1.10 misses "share a signature worth carrying forward: claims about **failure modes, visibility and impossibility**, none of them falsifiable by the grep-shaped check that confirms a count" (`:116-119`). I agree, and F-08 is arguably a fourth instance of the same family (a *cardinality* claim whose check is containment). Is that signature intended to reach `LEARNINGS-pdlc-advisory-wave-gate.md` as a durable review-checklist line, or does it stay local to this record's preamble? I would file it as durable — it is the only recurring defect class this document has produced. |

## Positive Observations

- **The F-03 repair converted an impossibility into a cost without reopening the decision.** This is
  the hardest correction to make well, and `:138-163` makes it: it names the three lists and their
  files, cites `OPERATIONS.md:97` for the vendoring rule, records what the old bullet said and why it
  was wrong, and then re-rejects "add a module" **on merit** — co-location with `buildA4SeamOps` /
  `buildA5SeamOps`, no benefit against a three-list edit and a second vendoring surface. Every limb
  checked out at HEAD. A weaker revision would have quietly deleted the false premise; this one keeps
  the record of the miscount, which is what makes the next reader trust the rest.
- **The fail-closed split names the *pair* as the property, which is the right unit.** `:412-427` does
  not merely correct capture's disposition — it states why the two halves are discharged differently
  (`__preDispatch` is a `runAdvisorySeam` return value and the driver is never entered on the capture
  path) and then says what to transcribe: "Both halves end the wave; neither leaves a repair
  half-applied. That conjunction is the property." That sentence is a property statement, not prose,
  and it matches `orchestrate-dev.js:12558-12561` and `:12628-12631` line for line.
- **The v1.11 preamble answers my Q-01 honestly rather than defensively.** `:114-119` says the v1.10
  sweep was scoped, not exhaustive, names which claims it covered, and characterises the misses as a
  class. A revision note that narrows its own prior claim of completeness is rarer than it should be,
  and it is what makes `:52`'s "all claims re-grounded" readable now instead of misleading.
- **F-05's repair refused to close an obligation it had not discharged.** `:517-530` says
  "**specified**, not yet asserted", names A6-15 as owing the conjunct, and ends "recorded here rather
  than closed, because a closed obligation is what stops the next reader looking". That is the exact
  reasoning I filed the finding on, adopted rather than argued with.
- **PM F-02's cardinality repair reasons from the code's own shape.** `:301-305` derives the per-task
  reading from two independent facts — `groupPromotedPaths` returns rows keyed by task id, and the
  message template has a single `{taskId}` slot — rather than from assertion. Both hold
  (`orchestrate-dev.js:3329-3342`, `:15474`). F-08 asks only that the *oracle* half be described as
  precisely as the mechanism half is.

## Recommendation

**Approved with minor changes**

All three v1 High findings are resolved on ground I re-verified against the working tree, and both v1
Mediums and both v1 Lows are resolved. No High finding is open, old or new, so this document is not
blocked. Two non-gating items for the author to take at convenience:

1. **F-08 (Medium) — `DEC-A6-02` `:320-330`.** Split the reversibility caveat the way F-05's repair
   was split: the promotion commit's *message literal* is asserted (`waveExecution.test.js:1347`);
   the *per-task cardinality* the delta just made load-bearing is not, and wants a two-promotion
   fixture asserting set-equality over the observed `advisory promotion (…)` messages.
2. **F-09 (Low) — `## Context` `:147-150`.** Say "three production lists plus the packed-set fixture
   (`pdlc/engine/__tests__/_tspec-packed-set.mjs:51`)", so the countable cost is counted completely.

Neither touches a decision entry; `DEC-A6-01`…`DEC-A6-04`'s decisions stay exactly where v1.11 leaves
them.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:ef59893dd2d1e8db9e4d8fdae108d7c31d2885738bb7054a4bcb34046dff8239
APPROVAL-HASH-NORMALIZED: sha256:ef59893dd2d1e8db9e4d8fdae108d7c31d2885738bb7054a4bcb34046dff8239
REVIEWED-COMMIT: 3143290a2edaabe80119609a9a3291f4ae64033d
UPSTREAM-STATE: REQ sha256:c62cfc35ac9e49f60f70226036a3381c1d08518f33d5454fbef062ced0611bf7
UPSTREAM-STATE: FSPEC sha256:91ef25574e678b3c5433467ff31f800bdcb17bcff54e5f1a59c2e6da28e5cb34
UPSTREAM-STATE: TSPEC sha256:3fa21acf346e987c39d625133e5d56f4873b0cf2a205cad9460a6b4944eb7a00

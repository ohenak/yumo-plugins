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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict

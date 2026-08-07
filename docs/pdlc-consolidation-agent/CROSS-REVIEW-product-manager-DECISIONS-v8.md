# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 8
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of `50e28b23..HEAD` — four document commits: `eaf5c744` (DEC-CONS-07's first rejected
alternative annotated as the shipped behaviour, TE F-01), `cde34287` (§11.2 conjunct 4 item (i)
restated as the invoking-tree domain's *whole* verb set, obliged ∪ permitted, as §5 domain 1 already
did — TE F-02), `9fe8f762` (the stale `FSPEC:415` / `FSPEC:442` anchors retargeted and §9's
lifetime-row sentence past-tensed — my F-16), `d8a297e1` (the continuation-anchor spelling named,
both counts published, and the sweep warranty scoped to `TSPEC:` anchors with an FSPEC recipe stated
— my F-17 and F-16's third limb).

I read my v7 cross-review, ran
`git diff 50e28b23..HEAD -- docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
(48 insertions, 11 deletions), and confined this pass to the changed spans plus my two open v7
findings.

Changed spans: §9's *Context* paragraph (`DECISIONS:657-663`), the accepted-cost paragraph
(`:681-693`), the first rejected-alternative bullet (`:761-772`); §11.2 conjunct 4 item (i)
(`:907-909`); the *Anchor provenance* paragraph (`:947-957`) and its new warranty-scope paragraph
(`:971-976`); §11.3 item 1 (`:1026-1031`). Everything else is untouched and not re-litigated.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-16 | Low | **Resolved on all four limbs I named, and the retargets land** | I asked for four things. (a) *Retarget `FSPEC:415`.* Done at both sites, to `:435-436` with `:441-442` for the explanation. I resolved them at HEAD: `FSPEC:435` is "Released \| at step 16, by the pass that took it — an **in-place rewrite** … `RELEASED: {passId} {ISO-8601}`" and `FSPEC:436` is "Removed \| **never by the pass**"; `FSPEC:441-442` is the sentence the document now quotes, word for word — "a lifetime that said 'removed at step 16' would state a capability the runtime does not have, so release is specified as the one operation available: an in-place write of the same path". (b) *Retarget `FSPEC:442`.* Done, to `FSPEC:479`, and the quoted outcome is verbatim: "Present but **empty**, or a line that is neither form \| undecidable \| treated as **stale and reclaimed**, recording `reclaimed-stale-lock` with the abandoned pass id reported as `unknown`". (c) *Past-tense `DECISIONS:658`.* Done — "**said** the marker was 'removed at step 16' at the revision this entry was written against. It no longer does". §11.3 item 1's twin now reads the same way and adds the current locations. (d) *Say the warranty covers `TSPEC:` anchors only.* Done as its own paragraph, naming both stale FSPEC values, their retargets, and the equivalent `FSPEC:` recipe for the next sweep. Beyond the ask, the revision explains the *fourth-row* drift instead of silently renumbering: the empty arm "was the fourth before the `RELEASED:` row at `FSPEC:476` was inserted". I checked that: `FSPEC:475`–`:479` are the five data rows, `:476` is the `RELEASED:` row, and deleting it makes `:479` the fourth. The two surviving `FSPEC:415` / `FSPEC:442` occurrences in the file are inside the provenance note itself, naming them as the retargeted-from values — correct usage, not a residual cite. |
| F-17 | Low | **Resolved as asked, on the second of the two options I offered** | I offered "widen the pattern, or state that continuation anchors are hand-resolved and give both counts". The document takes the second and takes it further than the ask: it names the third spelling explicitly ("the file-less *continuation* anchor, a backticked `` `:NNN` `` token whose file is carried by an earlier anchor in the same sentence"), gives three worked examples, states the hand-resolution rule, publishes the second recipe `` grep -onE '`:[0-9]+(-[0-9]+)?`' ``, and closes the loop on its own arithmetic — "the fourteenth stale site counted below is the pre-sweep bare `:684`, which the published pattern cannot see", which is exactly the gap I raised. The method is now as wide as the claim. The *numbers* attached to it are not, which is F-18 below — a new defect in new text, not a survival of F-17. |
| Q-04 | — | Answered upstream in v7; stays retired | Not re-opened. |
| Q-05 / Q-06 / Q-07 / Q-08 / Q-09 | — | Still open, still not findings | Carried forward unchanged. Q-09 is untouched by this delta — §11.3 still carries two struck items and one live one under a title that describes one of the three. |

Both v7 findings are resolved. The verdict turns on the new material.

## Verification of the changed sections

I resolved every anchor the changed spans introduce, and re-ran every number they publish, against
the TSPEC, the FSPEC and `runtime-adapter.js` at HEAD (`d8a297e1`) rather than taking the document's
word for any of them.

- **The §9 *Context* rewrite is correct in both tenses and its new cites land.** `FSPEC:435-436` and
  `FSPEC:441-442` resolve exactly as quoted (see F-16 above). The paragraph keeps the mechanical
  claim that carried the entry — the deletion-verb `grep -nc` over
  `pdlc/workflows/runtime-adapter.js` returns **0** at HEAD — and I re-ran it: **0**. The entry's
  conclusion (release must be a write) is now stated on the FSPEC's *current* words rather than on
  the ones it was written against, which is the stronger form: the document and its upstream now
  agree instead of the document recording a disagreement it had already won.
- **The accepted-cost paragraph's row renumbering is explained, not laundered.** It now names the row
  by content ("**empty-or-neither-form** row") rather than by ordinal, cites `FSPEC:479`, and says in
  parentheses why the ordinal moved. That is the right repair for an ordinal cite: content-addressed
  first, position second, with the drift on the record.
- **The rejected-alternative annotation is a correct product warning, and every cite in it resolves.**
  The bullet keeps the historical rejection and appends "Rejected on a premise the `RELEASED:`
  sentinel removes — and this alternative is now the shipped behaviour. Do **not** transcribe this
  bullet as current direction." Then it says which sentence of its own text is false at HEAD ("a
  *released* marker **is** an empty file"), gives the shipped outcome, and names the oracle a naive
  transcriber would write and why it is red: "`"" ⇒ free`, no `reclaimed-stale-lock` — is red against
  `TSPEC:1940` and blind to an AC-1.3 operator-visible outcome". I resolved both anchors:
  `TSPEC:1940` is §10.3 row 4 — an empty marker is `present` (§7.3 decision 2) ⇒ `markerVerdict` ⇒
  `reclaim`, `reclaimed-stale-lock`, abandoned id `unknown` — and `TSPEC:2640` is the four-fixture
  sentence (AT-M3's `""` and neither-verb fixtures reclaim, AT-M11's two `RELEASED:` fixtures do not,
  at either age). `TSPEC:974-977` and `:987-988`, the two supersession anchors the bullet leans on,
  both still resolve verbatim. This is the last surface in the entry that could still have been read
  as live direction; it is now flagged at the point of reading, which is where it matters — a
  PROPERTIES author who lands on the alternatives list without reading the note above it is caught.
- **§11.2 conjunct 4 item (i) is now exactly the TSPEC's row, and it agrees with §5.** The revision
  changes "that domain's permitted set" to "that domain's **whole verb set (obliged ∪ permitted)**"
  and splits the enumeration accordingly — "obliged `add` and `commit`, plus permitted `read-branch`,
  `read-status`, ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index`". `TSPEC:1724` is the invoking-tree
  row and its columns are precisely that: Obliged `add`, `commit`; Permitted-not-obliged
  `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index`. The prior wording
  transcribed the right seven verbs under the wrong column name, which a property author copying the
  phrase "permitted set" could have turned into a containment bound that excludes `add` and `commit`
  — the two verbs AT-Q7c's Given *requires* to be present. `DECISIONS:291-297` (§5 domain 1) already
  used the "whole verb set" framing with the same split; the two surfaces now match, so a reader who
  consults either arrives at the same bound. The "**Take the upper bound from `TSPEC:1724`, not from
  `FSPEC:2154`**" instruction is unchanged and still correct — `FSPEC:2154` still spells
  `{add, commit, read-branch, read-status}` and still calls it "its permitted set".
- **The continuation-anchor paragraph is right about the mechanism.** I confirmed the published
  `grep` patterns behave as described against the file: the widened `TSPEC` pattern does not match a
  bare `` `:NNN` `` token, and the bare-token pattern does. The three worked examples are real sites
  in the document. The warranty-scope paragraph's FSPEC recipe
  (`grep -onE 'FSPEC[^ ]* ?§?[0-9.]*:[0-9]+(-[0-9]+)?'`) runs and returns the document's FSPEC set —
  I ran it and resolved all thirteen distinct values at HEAD; every one lands except the two the
  paragraph itself declares retargeted-from.
- **No regression against anything I approved.** I re-checked DEC-CONS-07's supersession note,
  Reversibility, the re-evaluation triggers and both Testability conjuncts, DEC-CONS-01's
  credential-helper lane (`pdlc/workflows/runtime-adapter.js:668` — `rtShellQuote` is still the POSIX
  single-quote wrapper the entry claims, and `:714` still maps it over every argv element),
  DEC-CONS-03's domains and verb sets, DEC-CONS-05's evidence structure, DEC-CONS-06's exclusion,
  §11.6(e)'s guard sentence and the six-status set-equality. All unchanged; nothing traded for these
  four commits.

One thing in the changed spans did not verify: the two counts the new *Anchor provenance* sentence
publishes. That is F-18 below.

## Findings

Both v7 findings are resolved. No High or Medium finding is open — old or new. One Low finding rides
out of the changed spans; it cannot steer a PLAN or PROPERTIES author wrong.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-18 | Low | Local | **The two counts the widened recipe publishes were measured one commit before the sentence that publishes them, and are wrong at the revision that carries them — by 6 and by 10.** `DECISIONS:952-955` says: "both counts belong to any re-sweep so a re-runner can tell whether they have the whole set: **at this revision** the pattern above returns **92** prefixed sites, while `` grep -onE '`:[0-9]+(-[0-9]+)?`' `` returns **122** bare tokens". I ran both patterns against the file at every commit in this delta. `50e28b23` (the revision I reviewed as v7): 92 and 122 — exactly the published pair. `eaf5c744`: 96 and 122. `cde34287`: 96 and 122. `9fe8f762`: 96 and 121. **HEAD (`d8a297e1`, the commit that writes the sentence): 98 and 132.** The counts were taken before the four commits that precede the sentence and before the sentence's own text, which itself contributes prefixed and bare anchors (the three worked examples alone add three bare tokens). "At this revision" is therefore false as written at the only revision a reader can run it against. The product consequence is confined and real: this paragraph exists so a future re-sweeper can tell whether they have the whole citation set, and it hands them a baseline that fails on first contact — a re-runner who gets 98/132 and expects 92/122 must decide whether they widened the pattern, whether ten anchors appeared, or whether the paragraph is stale, and the paragraph gives them nothing to decide with. It steers no oracle: nothing downstream transcribes these integers into a test, and every *anchor* the paragraph certifies still resolves (I re-resolved the whole TSPEC and FSPEC sets at HEAD). It is Low for that reason and no other. Note that this is the third round in which a published count in this paragraph has been wrong at the revision that carries it (v6's "ten across twelve", corrected to eleven across fourteen; now 92/122). Fix — pick one and make it hold: (a) re-measure at the committing revision and state **98** and **132**, accepting that any later edit re-stales them; or better (b) drop the absolute integers and state the *invariant* the re-runner actually needs — that the bare-token count strictly exceeds the prefixed count, that the difference is continuation anchors plus `runtime-adapter.js` cites, and that both figures must be re-measured at the revision under sweep — which is a claim that survives an edit, unlike a pair of integers in a file that cites itself. The paragraph already says "the site count is a function of the revision, not a constant" one sentence later; option (b) is just applying its own rule to its own numbers. | AC-3.8 |

## Questions

## Positive Observations

## Recommendation

## Verdict

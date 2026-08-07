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

| ID | Question |
|----|---------|
| Q-05 | *(carried unchanged from v2.)* DEC-CONS-04's observability paragraph names a forensic signature — two `.consolidation-log.md` records with distinct `passId`s carrying the same `(failure-mode-id, action)` key — that nothing computes. Should it appear in the operator-facing release note beside the drift-gate row §11.1 already flags? |
| Q-06 | *(carried unchanged from v3.)* `REQ:288` obliges a **pathspec** on both invoking-tree calls and explicitly rejects `commitPaths`' bare `git commit -m` shape. The obligation conjunct asserts the two verbs are *observed*, but a verb-level observation still cannot see the pathspec. Which oracle owns the pathspec — an AT in the register, or an argv-shape assertion like domain 3's? |
| Q-07 | *(carried from v5.)* A mechanical link-resolver would have caught F-10, F-16 and F-17; it would not have caught F-13, a stale *claim* whose anchors all resolved. Is there a cheaper convention that catches both — e.g. every DECISIONS entry carrying a one-line `Superseded-by:` field that the TSPEC's §13.1 row is required to match, so a supersession is a set comparison rather than a prose paragraph a reader has to find? |
| Q-08 | *(carried from v6, answered in practice.)* The author chose "annotate in place", and with `eaf5c744` the annotation now reaches the rejected-alternatives list too — the last surface that could be read as live direction. The structural question stands for the next document: should §2's index only ever list *live* decisions, with overturned entries relocated to a short "superseded" section? Not a finding — in-place annotation has now been carried to every surface, which is the expensive way to make it work. |
| Q-09 | *(carried from v7, untouched by this delta.)* §11.3 still holds two struck (closed) items and one live one under the title *Errata raised, not settled here*, which now describes one of its three. Does the PLAN's reader need the section partitioned (live / closed), so "what is still handed up" is a set they can read off rather than derive from strikethrough? |
| Q-10 | *(new, and it is Q-07 arriving from the other side.)* F-15, F-17 and now F-18 are the same shape: a self-describing paragraph whose published method or count is measured at one revision and read at another. The document has now paid for this three times. Is the durable answer that a document should never publish an integer about itself — only the recipe and the invariant — with the count left to whoever runs the recipe? I would take that as a process convention rather than a finding against this document, which is why it is a question. |

## Positive Observations

- **The rejected-alternative annotation closes the last hole a PROPERTIES author could have fallen
  into.** A reader who skips the supersession note and goes straight to "Alternatives considered" —
  which is exactly what someone hunting for "what did they decide about empty markers" does — was,
  until `eaf5c744`, told that empty ⇒ `reclaim` was *rejected*, when it is what ships. The bullet now
  catches that reader in place, names the false sentence in its own text, gives the shipped outcome
  with its reason code and abandoned id, and spells the wrong oracle out so it can be recognised
  rather than merely avoided. Flagging the entry at the index, the heading, the Decision block and
  now the alternatives list is four surfaces for one supersession, and that is the correct cost.
- **F-16 was answered past its own scope.** I asked for two retargets, a tense fix and a warranty
  sentence. The revision also explains *why* the §4.2 ordinal moved — the `RELEASED:` row inserted at
  `FSPEC:476` pushed the empty arm from fourth to fifth — and publishes the FSPEC sweep recipe so the
  next pass covers both upstream documents. That converts a one-off reviewer catch into a repeatable
  method, which is the difference between fixing a defect and closing a class.
- **The document names its own blind spot rather than quietly widening around it.** F-17 offered two
  exits and the harder-to-write one was chosen: instead of stretching the pattern until the counts
  agreed, the paragraph says plainly that a third spelling exists, that the pattern cannot see it,
  that those anchors are resolved by hand, and that its own fourteenth stale site was one of them.
  Publishing the limit of your tool is more useful to a re-runner than publishing a tool that looks
  complete.
- **The invoking-tree fix removed a real trap, not a wording nit.** "Permitted set" naming a set that
  contains two *obliged* verbs is the kind of phrase a property author transcribes literally; the
  resulting containment bound would have excluded `add` and `commit`, which AT-Q7c's own Given
  guarantees are present. The correction also reconciles §11.2 with §5 domain 1 word for word, so the
  two places a reader might look no longer differ.
- **Nothing was weakened across four commits.** I checked the supersession note, both testability
  conjuncts, the reversibility and trigger paragraphs, DEC-CONS-01's credential-helper lane against
  `runtime-adapter.js` at HEAD, DEC-CONS-03's verb sets, DEC-CONS-05's evidence structure,
  DEC-CONS-06's exclusion, §11.6(e) and the six-status set-equality, specifically for silent
  weakening. Found none.

## Recommendation

**Approved with minor changes**

Both v7 findings are resolved — F-16 on all four limbs, with the retargeted FSPEC anchors resolved by
me at HEAD rather than taken on the document's word, and F-17 on the harder of the two exits I
offered — and nothing I approved in earlier rounds was weakened. I walked the one product test that
matters at this gate — *can a PLAN or PROPERTIES author read this document and write the wrong
artifact?* — across the four changed surfaces: §9's Context and accepted-cost paragraphs, §9's first
rejected alternative, §11.2 conjunct 4 item (i), and the *Anchor provenance* paragraph with its new
warranty-scope note. Every one of them now points at the shipped upstream form. Two of the four
closed live traps rather than tidying prose: the alternatives-list annotation catches a reader who
never reaches the supersession note, and the "whole verb set (obliged ∪ permitted)" restatement
removes a bound that would have excluded the two verbs AT-Q7c's Given requires. There is no path in
this document to a wrong oracle.

One Low finding rides out:

1. **F-18** — the *Anchor provenance* paragraph publishes "at this revision … **92** prefixed sites
   … **122** bare tokens". Those are the counts at `50e28b23`, four commits before the sentence
   exists; at the committing revision (`d8a297e1`) they are **98** and **132**, partly because the
   sentence's own worked examples are bare tokens. Either re-measure to 98/132, or — better, and this
   is the same paragraph's own stated rule applied to itself — drop the integers and publish the
   invariant plus the recipe, since the count is a function of the revision and this file cites
   itself.

That does not block the document from being carried downstream, which is what "Approved with minor
changes" means here: I would hand this DECISIONS to a PLAN author today and expect F-18 to land in
the next commit that touches the file rather than in a round of its own.

I am **not** asking for changes to the rejected-alternative annotation, the §9 Context rewrite, the
`FSPEC:479` content-addressed row cite, §11.2 conjunct 4 item (i)'s new bound, the continuation-anchor
paragraph, or the FSPEC warranty-scope note — all six are correct, all six are better than what they
replaced, and I would keep every one verbatim.

Two upstream errata leave this review, both carried from v7 and both re-measured at HEAD rather than
re-asserted on faith. First, `FSPEC:2154` (AT-Q7c) still spells the invoking-tree upper bound
`{add, commit, read-branch, read-status}` and still calls it "its permitted set", but that is FSPEC
§6.5's pre-widening set — `TSPEC:1724` permits three further non-mutating reads, at least one of
which (`read-index`) is observed on AT-Q7c's own `promoted` Given, so a property transcribing FSPEC's
bound is red on correct code. This DECISIONS revision has now made its own statement of the bound
exactly right in two places, which leaves FSPEC as the only carrier. Second, `TSPEC:1405` still cites
`TSPEC:1522` for `openClone` (measured at `:1602`) and `TSPEC:1832` for §10.3 row 1a (measured at
`:1937`), and the changelog pointer at `TSPEC:52` still spells the NFR-2 row as `:1325`, which is a
blank line. This document corrected its inherited copies in the v5 sweep; the TSPEC remains the only
carrier.

## Verdict

VERDICT: Approved with minor changes

APPROVAL-HASH: sha256:286797a97ad68d3986c38bc63b860a59133a6b479838d0a2a20079e899846c21
REVIEWED-COMMIT: d8a297e164e9cbd13aad2e1740c757615ffda9f4

# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 5
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of `61f11478..HEAD` — three document commits: `4800522a` (retarget DEC-CONS-03's
obligation cites to `TSPEC:2202-2203` and the domain rows to `:1724`/`:1725`), `a3227a0a` (§11.2's
DEC-CONS-03 row — enumerate all four set assertions in TSPEC order, both-domain absent-always), and
`8ee80a62` (re-measure remaining TSPEC anchors at HEAD; add the new *Anchor provenance* paragraph).
I read my v4 cross-review, ran
`git diff 61f11478..HEAD -- docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`,
and confined this pass to the changed spans plus my two open v4 findings.

Changed spans: §5 (DEC-CONS-03) domains 1, 2 and 3 — anchor retargets plus the two parenthetical
"not `:2201-2202`, which is containment" clauses; §5's marker-lock rejection bullet (`:1619` ⇒
`:1724`); §8 (DEC-CONS-06)'s widened-prompt and exclusion anchors (`:425-426` ⇒ `:479-480`,
`:2160` ⇒ `:2282-2284`, `:912-919`/`:969-971` ⇒ `:992-996`/`:1046-1048`, `:439` ⇒ `:493`); §11.2's
DEC-CONS-03 row, rewritten from a prose sentence into a four-item enumeration, plus the wholly new
*Anchor provenance* paragraph. Everything else is untouched and not re-litigated.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-08 | Low | **Resolved, exactly** | I asked for the obligation conjunct to be cited at `TSPEC:2098-2099` rather than `:2097`, in all three places. The TSPEC has since moved, and the revision retargets to the *current* anchor in all three: DEC-CONS-03 domain 1, domain 2, and §11.2 item 3 now cite `TSPEC:2202-2203`. Verified at HEAD — `TSPEC:2202` reads "`observed ⊆ permitted` per domain, universally; **obligation** `obliged ⊆ observed` per domain, on" and `:2203` continues "the Given that obliges it; and the two `∅` equalities of AT-Q7c." Two of the three sites go further than I asked and state the *negative* — "`:2201-2202` is *containment*, which is precisely the conjunct this sentence has just said is insufficient" — which closes the mis-landing my finding described rather than merely relocating it. |
| F-09 | Low | **Resolved, in full** | I asked for three things and the revision does all three. (a) The span is now `TSPEC:2199-2204`, which I verified covers the whole oracle sentence from "The oracle is then **four** set assertions" through "never a multiset" — my v4 complaint that the cited span was short at both ends is gone. (b) The four are re-ordered to the TSPEC's own order: partition **first** (`:2199-2201`), containment (`:2201-2202`), obligation (`:2202-2203`), the two `∅` equalities of AT-Q7c **fourth** (`:2203`). I transcribed `TSPEC:2199-2204` and the order matches exactly. (c) The clone-domain absent-always `∅` is now carried — item 4 states *two* intersections, names the invoking-tree absent-always set (`checkout`, `switch`, `stash`, `reset`, `rebase`, every merge verb, `TSPEC:1724`) and the clone's (every merge verb, `TSPEC:1725`), and adds the sentence I would have written myself: "a property that carries only the invoking-tree half is not set-equal to the TSPEC's oracle." |
| Q-04 / Q-05 / Q-06 | — | Still open, still not findings | None is answered here and none needs to be. Carried forward unchanged. |

## Verification of the changed sections

Every retargeted anchor in the three commits was re-run against the TSPEC and the adapter at HEAD.

- **The two domain rows are now correct.** `TSPEC:1724` is the `git, invoking tree` row of §9.3's
  domain table (obliged `add`, `commit`; permitted `read-branch`, `read-status`, ⊕ `read-object`,
  ⊕ `read-remote`, ⊕ `read-index`; absent always `checkout`, `switch`, `stash`, `reset`, `rebase`,
  every merge verb) and `TSPEC:1725` is the `git, clone` row (obliged `clone`, `create-branch`,
  `add`, `commit`, `push`; permitted `fetch`, `read-branch`, `read-status`; absent every merge
  verb). Both are **set-equal** to what DEC-CONS-03 domains 1 and 2 and §11.2 transcribe — I
  compared member by member in both directions, and neither transcription has gained or lost a verb
  in this revision.
- **The four set assertions verify against `TSPEC:2199-2204` line for line.** `:2199-2200`
  partition and its union clause, `:2201` the "(without this, a call that falls out of the
  partition is exempt from containment)" rationale plus the word **containment**, `:2202` the
  containment formula and the word **obligation**, `:2203` "the Given that obliges it; and the two
  `∅` equalities of AT-Q7c. Comparison is over a `Set`, never a", `:2204` "multiset". Every
  sub-anchor §11.2 now gives — `:2199-2201`, `:2201-2202`, `:2202-2203`, `:2203`, `:2203-2204` —
  lands on the clause it names.
- **The DEC-CONS-06 retargets are right.** `TSPEC:479-480` is the widened `rtWriteFile` clause
  quoted verbatim, and I re-confirmed the count it turns on: `grep -n 'relative to the repository
  root' pdlc/workflows/runtime-adapter.js` still returns the single line `805:`, and `:480` reads
  "against the repository root", a different string — so the post-widening whole-file count is still
  1, exactly as the entry says. `TSPEC:2282-2284` is §11.6(e) conjunct 2 ("the string … occurs in
  `runtime-adapter.js` **exactly once** — the count is the falsifier for the opposite mistake"),
  correctly retargeted from the stale `:2160`. The standing guard sentence I praised at v4 is
  intact.
- **The exclusion paragraph's retargets are right.** `TSPEC:992-996` is the `takeMarker` passage
  that probes with `_checkFile` and reads with `_readFile`; `:1046-1048` is the observe-then-write
  ordering. `grep -n '_hashFile'` over the TSPEC still returns **exactly one** line — `:493`, the
  `rtDevInjections` member list — so "no consumer" holds and the retarget from `:439` is correct.
- **No regression against anything I approved.** DEC-CONS-06's decision, scoping and positive arms,
  DEC-CONS-03's three domains, the withdrawn-ground paragraphs and the `∅`/obligation strengthening
  are all untouched in substance; this revision moves anchors and expands one enumeration, and
  removes no assertion. I re-checked that §11.2's rewritten row is a superset of the prose it
  replaced — it is.
- **What did not verify: the new *Anchor provenance* paragraph's universal claim.** See F-10. Its
  scoped statement about the conjuncts is true (`:2095` ⇒ `:2199` and `:2098` ⇒ `:2202` are both
  +104), but the sentence generalises to the whole file, and the whole file does not hold.

## Findings

Both of my v4 Lows are resolved and verified. One **Medium** is newly introduced by this revision —
not by an anchor being wrong, but by the document asserting a **universal warranty over all its
anchors** that is refuted by counterexample. Two Lows follow from it.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-10 | **Medium** | Local | **The new *Anchor provenance* paragraph warrants something that is not true, and the warranty is aimed at the one reader who will act on it.** §11.2's new paragraph states: "Every `TSPEC:` line number in this document was re-measured against the TSPEC at the commit that carries this revision," and closes by telling the PROPERTIES author to "re-measure the anchors **if the TSPEC moves again**" — i.e. that no re-measurement is needed now. At least **six** `TSPEC:` anchors outside the retargeted spans are stale at HEAD, and I resolved each one: (1) `TSPEC:618` (DECISIONS:100, `enumerateCorpus` returns `{unlistable: true, detail: stderr}`) is in fact `bySeamFeature: Map<string, Map<string, number>>;` inside `EscalationCounts` — the real anchors are `TSPEC:672` (signature) and `:738` (the exact phrase). (2) `TSPEC:1832` (DECISIONS:101, "§10.3 row 1a puts pathspec `stderr` in report body") is a **blank line** before the `### 10.1` heading; §10.3 row 1a is `TSPEC:1937`. (3) `TSPEC:1522` (DECISIONS:102, "`openClone` returns `{failure, detail}`") is a sentence about `devModule`'s export list naming `resolveAdvisoryRung` and `commitPaths`; `openClone`'s signature is `TSPEC:1602`. (4) `TSPEC:2522` (DECISIONS:674, "one permanent zero-byte `docs/_decisions/.consolidation-lock` per consuming repo") is the register-id set-equality invariant; the quoted text is at `TSPEC:2658`. (5) `TSPEC:1325` (DECISIONS:850, "traceability row states NFR-2") is a **blank line**; the NFR-2 / §7.4 traceability row is `TSPEC:1405`. (6) `TSPEC:1595-1601` (DECISIONS:94, "TSPEC §9.2 — value never becomes JS string") spans the end of §8's report-body paragraph, the `## 9.` and `### 9.1` headings and a fence opener; §9.2 begins at `TSPEC:1629` and the quoted claim is at `TSPEC:1405`. **Why this is Medium and not a sixth Low.** Individually these are the same class of slip as my v4 F-08 — but the revision does not merely leave them, it *certifies* them, and it certifies them in the paragraph whose entire purpose is to tell the PROPERTIES author which anchors to trust. Two of the six (`:1832`, `:1522`) are the anchors that carry the **NFR-2 inbound-residual** carve-out — the one place this document concedes credential-derived `stderr` reaches a report body — so an author following them to write the non-disclosure property lands on a blank line and an unrelated export list. Under the completeness discipline this document applies to everything else, an enumerated warranty ("every") must hold by **set-equality over the full enumeration**, not over the subset that was actually re-measured; here it is refuted by six members. Fix: either re-measure and correct all six (and re-run the sweep over every `TSPEC:` anchor before re-asserting the sentence), or narrow the claim to what was done — "every `TSPEC:` anchor **in DEC-CONS-03, DEC-CONS-06 and §11.2** was re-measured; anchors elsewhere in this document have not been re-measured against the current TSPEC and should be verified before use." The narrowed form costs one sentence and is true. | AC-3.8, NFR-2 |
| F-11 | Low | Local | **"shifted the file by roughly +105 lines" is stated as a global offset and is not one.** The same paragraph explains the v4 anchors' staleness with "the subsequent TSPEC round shifted the file by roughly +105 lines." That is accurate for the conjuncts under discussion (`:2095` ⇒ `:2199`, `:2098` ⇒ `:2202`: +104 both) and for the domain rows (`:1619` ⇒ `:1724`: +105), but the shift is cumulative and location-dependent, not uniform: this revision's own retargets are `:425` ⇒ `:479` (**+54**), `:439` ⇒ `:493` (**+54**), `:912` ⇒ `:992` (**+80**), `:2160` ⇒ `:2282` (**+122**). A reader who takes the sentence at face value and adds 105 to any of F-10's six stale anchors lands nowhere. The sentence is offered as an explanation, so the fix is to scope it rather than delete it: say the shift **at the conjuncts** is +104, and that shifts elsewhere range from +54 to +122 because the TSPEC round inserted at several points. | AC-3.8 |
| F-12 | Low | Local | **DEC-CONS-06's `_checkFile` exclusion cites the transport prompt one line high.** §8's exclusion paragraph reads "the `_checkFile` transport (`check:${path}`, `:823-825`)". At HEAD the prompt is `runtime-adapter.js:822-824` — `822` "Run this exact command from the repository root and report the result:", `823` the `test -f … && test -s …` line, `824` "Return ONLY one word: OK, EMPTY, or MISSING." — and the `label: \`check:${path}\`` the citation names is at `:825`. `runtime-adapter.js` has not changed on this branch (last touching commit `bb99f890`, pre-branch), so this is a measurement slip, not drift; my own v4 review repeated it, which is why I am recording it rather than leaving it. The cited span does contain the label it names, and the substantive claim — that neither `rtHashFile` nor the `_checkFile` transport is a read prompt in DEC-CONS-06's sense — is unaffected and remains correct (`rtHashFile` at `:613`, its prompt at `:618`, both verified at HEAD). Fix: cite `:822-824` for the prompt and `:825` for the label. | AC-3.8 |

## Questions

## Positive Observations

## Recommendation

## Verdict

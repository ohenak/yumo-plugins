# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 5 (erratum delta-confirmation round; base reviewed at `218debf3`, delta `218debf3..HEAD`)

## Scope of this round

Delta confirmation only. I read the erratum diff (37 insertions, 30 deletions across §1's
changelog, C-3, C-9, §4.1, AC-2.1, AC-2.2, AC-2.6, AC-3.2, AC-4.2, AC-4.4, AC-5.1b/c, AC-6.2),
then re-read the whole REQ once for coherence against the amended text (DEC-ERR-03), and diffed
every existing-code claim the delta touches against HEAD sources — not against the item list.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | §1.2 claim 2 still asserts `docs/discarded/` is "excluded by pathspec" — the exact statement C-3 and AC-2.6 were amended to retract, and false at HEAD | §1.2 claim 2 (line 70) |
| F-02 | Medium | Local | The newly split AC-5.1c has no row in FSPEC's traceability matrix and no AT mapped to it | AC-5.1c |
| F-03 | Low | Local | Duplicated article: "so a a malformed section is distinguishable" | AC-5.1b |

### F-01 (High, Local) — `delta | nonlocal` — §1.2 claim 2 contradicts the amendment it was routed with

The routed item was: *"C-3 and AC-2.6 state a `docs/discarded/` explicit exclusion, but the
shipped enumeration excludes only `docs/discarded/{feature}/` by glob depth."* C-3 and AC-2.6
now land it correctly. §1.2 claim 2 does not — it still reads:

> `pdlc-consolidation-agent` already ships an enumeration over exactly those two locations —
> tracked and untracked but not ignored, `docs/discarded/` excluded by pathspec …

Verified against HEAD: `pdlc/workflows/consolidate-learnings.js:1337-1345` declares
`LS_FILES_ARGV` as `ls-files --cached --others --exclude-standard --`
`:(glob)docs/*/LEARNINGS-*.md` `:(glob)docs/completed/*/LEARNINGS-*.md`. There is **no**
exclusion pathspec of any kind — no `:(exclude)`, no `docs/discarded/` term. `docs/discarded/{p}/`
falls out because it sits one directory deeper than either glob reaches, and
`docs/discarded/LEARNINGS-x.md` *does* match the first glob. FSPEC BR-2 (lines 264-271) says
exactly this.

So the document now carries both readings at once: C-3 line 171 ("`docs/discarded/` gets **no
exclusion rule of its own** (AC-2.6)") against §1.2 line 70 ("excluded by pathspec"). An
implementer reading §1.2 for the corpus predicate would restate a pathspec that does not exist —
and the O-7 pinning test would then fail against `LS_FILES_ARGV`, which is the one place this
claim is load-bearing. It is also a false existing-code claim on its own terms.

Fix, one clause: replace "`docs/discarded/` excluded by pathspec" with "`docs/discarded/{feature}/`
outside both globs by depth, with no exclusion pathspec". No other sentence in §1.2 changes.

### F-02 (Medium, Local) — `delta | local` — AC-5.1c has no downstream traceability row

The split of AC-5.1b into AC-5.1b (section present, not an object) and AC-5.1c (declared key
wrong-typed) is correct and matches shipped semantics, but FSPEC's traceability matrix still
carries only `| AC-5.1b | BR-14 | AT-32 |` (FSPEC:117) and BR-14's own heading still scopes
itself `*(AC-4.4, AC-5.1a, AC-5.1b)*` (FSPEC:584). The behaviour is already legislated — BR-14's
state table has the wrong-typed row and BR-9's notice catalogue has `NTC-KEYTYPE` — and REQ AC-6.2
requires the assertion, so this is a matrix/heading gap, not a coverage gap. The fix lands in
FSPEC, not here; recorded so the FSPEC round picks it up rather than shipping an AC with no AT.

### F-03 (Low, Local) — `delta | local` — typo in AC-5.1b

"so a a malformed section is distinguishable from a deliberate disable" — drop the duplicated
article.

## Verifications performed

Each amended claim was checked against HEAD rather than accepted from the item list:

| Amendment | Check | Result |
|---|---|---|
| AC-2.2 → ordering is a pure function of (key value, path); rename-invariance retracted | FSPEC BR-4:330-351; 2 of 89 measured documents carry no `Date Completed` row | Agrees; the retraction is stated in the REQ's own voice, not as a deference |
| AC-2.1 → "at most `maxDocuments` for every N", cap reached only where byte bounds do not bind | FSPEC BR-5:353-368; §4.1's 5 / 6,000 / 20,000 | Agrees; the falsified equality claim is gone and no other AC re-asserts it |
| AC-2.6 / C-3 → depth-based exclusion, `docs/discarded/LEARNINGS-*.md` an ordinary member | `consolidate-learnings.js:1337-1345`; FSPEC BR-2:264-271 | Agrees **in C-3 and AC-2.6**; §1.2 claim 2 does not (F-01) |
| AC-3.2 → `RSN-TRUNCATED` removed, `RSN-NO-MATERIAL` added, third notice catalogue | FSPEC BR-9:477-505 | Set equality holds: 6 per-document ids, 2 corpus-level, notice catalogue acknowledged; "Three set-equality tests" matches BR-9's per-catalogue rule |
| AC-4.2 → truncation lands as eligible-or-`RSN-UNPARSEABLE` | FSPEC BR-3:294-298 | Agrees; C-7 still lists truncation as an *input state*, which is consistent, not a residue |
| AC-5.1b → present-and-not-an-object; misspelt name reads as absent | `orchestrate-dev.js:191-210` (`parseImplementationConfig`/`parseAdvisoryConfig` set `sectionMalformed` only when the section key is present and not a plain object); `consolidate-learnings.js:2097-2159` | Agrees with shipped precedent; no unknown-key registry implied |
| AC-5.1c → wrong-typed key keeps the run enabled at the key's default, with a notice | `orchestrate-dev.js:213-240` (`invalidKeys` accumulates, defaults substituted, section still consumed) | Agrees |
| AC-4.4 / AC-6.2 / C-9 / §4.1 cross-references to the split | grep for `AC-5.1c` across the REQ | All four updated; no dangling reference to the old single AC |
| Residues | grep for `RSN-TRUNCATED`, `learningsInjectoin`, `rename` | None survive except AC-2.2's deliberate "rename invariance is **not** claimed" |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-2.6 says a document directly at `docs/discarded/LEARNINGS-*.md` is "a corpus member on ordinary terms". FSPEC E-35 notes none exists at HEAD. Is the intent that a future operator moving a LEARNINGS file to that path silently re-admits it to the corpus, or should O-6/O-3 record that as a state to watch? No AC depends on the answer; asking so it is a decision rather than a by-product. |

## Positive Observations

- Every amendment is stated in the REQ's own voice with the retraction made explicit
  ("equality above it is **not** claimed"; "Rank invariance … is **not** claimed: the path is
  load-bearing here"). A reader of the REQ alone now gets the corrected reading without holding
  the FSPEC beside it — which is what an erratum round is for.
- AC-5.1b/AC-5.1c is a genuinely better split than the item list asked for: it separates
  *section shape* from *key type*, matches the two distinct signals shipped code already emits
  (`sectionMalformed` vs `invalidKeys`), and keeps both at REQ altitude by naming outcomes rather
  than the parse procedure.
- AC-3.2's third catalogue was added with its set-equality obligation ("Three set-equality tests,
  one per catalogue") rather than as prose, so the closure discipline survives the addition.
- The changelog row names the absorbed FSPEC rules and the touched ids, so the next reviewer can
  scope a delta read without reconstructing it from the diff.

## Recommendation

**Needs revision** — one High finding, and it is a one-clause edit. C-3 and AC-2.6 landed the
`docs/discarded/` correction; §1.2 claim 2 was left behind asserting the retracted mechanism as
fact about shipped code. Fix F-01 (and, freely, F-03) and this REQ is done. F-02 is routed to the
FSPEC round and does not gate here.

## Delta-confirmation findings (tagged)

FINDING: High | delta | nonlocal | §1.2 claim 2 | The routed `docs/discarded/` correction landed in C-3 and AC-2.6 but not in §1.2 claim 2, which still asserts "`docs/discarded/` excluded by pathspec" — false at HEAD (`consolidate-learnings.js:1337-1345` carries no exclusion pathspec) and contradicting the amended C-3.
FINDING: Medium | delta | local | AC-5.1c | The new AC-5.1c has no FSPEC traceability row and no AT mapped to it (FSPEC:117, FSPEC:584 still scope BR-14 to AC-5.1b); fix lands in FSPEC, behaviour already legislated by BR-14 and BR-9.
FINDING: Low | delta | local | AC-5.1b | Duplicated article: "so a a malformed section is distinguishable".

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}

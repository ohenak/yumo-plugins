# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.4)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.4 (sha256:60a516fb…, verified at HEAD)
**Date:** 2026-08-31
**Iteration:** 6 (targeted erratum delta confirmation)

## Overview

This is a targeted erratum delta confirmation. Nine routed items arrived from three reviewers, but
they collapse to **three distinct defects**, each reported independently by two or three roles:

1. BR-11's harvested predicate stated over bare `CODE_REVIEW-*` while REQ-STATS-04 scopes it to the
   version grammar (pm-review, se-author, te-review).
2. BR-16's harvested predicate stated over bare `CROSS-REVIEW-*` while BR-14's numerator and
   REQ-STATS-06 read the documented basename grammar — the two disagreeing on the out-of-catalogue
   `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files (pm-review, se-author, te-review).
3. BR-25's directories-only illustration naming `docs/completed/REQ-completed.md` but not
   `docs/completed/QUEUE-HISTORY-rows-0-1.md` (se-author, te-review).

Per DEC-ERR-03 the FSPEC was re-read whole against REQ v1.4 at HEAD, not just at the routed
anchors. Method: `git diff 32a23e013 HEAD` for the round's edit, then the current REQ text of every
criterion and constraint the FSPEC leans on, plus filesystem verification of every claim the edit
makes about this repository.

**All three routed defects landed, and landed correctly.** I could verify each against REQ HEAD and,
where the FSPEC asserts a fact about this repository, against the filesystem. There are no `delta`
findings: the edit introduced nothing and left nothing routed unlanded.

What remains is one class of `inherited` staleness, and the round sharpened rather than resolved it.
§7.3 is titled *"Upstream errata raised, not folded in"* and lists five errata as still open against
the REQ. The round correctly closed and removed three of them. Checking the remaining five against
REQ v1.4, **every one is now settled upstream** — REQ v1.3/v1.4 landed the carve-outs and wording
changes each bullet asks for. §7.3 therefore now reports zero real disagreements as five, and three
in-place erratum notices (BR-06, BR-27, EC-09/D-9) still tell the reader a live dispute exists where
none does. No behaviour turns on any of it; the FSPEC's behavioural spine agrees with REQ HEAD
everywhere I checked. But TSPEC reads §7.3 for intent, and phantom open errata are an invitation to
"fix" agreement into divergence.

One correction to my own v5 review, in fairness to the author: v5 F-03 asserted BR-27's quoted
string "no longer exists". That was wrong. The string is real — it lives at **G-3**, a goal, not at
REQ-STATS-07, the criterion BR-27 attributes it to. The defect is mis-attribution, not a dead
quote, and it is narrower than I made it sound. F-02 below states it correctly.

None of the remaining findings is High, so none gates this confirmation; they route back to the
document's ordinary revision loop rather than halting the phase.

## Routed Items — Verification

### 1. BR-11 vs REQ-STATS-04's version grammar — **landed**

REQ-STATS-04 at HEAD: harvested applies "where `LEARNINGS-{feature}.md` is present **and** no
`CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains". BR-11 now states exactly
that predicate and, crucially, goes on to *decide the leftovers* rather than leaving them implied:

> a basename beginning `CODE_REVIEW-` that does not match — a `-draft` suffix, another feature's
> name — contributes nothing to BR-10's value and counts as nothing remaining here, so it neither
> raises the number nor suppresses `harvested`.

That is the right resolution of the two cases the reviewers named, and it is the one REQ-STATS-04
requires: the REQ says a non-matching basename "simply does not contribute, exactly as an unrelated
file". Both documents now yield `harvested` on a directory holding `LEARNINGS` plus only
`CODE_REVIEW-{feature}-draft.md`. The v5 High is closed.

AT-12 gained the matching third leg — a directory with `LEARNINGS` plus `CODE_REVIEW-{feature}-draft.md`
and a foreign `CODE_REVIEW-{other}-v2.md` reading `harvested` — so the behaviour is pinned, not just
asserted. Good: this is the leg whose absence let the v1.2-era divergence survive four rounds.

### 2. BR-16 vs BR-14 / REQ-STATS-06 — **landed**

REQ-STATS-06 at HEAD names the two families by C-4's grammars. BR-16 now does the same and adds the
invariant that makes the BR-14 disagreement structurally impossible rather than merely absent:

> It is evaluated over exactly the file set BR-14's numerator sums, so the two never disagree: a
> basename failing a grammar contributes no bytes to the process side and counts as no file
> remaining.

I checked this closes properly through the chain. BR-14's process side is "every file matching
… `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`"; BR-09 fixes `{doc-type}` to the driver's closed
six-type catalogue and explicitly excludes the `REVIEW` spelling; BR-06 and EC-05 classify that
spelling as malformed. So `CROSS-REVIEW-{role}-REVIEW-v{N}.md` contributes no bytes to BR-14 **and**
counts as nothing remaining for BR-16. Consistent in both directions.

The worked example is accurate, and its repository citation checks out: `docs/completed/pdlc-advisory-wave-gate/`
does carry that shape — `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md`, four files,
matching §7.3's and BR-06's count. Note the phrasing is careful and correct: the em-dash aside cites
*the shape that directory carries*, not a claim that the directory holds only those files (it also
holds 60-odd well-formed cross-reviews). I read it twice for that ambiguity and it does not
misstate.

AT-17 gained the fourth fixture pinning it. Its closing clause — "files whose bytes BR-14 refuses
are equally files BR-16 does not count as remaining" — is the invariant in one sentence, which is
what makes the test legible.

### 3. BR-25's loose-file enumeration — **landed, and now exhaustive**

Verified on disk. Loose files at the two roots, in full:

| Root | Loose files present |
|---|---|
| `docs/` | `PLAN-pdlc-integration-boundary-gates.md` |
| `docs/completed/` | `REQ-completed.md`, `QUEUE-HISTORY-rows-0-1.md` |

BR-25 now names all three. That is not merely one more example: `find docs -maxdepth 1 -type f` and
the same at `docs/completed/` return exactly these, so the illustration is now a **complete**
enumeration of the repository's loose files rather than a sample. The added "whatever its basename
claims" also generalises the rule past the two basenames that happen to look like artifacts, which
is the durable form — `QUEUE-HISTORY-rows-0-1.md` claims neither a REQ nor a PLAN prefix and would
have escaped a prefix-shaped reading of the old text.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | local | §7.3 lists five errata as open against the REQ; all five are settled at REQ v1.4. The section now reports zero real disagreements as five. | §7.3 |
| F-02 | Medium | inherited | nonlocal | BR-27 attributes G-3's wording to REQ-STATS-07 and narrows it as an erratum; REQ-STATS-07 at HEAD already states BR-27's own rule. | §4.5 BR-27 |
| F-03 | Medium | inherited | nonlocal | EC-09 and D-9 assert a departure from REQ-STATS-09's *Given*; REQ v1.4 added the carve-out that removes the departure. | §5 EC-09; §7.1 D-9 |
| F-04 | Low | inherited | nonlocal | BR-06 calls the `-REVIEW-` malformed disposition "a wording defect of the upstream criterion"; REQ-STATS-03 now decides that case explicitly, in D-8's direction. | §4.2 BR-06; §7.1 D-8 |

### F-01 — §7.3's five remaining errata are all settled upstream (Medium)

The round closed three harvested-predicate errata and said so. Checking the five it kept against REQ
v1.4, each asks for a change the REQ has already made:

| §7.3 bullet | What it asks the REQ for | REQ v1.4 at HEAD |
|---|---|---|
| REQ-STATS-05 / C-5 post-mortem listing (High) | "the REQ's own C-5 enumeration is what needs the carve-out" | C-5 **has** it: "Discovering *which* phases have a post-mortem is carved out: the driver builds that path from a phase it already holds and classifies no `POSTMORTEM-*` basename… That listing is this REQ's own (REQ-STATS-05)" |
| REQ-STATS-03 swallows pipeline artifacts (High) | "whether that is the intended operator-facing wording is the REQ's to decide" | REQ-STATS-03 **decided it**, naming the shape: malformed "covers the grammatical-but-out-of-catalogue names the pipeline writes (`CROSS-REVIEW-{role}-REVIEW-v{N}.md`); one label stands: a third bucket would be an independent rule C-5 forbids" |
| REQ-STATS-09 sweeps in no-`docs/`-root (Medium) | "the criterion needs the carve-out, and until it has one the two documents disagree on a P1 path" | REQ-STATS-09 **has** it: "in a repository whose `docs/` root is present and readable — a missing or unreadable `docs/` root is not this criterion's case but a root failure" |
| REQ-STATS-07 zero-state row (Medium) | "'as missing' is not what that row says… it is the wording that should move" | REQ-STATS-07 **moved**: "for any feature whose directory cannot be read, reports it by name with the reason…; a readable but empty directory is not a gap but a normal row whose metrics report their zero states" |
| REQ-STATS-02 over-distribution + REQ-STATS-08 separator (Low, Low) | intended readings stated in BR-22/§3.4 | Both fixed: REQ-STATS-02 now scopes states per metric ("REQ-STATS-03's malformed and unmeasurable states and REQ-STATS-03/04/06's harvested state ride in their own metric's value"); REQ-STATS-08(b) has its separator ("`commit`, `push`, `add`, `checkout`, or similar") |

So all seven errata §7.3 ever carried are now closed, not three. The section's own framing makes
this worth fixing rather than leaving: its title asserts the contents are *"not folded in"*, and two
bullets are labelled High. A TSPEC author reading it inherits two phantom High-severity
FSPEC/REQ disagreements on REQ-STATS-05 and REQ-STATS-03 — precisely the two places where the FSPEC
and REQ now agree word-for-word, and where the FSPEC's reasoning was *adopted* upstream. The risk is
not inaction; it is a TSPEC that re-litigates a settled carve-out, or an operator asked to
re-decide REQ-STATS-03's label when the REQ states the decision.

Fix: convert §7.3 to a settled record, as the round already did for the harvested three — name REQ
v1.3/v1.4 as the resolving version per item and keep the derivation history, which is worth
retaining. If nothing remains open, the section should say so; an empty erratum list is the
correct and reassuring end state for a document that has cascaded four times.

### F-02 — BR-27 sources G-3's wording to REQ-STATS-07 (Medium)

BR-27 says it "narrows REQ-STATS-07's *'missing or fail to parse … reports it by name as
missing/malformed'*". That string is not in REQ-STATS-07. It is in **G-3**, a goal statement:
"any feature whose artifacts are missing or fail to parse is reported as missing/malformed — never
silently dropped." REQ-STATS-07 itself now states BR-27's rule directly, so at the criterion BR-27
names there is nothing left to narrow.

This matters slightly more than a citation slip because BR-27 is doing real work — it is the rule
that resolved the v1 empty-directory contradiction — and it currently justifies itself as a
deviation from a criterion that agrees with it. Fix: cite G-3 as the wording being narrowed (a goal
is the right altitude for a loose phrase), and state that REQ-STATS-07 already carries the rule.
The "raised as an erratum (§7.3)" clause should go with F-01's cleanup.

### F-03 — EC-09 and D-9 assert a departure the REQ no longer supports (Medium)

EC-09: "That departs from REQ-STATS-09's *Given*, which sweeps this case in; the departure is
decided at D-9 and raised as an erratum (§7.3)". D-9's rationale is built on the same premise
("REQ-STATS-09's *Given* sweeps this case in without meaning to… the criterion's wording is what
needs the carve-out").

REQ v1.4's REQ-STATS-09 carries the carve-out, in the FSPEC's own direction: a missing or unreadable
`docs/` root "is not this criterion's case but a root failure". The behaviour EC-09 and D-9 specify
is unchanged and now endorsed upstream — this is a documentation-only fix. But it sits on a P1
error path, and D-9 is exactly the kind of decision record a TSPEC author reads to learn whether a
behaviour is safe to rely on. Reading "this departs from the REQ" about behaviour the REQ now
mandates is the wrong signal. Fix: restate D-9's premise in the past tense (the criterion swept the
case in; v1.4 carved it out, adopting this decision) and drop EC-09's departure and erratum clauses.

### F-04 — BR-06's erratum notice outlives the erratum (Low)

BR-06 closes: "That a pipeline-authored artifact lands in a list an operator reads as 'malformed' is
a wording defect of the upstream criterion, not a divergence introduced here; it is raised as an
erratum against the REQ (§7.3)". REQ-STATS-03 at HEAD decides that case in the same direction and
for D-8's own reason — a third bucket would be an independent rule C-5 forbids. The disposition is
settled, not defective.

Everything else in BR-06 is correct and verified: the four `CROSS-REVIEW-{role}-REVIEW-v{N}.md`
files in `docs/completed/pdlc-advisory-wave-gate/` exist and number exactly four. Fix: replace the
erratum notice with a citation of REQ-STATS-03's settling sentence. D-8's decision, its rationale
and AT-09 all stand unchanged.

## Positive Observations

- **The three routed defects were fixed at the invariant, not at the example.** BR-16 could have
  been patched by naming the `-REVIEW-` case; instead it states *why* BR-14 and BR-16 can never
  disagree ("evaluated over exactly the file set BR-14's numerator sums"), which closes the whole
  class. Same for BR-11's leftovers clause. This is the difference between a fix that holds and one
  that holds until the next basename shape appears.
- **Every new claim about this repository is true.** I checked all of them on disk: three loose
  files at the two roots (exhaustive, not illustrative), four `-REVIEW-` files in
  `docs/completed/pdlc-advisory-wave-gate/`. After four rounds of cascade this is the round where
  the FSPEC's factual assertions and the filesystem fully agree.
- **Both fixes came with test legs.** AT-12's third leg and AT-17's fourth fixture pin the two
  harvested predicates rather than leaving them as prose. The v1.2-era BR-11 divergence survived
  four review rounds precisely because no AT exercised a non-matching `CODE_REVIEW-` basename; that
  hole is now closed.
- **The round respected its own scope.** 46 insertions, 33 deletions, confined to the header, A6,
  BR-11, BR-16, BR-25, AT-12, AT-17 and §7.3. No opportunistic edits elsewhere, which is what made
  this confirmation cheap to verify — I could diff, check the routed anchors, and re-read the rest
  for staleness rather than for change.
- **§7.3 was partly cleaned up unprompted.** Closing and removing the three harvested-predicate
  bullets was not a routed item; the author noticed they had gone stale and said so explicitly
  ("nothing about them is routed upstream now"). F-01 asks for exactly the same treatment applied to
  the other five — the pattern is already established in the document.

## Recommendation

**Approved with minor changes** — no High findings.

All three routed erratum items landed and are correct against REQ v1.4 and against the filesystem.
The FSPEC's behavioural spine agrees with the REQ everywhere I checked, and the two harvested
predicates that drove this round are now stated, cross-referenced and test-pinned.

The four remaining findings are all `inherited` documentation staleness in the upstream-erratum
bookkeeping: §7.3 and three in-place notices describe disagreements with the REQ that REQ v1.3/v1.4
resolved — in every case by adopting the FSPEC's reading. No behaviour changes if they are fixed;
what changes is that TSPEC stops inheriting five phantom open errata, two of them labelled High.
These route back to the document's ordinary revision loop, not to a halt, and would fit comfortably
in a single editing pass over §7.3, BR-06, BR-27, EC-09 and D-9.

FINDING: Medium | inherited | local | §7.3 upstream errata | All five errata §7.3 still lists as open are settled at REQ v1.4; the section reports zero real disagreements as five, two of them labelled High.
FINDING: Medium | inherited | nonlocal | §4.5 BR-27 | BR-27 attributes G-3's "missing/malformed" wording to REQ-STATS-07 and narrows it as an erratum, but REQ-STATS-07 at HEAD already states BR-27's own rule.
FINDING: Medium | inherited | nonlocal | §5 EC-09 and §7.1 D-9 | Both assert a departure from REQ-STATS-09's Given that REQ v1.4's present-and-readable carve-out removed; the behaviour is now endorsed upstream, not divergent.
FINDING: Low | inherited | nonlocal | §4.2 BR-06 and §7.1 D-8 | BR-06 calls the `-REVIEW-` malformed disposition an upstream wording defect raised as an erratum; REQ-STATS-03 now decides that case explicitly and in D-8's direction.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}

APPROVAL-HASH: sha256:0b8864d624cad46274ccb98a80e5da2672370bead258311446f6b482918017b0
APPROVAL-HASH-NORMALIZED: sha256:0b8864d624cad46274ccb98a80e5da2672370bead258311446f6b482918017b0
REVIEWED-COMMIT: 6e7985d14c26b774a148187cd40dac66abc6d8eb
UPSTREAM-STATE: REQ sha256:60a516fb2ede925b2428dca1bc8e4e61587c52827ea55b9e4965ea57b9a8f1c9

# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 2

## Scope of this round

Delta re-review. Baseline: `6f3be45e6` (the commit reviewed at v1). Delta: `6f3be45e6..aa7e06626`,
37 insertions / 19 deletions in one file — the revision-history block, two new properties
(PROP-DISC-10, PROP-ERR-10), one new fixture (`F-EXCLUDED-ONLY`), two new oracle rows, conjuncts on
PROP-CLI-03, PROP-DISC-04 and PROP-DISC-08, the corrected `docs/` root measurement, the REQ coverage
additions, the matrix repoints, the level-distribution and pyramid counts, and the G-4 narrowing.
Unchanged sections already approved at v1 were not re-litigated. Every claim the delta introduces was
re-derived against the working tree at HEAD rather than read.

## Prior findings — disposition

| v1 finding | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 `docs/` root count stale (twelve features / twenty dirs) | Medium | **Resolved** | §Fixtures now reads "twenty-one directories … thirteen feature directories (this feature's own `docs/pdlc-stats/` among them)"; §Oracles' exclusion-set row matches. `git ls-tree -d --name-only HEAD docs/` returns exactly 21 entries: the eight excluded plus thirteen feature directories, `docs/pdlc-stats/` included. Both sites corrected, no third site left stale. |
| F-02 REQ coverage table was containment, not set-equality | Low | **Resolved** | An `O-2` row was added (`PROP-DRIFT-01…04, PROP-RR-13, PROP-NEG-07`), which closes the one real hole — PROP-NEG-07's Traces column cited `REQ O-2` with no matching row. A following paragraph now records why `A-3`, `O-1` and `O-4` carry no property, one clause each, and closes with the explicit enumeration of every id that does. The table is a set-equality statement again. |
| F-03 PROP-DISC-08 framed as a claim about the volume | Low | **Resolved** | Restated as a claim about `discoverFeatures`, naming `fakeStatsIo.listDir` as the source of the two-name listing, and recording why `integration-fake` needs no case-sensitive volume — including the `EEXIST` reason a real-path fixture could not be built on APFS. The added "in lexicographic order" conjunct is a strengthening, not a drift: it is PROP-DISC-02's ordering applied to the same listing. |

No prior finding was closed by deletion or by weakening the claim.

## Verification of the delta

Executed, not read:

| Delta claim | Checked against HEAD | Verdict |
|---|---|---|
| `docs/` root holds twenty-one directories, thirteen of them features | `git ls-tree -d --name-only HEAD docs/` → 21; minus `NON_FEATURE_DIRS`' eight → 13 | ✅ |
| `docs/pdlc-halt-hardening/` holds only `PLAN-pdlc-halt-hardening.md` (PROP-DISC-04's new EC-17 conjunct) | `git ls-tree --name-only HEAD docs/pdlc-halt-hardening/` → exactly that one file | ✅ |
| Three loose files still present (PROP-DISC-04's first half, unchanged) | `docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/completed/REQ-completed.md`, `docs/completed/QUEUE-HISTORY-rows-0-1.md` all tracked | ✅ |
| PROP-CLI-03: `USAGE` is module-private, reaches stderr only through `checkFlags` | `pdlc/engine/bin/cli.mjs:59` `const USAGE = [...].join("\n")`, no `export`; `checkFlags` at `:1012` writes `console.error(USAGE)` then the error | ✅ |
| PROP-CLI-03: that stderr carries five command lines and no `stats` line at HEAD | `USAGE` array carries `dev`, `queue`, `decide`, `doctor`, `hello \| spike:sdk` — five, none naming `stats` | ✅ |
| PROP-CLI-03's verbatim literal `  pdlc stats [feature] [--json] [--cwd <path>]` | Command string matches FSPEC BR-01 (`FSPEC:215`) and TSPEC §3.4's `USAGE` row (`TSPEC:404`); the two-space indent matches every existing command line in the `USAGE` array | ✅ |
| PROP-ERR-10's transcribed literal `["not_found","no_docs_root","unreadable_feature"]` | `FSPEC:533` ("`reason` is one of …"), TSPEC `:536` and `:582` union types, and the three §5 rows at TSPEC `:798`–`:800` — set-equal, no fourth value anywhere | ✅ |
| PROP-DISC-10's upstream anchors | FSPEC `EC-20` (`:568`, empty report, exit 0) and its AT map row `EC-20 \| AT-18 (empty-root leg)` (`:907`); `EC-17 \| AT-18 (docs/pdlc-halt-hardening/)` (`:904`) | ✅ |
| Counts after two additions | 104 unique `PROP-*` ids in the property tables; level distribution 5 + 27 + 16 + 21 + 13 + 22 = 104; `integration-fake` list expands to exactly 21 members; "69 falsifiable without a filesystem or a process" = 5 + 27 + 16 + 21 | ✅ |
| No stale `102` left behind | `grep` for `102` in the document returns nothing | ✅ |

The new fixture is coherent with the section it sits in: `F-EXCLUDED-ONLY` transcribes
`NON_FEATURE_DIRS`' eight names in the same order as the literal used elsewhere in the document, and
`_stats-scratch`-style real-path claims are not touched.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | PROP-ERR-10's addition-direction claim is not delivered by its own oracle: a behavioural corpus built from FSPEC §5's table cannot observe a fourth `reason` emitted on a path that table does not contain — which is exactly the "released without an FSPEC edit" case the property says it catches | §Properties → PROP-ERR-10; §Oracles → Reason-catalogue equality |
| F-02 | Low | Local | PROP-DISC-10's Traces column cites `PLAN T-05/T-06/T-07`, but §PLAN tasks lists it under T-05 and T-07 only — the render conjunct has no T-06 row | §Properties → PROP-DISC-10; §PLAN tasks |
| F-03 | Low | Local | PROP-DISC-10 says the fixture must hold the eight names "as a real directory" while the property is levelled `integration-fake` and `F-EXCLUDED-ONLY` sits under "Constructed fixtures (over `fakeStatsIo`)" — the volume/command conflation v1's F-03 removed from PROP-DISC-08 | §Properties → PROP-DISC-10; §Fixtures |

### F-01 (Medium) — PROP-ERR-10 catches deletion and renaming, not addition

The property is a genuine improvement and I want it to survive; the sentence that overstates it is
what I am asking to change.

PROP-ERR-10 specifies collection as: drive "every refusal scenario of FSPEC §5's table through
`runStats` under `--json` (the corpus PROP-ERR-09 already builds)" and gather the distinct
`error.reason` strings, then assert set-equality with the transcribed literal. Against that corpus:

- **Deletion** of one of the three — the corpus still drives EC-01, EC-09 and EC-11, one of them now
  produces something else or nothing, the collected set loses a member, set-equality fails. Caught.
- **Renaming** one of the three — same path, different string, the collected set gains a stranger and
  loses a member. Caught.
- **Addition** of a fourth on a path *not* in FSPEC §5's table — the corpus never drives that path,
  so the string never enters the collected set, and set-equality over the three still holds. **Not
  caught.**

The property's own justification names the third case as the one it covers: "A fourth reason released
without an FSPEC edit fails." An FSPEC edit is precisely what would have added the new refusal row to
§5's table and therefore to the corpus — so the condition under which the oracle works is the
condition the sentence excludes. As written, the claim is inverted.

This matters beyond wording because §Gaps is where the document parks things it cannot assert, and an
overclaimed property is not visible there. A reviewer or a `dod-verify` sweep reading PROP-ERR-10
concludes BR-30's enum is pinned in both directions; it is pinned in one.

**What resolves it** — two options, either fine:

1. Add a structural conjunct, in the shape this document already uses for PROP-RATIO-05 and
   PROP-DRIFT-01/-02: read the source that declares the reasons and assert its literal set. TSPEC
   `:536`/`:582` fix the union as a type, but the runtime literals appear at the three construction
   sites (`{kind:"error", reason:"…"}`), so a source-level assertion over `lib/stats.mjs` — the set of
   string literals following `reason:` is set-equal to the transcribed three — closes the addition
   direction and stays hand-transcribed, no module-constant read, no implementation echo. This is the
   stronger fix and it keeps the "never by reading a module constant" discipline intact.
2. Narrow the claim: state that the behavioural half pins the three against deletion and renaming on
   the decided paths, and record the addition direction in §Gaps with an owner. Cheaper, and honest.

I would prefer (1) — the structural conjunct is three lines of test and the document has the pattern
twice already — but (2) is a legitimate answer and I will not re-raise it if the author takes it.

### F-02 (Low) — PROP-DISC-10's task trace is one row short of its own Traces column

The property's Traces column reads `PLAN T-05/T-06/T-07`. §PLAN tasks lists it against T-05
("discovery half") and T-07, and T-06's row (`statsRender.test.js`) does not name it. PROP-DISC-10
carries a render-side conjunct — "the human report must carry the same header line as a populated run
and an empty feature list" — which is T-06 material by the same split the rest of the document uses
(PROP-RENDER-*, PROP-JSON-03…-10 and PROP-RATIO-10 all sit in T-06).

It is Low because the conjunct is reachable from T-07's `runStats` exercise, so nothing goes
unasserted if the implementer follows the property text. But an implementer following the task trace
— which is what the trace is for — will not write the render leg where the document's own convention
puts it. Either add PROP-DISC-10 (render half) to T-06's row, or drop `T-06` from the Traces column.

### F-03 (Low) — "a real directory" inside a fake-io fixture

PROP-DISC-10's last sentence: "The fixture must hold every one of `NON_FEATURE_DIRS`' eight names as
a real directory, so an implementation that treats 'nothing to report' as 'nothing to read' and takes
EC-09's root-failure branch fails." The intent is unambiguous and right — the eight must be present
as *directory* entries, not as files and not as an empty listing, otherwise the property degenerates
into PROP-ERR-03's missing-root case and stops falsifying the branch it targets.

But "real directory" reads as a claim about the filesystem, and the property is levelled
`integration-fake` while `F-EXCLUDED-ONLY` is declared under the heading "Constructed fixtures (over
`fakeStatsIo`)". This is the same volume-versus-command conflation that v1's F-03 removed from
PROP-DISC-08 one revision ago, reintroduced in the new property. An implementer taking it literally
builds a temp-directory fixture, which changes the level and drags PROP-DISC-10 out of the suite it is
traced to.

**What resolves it:** say "as directory-typed entries in the fake listing" (or equivalent) rather than
"as a real directory". One clause.

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-CLI-03 pins the `USAGE` line with a two-space indent, `  pdlc stats [feature] [--json] [--cwd <path>]`. That matches every existing line in `bin/cli.mjs:59`'s array, so it is the right literal — but TSPEC §3.4 (`:404`) states the line without the indent, so PROPERTIES is the lowest layer pinning the exact bytes. That is the correct home by the "lowest layer pins the literal" rule, and I am not raising it. Worth a half-sentence in the property saying the indent is deliberate and taken from the shipped array, so a future reader does not "fix" it against TSPEC's unindented spelling? |
| Q-02 | PROP-DISC-10 asserts `features` set-equal to `{}` and `unclassified` set-equal to `[]`, "both keys **present**, not omitted". Is the fleet document's `schemaVersion` key intentionally left to PROP-JSON-07's key-set equality rather than restated here? I read it as deliberate non-duplication and correct; confirming rather than asking for a change. |
| Q-03 | The G-4 narrowing says the `USAGE` line is "no longer part of this gap" and what remains is `pdlc/OPERATIONS.md` and `pdlc/README.md` prose only. PLAN T-27 also touches the operator-facing description of the read-only stance, which PROP-RO-* pins behaviourally in the binary but not in the prose. Is the remaining gap intended to cover "the prose may contradict the pinned behaviour", or only "the prose may be absent"? The distinction changes what a `dod-verify` sweep should look for. |

## Positive Observations

- **The corrected measurement was re-derived, not patched.** The `docs/` root correction landed in
  both §Fixtures and §Oracles with the same numbers and with the reason the count moved — this
  feature's own `docs/pdlc-stats/` — named in both. `git ls-tree` confirms 21 and 13. The exclusion
  half, which was already right at v1, was left alone: the revision did not disturb the
  eight-name set-equality or PROP-DISC-05's independent artifact-naming witness while fixing the
  feature half.
- **PROP-CLI-03's new conjunct is the strongest available answer to the `USAGE` gap.** The author did
  not take the cheap route of asserting `USAGE` contains the substring `pdlc stats` from a structural
  read. Instead the conjunct is behavioural, on stderr, through the only observer path a
  module-private constant has — and the property text names that path (`checkFlags`), names the HEAD
  state it must contradict (five command lines, no `stats`), and names when it goes green (T-17). I
  verified every clause of that sentence against `bin/cli.mjs`; all four hold. This is a red test that
  will actually be red for the right reason.
- **PROP-ERR-10's collection discipline is right even though its claim overreaches.** "Never by
  reading a module constant" is the discipline DC-14 asks for, and reusing PROP-ERR-09's corpus rather
  than inventing a parallel one keeps the two properties from drifting apart. My F-01 is about one
  sentence of justification, not about the method.
- **PROP-DISC-04's EC-17 conjunct is paired, not absence-only.** The added half asserts what *does*
  happen — `docs/pdlc-halt-hardening/` appears "with its metrics" — rather than only that a missing
  REQ does not exclude it, and the closing sentence names both mutants the single test kills
  ("an implementation that admits loose files, and one that requires a REQ, each fail"). The same
  pairing discipline holds in PROP-DISC-10, which spells out its positive obligations (header line,
  empty list, both keys present, exit `0`) before its three "never"s.
- **PROP-DISC-08's restatement gained precision rather than losing it.** Answering a wording finding by
  adding a falsifiable conjunct — two distinct rows *in lexicographic order* — instead of just
  softening the sentence is the right instinct, and the ordering claim is consistent with
  PROP-DISC-02.
- **The bookkeeping tracked the two additions cleanly.** 104 unique ids, level distribution summing to
  104, the pyramid sentence moved 67 → 69, `integration-fake` 19 → 21, AT-18/AT-23/AT-27/EC-20 matrix
  rows repointed, EC-20 moved off PROP-DISC-04 onto PROP-DISC-10, REQ-STATS-07/-09 and R-5 rows
  extended, and no stale `102` anywhere in the file. Two properties added is the case where count
  words usually rot; none did here.
- **The revision-history block attributes each change to the finding that caused it**, including the
  reviewer and severity. That makes this delta re-review checkable in minutes rather than by diffing
  blind, and it is the record a future reader needs to know why PROP-DISC-08 is worded the way it is.

## Recommendation

**Approved with minor changes**

All three v1 findings are resolved, and resolved substantively — the two Low ones by strengthening the
claims rather than by trimming them. The delta introduces no High finding, and nothing in it disturbs
the parts of the document that were verified green at v1: the real-path literals, the mutation kill
map, the PLAN task trace and the fixture table all still hold against HEAD.

The three findings here are documentation-accuracy items and none blocks the wave:

- **F-01 (Medium)** should be settled before PLAN T-07 is implemented, since T-07 is where PROP-ERR-10
  becomes a test and the choice between "add a structural conjunct" and "narrow and record in §Gaps"
  changes what gets written.
- **F-02** and **F-03 (Low)** are a trace row and a clause; they can ride along with F-01.

I found no defect in an upstream document. PROP-CLI-03's literal, PROP-ERR-10's reason set,
PROP-DISC-10's EC-20/AT-18 anchors and PROP-DISC-04's EC-17 anchor were each checked against FSPEC and
TSPEC at HEAD and all four are faithful to their sources. No erratum raised.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

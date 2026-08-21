# Cross-Review: product-manager — DECISIONS (delta re-review, frozen round)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 9
**Scope:** Local

## Context

My v8 review returned **Needs revision** on one High finding: `DEC-LI-08`'s two framing literals
(694 bytes at one document, 1,012 at five, ceiling "roughly 21,012") were not reproducible on the
renderer they named, and `D-O-4` restated them. Everything else in that round's delta verified
clean. Four commits have landed on the document since the bytes I reviewed (`6f28eded`):
`dbbfcb07` (restate the framing cost as a formula over a named fixture), `79675345` (`D-O-4` cites
the formula instead of restating literals), `6548c08a` (scope the grounding pin; re-pin upstream on
FSPEC v0.14 / REQ v0.10), `a370ba06` (bump to v0.5 with the round-7 changelog) and `9baf60b5` (note
that FSPEC v0.14 leaves the accounting basis untouched). The delta is 36 insertions and 11
deletions in one file: the header `Upstream` row and changelog cell, a new paragraph in §"Scope,
grounding pin, and how to read this document", the rewritten **Upstream version note**, the
rewritten framing passage inside `DEC-LI-08`, and the rewritten `D-O-4` row. Nothing else moved, so
per the delta protocol I scanned only those passages.

Upstream at HEAD has moved since v8, exactly as v8 predicted it would: REQ is now **v0.10**
(`REQ-pdlc-learnings-injection.md:18`), FSPEC **v0.14** (`FSPEC-pdlc-learnings-injection.md:18`),
TSPEC unchanged at **v0.9** (`TSPEC-pdlc-learnings-injection.md:18`). The document's re-pinned
header row matches all three. The freeze standard applies: I judged each delta passage only on
whether it broke something that worked at `6f28eded` and whether it contradicts the repository at
HEAD. Every numeric claim in this round was checked by executing the shipped renderer, not by
reading prose.

## Options Considered

Three readings of this delta were open when I started. Each was settled by executing the shipped
code or reading the upstream bytes at HEAD, never by comparing prose to prose.

**Reading A — the new framing formula is a plausible-looking rewrite that has not actually been
checked against the renderer.** Rejected; it is exact. The document now states framing as a
**block constant of 477 bytes** plus `49 + 2·len(path) + len(feature) + len(orderKey)` per selected
document, plus `30 + len(String(bytes))` when the document is `bounded`. I re-derived this from
`renderLearningsBlock` (`pdlc/workflows/orchestrate-dev.js`, the exported function whose body
concatenates `"\n\n"`, `LEARNINGS_BLOCK_HEADER`, `"\n"`, `LEARNINGS_BLOCK_PREAMBLE`, `"\n\n"`, the
`"\n\n"`-joined per-document units, `"\n"` and `LEARNINGS_BLOCK_TRAILER`) and then tested it: for
`n ∈ {1,2,3}` over synthetic paths and for `n ∈ {1,5}` over the named fixture, in both the abridged
and unabridged case, the formula reproduces the rendered block's framing byte-for-byte at every
point — six of six synthetic cases exact, no residual. The two component literals the passage names
also check out directly: `LEARNINGS_BLOCK_HEADER` is 50 bytes and `LEARNINGS_BLOCK_TRAILER` is 35
(`pdlc/workflows/orchestrate-dev.js`, the two `const` declarations immediately above the preamble).
Note that the partition differs from the one my v8 finding proposed — 477 + 49/doc rather than
479 + 47/doc — because this version charges the `"\n\n"` join to the document rather than to the
block. The two agree at every `n` (477 + 49n ≡ 479 + 47n + 2(n−1)), and the document's partition is
the one that composes correctly per document, so this is a better answer than the one I suggested,
not a divergence from it.

**Reading B — the worked example's figures are still not reproducible, only differently wrong.**
Rejected. The fixture is now *named*, which is what makes the check mechanical: "this repository's
own corpus at HEAD, the first five of `git ls-files | grep -E 'LEARNINGS-.*\.md$'`, with a
ten-character `orderKey`". Running that literal command yields twelve paths; taking the first five
and rendering them through HEAD's `renderLearningsBlock` with a ten-character `orderKey` gives
framing of **684 bytes** at one document, **1,607** at five, **718 / 1,777** when every selected
document is abridged — all four figures exactly as the document states them, and all four matching
what my v8 review measured independently. The v8 High finding is resolved on the merits, not
papered over: the unreachable literals are gone, the surviving numbers are labelled as one
corpus's evaluation of a stated formula, and the text says outright that the cost is "a **function
of the corpus**, not a fixed number".

**Reading C — the upstream re-pin and the new grounding-pin paragraph claim more than HEAD
supports.** Rejected; both are accurate. FSPEC v0.14's own erratum note
(`FSPEC-pdlc-learnings-injection.md:83-90`) says exactly what this document attributes to it —
BR-6's total bound "stated over **the window** the count bound leaves", and "a document past the
window carries `RSN-COUNT` whatever the window's byte outcome" — and REQ v0.10's AC-2.4 carries the
matching clause, "**attributed to the bound that actually removed it**: a document the count bound
(AC-2.2) already cut is reported under that cause" (`REQ-pdlc-learnings-injection.md`, AC-2.4). The
document's load-bearing negative claim — that neither change touches what `DEC-LI-08` restates — is
confirmed positively at HEAD: FSPEC §"The byte-accounting basis" still reads "a document's
**contributed bytes** are its **material** … Framing carries no byte charge", `E-36` still reads
"No document yields material: every one carries `RSN-NO-MATERIAL` and consumes no slot", and
`AT-30` still names it. The new grounding-pin paragraph's distinction — pre-feature reads ground
decisions, post-implementation reads only *confirm* them — is honoured in the two places it names:
`DEC-LI-08` says "Read off the shipped `renderLearningsBlock` at HEAD" and `D-O-3` says "shipped as
`extractInjectableMaterial`'s `maxBytes <= 0` early return and `selectLearnings`'s
`sections.length === 0` branch", and both branches exist at the lines claimed
(`pdlc/workflows/orchestrate-dev.js`, the `maxBytes <= 0` early return in
`extractInjectableMaterial` and the `sections.length === 0` rejection in `selectLearnings`).

## Decision

**No High finding. My v8 blocker is resolved, and the revision broke nothing.** Under the freeze a
finding may block only if this revision introduced a defect or if a load-bearing claim contradicts
the repository at HEAD. Neither applies: every numeric and structural claim in the delta was
re-derived by running HEAD's code, and every upstream citation was read at HEAD.

Prior-finding status:

| v8 finding | Status | Evidence |
|---|---|---|
| F-01 (High) — `DEC-LI-08`'s 694 / 1,012 framing literals were unreproducible, and `D-O-4` restated them | **Resolved.** The literals are replaced by the renderer's actual shape (477-byte block constant + `49 + 2·len(path) + len(feature) + len(orderKey)` per document + `30 + len(String(bytes))` abridged), the worked example names its fixture, and the ceiling is stated as a function of the corpus. `D-O-4` now cites the formula rather than restating numbers, and adds that "neither quantity has a transcribable expected constant" | Formula reproduces HEAD's `renderLearningsBlock` exactly at n = 1, 2, 3 synthetic and n = 1, 5 on the named fixture, abridged and not (6/6 and 4/4 exact); fixture command yields the stated 684 / 1,607 / 718 / 1,777 |
| F-02 (Low) — `D-O-9` attributes the TSPEC erratum's discharge to the version it was *observed* at | **Still open, still non-gating.** The delta did not touch `D-O-9`; the discharge is real, so no reader is misled about whether it landed. Carried as F-01 below | `D-O-9` row unchanged in `git diff 6f28eded..HEAD` |
| F-03 (Low) — `DEC-LI-03`'s trigger cites `G-C` without signalling it is this document's own ground | **Still open, still non-gating.** Unchanged section, not re-litigated. Carried as F-02 below | `G-C` occurrences unchanged; the id is defined in this document's own grounding table |

Delta passages verified clean, with no finding:

- The framing formula's three terms and both named constants, against `renderLearningsBlock` and
  the `LEARNINGS_BLOCK_HEADER` / `LEARNINGS_BLOCK_TRAILER` declarations at HEAD.
- The named fixture and its four figures, by running the stated `git ls-files` command and
  rendering its first five paths.
- The claim that framing "is a block term plus one opener/closer pair per selected document, and
  each pair embeds that document's path twice, its feature name and its `orderKey`", against TSPEC
  §D.5's three-pool table, whose *per-document framing* row names the `<<< path — feature {p},
  completed {d} >>>` opener, the `ABRIDGED` annotation and the `<<< end path >>>` closer, and
  against the renderer's `opener`/`closer` template literals, which do embed `doc.path` in both.
- The re-pin to REQ v0.10 / FSPEC v0.14 / TSPEC v0.9, against the three documents' version rows at
  HEAD.
- The characterisation of what v0.14 and v0.10 changed, against FSPEC's v0.14 erratum note and REQ
  AC-2.4, and the negative claim that the byte-accounting basis, `E-36` and `AT-30` are untouched,
  against those three passages at HEAD.
- The grounding-pin scope paragraph, against the two entries it names, both of which do label their
  post-implementation citations as *shipped*.
- The v0.5 changelog cell, against the five commits that landed round 7.
- `D-O-4`'s revised row: its (a)/(b) split is unchanged and was verified at v8; the substitution
  removes the literals without weakening the obligation, and the added sentence about
  non-transcribable constants is the correct instruction for a test author.

One Low finding is new, in the same passage: the "roughly **21,600 bytes**" ceiling is the
unabridged five-document evaluation (20,000 + 1,607), while the same sentence's own parenthetical
says abridgement "at §4.1's 6,000-byte per-document default is the common case", where the figure
is 21,777. It is hedged with "roughly", the paragraph's load-bearing claim (the overshoot is a
corpus function, not a constant) is unaffected, and it is a ~180-byte imprecision against a
predecessor that was wrong by ~600–800 in the unsafe direction. It is recorded, not gating.

## Consequences

**PLAN and PROPERTIES are unblocked on this document.** The v8 trap is gone in the right way. A
test author reading `D-O-4` is now told explicitly that "neither quantity has a transcribable
expected constant" and that "a report assertion pins the formula's evaluation over the fixture
under test, never a number copied from here". That is precisely the anti-echo discipline this
pipeline demands, stated at the obligation rather than left to the author: the expected value is a
literal transcription of a spec-stated *formula* evaluated on the fixture, not a value derived from
the code under test, and not a number that no fixture can honour. The one residual hazard is the
inverse of v8's: 684 / 1,607 / 718 / 1,777 are reproducible today over `git ls-files`, but they
drift the moment this repository harvests a new LEARNINGS file whose path sorts into the first
five. Any test that transcribes them would be pinned to repository state, not to the spec. The
document does not invite that — it labels them an evaluation over a named fixture — but PROPERTIES
should build its fixture explicitly rather than reach for `git ls-files` at test time.

**The operator-facing consequence — the C-8 gap's size — is now stated honestly and re-derivably.**
`DEC-LI-08` exists to say how far the static caps fall short of bounding what the author actually
receives. It now gives the reader a formula they can evaluate against their own corpus plus one
worked example, instead of a constant that was both wrong and unfalsifiable-looking. REQ O-1's
measurement obligation closes on a quantity that is now defined well enough to measure.

**Note for the orchestrator, not a finding against this document.** The parallel reviewer working
this same phase committed with a repository-wide stage and swept my in-progress cross-review
skeleton into its own commit (`89476ef4`, which carries both reviewers' v9 files). No content was
lost and no branch discipline was violated, but reviewers running in a shared tree should stage by
pathspec. That is a process observation about the fan-out, not about the artifact under review.

**Deferred items** — recorded, not opened, per the freeze:

DEFERRED: `DEC-LI-08`'s "roughly **21,600 bytes**" ceiling is the unabridged evaluation; the same paragraph's abridged figure (1,777) gives 21,777, so the stated ceiling is ~180 bytes below the abridged worst case it acknowledges is the common one.

DEFERRED: `D-O-9`'s "DISCHARGED at TSPEC v0.9" still attributes the discharge to the version it was observed at, not the version the four edits landed at (carried from v7 F-01, v8 F-02).

DEFERRED: `DEC-LI-03`'s re-evaluation trigger cites `G-C` without signalling that `G-C` is this document's own ground rather than an FSPEC or REQ id (carried from v7 F-02, v8 F-03).

DEFERRED: The worked example is keyed to live repository state (`git ls-files | grep -E 'LEARNINGS-.*\.md$'`), so its four figures go stale when the corpus grows; a future pass may prefer a frozen path list to a command.

DEFERRED: The header changelog cell now carries three rounds of prose in one table cell; a future pass may want the revision history as its own section rather than a cell that grows monotonically.

DEFERRED: The three `Process` candidates filed at v6 (unfalsifiable header pins, discharge-without-routing, dated claims in timeless voice) plus v8's fourth (measured constants no document gate re-derives) remain unaddressed and belong to harvest — with the round-7 counter-example worth recording alongside them: naming the fixture and stating the shape is what made this round's numbers re-derivable in one command.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | `DEC-LI-08`'s ceiling sentence — "at REQ §4.1's defaults a fully-conforming block over *this* corpus occupies up to roughly **21,600 bytes**" — is the **unabridged** five-document evaluation (20,000 + 1,607). The same sentence's parenthetical states the abridged figures (718 / 1,777) and says abridgement "at §4.1's 6,000-byte per-document default is the common case", where the ceiling is 21,777. Since the number is introduced as an "up to", the common case should set it. Non-gating: it is hedged "roughly", the paragraph's load-bearing claim (framing is a corpus function, not a constant) is unaffected, and the imprecision is ~180 bytes in a passage whose predecessor was wrong by ~600–800. Fix is one number, or "up to roughly 21,600 bytes, or 21,800 when every selected document is abridged". | REQ C-8, §4.1, O-1; `D-O-4` |
| F-02 | Low | Local | `D-O-9`'s row records the TSPEC erratum as "**DISCHARGED at TSPEC v0.9**", the version at which the four edits were *observed* rather than the version at which they landed (`ERR-4`/`OQ.2` closure and the `present` drop landed in earlier TSPEC revisions). Carried unchanged from v7 F-01 and v8 F-02; non-gating, because the discharge is real and no downstream reader is misled about *whether* it landed. Fix is one clause: "landed before TSPEC v0.9". | REQ AC-5.1a (via `DEC-LI-07`); `D-O-9` |
| F-03 | Low | Local | `DEC-LI-03`'s re-evaluation trigger cites `G-C` without signalling that it is this document's own ground (defined in this document's grounding table) rather than an FSPEC or REQ id, leaving a reader to grep upstream for an id that is not there. Carried unchanged from v7 F-02 and v8 F-03; non-gating. Fix is one word: "this document's `G-C`". | REQ C-1 / FSPEC `BR-1` |

**Verified, no finding:** the 477-byte block constant and the `49 + 2·len(path) + len(feature) +
len(orderKey)` per-document term against HEAD's `renderLearningsBlock` (exact at n = 1, 2, 3
synthetic and n = 1, 5 on the named fixture, abridged and unabridged); the `30 +
len(String(bytes))` abridged term against the ` (ABRIDGED: bounded at N bytes)` clause; the 50-byte
header and 35-byte trailer against their `const` declarations; the named fixture's four figures
(684 / 1,607 / 718 / 1,777) by running the stated `git ls-files` command; the TSPEC §D.5 attribution
against §D.5's three-pool table; the re-pin against REQ v0.10, FSPEC v0.14 and TSPEC v0.9 at HEAD;
the characterisation of FSPEC v0.14's window restatement and `RSN-COUNT` attribution against FSPEC's
v0.14 erratum note; REQ v0.10's matching AC-2.4 clause; the negative claim that the byte-accounting
basis, `E-36` and `AT-30` are untouched, against all three at HEAD; the grounding-pin scope
paragraph against `DEC-LI-08`'s "shipped … at HEAD" and `D-O-3`'s "shipped as …" labels and against
both code branches they name; `D-O-4`'s revised row against `DEC-LI-08`'s formula; the v0.5
changelog cell against the five commits of round 7.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Should the worked example's fixture be a frozen list of five paths rather than `git ls-files | grep …` evaluated at read time? The command is what made this round's numbers checkable in one step, which is a real gain — but it also means the four figures silently go stale the next time a LEARNINGS file lands. I am naming the tradeoff, not deciding it. |
| Q-02 | Given that `D-O-4` now says neither quantity has a transcribable constant, does PROPERTIES need the formula restated in its own terms, or is the citation to `DEC-LI-08` sufficient for a property author to build the assertion? Either answer is fine; the coupling is worth being deliberate about, since restating it is what produced v8's disagreeing pair. |

## Positive Observations

- **The fix went past what I asked for and landed a better partition than I proposed.** My v8
  finding suggested `479 + 47/doc`; the revision charges the `"\n\n"` join to the document instead,
  giving `477 + 49/doc`. Both are arithmetically identical at every `n`, but the document's version
  composes correctly *per document*, which is the form a report or a property actually needs. That
  is an author verifying the mechanism rather than transcribing a reviewer's arithmetic.
- **Naming the fixture is the durable move.** "The first five of `git ls-files | grep -E
  'LEARNINGS-.*\.md$'`, with a ten-character `orderKey`" turns a claim that previously took a
  bespoke measurement to falsify into one any reader reproduces in a single command. The v8 defect
  was not really the wrong numbers — it was numbers with no stated fixture. This round fixed the
  class, not just the instance.
- **The negative upstream claim is stated positively.** "Neither touches the byte-accounting basis
  … `E-36` and `AT-30` … are unchanged" names exactly which passages a reader should check, which is
  what let me confirm it at HEAD in three greps rather than re-reading FSPEC v0.14 whole. An
  absence-only claim ("nothing decided here is affected") would not have been checkable.
- **`D-O-4` now carries the anti-echo instruction itself.** Telling the downstream author that the
  expectation is the formula's evaluation over their fixture — "never a number copied from here" —
  puts the discipline where the obligation is read, which is the only place it reliably survives.
- **The grounding-pin scope paragraph is an honest structural answer to a real hazard.** A
  decisions document that cites post-implementation code risks reading as if the decisions were
  reverse-engineered from the implementation. Separating grounds from confirmations, and labelling
  the confirmations *shipped* in the text, resolves that without weakening either citation.

## Recommendation

**Approved with minor changes**

My v8 High finding is resolved on the merits and nothing in the delta broke what was approved at
`6f28eded`. Three Low findings are recorded and none gate: F-01 (the "roughly 21,600" ceiling omits
the abridged common case, ~180 bytes), F-02 and F-03 (both carried unchanged from v7/v8, in
sections this delta did not touch). Six deferred items are recorded in `## Consequences` per the
freeze. No decision is opened, reopened or contradicted by this review — `DEC-LI-08`'s decision
(static caps only, no dynamic budget) stands exactly as approved at v7, and this round's change was
exposition, as the entry itself says.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

APPROVAL-HASH: sha256:87ec8ebca294ebbdd45eb0fdebe939740fc968c8b91dcaf964dbc87ca299b193
APPROVAL-HASH-NORMALIZED: sha256:87ec8ebca294ebbdd45eb0fdebe939740fc968c8b91dcaf964dbc87ca299b193
REVIEWED-COMMIT: 9baf60b5c6344eb59c66b5b83523420358ce121b
UPSTREAM-STATE: REQ sha256:32cb8b7d4f4072d18772c7efeeb846460083dfea1959cd1159ac625a057fafeb
UPSTREAM-STATE: FSPEC sha256:ef2301995af6ab2b0d722339a15d07da1eeec8ce28b501a92155064d660b5e56
UPSTREAM-STATE: TSPEC sha256:1ddfdbc340d9078efc98930df625cc4f8f0dd6d3d9b24070fdee08af8ff44a95

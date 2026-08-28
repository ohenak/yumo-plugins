# PROPERTIES pdlc-loop-economics

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/**`) |
| Cross-Reviews | (none yet) |
| LEARNINGS | `docs/pdlc-loop-economics/LEARNINGS-pdlc-loop-economics.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | te-author | 1.0 | 2026-08-27 |

**Scope in one line.** Behavior-level invariants for anchor round-trip/re-derivation (M1a/M1b, FSPEC
§1), finding-identity carried/new accounting (M1d, FSPEC §2), DoD round-index derivation (M1c, FSPEC
§3), pin-cascade routing (M2, FSPEC §4), derivative-stop convergence (M3, FSPEC §5), and the
cross-cutting config-parsing/byte-identity contracts (FSPEC §4.1/§5.1/§7). No `orchestrate-dev.js`
symbols or line numbers are cited here — TSPEC and PLAN, authored in parallel, own the
implementation mapping; these properties describe observable behavior only and cannot conflict with
either.

## 1. Conventions

Property ids are `PROP-LOOPECON-{NN}` for `fast-check@4`-generated properties (∀-quantified input
domains, arbitraries) and `EX-LOOPECON-{NN}` for example-based/fixture properties (fixed committed
fixtures, byte-identity baseline guards). Both id families share one numbering surface and are
listed together in §7's traceability table. `fast-check` is already a `devDependency` of
`pdlc/workflows` (`package.json` `"fast-check": "^4.9.0"`), exercised under `cd pdlc/workflows && npm
test`; no new dependency is introduced.

Each property states: **Domain/generator** (the `fast-check` arbitrary sketch, or for EX- properties
the fixture set), **Invariant** (the falsifiable assertion), **Traces** (FSPEC §, REQ AC id).
Absence-only assertions are never sufficient on their own (te-author falsifiability checklist):
every property below pairs an absence conjunct with a positive-presence conjunct where the FSPEC
text has one.

## 2. Anchor Round-Trip and Re-Derivation (FSPEC §1)

**PROP-LOOPECON-01** — Anchor round-trip byte-compatibility.
*Domain/generator:* `fast-check` arbitrary document bodies (printable-string blocks up to a bound,
including embedded `\n`, CRLF, and multi-byte UTF-8 sequences) combined with an arbitrary git-HEAD
sha-like hex string and an arbitrary `{DOCTYPE}` drawn from `{REQ, FSPEC, TSPEC, DECISIONS, PLAN,
PROPERTIES}`.
*Invariant:* the engine-computed anchor block — `APPROVAL-HASH: sha256:<hex>`, optional
`APPROVAL-HASH-NORMALIZED: sha256:<hex>`, `REVIEWED-COMMIT: <sha>`, `UPSTREAM-STATE {DOCTYPE}:
sha256:<hex>` lines — parses back through the existing staleness-walk/harvest parser to *exactly*
the hash of the document bytes it was computed from (`APPROVAL-HASH`/`UPSTREAM-STATE`) and the git
HEAD captured at write time (`REVIEWED-COMMIT`); grammar (scheme tag, lowercase hex digest) stays
byte-compatible across the whole generated domain, never only the two or three literal fixtures a
hand test would pick.
*Traces:* FSPEC §1.1/§1.2; REQ-LOOPECON-01a.

**PROP-LOOPECON-02** — No dispatch prompt instructs anchor transcription (absence guard).
*Domain/generator:* enumeration (not randomized — this is a static corpus scan, `fast-check`
`fc.constantFrom` over every prompt-builder export reachable from `orchestrate-dev.js`'s module
graph) of every dispatch-prompt-building function's rendered output across a representative
generated input set for each function's own parameter shape.
*Invariant:* no rendered prompt string contains an instruction to append, transcribe, restate, or
copy an approval-anchor value (`APPROVAL-HASH`, `APPROVAL-HASH-NORMALIZED`, `REVIEWED-COMMIT`,
`UPSTREAM-STATE {DOCTYPE}`) — asserted as a negative-regex/substring conjunct over the full rendered
text of every builder, not just a hand-picked subset — paired with the positive conjunct that at
least one prompt (the pin-check-PASS reappend path, FSPEC §4.6) legitimately *quotes* a
harness-computed anchor value read-only, so the absence assertion is not vacuously true because no
prompt ever mentions anchors at all.
*Traces:* FSPEC §1.2, §1.4; REQ-LOOPECON-01a (absence guard clause); REQ NG-2 (three vestigial
SKILL.md sentences are out of scope for this feature and must not be asserted against).

**PROP-LOOPECON-03** — Dispatch-construction-time re-derivation, never mint-time carry-forward.
*Domain/generator:* `fast-check` arbitrary sequences of document-mutation events (2–6 events) each
independently toggling one of {document bytes changed, git HEAD advanced, upstream pin document's
hash changed}, interleaved with a dispatch-construction call at an arbitrary point in the sequence.
*Invariant:* whatever value a dispatch prompt renders as the "current" `APPROVAL-HASH`,
`REVIEWED-COMMIT`, or `UPSTREAM-STATE {DOCTYPE}` equals the value recomputed from on-disk bytes (or
git HEAD, for `REVIEWED-COMMIT`) **at dispatch-construction time**, never a value captured earlier in
the same erratum batch (`snapshotErratumDocs` mint-time snapshot) and carried forward unchanged
through a later mutation event. The one legitimate exception — a mint-time snapshot used *only* to
detect drift (compared against, never rendered as, current) — is asserted as a distinct code path
whose output never reaches the "current" render.
*Traces:* FSPEC §1.3, §1.4; REQ-LOOPECON-01b.

## 3. Finding-Identity Normalization and Carried/New Accounting (FSPEC §2)

**PROP-LOOPECON-04** — Identity-triple equivalence is order-independent.
*Domain/generator:* `fast-check` arbitrary pairs of finding lists (round N, round N+1), each finding
an arbitrary tuple of `severity ∈ {High, Medium, Low}`, `section-anchor` (arbitrary string drawn from
a small alphabet plus numbered-anchor shapes like `AC-3`, `§4.2`, `BR-7`), and free-text body
containing 0–2 arbitrary round-number tokens (`"v3"`, `"in round 4"`) and 0–1 arbitrary hex-token
substrings, shuffled into random list order for both rounds.
*Invariant:* classification into carried/new/absent for a given round-N+1 finding is identical
regardless of the traversal order of either round's finding list — computed as a set comparison over
identity triples `(severity, section-anchor, normalized-text)`, never a positional or first-match
comparison. Section-anchor and severity are asserted **never** stripped by normalization: two
findings differing only in section-anchor, or only in severity, with identical free text, never
collapse to one identity.
*Traces:* FSPEC §2.1, §2.3 (order-independence clause); REQ-LOOPECON-03.

**PROP-LOOPECON-05** — Text-normalization strips exactly the named tokens, nothing else.
*Domain/generator:* `fast-check` arbitrary finding-body strings built from a base sentence with
injected leading/trailing whitespace runs, case variation, embedded round/version tokens (`"v3"`,
`"round 4"`, `"in round 12"`), and embedded hex-looking substrings (`/[0-9a-f]{8,64}/`) at random
positions, paired with a control string carrying none of these.
*Invariant:* two finding bodies differing **only** in whitespace run length, letter case, an embedded
round/version token's value, or an embedded hash token's value normalize to the same
`normalized-text`; a body differing in any other substring (a content word, a number that is not a
round/version or hash token) never normalizes to the same text as the control. Both directions are
asserted — false collapses (over-normalization) and false non-collapses (under-normalization) are
each independently falsifiable.
*Traces:* FSPEC §2.2; REQ-LOOPECON-03.

**PROP-LOOPECON-06** — Carried findings deduplicate; new findings never do.
*Domain/generator:* `fast-check` arbitrary round-N finding sets and round-N+1 finding sets
constructed so that a controlled fraction of round-N+1 findings share an identity triple with a
round-N finding (candidates for **carried**) and the remainder are structurally guaranteed distinct
(candidates for **new**), plus a boundary case where a round-N+1 finding's identity triple matches no
round-N finding.
*Invariant:* every round-N+1 finding classified **carried** contributes exactly one entry to the
round's finding list (no duplicate mint of an already-open item, staleness fact only — the finding
itself may be substantive); every finding classified **new** mints its own fresh entry with no
deduplication, regardless of any staleness characteristic of its content; a round-N finding absent
from round N+1's identity set is neither carried nor new — it is dropped from the accounting, not
forced into either bucket.
*Traces:* FSPEC §2.3, §2.4; REQ-LOOPECON-02, REQ-LOOPECON-03.

**PROP-LOOPECON-07 (negative)** — Staleness-only re-filing never mints a second finding.
*Domain/generator:* `fast-check` arbitrary sequences of 2–10 rounds where a single stale-anchor
finding (fixed identity triple) is re-raised in every round with only its embedded hash/round token
varying round to round (the DEC-ANCHOR-01/R-5 recurrence shape), interleaved with unrelated
genuinely-new findings at random rounds.
*Invariant:* across the whole sequence, the stale-anchor finding contributes **exactly one** open
finding-list entry, never `N` entries for `N` re-filings; each unrelated new finding contributes
its own entry independent of the stale-anchor finding's re-filing count. Oracle is a positive count
assertion (`openFindingCount(identity) === 1`), not merely "no crash" or "count did not grow
unboundedly" — an off-by-one duplicate on round 2 alone must still fail this property.
*Traces:* FSPEC §2.4; REQ-LOOPECON-02; REQ Problem/Context §1 (54-recurrence defect shape, DEC-ANCHOR-01).

## 4. DoD Round-Index Derivation (FSPEC §3)

**PROP-LOOPECON-08** — DoD round index is `max(existing) + 1`, derived from disk, never in-memory.
*Domain/generator:* `fast-check` arbitrary sets of `CODE_REVIEW-{feature}-v*.md` filenames present
"on disk" (test double): the empty set; contiguous sequences (`v1..vK`); sequences with gaps (`v1,
v3`); sequences with a non-matching sibling filename (`CODE_REVIEW-{feature}-vX-draft.md`,
`CODE_REVIEW-other-feature-v1.md`) that must not be counted; and a case where an in-memory
"last-dispatched" counter is deliberately desynced from the disk set (simulating a resumed/re-run
invocation).
*Invariant:* the next dispatched round's target version `N` equals `max(existing numeric N among
CODE_REVIEW-{feature}-v*.md on disk) + 1` for that feature, or `1` if none exist; `N` is computed
fresh from the disk enumeration on every dispatch, never read from or influenced by any in-memory
counter carried from a prior dispatcher invocation — the desynced-counter case must still produce
the disk-derived value, not the stale in-memory one.
*Traces:* FSPEC §3.1, §3.2; REQ-LOOPECON-09.

**PROP-LOOPECON-09** — Recomputation after resume is monotonic: no skip, no collision.
*Domain/generator:* `fast-check` arbitrary two-phase scenarios — an initial disk state with `K`
existing `CODE_REVIEW-{feature}-v*.md` files (`K` from 0 to 8), then a simulated "resume" where the
dispatcher is invoked again with an in-memory state claiming a different next-version value (higher,
lower, or equal to the correct one) than the disk-derived value.
*Invariant:* recomputing the target version from the (unchanged) disk state on the resumed
invocation yields the identical value the first invocation would have derived (`max(K) + 1`) — never
`max(K) + 2` (skip), never any value `≤ max(K)` (collision with an existing file). The property
asserts monotonicity as a relation over two independent derivations from the same disk state, not a
single-shot value check.
*Traces:* FSPEC §3.2; REQ-LOOPECON-09 (resumed/re-run invocation clause).

## 5. Pin-Cascade Routing (FSPEC §4)

**PROP-LOOPECON-10** — Pin-check-eligible set is disjoint from the re-confirmation set, and own-bytes-changed documents never enter it.
*Domain/generator:* `fast-check` arbitrary sets of downstream documents in the post-erratum
staleness walk, each document independently assigned: own-content-hash changed since last approval
(boolean), and, independently, at least one `UPSTREAM-STATE {DOCTYPE}` no longer matching its
upstream document's current hash (boolean) — the full 2×2 per document, `cascade.pinCheck.enabled =
true`.
*Invariant:* for every document flagged stale by the walk, it is pin-check-eligible **iff** own-bytes
unchanged **and** at least one upstream pin moved; a document whose own bytes changed is **never**
pin-check-eligible regardless of the upstream-pin state, and always receives a full ordinary
re-confirmation dispatch instead. The pin-check-eligible set and the ordinary-re-confirmation set are
asserted disjoint and jointly exhaustive over the flagged-stale set (every flagged document lands in
exactly one).
*Traces:* FSPEC §4.3; REQ-LOOPECON-05; REQ R-1 (mitigation: both signals required).

**PROP-LOOPECON-11** — PIN-CHECK verdict grammar parses to exactly PASS/FAIL/FAIL-by-unparseable, and routing follows the verdict.
*Domain/generator:* `fast-check` arbitrary reply texts: well-formed `PIN-CHECK: {DOCTYPE}: PASS` /
`PIN-CHECK: {DOCTYPE}: FAIL` lines for an arbitrary subset of `{DOCTYPE}` in `{REQ, FSPEC, TSPEC,
DECISIONS, PLAN, PROPERTIES}`; and malformed variants — wrong case (`pass`, `Fail`), missing
colon-space, extra trailing text, missing doctype token, or the line absent entirely for a document
covered by the dispatch.
*Invariant:* a well-formed `PASS` line for a document routes to anchor re-append with no review round
opened and no consumption of `MAX_REVIEW_ROUNDS`/`MAX_LIFETIME_ROUNDS` budget (asserted via a
round-counter spy showing zero increments); a well-formed `FAIL` line, or any line that does not match
the grammar exactly (including an absent line for a covered document), routes the document into an
ordinary re-confirmation round indistinguishable from the pin-check-disabled path — asserted by
comparing the resulting dispatch shape against the disabled-path dispatch shape for the same document
state, not merely "some round was opened."
*Traces:* FSPEC §4.5, §4.6, §4.7, §7.2; REQ-LOOPECON-05.

**EX-LOOPECON-01** — Disabled pin-check produces a byte-identical dispatch stream (fixture baseline guard).
*Domain:* fixture-based, not generated. A single committed pre-M2 baseline dispatch-stream fixture
(the same shape `learningsBaselineGuard.test.js` uses) exercised against the post-erratum downstream
staleness walk with `cascade.pinCheck.enabled` absent, explicitly `false`, and set to a malformed
value (string, number, object) — three fixture runs.
*Invariant:* all three runs produce a dispatch stream byte-identical to the committed pre-M2
baseline; no `PIN-CHECK:` dispatch is constructed in any of the three runs. This is an EX- property
(fixed committed fixture, not a generator) because the FSPEC's own contract (§7.4) is a byte-identity
claim against a specific captured baseline, not a quantified law.
*Traces:* FSPEC §4.1, §4.2, §7.3, §7.4; REQ-LOOPECON-04, REQ-LOOPECON-08; REQ C-2.

## 6. Config Parsing (FSPEC §4.1/§5.1/§7.3) and Derivative-Stop Convergence (FSPEC §5)

**PROP-LOOPECON-12** — Per-key independent fail-open: one malformed key never retunes the block.
*Domain/generator:* `fast-check` arbitrary JSON-shaped config objects for the `cascade.pinCheck` and
`review.derivativeStop` blocks, each key independently drawn from {absent, correctly-typed valid
value, wrong-typed value (string-for-boolean, boolean-for-number, array, null, nested object,
negative/NaN/Infinity for `rounds`)} — full cross-product per block, plus a corpus-level case where
`.claude/pdlc.config.json` itself is absent, unreadable, or contains non-JSON bytes.
*Invariant:* for every combination, each key independently either takes its parsed valid value or
falls back to its declared default (`cascade.pinCheck.enabled = false`,
`review.derivativeStop.enabled = false`, `review.derivativeStop.rounds = 2`) — a malformed `rounds`
value never affects the resolved `enabled` value for the same block and vice versa, and a malformed
key in one block never affects the other block's resolved keys. The corpus-level failure case
resolves to the full default block for *both* `cascade.pinCheck` and `review.derivativeStop`
simultaneously, asserted as a joint conjunct, not two independent single-block assertions that could
pass on a partially-defaulted corpus failure.
*Traces:* FSPEC §4.1, §5.1, §7.3; REQ-LOOPECON-08; REQ C-1, C-3.

**PROP-LOOPECON-13** — Flat-round classification requires all-carried and no open High, jointly.
*Domain/generator:* `fast-check` arbitrary rounds: a list of findings each independently
`carried`/`new` (per §3's accounting) and each independently `severity ∈ {High, Medium, Low}`,
constructed so all four quadrants of {all-carried vs. has-new} × {has-open-High vs. no-open-High} are
reachable, including the empty-findings-list round.
*Invariant:* a round is classified **flat** iff every finding in it is carried (no new finding, any
severity) **and** no finding recorded in the round (carried or new) is an open High-severity finding
— both conjuncts required; a round with one new Low finding is not flat even with zero High findings,
and a round with all findings carried but one being a carried open High is not flat either. The
empty-findings round (nothing to carry, nothing new, no High) is asserted flat, the boundary case
that most readily catches an "all(...)" vacuous-truth bug being applied to the wrong list.
*Traces:* FSPEC §5.3; REQ-LOOPECON-06.

**PROP-LOOPECON-14** — Derivative-stop convergence requires N *consecutive* flat rounds, reset on interruption, never overriding open High.
*Domain/generator:* `fast-check` arbitrary sequences of 1–12 rounds, each independently flat or not
(per PROP-LOOPECON-13's predicate, generated directly as a boolean tag to isolate this property from
the flat-round derivation itself), `review.derivativeStop.rounds` drawn from `{1, 2, 3, 5}`,
`review.derivativeStop.enabled = true`; a distinguished sub-domain forces the most-recent
`rounds`-window to contain an open High finding on at least one round within it.
*Invariant:* the document converges via `converged-by-derivative-stop` at round `R` iff rounds
`R-rounds+1 .. R` are *all* flat **and** contiguous — a single non-flat round anywhere in a would-be
window resets the consecutive count to zero starting after that round, so a sequence like
`[flat, non-flat, flat, flat]` with `rounds=2` converges only at the final round, not earlier; the
distinguished sub-domain (open High present anywhere in the window) never converges regardless of how
many consecutive rounds otherwise satisfy the non-High-and-carried conjunct of flatness — this is the
same invariant as PROP-LOOPECON-13's second conjunct but asserted at the window level to catch an
implementation that checks flatness per-round but aggregates the High-override incorrectly across the
window boundary.
*Traces:* FSPEC §5.4, §5.7; REQ-LOOPECON-06; REQ R-2 (mitigation), REQ-LOOPECON-06 (open-High override
clause).

**PROP-LOOPECON-15** — Converged-by-derivative-stop is a distinct, never-substituted outcome; rounds still count toward MAX_LIFETIME_ROUNDS; no POSTMORTEM.
*Domain/generator:* `fast-check` arbitrary converging sequences (per PROP-LOOPECON-14) paired with an
arbitrary starting lifetime-round count `L0` (0 to `MAX_LIFETIME_ROUNDS - rounds`).
*Invariant:* on convergence, the recorded outcome is the literal token `converged-by-derivative-stop`
— asserted by exact string equality against the phase report's outcome field, never coerced into or
compared as equal to an ordinary `approved`/`Needs revision` verdict; the document's lifetime-round
counter after convergence equals `L0 + rounds` (every round consumed while accumulating toward
convergence counts, none exempted or reset); and no `POSTMORTEM-*.md` write call is issued for this
outcome (asserted via a call-count spy on the POSTMORTEM-write seam showing zero invocations for this
document), distinguishing it from the cap-reached path which does write one.
*Traces:* FSPEC §5.5, §5.6; REQ-LOOPECON-06; REQ NG-4, C-4.

**EX-LOOPECON-02** — Disabled derivative-stop produces an identical convergence decision to the pre-M3 baseline (fixture baseline guard).
*Domain:* fixture-based. A single committed pre-M3 baseline convergence-decision fixture stream
(round outcomes for a representative multi-round sequence) re-run with `review.derivativeStop.enabled`
absent, explicitly `false`, and malformed — three fixture runs, mirroring EX-LOOPECON-01's structure
for the M2 gate.
*Invariant:* all three runs produce a convergence decision (continue-dispatching vs. stop, and if
stopped, which outcome) identical to the pre-M3 baseline for every round in the sequence; no
`converged-by-derivative-stop` outcome appears in any of the three runs. Recorded in
`pdlc/workflows/__tests__/learningsBaselineGuard.test.js`'s fixture shape per FSPEC §7.4; the
implementation task owns recording the digests this guard compares against.
*Traces:* FSPEC §5.2, §7.3, §7.4; REQ-LOOPECON-07, REQ-LOOPECON-08; REQ C-2.

## 7. Traceability

| REQ AC | Property ids | Covered |
|---|---|---|
| REQ-LOOPECON-01a | PROP-LOOPECON-01, PROP-LOOPECON-02 | yes |
| REQ-LOOPECON-01b | PROP-LOOPECON-03 | yes |
| REQ-LOOPECON-02 | PROP-LOOPECON-06, PROP-LOOPECON-07 | yes |
| REQ-LOOPECON-03 | PROP-LOOPECON-04, PROP-LOOPECON-05, PROP-LOOPECON-06 | yes |
| REQ-LOOPECON-04 | EX-LOOPECON-01 | yes |
| REQ-LOOPECON-05 | PROP-LOOPECON-10, PROP-LOOPECON-11 | yes |
| REQ-LOOPECON-06 | PROP-LOOPECON-13, PROP-LOOPECON-14, PROP-LOOPECON-15 | yes |
| REQ-LOOPECON-07 | EX-LOOPECON-02 | yes |
| REQ-LOOPECON-08 | PROP-LOOPECON-12 | yes |
| REQ-LOOPECON-09 | PROP-LOOPECON-08, PROP-LOOPECON-09 | yes |

Every property/EX id above appears in at least one row; every REQ AC row (01a through 09) is covered
by at least one property. No FSPEC §6 AC row is left unmapped.

REVISION-COMPLETE: yes

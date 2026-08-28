---
Status: Draft
Author: pm-author
Version: 1.0
Feature: pdlc-loop-economics
---

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, DECISIONS, PLAN, PROPERTIES |
| Scope | Anchor-computation ownership (M1a/M1b), finding-identity normalization and carried/new accounting (M1d), DoD round-index derivation (M1c), pin-cascade confirmation round grammar (M2), derivative-stop convergence predicate (M3) |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/completed/pdlc-loop-economics/LEARNINGS-pdlc-loop-economics.md |

# FSPEC pdlc-loop-economics

Behavioral specification for the review-loop economics moves M1–M3: what the loop
computes, what grammar it emits, and what happens on every failure/fallback path. This
document specifies *behavior* — inputs, decision rules, output grammar, ordering — not
the seam/function shape that implements it; that is TSPEC/PLAN material.

---

## 0. Document Map

This FSPEC covers five functional areas, one per REQ-LOOPECON-* cluster:

0. **§1 Anchor computation ownership** (M1a/M1b) — who computes `APPROVAL-HASH`,
   `REVIEWED-COMMIT`, `UPSTREAM-STATE` and when.
1. **§2 Finding-identity normalization and carried/new accounting** (M1d) — the
   algorithm that decides whether round N+1's finding is the same fact as round N's.
2. **§3 DoD round-index derivation** (M1c) — how the next `CODE_REVIEW-{feature}-v*.md`
   version number is picked.
3. **§4 Pin-cascade confirmation round** (M2) — dispatch/verdict grammar, batching
   rule, PASS/FAIL routing.
4. **§5 Derivative-stop convergence** (M3) — the exact predicate, its interaction with
   open-High findings and `MAX_LIFETIME_ROUNDS`.

§6 carries the AC→FSPEC traceability table. §7 carries cross-cutting failure/fallback
semantics common to M2 and M3.

---

## 1. FSPEC-ANCHOR: Anchor Computation Ownership

**Linked requirements:** REQ-LOOPECON-01 (01a write path, 01b quote path).

### 1.1 What an anchor is

An anchor is one of three values a document's anchor block carries as "the current
state an agent should treat as ground truth": `APPROVAL-HASH: sha256:{hex}`,
`REVIEWED-COMMIT: {hex}`, and `UPSTREAM-STATE {DOCTYPE} sha256:{hex}` (one line per
upstream doctype referenced). The line grammar itself — literal prefix, `sha256:`
scheme tag, lowercase hex digest — is unchanged by this feature; §5 of
`pdlc/OPERATIONS.md`'s reviewed material and every existing parser (staleness walk,
harvest) keeps reading exactly that shape.

### 1.2 Write path (M1a): existing engine self-write, pinned not built

The engine already writes the anchor block itself, through injected IO seams,
once a document's review round resolves to approval; no `orchestrate-dev.js`
prompt builder instructs an agent to append, transcribe, or restate an anchor
value today. This write mechanism predates this feature — M1a's obligation is to
**pin it** (a regression-guard test asserting the absence, over the engine's
prompt builders) and **reuse it** (§4.6's pin-check `PASS` routing re-invokes this
same write path to refresh an anchor), not to construct a new one:

- **Trigger.** A document's review round resolves to approval.
- **Writer.** The engine itself, through its injected IO seams — never an agent
  instructed to compose and append the block.
- **Value provenance.** `APPROVAL-HASH` and each `UPSTREAM-STATE {DOCTYPE}` value
  are hashes of the **referenced document's bytes on disk at write time** — never
  a value snapshotted at an earlier phase and carried forward. `REVIEWED-COMMIT`
  is the one exception to "hash of on-disk bytes": it is inherently a commit sha,
  so its value is **git HEAD at anchor-write time**, not a document hash.
- **Grammar.** Byte-identical to the anchor lines existing parsers already read
  (§1.1) — nothing about the line's shape changes.
- **Regression guard.** A test asserts no prompt builder in `orchestrate-dev.js`
  contains anchor-append/transcribe/restate instruction text. Three SKILL.md files
  still carry a vestigial, currently-unreachable conditional sentence for this
  path; editing those SKILL.md files is out of scope for this feature (REQ NG-2).

### 1.3 Quote path (M1b): dispatch-construction-time re-derivation, not mint-time

The review loop already captures a document's own anchor hash from bytes on disk
at round start, and the erratum confirmation flow already re-derives and
drift-checks upstream state after confirmers return — neither of those paths is
this feature's defect. The residual defect the R-5 stale-hash re-filings (54× on
`pdlc-engineering-loop`) point at is narrower: an upstream hash minted once early
in an erratum batch (`snapshotErratumDocs`, DEC-ERR-03's mint-time snapshot) must
never itself be the value a later dispatch renders into agent-visible prompt text
as "current." Every dispatch that renders an `APPROVAL-HASH`, `REVIEWED-COMMIT`,
or `UPSTREAM-STATE {DOCTYPE}` value as current **recomputes it from bytes on disk
(or, for `REVIEWED-COMMIT`, from git HEAD) at dispatch-construction time**. A
mint-time snapshot remains legitimate for, and only for, detecting whether
upstream moved since mint (drift detection between snapshot and re-derived state);
it is never the value quoted to the agent as current. No dispatch prompt
instructs the receiving agent to transcribe, retype, or hand-copy an anchor value
from a prior round's prose, an earlier document version, or its own memory.

M1b's scope is exactly this re-derivation-vs-mint-time distinction. It does not
include: the DoD round-index pick (§3, M1c — a sibling harness-computed value
with its own, separate defect shape), finding-identity carried/new accounting
(§2, M1d), the `cascade.pinCheck` key (§4, M2), or the derivative-stop outcome
(§5, M3).

### 1.4 Behavioral consequence: no transcription-shaped instruction, ever

An agent never composes an anchor block (write side, §1.2 — already true, now
pinned) and never states an anchor value the harness has not itself already
computed (quote side, §1.3 — the re-derivation fix). An agent's role with respect
to an anchor is read-only on both paths. A dispatch prompt containing language of
the shape "append the current APPROVAL-HASH" or "quote the current APPROVAL-HASH
from the last cross-review" is a defect under this FSPEC, whether such language
is newly introduced or (per §1.2's regression guard) silently reintroduced.

### 1.5 Non-goal boundary

§1 does not change *what* triggers a new round, does not change the erratum-routing
grammar (`FINDING: {High|Medium|Low} | {delta|inherited} | {local|nonlocal} | ...`),
and does not touch `deriveRoundWindow`'s directory-listing-derived round-index logic —
that mechanism stays content-addressed and is out of scope.

---

## 2. FSPEC-IDENTITY: Finding-Identity Normalization and Carried/New Accounting

**Linked requirements:** REQ-LOOPECON-02, REQ-LOOPECON-03.

### 2.1 Identity triple

A finding's identity is the triple:

```
(severity, section-anchor, normalized-text)
```

- **severity** — one of `High`, `Medium`, `Low`, taken verbatim from the finding's
  recorded severity.
- **section-anchor** — the document section (heading or numbered clause, e.g. `AC-3`,
  `§4.2`, `BR-7`) the finding is filed against. Two findings filed against different
  section anchors never share an identity, even with identical text.
- **normalized-text** — the finding's body text after normalization (§2.2).

Two findings are the **same finding** — one carried occurrence of one fact — if and
only if all three components of the identity triple match exactly.

### 2.2 Text normalization rule

Normalization is whitespace-collapsing and case-insensitive comparison of the
finding's body text after stripping:

- leading/trailing whitespace,
- the finding's own round-number or file-version token if one is embedded in the
  text (e.g. "as of v3" or "in round 4"), since that token varies with the very
  re-filing this normalization exists to collapse,
- any embedded hash/sha token the finding cites as evidence (the fact a hash is
  stale does not change across re-filings even though the specific hex value quoted
  might, once §1 makes anchors harness-computed).

Normalization never strips or ignores the section-anchor or severity components — only
the free-text body is normalized. Two findings whose bodies differ only in the stripped
tokens above normalize to the same normalized-text.

### 2.3 Carried vs. new classification

For a document under review in round N+1, given the full set of findings recorded in
round N and the full set of findings recorded in round N+1:

- A round N+1 finding whose identity triple matches some round N finding's identity
  triple is classified **carried**.
- A round N+1 finding whose identity triple matches no round N finding is classified
  **new**.
- A round N finding with no matching round N+1 occurrence is neither carried nor new
  in round N+1's accounting — it is simply absent (resolved, or the reviewer chose
  not to re-raise it).

This classification is computed once per round, per document, over that document's
full finding set for the round; it does not require any specific traversal order and
its result does not depend on the order findings were recorded within a round
(order-independence).

### 2.4 Feed into deduplication (§ REQ-LOOPECON-02) and derivative-stop (§5)

A finding classified **carried** whose only content is staleness bookkeeping (an
anchor/pin fact, not a substantive document defect) does not mint a second entry in
the round's finding list — the existing open item from the earlier round remains the
single record. A finding classified **new**, regardless of whether it is a staleness
fact or a substantive one, always mints a fresh entry; deduplication only ever
collapses a repeat of an already-open item, never a genuinely new one.

The carried/new split computed here is the exact input §5's derivative-stop predicate
consumes: a round in which no finding is classified **new** at severity ≥ Medium (a
new Low is allowed), and none of the round's findings — carried or new — is an open
High, is a **flat round** for derivative-stop purposes (§5.3).

---

## 3. FSPEC-DODVER: DoD Round-Index Derivation

**Linked requirements:** REQ-LOOPECON-09.

### 3.1 Derivation rule

When Phase DOD dispatches a new `CODE_REVIEW-{feature}-v{N}.md` round, `N` is derived
as `max(existing version numbers among CODE_REVIEW-{feature}-v*.md files present on
disk) + 1`. If no `CODE_REVIEW-{feature}-v*.md` file exists yet, `N` is `1`.

### 3.2 Why disk state, not a running counter

This mirrors `deriveRoundWindow`'s existing contract for review rounds
(`pdlc/OPERATIONS.md` review-loop-mechanics): the round index is derived from what
files are actually present, never from an in-memory counter that could desync from
disk state across a resumed or re-dispatched run. A counter that drifted from disk
would either skip a version number (leaving a gap a completeness gate might
misinterpret) or collide with an existing file (the append-only-history invariant
`deriveRoundWindow` already enforces for review rounds).

---

## 4. FSPEC-PINCASCADE: Pin-Cascade Confirmation Round

**Linked requirements:** REQ-LOOPECON-04, REQ-LOOPECON-05, REQ-LOOPECON-08.

### 4.1 Config gate

Governed by `cascade.pinCheck.enabled` (default `false`). Parsed with the same
per-key independent-fallback rule as `learningsInjection`/advisory-tier config: a
missing or wrong-typed `enabled` key, or an unreadable/unparseable config file, falls
back to `false` and does not affect any other config block.

### 4.2 When disabled (default)

The post-erratum downstream staleness walk runs exactly as it does today: every
downstream document flagged stale by an upstream change receives an independent full
review-loop dispatch. No `PIN-CHECK` dispatch is ever constructed. The dispatch stream
this walk produces is byte-identical to the pre-M2 baseline.

### 4.3 Batch-eligibility predicate (when enabled)

In the post-erratum downstream staleness walk, a document is **pin-check-eligible**
for the current walk if and only if **both** hold:

1. The document's own content hash (the hash of its current on-disk bytes) is
   unchanged since the hash recorded at its last approval.
2. At least one `UPSTREAM-STATE {DOCTYPE}` reference the document carries no longer
   matches the current upstream document's hash — i.e. an upstream pin moved — and
   this is the *only* reason the walk flagged the document as stale.

A document whose own bytes changed since last approval is **never** pin-check-
eligible, regardless of what else is true; it always receives a full review dispatch.

### 4.4 Batching rule

All pin-check-eligible documents identified in one staleness walk are grouped into
**one** pin-check dispatch — not one dispatch per document — covering every doctype in
that eligible set (e.g. REQ, FSPEC, TSPEC together in a single dispatch if all three
are eligible in the same walk).

### 4.5 Dispatch and verdict grammar

The pin-check dispatch presents, for each eligible document, the document's identity
and the specific upstream pin(s) that moved. The dispatch's reply carries one verdict
line per document:

```
PIN-CHECK: {DOCTYPE}: PASS | FAIL
```

- **Grammar:** literal prefix `PIN-CHECK: `, the doctype token (`REQ`, `FSPEC`,
  `TSPEC`, `DECISIONS`, `PLAN`, `PROPERTIES`), a colon-space separator, then exactly
  one of `PASS` or `FAIL` (case-sensitive, no other token parses). One line per
  document covered by the dispatch; a dispatch covering three documents carries three
  `PIN-CHECK:` lines.
- Any line that does not match this grammar exactly is treated as unparseable for
  that document (§7.2).

### 4.6 PASS routing

A document whose `PIN-CHECK:` verdict is `PASS` has its approval anchor (§1)
re-appended or updated to reflect the now-current upstream pin(s); no new review round
is opened for that document, and it is not counted against that document's
`MAX_REVIEW_ROUNDS`/`MAX_LIFETIME_ROUNDS` budget.

### 4.7 FAIL routing

A document whose `PIN-CHECK:` verdict is `FAIL` is routed into an ordinary
re-confirmation round — the same review-loop dispatch shape that document would have
received had pin-check been disabled. A `FAIL` verdict never causes the document to be
silently accepted; fail-open on this path means "do the full review," not "approve
anyway" (§7.1).

---

## 5. FSPEC-DSTOP: Derivative-Stop Convergence

**Linked requirements:** REQ-LOOPECON-06, REQ-LOOPECON-07, REQ-LOOPECON-08.

Enabling `review.derivativeStop.enabled` does more than add a new outcome: it
suspends the standing review-loop convergence bar's high-only shortcut (§5.4) for
that document's loop, so the enabled-mode gate — not just the flat-round predicate
— is load-bearing FSPEC material.

### 5.1 Config gate

Governed by `review.derivativeStop.enabled` (default `false`) and
`review.derivativeStop.rounds` (default `2`). Same per-key fail-open parsing as §4.1;
a wrong-typed `rounds` value falls back to `2` independently of `enabled`'s value.

### 5.2 When disabled (default)

The loop's continue/stop decision for a document is computed exactly as it is today
(round-cap and verdict-driven only); the `converged-by-derivative-stop` outcome is
never recorded, and the decision sequence for any fixed sequence of round verdicts is
identical to the pre-M3 baseline.

### 5.3 Flat-round predicate

A round is a **flat round** for a document if, per §2.3's carried/new accounting for
that round:

- no finding recorded in the round is classified **new** (§2.3) at severity Medium
  or High — a new Low finding does not break flatness, and a carried finding of any
  severity does not break flatness, and
- no finding in the round — carried or new — is an open High-severity finding.

### 5.4 Convergence gate (enabled-mode) and derivative-stop predicate

**When `review.derivativeStop.enabled` is `false` (default):** this gate does not
apply; the loop's convergence decision is exactly today's — see §5.2.

**When `review.derivativeStop.enabled` is `true`:** the standing review-loop
convergence bar's high-only shortcut (`pdlc/OPERATIONS.md`, review-loop-mechanics —
the 2026-08-08 relaxation under which a round-2+ delta-scoped round with an open
Medium/Low but no open High reads as PASS) is **suspended** for that document's
loop. A round for that document converges — the loop stops dispatching further
rounds and records an outcome — if and only if one of:

1. **Ordinary approval, pre-relaxation reading.** The round carries a literal
   `VERDICT: Approved` or `VERDICT: Approved with minor changes` verdict — not a round
   that reads as PASS only because the high-only shortcut waives an open Medium/Low.
2. **Derivative-stop.** The document has just completed
   `review.derivativeStop.rounds` (default 2) **consecutive** flat rounds (§5.3),
   counting back from the most recently completed round. "Consecutive" means
   uninterrupted: if any round in that window fails the flat-round predicate, the
   count resets from the round after the failure.

Path 1 records an ordinary approval outcome; path 2 records
`converged-by-derivative-stop` (§5.5). Neither path is reachable through the
suspended high-only shortcut while the key is enabled.

### 5.5 Outcome recording

On convergence, the loop records the document's outcome as `converged-by-derivative-
stop` — a value distinct from, and never substituted for, an ordinary approval
verdict in the phase report. The loop stops dispatching further rounds for that
document. No `POSTMORTEM` is written for a `converged-by-derivative-stop` outcome (it
is not a failure/cap condition).

### 5.6 Interaction with MAX_LIFETIME_ROUNDS

Rounds consumed while accumulating toward derivative-stop convergence count toward
that document's `MAX_LIFETIME_ROUNDS` accounting exactly as any other round does.
Derivative-stop is a way to stop *before* the cap is reached when the loop has
evidence of convergence; it never resets, pauses, or exempts rounds from the lifetime
counter.

### 5.7 Never overrides an open High

If any round within the candidate consecutive window carries an open High finding
(§5.3's second clause), that window can never satisfy §5.4's predicate regardless of
how many rounds within it were otherwise flat. Derivative-stop cannot fire while any
High finding in the counted window remains open.

### 5.8 Operator-visible consequence: enabling can add rounds

Enabling `review.derivativeStop.enabled` can lengthen a document's loop relative to
today's default bar: a document that would converge today via the high-only
shortcut — an open Medium finding present, no open High — no longer converges on
that shortcut alone once the key is on; it must reach either a literal approving
verdict (§5.4 path 1) or the derivative-stop window (§5.4 path 2). This is
deliberate (DEC-TERM-01): a real convergence signal, not verdict-at-cap, is worth
the extra round(s) it costs on documents the standing leniency previously let
through with an open Medium left unresolved.

---

## 6. Traceability: AC → FSPEC Section

| Acceptance Criterion | FSPEC Section |
|---|---|
| REQ-LOOPECON-01a | §1.2 (FSPEC-ANCHOR, write path) |
| REQ-LOOPECON-01b | §1.3 (FSPEC-ANCHOR, quote path) |
| REQ-LOOPECON-02 | §2.4 (FSPEC-IDENTITY) |
| REQ-LOOPECON-03 | §2.1–§2.3 (FSPEC-IDENTITY) |
| REQ-LOOPECON-04 | §4.2 (FSPEC-PINCASCADE) |
| REQ-LOOPECON-05 | §4.3–§4.6 (FSPEC-PINCASCADE) |
| REQ-LOOPECON-06 | §5.3–§5.7 (FSPEC-DSTOP) |
| REQ-LOOPECON-07 | §5.2 (FSPEC-DSTOP) |
| REQ-LOOPECON-08 | §4.1, §5.1 (config fail-open) |
| REQ-LOOPECON-09 | §3.1–§3.2 (FSPEC-DODVER) |

---

## 7. Cross-Cutting Failure and Fallback Semantics

### 7.1 Fail-open direction is always "do the more expensive, more correct thing"

Every failure/fallback path this FSPEC introduces resolves toward the pre-M1/M2/M3
baseline behavior — a full review dispatch, not an approval; the pre-existing
convergence decision, not a manufactured `converged-by-derivative-stop`. Nowhere does
a parse failure, malformed config, or unparseable verdict resolve toward silently
approving or silently skipping a document.

### 7.2 Unparseable pin-check verdict

If a `PIN-CHECK:` line for a document is absent from the dispatch's reply, or present
but does not match §4.5's grammar exactly, that document is treated as `FAIL` (§4.7)
for that walk — it receives a full re-confirmation round. This mirrors the existing
review-loop rule that a missing or malformed `VERDICT:` is treated as `Needs revision`
(`pdlc/OPERATIONS.md`, review-loop-mechanics; FSPEC-orchestrate-dev-workflow §1.3).

### 7.3 Config file unreadable or malformed at the top level

If `.claude/pdlc.config.json` itself cannot be read or is not a JSON object, both
`cascade.pinCheck` and `review.derivativeStop` fall back to their full default block
(§4.1, §5.1) — this is the corpus-level fail-open case, distinct from a single
malformed key inside an otherwise-readable block.

### 7.4 Byte-identity is a testable claim, not an assertion

Every "byte-identical to baseline" claim in this FSPEC (§4.2, §5.2, and REQ-LOOPECON-04
/07) is verified against a committed fixture set, following the precedent already
shipped for `learningsInjection` in
`pdlc/workflows/__tests__/learningsBaselineGuard.test.js` — never asserted by
inspection alone and never verified against a same-branch disabled run.

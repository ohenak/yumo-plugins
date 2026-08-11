---
feature: pdlc-headless-engine
---

# DECISIONS — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** (`docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` v0.9; `FSPEC-pdlc-headless-engine.md` v1.3; `TSPEC-pdlc-headless-engine.md` v1.5) |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-11 |

## 0. Scope of this document

TSPEC v1.5 fixes the mechanism. This document records only the **load-bearing choices inside that
mechanism** — the ones where an alternative was live, where the rejection has a cost, and where a
later reader would otherwise re-open the question from scratch. Each entry states what was decided,
what was rejected and why, what constraint forced the shape, how reversible it is, and what would
make it worth revisiting.

Two classes of thing are deliberately **not** here: TSPEC's open questions (O-ENG-T1…T5, §9.2 there)
are undecided by construction and stay undecided; and design detail with no rejected alternative is
mechanism, not decision, and lives in TSPEC alone.

Project-level decisions under `docs/_decisions/` are treated as settled input, not re-litigated.
DEC-ENG-08 below applies `DEC-ORACLE-01` rather than re-deriving it.

Every code claim below was verified against the working tree at authoring time; `file:line`
citations are to that state.

## 1. Transport

## DEC-ENG-01: The Agent SDK is the primary transport; `claude -p` is built as a fallback but is not runtime-selectable

**Context:** REQ G-5 wants an unattended pipeline that dispatches agents with no Claude Code session.
Two carriers can do that: the in-process Agent SDK (`@anthropic-ai/claude-agent-sdk`, pinned
`^0.3.226` in `pdlc/engine/package.json`, resolved 0.3.226 in the tree) and spawning `claude -p`.
HEAD already ships only the first (`pdlc/engine/lib/transport.mjs`, `queryFn` consumed as a message
stream). The question was whether this feature ships one transport, two, or one with a selector.

**Decision:** Ship the SDK transport as the only path a run takes, and build `lib/transport-cli.mjs`
to the *same* interface (TSPEC §3.4) so the fallback is a tested unit, driven in tests over recorded
fixtures only. `resolveTransport({ env })` returns a constant `kind: "agent-sdk"`; `"cli"` is
reachable only by direct unit construction. Making the fallback selectable stays with O-1.

**Alternatives considered:**

- **Ship only the SDK transport, no CLI module** — rejected because the two carriers differ in
  exactly the places C-2/C-5/C-6 constrain (env passthrough, hook carriage, permission flags), and
  those differences are cheapest to discover while the interface is being written, not after the SDK
  path is the only thing anyone has run. The cost of the rejection is real: `transport-cli.mjs` is
  code with no production caller this feature.
- **Ship a runtime selector (flag or env var)** — rejected, and this is a *reversal* of TSPEC v1.0,
  which had designed one. A selector is only honest once the CLI path has been measured against a
  live `claude` binary on both CI platforms (C-9), and nothing in this feature funds that
  measurement. A selector shipped ahead of the measurement offers operators a switch whose far side
  is unmeasured.
- **Spawn `claude -p` as primary** — rejected: it puts a second process, its stdout framing and its
  own settings resolution between the engine and every dispatch, and the SDK exposes as typed
  options (`hooks`, `permissionMode`, `canUseTool`) what the CLI exposes as flags and temp files.

**Constraints that forced this shape:** C-2 (proxy env reaches every dispatch — satisfied by the
spread at `transport.mjs:159`, never a constructed child env); C-9 (every runtime fact measured per
platform, which is what makes an unmeasured selector unacceptable).

**Reversibility:** Easy in one direction. Because `resolveTransport` already exists and both
transports satisfy one interface, adding the selector is a change to one function plus the
measurement it waits on. Removing `transport-cli.mjs` later is also easy — nothing depends on it.

**Re-evaluation triggers:** O-1 completes the CLI flag-surface measurement; an SDK version bump
breaks the primary path and the fallback becomes the recovery route; a consumer environment forbids
in-process SDK use.

## DEC-ENG-02: There is no failover between transports — an SDK failure is a failure

**Context:** With two transports in the tree, the tempting behaviour is: primary throws, retry on
the fallback. TSPEC v1.0 attributed this rule to a `BR-TRANS-6` that exists in neither REQ nor
FSPEC, so the rule needed an owner; it is recorded here as a design decision (TSPEC §3.4,
**R-TRANS-1**).

**Decision:** No failover, silent or announced. A dispatch failure on the primary transport is
classified by `lib/outcome.mjs` (§5.1) and surfaced. The fallback is never reached by a failure path.

**Alternatives considered:**

- **Automatic failover on transport error** — rejected on evidence-integrity grounds. Every
  downstream oracle in this pipeline reads *files* an agent wrote, and the engine's report attributes
  a run to one transport (`report.mjs:50` today, observed rather than declared after §3.6). If the
  carrier can change underneath a run, every subsequent observation in that run is unattributable to
  a transport, and a per-transport measurement regime (C-9) is unfalsifiable.
- **Operator-triggered failover after a halt** — not rejected so much as *not this feature's*: it is
  the same measurement O-1 owes, and it can be added later without changing anything decided here.

**Constraints that forced this shape:** C-9; and the taxonomy's totality (AC-4.1) — a six-member
closed outcome set means a transport failure already has a name and a report row, so "try the other
one" would be a behaviour that hides a classified outcome rather than one that surfaces it.

**Reversibility:** Easy — it is an absence of code, not a structure.

**Re-evaluation triggers:** A measured SDK failure mode that is both frequent and provably
transport-local (so the fallback is a genuine recovery rather than a second sample of the same
fault); or an operator requirement for unattended completion that outranks per-run attributability.

## 2. Guard parity

## 3. Skills and prompts

## 4. Engine-side provenance

## 5. Test mechanics

## 6. Configuration and lifecycle

## 7. Decision index

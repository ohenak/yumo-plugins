# DECISIONS — model availability

Project-level decisions about which model runs a dispatch, and what happens when that model is
unavailable. Promoted 2026-08-19 by `/pdlc:consolidate-learnings` from LEARNINGS
`pdlc-plugin-retirement`, `pdlc-consolidation-agent`, `pdlc-advisory-tier` and `pdlc-headless-engine`.

Read by `se-author` (before DECISIONS/TSPEC touching dispatch), `orchestrate-dev` and the engine
backlog.

---

## DEC-MODEL-01: Model availability is a declared per-seat property with a fallback tier

**Decision.** Every dispatching seat — reviewer role, author role, advisory rung, wave agent —
declares the model it wants **and the tier it falls back to**. A provider-side unavailability
(HTTP 529 overload, capacity refusal, a model id that has been retired) is a *first-class pipeline
failure mode*, not a flake: it degrades the round to the fallback tier and records that it did. It
does not halt the run, and it is not retried indefinitely against the same seat.

**Rationale.** `pdlc-plugin-retirement` rounds 11–14 stalled outright: SE and TE dispatches died on
Opus 529 overload, and recovery was manual — a Sonnet fallback plus a queue-row flip to `pending` for
a lossless resume. `pdlc-consolidation-agent` §4.10 measured the same class from the other side: four
halts in one session were transport, not substance, and the two most expensive were long dispatches
that died mid-flight, costing a full re-entry pass of ~15–20 Opus dispatches. The countermeasure both
corpora point at is the one `pdlc-advisory-tier` already shipped for its own seams — a declared pair,
`MODEL_ADVISORY = "fable"` with `MODEL_ADVISORY_FALLBACK = "opus"` — generalised to every seat.

**Consequences.**
- A dispatch that degrades to its fallback tier says so in the round record, so a reviewer verdict
  produced by a cheaper model is legible when the round is later audited.
- Long remediation dispatches are decomposed so no single dispatch needs a 30-minute ceiling, and a
  faulted dispatch is retried rather than halted (`pdlc-consolidation-agent` §4.10).
- The division of labour that held up under measurement stands: mechanical, ownership-disjoint
  implementation waves on the cheap model under a script-owned gate; judgement steps — spec
  authoring, review, DoD, CR, PUB dispatch — on the expensive one. Fallback is a degradation of the
  judgement tier, not a redefinition of it.

**Testability.** The seat table is a closed catalogue (DC-01); assert set-equality between the
declared seats and the seats the dispatcher can reach, and assert that a simulated 529 on a seat
yields a fallback dispatch and a recorded degradation rather than a halt.

---

## DEC-MODEL-02: Model fallback is not transport failover

**Decision.** A seat may fall back to another **model** on the same transport. A run does **not**
fail over to another **transport**. `DEC-ENG-01`/`DEC-ENG-02` stand: the SDK is the primary
transport and `claude -p` is a build-time fallback selected before the run, not a runtime
alternative.

**Rationale.** `pdlc-headless-engine` rejected runtime transport selection deliberately: an SDK
failure is a failure, not a signal to try another path, and failover makes the auth and guard posture
non-deterministic — turning one red into two silent retries. Model unavailability has none of those
properties. It is observable, it is attributable to a named seat, and the fallback model runs under
the identical auth and guard posture. Conflating the two would let `DEC-MODEL-01` quietly reopen a
security decision that was made on different evidence.

**Consequences.** The fallback tier is a list of model ids for one transport. Any proposal that
reaches for a second transport is a re-opening of `DEC-ENG-01`/`DEC-ENG-02` and belongs in a REQ, not
in a dispatch-layer fix.

**Testability.** Assert that the fallback resolver's range is a subset of the model catalogue and
disjoint from the transport catalogue.

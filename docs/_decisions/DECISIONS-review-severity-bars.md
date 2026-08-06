# DECISIONS — review severity bars

Project-level adjudication of a reviewer severity split the review loop cannot resolve itself.
Recorded per `POSTMORTEM-R-pdlc-consolidation-agent.md` (second window, rounds 6–10)
Recommendation step 2, on 2026-08-06. Read by `se-review` / `te-review` when scoring
documentation-layer findings.

---

## DEC-SEV-01: A detectable obligation-scope gap is Low, not Medium

**Context.** Phase R of `pdlc-consolidation-agent` ran a five-round window in which the two
reviewers agreed on every fact and split on one severity, three rounds running: when a governance
rule (ownership statement, set-equality oracle range, deliverable list) fails to range over a
section that exists, SE scored it Medium ("an obligation whose scope is unstated blocks a
downstream author"), TE scored it Low ("the version-pin clause makes drift detectable, so a test
author can proceed today with a pinned expected value"). The approval bar (any open Medium ⇒
Needs revision) made the stricter bar decisive, and the loop has no adjudication seam — delta-scoped
reviewers never read each other's cross-review.

**Decision.** For REQ-layer findings about the *scope of a governance rule over a shared
normative file*: when the governed file carries a version-pin obligation whose breach is itself a
defect (an unbumped content change cannot land silently), a rule that under-ranges the file's
current sections is a **Low** finding — a maintenance lag, detectable and non-blocking — not a
Medium. It is a **Medium** only when the gap leaves a downstream author unable to make a decision
today (no pinnable version, no defect clause, or the unranged content is an enumeration a
downstream layer must transcribe with no stated oracle).

**Why.** Both bars were applied consistently and both are defensible; the difference is what they
measure (obligation stated vs. test writable). The bar that keys on *detectability* is the one the
documents themselves enforce — the version-pin/defect clause exists precisely so drift cannot land
silently — and adopting it removes a one-Medium-per-round generator without weakening any oracle:
an undetectable or transcription-blocking gap remains blocking.

**Scope.** REQ-layer documentation findings of this exact class. This does not change the approval
bar itself (any open High/Medium still blocks), nor the severity of code-behaviour findings.

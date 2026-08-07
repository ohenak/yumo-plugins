# DECISIONS — spec layer boundary

Project-level decision fixing which classes of decision each specification layer owns.
Recorded per `POSTMORTEM-F-pdlc-consolidation-agent.md` Recommendation step 3, on 2026-08-06.
Read by `pm-author` / `se-author` / `te-author` before authoring, and by
`se-review` / `te-review` when scoring a finding that asks a document to settle a decision.

---

## DEC-LAYER-01: An FSPEC states the observable and names the artefact that will pin it; it does not carry the artefact

**Context.** Phase F of `pdlc-consolidation-agent` exhausted a five-round window with the High
population fully drained by round 4 and the Medium population flat at four-to-five per round. The
postmortem's primary root cause: the FSPEC was settling decisions that belong a layer down, and
each such settlement is a new checkable claim in a document reviewed by two reviewers per round —
repairs manufactured Mediums at roughly the rate they retired them (the document ended at 4.1× its
REQ's size for one workflow pass). Reviewers were not wrong to file the findings: a rule stated
at FSPEC layer without its pinning artefact is unfalsifiable *at that layer*. The fix is to stop
stating the rule at that layer.

**Decision.** The following classes of decision are **TSPEC- or PROPERTIES-owned**, not
FSPEC-owned. An FSPEC that needs one states the observable outcome and names the downstream
artefact that will pin the mechanism (`TSPEC §…` / `PROPERTIES …`), and stops:

- **Tie-break and ordering algorithms** (e.g. which of two colliding subjects wins, and by what
  comparison) — TSPEC. The FSPEC states that the outcome is deterministic and input-pure.
- **Per-field reader indices and parse-notice contracts** (how a reader walks a record's fields,
  what a short record yields) — TSPEC. The FSPEC states the reader-side observable (skip, never
  halt, bytes unchanged).
- **Seam verb permitted-sets** (the closed enumeration of calls a seam may make) — TSPEC.
- **Fixture construction and oracle strength** (what a test's Given builds, which ordered pairs a
  fixture set ranges over, set-equality domains) — PROPERTIES / the AT layer, reviewed by
  te-review there.

**Review consequence.** A reviewer finding that an FSPEC rule of one of these classes lacks its
pinning artefact is answered by **naming the downstream owner**, not by authoring the artefact
into the FSPEC; such a finding, when the downstream pointer exists, is Low ("deferred, tracked"),
not a blocking Medium. A finding that the FSPEC fails to state the *observable* (or names no
owner at all) remains blocking at FSPEC layer.

**Cost, accepted.** FSPEC reviewers lose falsifiers they currently exercise, and the TSPEC
inherits the open decisions. This is accepted deliberately: settling them at FSPEC layer is
exactly what consumed the Phase F window, and the TSPEC/PROPERTIES reviewers are the ones
equipped to check them (`POSTMORTEM-F-pdlc-consolidation-agent.md` RC-1).

**Related.** [DEC-SEV-01](DECISIONS-review-severity-bars.md) adjudicates the severity of
detectable governance-scope gaps; this decision adjudicates *where a mechanism belongs*. Together
they remove the two observed one-Medium-per-round generators.

**Companion (added 2026-08-06, per `POSTMORTEM-T-pdlc-consolidation-agent.md` step 3).** The
decisions this rule moves down arrive at the receiving layer **with** the disposition rule
[DEC-SEV-03](DECISIONS-review-severity-bars.md): when deciding one of them collides with an
enumerated upstream artifact, the collision is named, priced and routed through the erratum
channel at Low severity — the cost this decision priced ("TSPEC inherits four open decisions")
is paid through that channel, not through the severity bar.

**Companion (added 2026-08-06, per `POSTMORTEM-P-pdlc-consolidation-agent.md` step 5).** A
multi-layer erratum wave must propagate **downward in order**: a child document confirmed before
its parent's decision reaches it is approved stale, and its approval is worth less than it looks.
An erratum round on document D therefore begins by re-reading D's immediate upstream at HEAD and
absorbing every decision the upstream's changelog names since D's last approval — before the
raised items are touched (see [DEC-ERR-01](DECISIONS-review-severity-bars.md)).

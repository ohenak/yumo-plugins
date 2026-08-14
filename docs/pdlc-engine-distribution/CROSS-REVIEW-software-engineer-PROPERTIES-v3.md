# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.5)
**Date:** 2026-08-14
**Iteration:** 3
**Scope:** Delta confirmation of the Phase-PT erratum round. One raised item checked for
resolution; the document re-grounded against its upstream at HEAD (REQ v0.11, FSPEC v0.7,
TSPEC v0.12, DECISIONS v0.3, PLAN v0.8) per DEC-ERR-01. Not a whole-document re-review.

## 1. The raised item

One item was raised (by pm-author), and it lands.

| Raised item | Edit made | Verified |
|---|---|---|
| PROP-LAUNCH-3 (`PROPERTIES:85`) discriminates on a "none installed" message that no longer exists in FSPEC or in `lib/handshake.mjs`; align with PROP-LAUNCH-9's `not found` literal | **The item as filed was already spent.** PROP-LAUNCH-3's discriminator was re-pinned in v0.4 to "**not** AT-1.1's `not found` message"; the residue in v0.5's scope was one line further down — PROP-LAUNCH-9's *headline* clause still read "state that none is installed". That clause now reads "report the plugin version as the literal `not found`" | **Resolved.** Checked as a diff (`git show 06e74162`), not from the changelog: four insertions, three deletions, one of them the PROP-LAUNCH-9 headline |

The author's re-filing of the item is correct and worth recording, because a literal reading of
the raised text would have produced a no-op edit. PROP-LAUNCH-3 at `:85` already carried the
post-v0.4 discriminator; the stale label had migrated to PROP-LAUNCH-9's headline, where its
own conjunct (b) had pinned `not found` since v0.3 — so the headline was the last place in the
document still pointing a reader at a string no module emits. That is the same defect the item
names, at the address it actually occupies.

**The new clause is a faithful compression of its upstream.** FSPEC v0.7's AT-1.1 reads: "the
message names the declared range and reports the plugin version as the literal `not found`"
(`FSPEC:676-681`). PROP-LAUNCH-9's headline now reads: "the refusal must name the declared
range and report the plugin version as the literal `not found`". Same two conjuncts, same
order, same literal.

**The `contains`/`equals` distinction survives the edit**, which is the part most likely to have
been flattened. FSPEC v0.7 added a sentence AT-1.1 did not carry at v0.6: the refusal *reason
text* **contains** the literal, while AT-1.6 and Q-1's version-triple member **equals** it.
PROPERTIES honours both sides — PROP-LAUNCH-9 conjunct (b) says the message "contains the exact
literal `not found`", PROP-LAUNCH-5 says the triple member "equals … the exact literal
`not found`". Had the headline been rewritten to say the message *equals* the literal, it would
have contradicted conjunct (b) one sentence below it. It was not.

## 2. Upstream re-grounding at HEAD (DEC-ERR-01)

The item list is necessary, not sufficient. I re-read the upstream this document leans on, at
its current version, and re-measured the load-bearing claims rather than trusting the changelog.

**Version cells first.** The Upstream cell's claim — FSPEC v0.6 → v0.7, PLAN v0.7 → v0.8, and
REQ / TSPEC / DECISIONS unmoved — is exactly true at HEAD:

| Upstream | Cell claims | At HEAD | |
|---|---|---|---|
| REQ | v0.11 | v0.11, `sha256:abd47bee…4a2eadd0` | **Matches the dispatch pin byte-for-byte** |
| FSPEC | v0.7 | v0.7 (`a57e0547`, round-6) | Moved, correctly re-pinned |
| TSPEC | v0.12 | v0.12 | Unmoved |
| DECISIONS | v0.3 | v0.3 | Unmoved |
| PLAN | v0.8 | v0.8 | Moved, correctly re-pinned |

**§4's set-equality against FSPEC §8, recomputed not assumed.** This is the claim an erratum
round most easily invalidates silently, since an upstream that gains or loses an `AT-` row
breaks it without touching a single line of PROPERTIES. I extracted both id sets mechanically
and diffed them:

- FSPEC §8's `AT-` definitions: **35 ids**, `AT-1.1`…`AT-6.2`.
- PROPERTIES §4's `AT-` rows: **35 ids**.
- `diff` of the two sorted sets: **empty**. Set-equality holds in both directions, including
  the irregular members `AT-3.8a`, `AT-3.8b` and `AT-5.3b`.

**The whole FSPEC v0.6 → v0.7 diff was read, not just the parts the changelog names.** It is 22
insertions / 13 deletions, confined to the version cell, a new changelog paragraph, §5.2's class
table and per-class count sentence, AT-3.8a's count conjunct, AT-3.8b's class-name wording, and
the AT-1.1 / AT-1.6 literal. FSPEC's own changelog states "No criterion, oracle or count
changed", and the diff bears that out — no `AT-` row was added or removed, which is the
independent reason §4's set-equality still holds rather than holding by luck.

**A prior erratum of mine is now discharged upstream.** In round 2 I raised that FSPEC's AT-1.6
wrote the missing-plugin triple member as the literal `"none"` while the shipped renderer used
`not found` (`handshake.mjs:209`). FSPEC v0.7 fixes it: AT-1.1 and AT-1.6 both name `not found`,
and AT-1.4's discriminator now points at AT-1.1's `not found` message instead of the deleted
"none installed" name, so it no longer dangles. The divergence that made PROPERTIES right and
FSPEC stale is closed on the FSPEC side; nothing on this side needed to move for it.

## 3. Absorbed decisions, checked individually

## 4. Findings

## 5. Carried-forward findings from round 2

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict

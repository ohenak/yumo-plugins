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

The changelog absorbs four upstream decisions and calls all four "no-ops here by construction".
A no-op claim is the easy thing to assert and the easy thing to get wrong, so each was checked
against the upstream text and against what this document actually asserts.

| # | Absorbed decision | Claimed effect | Verified |
|---|---|---|---|
| (a) | FSPEC §5.2's vendored-module class renamed **Workflow members**, `PK-22` being a JSON manifest not a module | No-op: reading rule 3 gives class names to FSPEC, and PROP-PACK-5 asserts the *manifest's* `modules` array, not the class's cardinality | **Holds.** FSPEC §5.2's row now reads "Workflow members", `PK-20`…`PK-22`, "three vendored workflow members … two `.js` modules and a JSON manifest". PROP-PACK-5 (`:133`) asserts `modules` **equals** `{orchestrate-dev.js, orchestrate-queue.js}` — two members, correct, because the manifest is not listed inside its own `modules` array. The class's 3 and the array's 2 are different quantities over different objects; no contradiction |
| (b) | §5.2's CLI-entry and engine-module rows now anchor `PK-4`/`PK-4b` and `PK-5`…`PK-19`; CLI-entry note no longer calls its cardinality downstream-only | No-op: PROP-PACK-1/-2 already source member names from TSPEC §5.4 and classes/counts from FSPEC §5.2 | **Holds.** Both anchors present at HEAD; the CLI-entry note now reads "the class holds the **2** members counted below, and moving that number is an FSPEC edit", replacing the v0.6 text that deferred the decomposition question to TSPEC and contradicted the per-class count. PROP-PACK-1 names TSPEC §5.4 as the expected set's source and PROP-PACK-2 names FSPEC §5.2 for classes and counts — the split the anchors formalise |
| (c) | FSPEC v0.7 states AT-3.8a's count conjunct positively | No-op: PROP-PACK-2 already asserts against the transcribed `PK-*` list and forbids reading the tarball's length | **Holds, and the two texts now agree almost verbatim.** AT-3.8a: the conjunct "asserts the **transcribed** `PK-*` list's length … never asserted against the tarball's own length: a tautology once the first conjunct passes, and the self-derived expectation BR-8.1 forbids". PROP-PACK-2 (`:130`) says the same in the same order, including the tautology reasoning and the BR-8.1 citation |
| (d) | PLAN v0.8 retitles §2.1's AT-1.1 trace row to "refusal, plugin reported `not found`" | No-op: no task, batch or ownership-manifest change, so every carrier cell stands | **Holds.** `PLAN:203` reads `| AT-1.1 *(AC-1.1)* refusal, plugin reported `not found` | T15, T14, T46 |`. The `Carried by` cell is unchanged and still matches PROPERTIES §4's AT-1.1 row (`T15, T14, T46`). PLAN's own changelog confirms the id and the cell were untouched |

**The packing arithmetic was recomputed from §5.2's per-class counts**, since decision (b)
touched the CLI-entry cardinality and decision (a) renamed a class — either could have moved the
total that PROP-PACK-2 pins. Package manifest 1 + package README 1 + CLI entry 2 + engine
modules 15 (`PK-5`…`PK-19`) + install script 1 + workflow members 3 = **23**, and 24 once N-2's
licence record flips `PK-3` in. That is exactly what PROP-PACK-2 asserts and exactly what
AT-3.8a states. The rename did not move the total: FSPEC's count sentence changed "workflow
modules 3" to "workflow members 3", the noun only.

**The rename genuinely reaches nothing in this document.** I checked the phrase directly rather
than trusting the reading-rule argument. PROPERTIES uses "workflow modules" in three places
(`:166`, `:171`, `:173`, in PROP-PROV-2/-7/-9), but every one refers to the two canonical
`pdlc/workflows/` source modules — `orchestrate-dev.js` and `orchestrate-queue.js`, which really
are modules — and not to FSPEC §5.2's packed-set class. Different referent, correct noun,
untouched by the rename.

## 4. Findings

**No new findings.** The delta resolves the raised item, breaks nothing previously approved, and
the document remains a faithful compression of its upstream at HEAD.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| — | — | — | None raised this round | — |

Specifically checked for, and absent:

- **No property added, removed or re-scoped.** The diff is four insertions and three deletions:
  the Upstream cell, the version cell, one changelog row, and the PROP-LAUNCH-9 headline. The
  property count (89), the column sum (95) and the Unit count (74) are untouched, and no
  `Traces` or `Carried by` cell moved.
- **No new existing-code claim.** The edit introduces no file:line citation; PROP-LAUNCH-9's
  `handshake.test.js:110-118` anchor is unchanged from v0.3, where I verified it line by line.
  Nothing to re-verify, and nothing left unverified.
- **No contradiction introduced between a headline and its own conjuncts** — the specific
  hazard of editing a property's headline while leaving its conjunct list alone. Checked in §1.
- **No residue of the retired label.** The only surviving occurrence of the phrase in
  PROPERTIES is PROP-LAUNCH-5's "the exact literal `not found` **when none is installed**"
  (`:89`), which describes the *precondition state* — the same state FSPEC's own AT-1.1 Given
  clause calls "no plugin installed" — and does not name a message. Correct as written; the
  thing FSPEC retired was a message label, not the English description of the state.
- **No standing constraint or promoted decision contradicted.** Nothing in the delta touches
  `docs/_constraints/` or a promoted DECISIONS record.

**No erratum raised upstream this round.** The one I raised in round 2 (FSPEC's `"none"` triple
member) was fixed in FSPEC v0.7, as recorded in §2.

## 5. Carried-forward findings from round 2

My round-2 review approved with minor changes and left two non-gating findings open. This was an
alignment-only erratum round which correctly addressed no round-3 cross-review, so both remain
open by design. Recording their disposition so they are not lost rather than re-raising them:

| Round-2 finding | Severity | State at HEAD | Disposition |
|---|---|---|---|
| F-01 — PROP-LAUNCH-1 traces `AC-5.5` while asserting the `store.empty` branch, whereas AC-5.5's message id is the `version.pin-missing` branch already carried by PROP-VER-5; and §4's no-`AT-`-row sentence justifies it via AT-5.5 / AT-1.3 legs that PROP-LAUNCH-4 scoped to the two plugin-handshake states | Medium | **Still open.** `:85` still reads `AC-5.5, TSPEC §6.2` | Carried forward, not gating. A traceability-claim correction of roughly two cells; costs little now, reads as a coverage gap later |
| F-02 — PROP-LAUNCH-9's byte-identical-tree conjunct is a §3-class negative with no §3 catalogue row, though §3 says *every* negative appears there | Low | **Still open.** No `LAUNCH-9` row in §3 | Carried forward, not gating. Catalogue completeness, not oracle weakness — the conjunct itself is correctly written |

Neither blocks Phase I, and neither is a reason to withhold approval: both were non-gating when
raised and nothing since has raised their severity. Phase I's actual blockers remain the two
open TSPEC errata recorded in PLAN §7 (below-floor emission, fixture-machine home), which are
correctly routed and are not this document's defect.

## 6. Questions

None. My two round-2 questions (Q-01 on the five-state exit-code split, Q-02 on T32's ownership
manifest) were about material this round did not touch, and neither was answered nor needed to
be — an alignment-only round is the wrong place for them. They stand as asked.

## 7. Positive Observations

- **The item was re-filed at its true address instead of applied literally.** The raised text
  named PROP-LAUNCH-3 at `:85`, where the discriminator had already been fixed in v0.4. The
  obedient response was a no-op edit and a confirmation round claiming resolution; the correct
  response was to find where the stale label had actually migrated — PROP-LAUNCH-9's headline —
  and say so in the changelog. That is the harder of the two moves and the one that leaves no
  residue for a fourth round.
- **The `contains` / `equals` distinction was preserved through a headline rewrite.** FSPEC v0.7
  drew a line AT-1.1 did not carry at v0.6: the reason text *contains* the literal, the triple
  member *equals* it. Rewriting PROP-LAUNCH-9's headline to say the message equals `not found`
  would have been the natural paraphrase and would have contradicted its own conjunct (b) one
  line below. The edit tracks the upstream's verb, not just its literal.
- **Four absorbed decisions, four honest no-op arguments.** Each is argued from a stated
  mechanism — reading rule 3 for the class rename, the `PK-*` transcription for the anchors, the
  existing positive form for AT-3.8a, the untouched `Carried by` cell for PLAN's retitle —
  rather than asserted. All four survived independent checking, including the one place the
  argument could have failed quietly: the class holds three members while PROP-PACK-5 asserts a
  two-member `modules` array, which is correct only because the manifest is not inside its own
  array. The changelog names that distinction explicitly.
- **§4's set-equality is intact under an upstream that moved.** 35 ids each side, empty diff,
  including the irregular `AT-3.8a` / `AT-3.8b` / `AT-5.3b` members — and intact for the right
  reason, since FSPEC v0.7 added and removed no criterion.
- **The round is scoped as an erratum round should be.** No settled decision re-opened, no
  round-3 cross-review pre-emptively addressed, no scope expanded, and the two open non-gating
  findings from round 2 deliberately left alone rather than swept in.

## 8. Recommendation

**Approved**

The delta resolves the raised item without breaking anything previously approved. The document
is still a faithful compression of REQ v0.11, FSPEC v0.7, TSPEC v0.12, DECISIONS v0.3 and PLAN
v0.8 as they stand at HEAD: §4's set-equality against FSPEC §8 recomputes exactly, the packed-set
arithmetic recomputes to 23/24 from §5.2's per-class counts, every carrier cell still matches
PLAN §2.1, and no property was added, removed or re-scoped. No new findings, and the erratum I
raised in round 2 has been discharged upstream in FSPEC v0.7.

Two non-gating findings from round 2 remain open (§5) and are recorded rather than re-raised;
neither blocks Phase I, whose real blockers are the two TSPEC errata tracked in PLAN §7.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:d30577b08761916978cef2c73aa501ab4f427ff815dd762889194a939f1e7ddf
APPROVAL-HASH-NORMALIZED: sha256:c01a2df7e7f3dea9da47b718a4e13510a7b6d5c1f9a1108ce723978d78f5d5be
REVIEWED-COMMIT: 06e741625b25f8e74994f4e87db177e709491ec6

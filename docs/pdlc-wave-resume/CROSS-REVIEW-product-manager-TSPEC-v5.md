# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 5 (round 3 erratum — delta confirmation)
**Scope:** Local

## Scope

This is a **delta confirmation**, not a fresh review. I approved this TSPEC at v4 (`REVIEWED-COMMIT:
618589c22e6d5e20ed061158df001a65032ed2d6`, *Approved with minor changes*). Since then the document
has received exactly the round-3 erratum edit: four commits, `0a1ec695` → `b4a628b8`, +26/−7 lines
against `docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md`, and nothing else. No other file in
`docs/pdlc-wave-resume/` moved.

The question I answer is the narrow one: does that delta land the routed items without breaking what
I previously approved, and is the document still a faithful compression of its upstream **at HEAD**?

Upstream state at this dispatch, verified by hash against my v4 `UPSTREAM-STATE:` anchors — both are
**byte-identical to the versions I approved against**, so no upstream text moved under this document
between v4 and now:

| Upstream | sha256 (measured, HEAD worktree) | Same as at v4? |
|---|---|---|
| `REQ-pdlc-wave-resume.md` | `17e83bfc…9e8c79f` | yes |
| `FSPEC-pdlc-wave-resume.md` | `9a6be7b5…1552356e` | yes |

That does not make the re-grounding duty vacuous — it makes it *cheap*: the upstream clauses the new
bytes newly lean on (FSPEC BR-07, BR-02) still had to be read at HEAD, and were (§ *Upstream
Re-Grounding*). It also means the upstream-drift findings I recorded at v4 are still live in exactly
the form I recorded them, which is what the *Carried Findings* section is about.

## Routed Items — Landing Check

The nine routed bullets are six distinct defects (the off-by-one, the RT-1 size claim and the §2.4
catalogue were each raised by two or three roles). Each row below is checked against the bytes at
HEAD and, where the claim is about the world rather than about the document, against the world.

| # | Routed item | Landed? | Evidence I checked |
|---|---|---|---|
| 1 | §3.1 "Four of the seven reasons interpolate" is an off-by-one | **Partly** — see F-01 | §3.1 now reads "**Three** of the seven reasons interpolate … `feature-mismatch`, `head-unreachable` and `over-count` … carrying **four** interpolated values". The *three* is right; the *four* is not (F-01, Low). |
| 2 | §6.1 DEC-WVR-06 repeats the same "four of seven" count | **Partly** — same defect | The row now reads "three of the seven interpolate run-specific values (four values in total, §3.1)". The two figures are now consistent with each other, which was the routed complaint; both inherit F-01's residual. |
| 3 | §6.4 RT-1 "the single largest file in the repo" | **Yes** | RT-1 now reads "the largest tracked *source module* … (734,711 B) and the second-largest tracked file of any kind — the generated `pdlc/workflows/dist/pdlc-cli.mjs` is larger at 738,924 B". I re-ran the measurement: `git ls-tree -r -l 345ae358 \| sort -k4 -nr \| head -2` returns `pdlc-cli.mjs 738924` then `orchestrate-dev.js 734711`. Both byte counts are exact, and the citation now names the command and the commit, so the claim is falsifiable rather than atmospheric. |
| 4 | §2.4's announcement table omits the invalid-`startWave` notice; the catalogue is closed by omission | **Yes** | §2.4 now carries an explicit iff-rule ("a notice carries a provenance token **iff** the resume decision emits it about a *resolved start point*") plus a one-row exclusion table naming the notice and its reason. |
| 5 | §2.4's "three shipped assertions that do change" count is unsafe while the catalogue is open | **Yes** | The exclusion paragraph now derives the count from the rule: the excluded notice gains no suffix, so no assertion pinning it changes, so the count stays three. The count is now a consequence rather than an enumeration that a reader has to trust. |
| 6 | §3.2 duplicates a clause ("on the decision on the decision") | **Yes** | The sentence now reads "Keeping the field on the decision is what lets that line be rendered…". This was my own v4 F-08; it is closed. |
| 7 | DEC-WVR-02 (b) calls an ancestry seam "a runtime capability" | **Yes** | The alternative now says extraction "would add a `main()` parameter and one more adapter binding, not a host capability", and names the mechanism. Verified against the tree: the shipped probe calls `branchGuardTransport(gitFn)` (`orchestrate-dev.js` on `origin/main`, the `headCorroborated` helper), and `runtime-adapter.js` defines `rtGit` and binds `_git: rtGit`. So the seam does already exist and the corrected cost — plumbing, not capability — is the true one. |

### On item 4, which is the one with product content

This is the only routed item that changes what the document *decides* rather than what it *states*,
so it deserves more than a landed/not-landed tick. I checked the rule against FSPEC BR-07 at HEAD,
which reads: "Every run that starts anywhere other than the plan's first wave — outcomes (b) and (c)
— announces its provenance … and so does **a full run reached by an operator pointer** or by an
announced disregard cause."

The exclusion argument is that an invalid `implementation.startWave` is rejected by config
validation *before* any resume decision, the pointer is discarded, and the run that follows is
therefore not "reached by an operator pointer". I confirmed the shipped mechanism matches that
description: the notice is emitted from the `implParsed.invalidKeys` loop, which runs well above the
resume block, and the rejected key falls back to the default — after which the run's start point is
decided by the ledger path like any other automatic run. So the run genuinely is an ordinary
automatic run, and §2.4's claim that "whatever it announces afterwards is one of the six rows above"
is the correct product reading, not a convenient one. FSPEC BR-02's silent IG-6 case is named too,
which is the case an operator would most plausibly hit after a typo'd pointer.

The wording of the notice is quoted accurately as content: shipped emits
`` `Notice: implementation.${key} in ${MERGE_CONFIG_PATH} is not a valid value — using the default.` ``,
and §2.4 renders it with `startWave` and `{cfg}` substituted, which is the same sentence.

**Why I care about the rule rather than the row.** A catalogue closed by enumeration is one an
implementer can silently outgrow: add a seventh notice and nothing reds. A catalogue closed by an
iff-rule gives the implementer and the reviewer the same decision procedure, and it is the rule —
not the row — that keeps §2.4's "exactly three assertions change" honest. This is the shape I asked
for, and it is better than the shape I asked for.

## Upstream Re-Grounding (DEC-ERR-03)

My scope is this TSPEC measured against its upstream at HEAD, not against the item list. Both
upstream documents are byte-identical to the versions I approved against at v4, so the re-grounding
reduces to two questions: (a) do the clauses the **new** bytes lean on still say what the new bytes
say they say, and (b) do the upstream-drift findings I already recorded still stand?

**(a) Clauses the new bytes newly lean on.** Re-read at HEAD, not from my v4 notes:

| New text | Upstream clause it leans on | Faithful at HEAD? |
|---|---|---|
| §2.4 exclusion rule ("full run reached by an operator pointer does not describe it") | FSPEC BR-07 (`FSPEC:230`) | Yes — BR-07's operative phrase is quoted verbatim, and the negation is applied to a run whose pointer was discarded, which is a case BR-07's phrase genuinely does not reach. |
| §2.4 "including the silent IG-6 row when there is no record" | FSPEC BR-02, restated inside BR-07 ("A full run reached with no record at all (IG-6) is silent … and is not an unattributed start") | Yes — the exclusion does not create a new silent case; it routes into the silent case FSPEC already sanctions. |
| §3.1 / DEC-WVR-06 interpolation claim | FSPEC BR-02 reason catalogue and the shipped renderer sentences | Direction faithful, arithmetic not (F-01). |
| §6.1 DEC-WVR-02 (b) "existing `_git` seam … `rtGit` for both bundles" | Not an upstream claim — a tree claim, checked against the tree | Yes — verified in `runtime-adapter.js` (`rtGit` defined; `_git: rtGit` bound). |
| §6.4 RT-1 file sizes | Not an upstream claim — a repo claim | Yes — re-measured, both figures exact. |

Nothing in the delta cites REQ text, so no REQ clause is newly load-bearing; REQ C-3 is referenced by
DEC-WVR-02 only as the constraint the *rejected* alternative would have strained, and the corrected
wording weakens rather than strengthens that reliance, which is the safe direction.

**(b) The drift findings I recorded at v4 are unchanged.** This erratum round did not route them, so
they are inherited rather than delta, and they remain non-gating — but they do not disappear by not
being routed, and a reader of the TSPEC at HEAD still meets them. Re-verified at HEAD rather than
copied forward:

- §2.5's "One interaction the FSPEC does not state" and §6.3 item 3 still assert FSPEC has no clause
  on what an operator-pointed run writes. FSPEC §3.4 at HEAD carries exactly that clause ("An
  operator-pointed run records exactly as any other run does … in the same high-water form counted
  from the plan's first wave … bounded by BR-10 … No record content distinguishes the two
  provenances"). Still false; still cheap to fix. (F-02)
- §6.3 item 2 still quotes FSPEC OB-F1 as saying BL-04 was "discharged at FSPEC authoring". FSPEC's
  own erratum (v1.2) rewrote that; the quoted string is not at HEAD. (F-03)
- §6.3 items 1–2 still carry `REQ v1.5` / `REQ v1.6` labels; FSPEC is at `Version | 1.2` and
  re-grounded on REQ v1.7, and the REQ at HEAD is `Version | 1.7`. (F-05)
- §6.3 item 4's REQ OB-1 `.worktreeinclude` observation is closed in REQ v1.7. (F-06)

None of these four are new, none were routed to this round, and none of them change a decision — but
leaving them unmarked means the next reader re-opens questions the pipeline already closed, which is
the specific downstream cost DEC-ERR-01 tells me to score them on. They stay Medium/Low and
`inherited`, which is exactly the tag that routes them back to the owning phase instead of halting
here.

## Carried Findings (inherited, unchanged bytes)

Every v4 finding, with its status at HEAD. The one thing I want visible is that this round **closed
one of them outright** and left the rest untouched — which is correct behaviour for a bounded
erratum round, not a shortfall.

| v4 ID | Subject | Status after this delta | v5 ID |
|---|---|---|---|
| F-01 | §2.5 / §6.3 item 3 — "FSPEC does not state" is false at HEAD | Open, bytes untouched | F-02 |
| F-02 | §6.3 item 2 — OB-F1 quotation not at HEAD | Open, bytes untouched | F-03 |
| F-03 | §5.4 AT-05 lacks a write-side conjunct for operator-pointed runs | Open, bytes untouched (AT-05 unchanged) | F-04 |
| F-04 | §6.3 items 1–2 — stale REQ/FSPEC version labels | Open, bytes untouched | F-05 |
| F-05 | §6.3 item 4 — REQ OB-1 `.worktreeinclude` closed in REQ v1.7 | Open, bytes untouched | F-06 |
| F-06 | §5.8 / RT-7 — coverage floor placed on a per-run `postWaveCommand` key | Open, bytes untouched | F-07 |
| F-07 | §5.2 H-1 — over-strong "harness cannot express it" rationale | Open, bytes untouched | F-08 |
| F-08 | §3.2 duplicated clause | **Closed** by this delta | — |

Two of these deserve a sentence of product framing so the next round does not treat them as
bookkeeping:

**F-04 (was v4 F-03) is the only carried finding about behaviour.** FSPEC §3.4 now specifies that an
operator-pointed run records exactly as any other run does, and §2.5 ratifies that. No oracle
asserts it: AT-05 asserts the resume point, the provenance token on the operator banner, and that
the record was never *consulted* — nothing about what the run *writes*. An implementation that
suppresses the write while `explicitPointer` is true passes AT-05, AT-07, AT-15 and AT-18, and
silently removes the resume path from exactly the recovery scenario the feature exists to serve. The
cheapest close is still a write-side conjunct on AT-05 (a record exists after the run, and its
`lastGreenWave` is the plan-absolute number) plus an entry in §5.5's mutation list. That is one
clause in each of two subsections, and it is the finding I would most like to see land before PLAN
authoring — not because it gates this round, but because a PLAN authored against the current AT set
can satisfy every listed oracle and still ship the wrong product.

**F-07 (was v4 F-06) is the one that will bite an implementer.** §5.8 and RT-7 both place the 85%
per-file branch floor on "the last implementation wave's `postWaveCommand`". `postWaveCommand` is a
single per-run key in `IMPLEMENTATION_DEFAULTS`, applied to every wave: configuring it for the last
wave configures it for wave 1, so the slow coverage run lands on the first wave and a red halts
there. The obligation as written cannot be expressed in the shipped config surface. This is a PLAN
authoring concern rather than a TSPEC-blocking one, which is why it has stayed non-gating across
three rounds — but three rounds is long enough that I want it named again rather than quietly
carried.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §2.4's iff-rule says a notice carries a token iff the resume decision emits it "about a resolved start point". The `Notice: could not write/update the wave ledger …` message (shipped, §2.5 item 3) is emitted *after* a start point is resolved but is not *about* it — I read the rule as excluding it, and the exclusion table names only the invalid-pointer notice. Is that reading intended? If so, one clause ("about — not merely after — a resolved start point") would make it unambiguous; if not, the exclusion table has a second row. Not a finding: on either reading the shipped assertion count is unaffected, since the write-failure notice carries no whole-string assertion in the ledger `describe`. |
| Q-02 | Now that the exclusion is stated as a rule, is it worth one line in §5.4 or §5.7 pinning it — a property that every provenance-bearing announcement is one of the six rows? The rule is currently reviewable but not falsifiable, and it is the thing keeping the "exactly three assertions change" count honest. Raised for the te-review lens to weigh; I am not asking for a new AT on product grounds. |


## Positive Observations

- **The §2.4 fix is better than the finding asked for.** Three reviewers asked for a missing row;
  the author supplied a *rule* that closes the catalogue and derives the missing row from it, then
  named the excluded notice anyway so no reader has to run the derivation. That is the difference
  between patching a table and fixing the thing that let the table go stale.
- **The corrections are honest about their own arithmetic.** RT-1 now carries the measuring command
  and the commit (`git ls-tree -r -l origin/main` at `345ae358`) alongside both byte counts, so the
  claim can be re-checked in one line — which is exactly how I re-checked it. A claim that names its
  own falsifier is worth more than a claim that happens to be true.
- **DEC-WVR-02 (b) got stronger by getting weaker.** The corrected alternative no longer leans on a
  REQ C-3 capability argument it could not support; it now says the cost is plumbing and rejects the
  alternative on the smaller, true ground. A rejection that survives the correction of its own
  rationale is a rejection I trust more.
- **The revision-history row is a model erratum record.** §1's v1.2 row names each correction, its
  section, and the roles that raised it, and states outright that no decision was re-litigated and no
  scope changed. I verified that claim against the diff and it holds: +26/−7 lines, every one of
  them corrective.
- **Nothing I approved regressed.** The six announcement rows, the report-row table, the three named
  assertion replacements, the evaluation-order table and the §5.4 AT set are byte-identical to the
  version I approved at v4.

## Recommendation

**Approved with minor changes**

The delta lands six of six routed defects, resolves one of my own carried v4 findings (§3.2's
duplicated clause), and breaks nothing I previously approved. No High finding is open: F-01 is a
Low-severity residual on the same sentence this round corrected — the count of interpolated *values*
is five, not four, because `feature-mismatch` interpolates both the recorded feature name and this
run's feature name — and every other finding is inherited, unchanged in these bytes, and already
recorded at v4.

For the record, since this is a confirmation and not a revision request: nothing here needs to land
before this document moves on. F-01 is a one-clause correction whenever §3.1 is next touched; F-04
is the one I would prioritise ahead of PLAN authoring, on product grounds set out above.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | The corrected sentence undercounts interpolated values: five, not four — `feature-mismatch` renders `it records feature "X", not "Y"`, interpolating the recorded feature name **and** this run's feature name | §3.1 "Why codes and not strings" / §6.1 DEC-WVR-06 |
| F-02 | Medium | inherited | nonlocal | §2.5's "One interaction the FSPEC does not state" and §6.3 item 3 are false at HEAD — FSPEC §3.4 carries the operator-pointed-write clause (v4 F-01, bytes untouched) | §2.5 / §6.3 item 3 |
| F-03 | Medium | inherited | nonlocal | §6.3 item 2 quotes an OB-F1 string no longer at HEAD; FSPEC OB-F1 now records BL-04 as open and unmet (v4 F-02, bytes untouched) | §6.2 OB-F1 / §6.3 item 2 |
| F-04 | Medium | inherited | nonlocal | No oracle asserts what an operator-pointed run writes; a suppressed write passes AT-05, AT-07, AT-15 and AT-18 (v4 F-03, bytes untouched) | §5.4 AT-05 / §5.5 |
| F-05 | Low | inherited | nonlocal | §6.3 items 1–2 carry stale REQ/FSPEC version labels (REQ is v1.7, FSPEC v1.2 re-grounded on it) (v4 F-04, bytes untouched) | §6.3 items 1–2 |
| F-06 | Medium | inherited | nonlocal | §6.3 item 4's REQ OB-1 `.worktreeinclude` erratum is closed in REQ v1.7 (v4 F-05, bytes untouched) | §6.3 item 4 / §1.3 |
| F-07 | Medium | inherited | nonlocal | The 85% branch floor is placed on "the last wave's `postWaveCommand`", a per-run key that configures every wave (v4 F-06, bytes untouched) | §5.8 / §6.4 RT-7 |
| F-08 | Low | inherited | nonlocal | §5.2 H-1's rationale claims the shipped harness cannot express interleaving; caller-supplied doubles can (v4 F-07, bytes untouched) | §5.2 H-1 |

FINDING: Low | delta | local | §3.1 "Why codes and not strings" / §6.1 DEC-WVR-06 | The round fixed the "four of seven" off-by-one to "three of seven" — correct — but the replacement's own value count is off by one in the other direction. It says the three interpolating reasons carry "four interpolated values … (the recorded feature name, the recorded commit's short sha, and the recorded and actual wave counts)". The shipped `feature-mismatch` renderer is `it records feature "${recorded.feature}", not "${featureName}"` — two interpolations, not one — so the total is five: recorded feature, this run's feature, the recorded commit's short sha, the recorded wave count, the plan's wave count. The load-bearing conclusion is untouched (a set-equality assertion over rendered sentences would still be an assertion over fixture data), and no test, type or task depends on the figure — `ReasonContext` already carries both `feature` and `recordedFeature`, so §3.2 is correct as written. Scored Low on downstream cost per DEC-ERR-01. Fix: "carrying five interpolated values between them (the recorded feature name and this run's, the recorded commit's short sha, and the recorded and actual wave counts)", and the DEC-WVR-06 parenthetical to "five values in total, §3.1".
FINDING: Medium | inherited | nonlocal | §2.5 / §6.3 item 3 | Unchanged from v4 F-01. §2.5's paragraph is headed "One interaction the FSPEC does not state" and §6.3 item 3 raises it as an open erratum, but FSPEC §3.4 at HEAD states it: "An operator-pointed run records exactly as any other run does … in the same high-water form counted from the plan's first wave … bounded by BR-10 … No record content distinguishes the two provenances." That is TSPEC's own ratified position returned verbatim, so nothing in the design moves — the cost is that a reader believes a routed question is still open. Fix: restate §2.5's paragraph as a ratification of FSPEC §3.4 citing the clause, and mark §6.3 item 3 landed in FSPEC v1.2.
FINDING: Medium | inherited | nonlocal | §6.2 OB-F1 / §6.3 item 2 | Unchanged from v4 F-02. §6.3 item 2 asserts FSPEC OB-F1 says the REQ's §10 records BL-04 as "discharged at FSPEC authoring". That string is not at HEAD: OB-F1 now records BL-04 as open and unmet, matching the REQ. The inconsistency the item routed is closed, and with it §6.2 OB-F1's trailing re-raise justification. OB-F1's substance survives untouched and is not part of this finding: BL-04 is still unmet, AT-14 is still red in this tree, and no wave carrying AT-14 should be dispatched before the rebase.
FINDING: Medium | inherited | nonlocal | §5.4 AT-05 / §5.5 | Unchanged from v4 F-03. FSPEC §3.4 specifies what an operator-pointed run writes; no oracle asserts it. AT-05 asserts the resume point, the provenance token on the operator banner, and that the record was never consulted — nothing about the write. The write-side oracles (AT-15/AT-15a, AT-18) drive automatic-provenance runs, so a mutation that suppresses the write while `explicitPointer` is true leaves AT-05, AT-07, AT-15 and AT-18 green while removing resume from the recovery path the feature exists to serve — the position §2.5 rejects on product grounds. Fix: a write-side conjunct on AT-05 (after the run a record exists, and its `lastGreenWave` is the plan-absolute number) plus an entry in §5.5's mutation list. No new AT needed.
FINDING: Low | inherited | nonlocal | §6.3 items 1–2 | Unchanged from v4 F-04. Both items carry version labels this round did not refresh: item 1 says FSPEC "states it derives from REQ v1.5" and "the REQ at HEAD is v1.6"; FSPEC is at `Version | 1.2` with §1 re-grounded on REQ v1.7, and the REQ at HEAD is `Version | 1.7`. Item 1's substantive observation is moot as a result. Update or strike the labels whenever §6.3 is next touched; no passage depends on them.
FINDING: Medium | inherited | nonlocal | §6.3 item 4 / §1.3 | Unchanged from v4 F-05. §6.3 item 4 raises REQ OB-1's `.worktreeinclude` evidence as an open erratum; REQ v1.7 landed the consumer-local framing and §1.3's cross-reference is closed. The conclusion both documents draw — worktrees fail open — is unaffected. Fix: mark item 4 landed in REQ v1.7 and repoint §1.3 at REQ OB-1's current framing.
FINDING: Medium | inherited | nonlocal | §5.8 / §6.4 RT-7 | Unchanged from v4 F-06. The 85% per-file branch floor is named as an obligation on "the last implementation wave's `postWaveCommand`", but `postWaveCommand` is a single per-run key in `IMPLEMENTATION_DEFAULTS` applied to every wave: configuring the last wave configures wave 1, so the slow coverage run lands first and a red halts there. Non-gating, but it should close before PLAN authoring, or se-author will write a PLAN obligation the shipped config surface cannot express.
FINDING: Low | inherited | nonlocal | §5.2 H-1 | Unchanged from v4 F-07. H-1's justification rests on the shipped harness being unable to express interleaving between `runCommand` and `git` doubles, but the doubles are caller-supplied and a test can append both to one array with no harness change. Restate H-1 as a reuse/consistency choice — one ordered sink for the whole ledger block — rather than an expressiveness limit.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 5, "low": 3}

APPROVAL-HASH: sha256:458e9ec676a9d47ea8ddc76ae573e55e510ba4f2572ca00da2dc8256210f85c1
APPROVAL-HASH-NORMALIZED: sha256:7e613354d225f6c4d2ba36ce6fd2adb94b83f4d243c509c02f9ca236ff9d1f27
REVIEWED-COMMIT: b4a628b8bb691cbc805f6701435138461dd16869
UPSTREAM-STATE: REQ sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f
UPSTREAM-STATE: FSPEC sha256:9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e

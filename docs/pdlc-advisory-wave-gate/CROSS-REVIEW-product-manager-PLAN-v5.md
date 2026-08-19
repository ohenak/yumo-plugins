# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.2, unchanged)
**Date:** 2026-08-20
**Iteration:** 5
**Scope:** Upstream-cascade confirmation only. PLAN's own bytes did not move; TSPEC moved v1.7 → v1.8 (erratum round, Phase PR). The question answered is whether PLAN still holds against TSPEC as it now stands.
**Prior review:** `CROSS-REVIEW-product-manager-PLAN-v4.md` (Approved with minor changes; 0 High, 1 Medium, 1 Low — both still unlanded, PLAN unedited since)

## Cascade basis

PLAN unchanged since its v4 approval: `git log 350980b2..HEAD -- PLAN-pdlc-advisory-wave-gate.md` returns
no commits, and the file hashes to `sha256:bfb7dc37…` — the exact bytes the v4 anchor pinned.

Of the four upstream documents named in this dispatch, three are byte-identical to what v4 recorded:

| Upstream | v4 `UPSTREAM-STATE` | HEAD | Moved? |
|---|---|---|---|
| REQ | `a10396e8…` | `a10396e8…` | No |
| FSPEC | `82f74a2d…` | `82f74a2d…` | No |
| DECISIONS | `5145d90a…` | `5145d90a…` | No |
| TSPEC | `c0ee14a4…` | `79777fa6…` | **Yes** |

So the cascade has exactly one source. TSPEC moved by exactly one commit, `a349767b` *(docs(tspec): mark
ADVISORY_SEAM_PHASES module-private, name PROP-REC-07's entry oracle)* — 43 insertions, 3 deletions,
version header v1.7 → v1.8. I re-read that diff and then re-read the changed passages at HEAD rather
than trusting the diff's framing, per the confirmation contract: the question is whether PLAN is still a
faithful compression of the current text, not whether the routed item landed.

## What changed upstream, and what PLAN owes it

The round settled one item raised by se-review: §3.1's export list omitted `ADVISORY_SEAM_PHASES` while
the prose below it said the table gains an `A6` row. TSPEC resolved it **in the direction PROPERTIES had
already taken** rather than by widening the interface. Three things are now stated at HEAD that were not
stated at v1.7:

| TSPEC v1.8 says (HEAD) | PLAN's corresponding text | Still faithful? |
|---|---|---|
| `ADVISORY_SEAM_PHASES` is marked *(module-private)* in §3.1 and is "absent from the export list above **by construction, not by omission**" (`:531`–`:535`) | A6-05 lists `ADVISORY_SEAM_PHASES.A6 = {id: "I", outcome: "halted"}` among the constants it transcribes, under a header citing §3.1. It never says "export", and A6-02's constant-surface RED suite — which imports every other constant A6-05 touches — deliberately does **not** import this one. | **Yes, but silent.** PLAN asserts nothing false. It also no longer carries an instruction TSPEC now directs at Phase P by name. See F-03. |
| The behavioural oracle for the sixth row is the **written escalation entry**, not the constant: A6 entry reads phase `I` / outcome `halted`, A3–A5 keep `DOD`/`halted` and `PUB`/`halted`, and a seam absent from the table reads `unknown`/`unknown` as the negative control (`:540`–`:551`) | A6-17 owns `advisoryEscalationLog.test.js` and covers AC-6.2 / AC-6.4, asserting the entry "carries the root-cause class and the tier's fields". Pipeline state is one of the tier's fields. | **Yes.** The file home TSPEC names is the file PLAN already owns. |
| "PROPERTIES maps PROP-REC-07 onto that file's owning PLAN task (A6-17), so **no new file and no new owner is minted** by this reconciliation" (`:552`–`:554`) | PROPERTIES `:157` maps PROP-REC-07 → `advisoryEscalationLog.test.js` (A6-17); PLAN's manifest gives that file to A6-17 and to nothing else. | **Yes.** Verified on both sides. No batching, ownership, or dependency consequence. |

**No new obligation is created by this round beyond a wording one.** I checked the two places where a
cascade of this shape usually bites and neither does here:

- **No PLAN task adds `export` to this constant.** Grepping PLAN for `export` returns four hits, all of
  them the *opposite* claim — A6-00's note that `pathsCollide` is unexported, and the manifest rows
  recording that `ownedSetCovers`, `captureTreeSnapshot`/`restoreTreeSnapshot`, and `buildA6SeamOps`
  are "not exported". PLAN's standing habit is to keep the surface narrow, which is why TSPEC's
  correction found nothing to contradict.
- **PLAN carries no PROPERTIES-coverage table**, only the AT-coverage table (`:251`). There is therefore
  no set-equality obligation over PROP ids for the new PROP-REC-07 sentence to break. The AT set is
  untouched by this round — no AT was added, removed, or re-homed in `a349767b`.

Both v4 findings survive unchanged, because PLAN never moved and TSPEC still says at HEAD what made them
findings: §4.4 (`:1103`) and §5.1 (`:1221`) still require the new engine expectation to assert that
`advisory` "carries `enabled` and `waveBudgetPerRun`, the latter a non-negative integer", and §1.3
(`:232`) still reads "Eight shipped surfaces". They are carried below as `inherited`.

## Findings

No High. One new Medium introduced by this round's TSPEC edit; two findings inherited unlanded from v4.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-03 | Medium | Local | **TSPEC now issues an explicit instruction to Phase P that PLAN does not carry: transcribe the sixth row and leave the `const` unexported.** TSPEC `:553`–`:555` reads "Phase P should transcribe the sixth row and leave the `const` unexported; a PLAN task that adds `export` here is outside this TSPEC's interface surface." PLAN's A6-05 is headed "**GREEN** — constants and vocabularies (TSPEC §3.1)" and lists `ADVISORY_SEAM_PHASES.A6` in one sequence with `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS`, `ADVISORY_ROOT_CAUSES`, `A6_PROHIBITIONS` and `ADVISORY_DEFAULTS.waveBudgetPerRun` — every one of which §3.1 renders with a leading `export`, and every one of which A6-02's RED suite imports. The implementer of A6-05 reads a list of six siblings, opens §3.1, sees five of them exported, and has nothing in the task telling them the sixth is different in kind. Adding `export` is the natural completion, no test would catch it (A6-02 correctly does not import this constant), and TSPEC now names that outcome out of scope. **Fix:** in A6-05, mark the entry `` `ADVISORY_SEAM_PHASES.A6 = {id: "I", outcome: "halted"}` (module-private; the shipped bare `const` at `orchestrate-dev.js:3108` — add the row, do not add `export`) ``. One parenthetical, inside a cell PLAN already owns; no batching, ownership, dependency, or AT-coverage consequence. | TSPEC §3.1 (`:531`–`:535`, `:553`–`:555`); PROP-REC-07; AC-6.2 |
| F-01 | Medium | Local | *(inherited from v4, unlanded — PLAN unedited since.)* **A6-04's red-test assertion is narrower than the expectation TSPEC specifies: `enabled` is missing from the asserted key set.** A6-04 states the new expectation as the example config's `advisory` section parsing and carrying `waveBudgetPerRun`, a non-negative integer (TSPEC §4.4, §5.1) — one key. TSPEC at HEAD says two, in both places (`:1103`–`:1104`, `:1221`). A6-06 correctly ships the **whole** `advisory` section because `{"enabled": true, "waveBudgetPerRun": 0}` is E-33's "keep the tier on, keep A6 off" affordance and the example block is its sole teaching site — but the new test is its sole guard, and a guard that asserts only `waveBudgetPerRun` stays green if a later edit drops `enabled`. **Fix:** in A6-04, state the assertion as "the `advisory` section parses and carries `enabled` and `waveBudgetPerRun`, the latter a non-negative integer", matching §4.4 and §5.1 verbatim. | E-33; AC-1.4; TSPEC §4.4, §5.1 |
| F-02 | Low | Local | *(inherited from v4, unlanded — PLAN unedited since.)* **A6-03's "the six collateral transcription surfaces §1.3 names" is stale: §1.3 now names eight** (`TSPEC:232`). Cosmetic only — the count-word is borrowed cardinality, and A6-03's own enumeration in the next clause is explicit, correct and complete (it names the four bare row-count sites including `advisoryHarvest.test.js:726`). No implementer loses work; a reader who follows the pointer and counts eight cannot tell whether the sentence is wrong or two surfaces are missing from the task. **Fix:** drop the cardinality, or re-scope it ("the four collateral transcription rows among §1.3's eight surfaces"). | PLAN (A6-03); TSPEC §1.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Non-blocking, for whoever lands F-03. TSPEC's negative control — "a fixture whose seam is absent from the table" reading `unknown`/`unknown` — is the one part of PROP-REC-07's oracle that needs a fixture PLAN does not currently describe anywhere. A6-17's cell names the root-cause class, durability, and the failed-write arm, but no synthetic absent seam. PROPERTIES carries it and PLAN has no PROP-coverage table to keep in sync, so this is not a completeness gap. It is worth one clause in A6-17 anyway, so the implementer does not discover the fixture requirement only when reading PROPERTIES mid-batch-11. |
| Q-02 | Carried unchanged from v3 and v4, still non-blocking: the `enabled: true` + `waveBudgetPerRun: 0` affordance remains discoverable only if an operator opens the example and infers the pairing. No REQ or FSPEC row asks for more, so it is not a finding — but it stays a good candidate for a one-line note in the feature's LEARNINGS, so a future operator-documentation pass picks it up. |

## Positive Observations

- **PROPERTIES was right first, and TSPEC deferred to it rather than to its own table.** The tempting fix
  for a constant missing from an export list is to add it to the export list. TSPEC instead reasoned that
  exporting would exist only to let a unit test import the constant, and that asserting "a frozen literal
  contains the row it was just edited to contain restates the diff rather than testing behaviour"
  (`:538`–`:539`). That is the correct product call — the user-visible thing is the escalation entry an
  operator reads, not the shape of a module's exports — and it means the round *narrowed* the delivered
  interface instead of widening it. Nothing downstream had to move.
- **PLAN's export discipline is what made this cascade cheap.** Four of PLAN's four `export` mentions are
  records of things deliberately *not* exported, with the reasoning attached each time (A6-00 on
  `pathsCollide`, and the manifest rows on `ownedSetCovers`, the snapshot pair, and `buildA6SeamOps`). A
  PLAN with the opposite habit would have had a task to unwind here. This one had nothing to correct —
  only something to say out loud, which is all F-03 asks for.
- **The file-home claim checks out on both sides.** TSPEC asserts that PROPERTIES maps PROP-REC-07 onto
  A6-17 and that no new file or owner is minted. I verified rather than accepted it: PROPERTIES `:157`
  names `advisoryEscalationLog.test.js` (A6-17), PLAN's manifest gives that file to A6-17 alone, and
  §5.1's edited-files list already carried it for AC-6.2. Three independent sources, one answer.
- **Fifth round, and I still have not found a PLAN citation that does not verify.** Every anchor I
  re-ran this round lands at HEAD. The one anchor gap this round surfaces is an *absence* — PLAN gives
  `ADVISORY_SEAM_PHASES` no line anchor at all, which is why nothing went stale when TSPEC pinned it to
  `orchestrate-dev.js:3108`.

## Recommendation

**Approved with minor changes** — the prior approval still holds against TSPEC v1.8. PLAN remains a
faithful compression of TSPEC as it now stands.

This was a one-commit, single-item cascade, and it moved TSPEC toward PLAN rather than away from it. Of
the three things v1.8 newly states, two require nothing of PLAN because PLAN and PROPERTIES were already
built that way — the oracle's file home is the file A6-17 already owns, and no new owner is minted — and
the third contradicts nothing PLAN says, because no PLAN task ever proposed exporting the constant.

What is owed is one parenthetical: **A6-05 should say the sixth row lands on a module-private `const` and
must not gain `export`** (F-03, Medium), because TSPEC now directs that instruction at Phase P by name and
because A6-05 currently presents the constant in a list of five exported siblings with nothing marking it
apart. Alongside it, the two v4 findings remain unlanded and unchanged: **A6-04's assertion should name
`enabled` as well as `waveBudgetPerRun`** (F-01, Medium), and **A6-03's borrowed "six" should track §1.3's
eight** (F-02, Low).

All three are single-clause edits to task prose. None touches batching, ownership, dependencies, or the
AT-coverage table, and none blocks Phase I from starting. They should ride the next edit that opens PLAN
for any reason. If none occurs, shipping as-is costs a guard on `enabled` in the engine example, a stale
count-word, and a small chance that an implementer widens a module's export surface by one constant that
TSPEC has now said out loud it does not want widened.

**Note on dispatch (repeated from v4, still unaddressed):** the completeness-gate headings supplied in the
instructions (`## Overview` / `## Batches` / `## Dependencies` / `## Verification`) are PLAN's headings,
not a cross-review's. I have again written the file in the format this reviewer role defines. Flagging in
case the gate is pointed at cross-review files by mistake — this is now the second consecutive round it
has appeared, which makes it a `Process` observation rather than a one-off.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

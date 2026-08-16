# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.9)
**Date:** 2026-08-16
**Iteration:** 7

**Scope:** Delta re-review of v6 (`REVIEWED-COMMIT: 3a5ca4b6`). Decision freeze in
force: only a defect this delta introduced, or a load-bearing claim false at HEAD,
can block. Everything else is recorded, not gating.

## 1. What the delta is

`git diff 3a5ca4b6..HEAD -- …/PROPERTIES-…md` — 21 insertions, 3 deletions across
three hunks, landed as `24959eaa` (PROP-PUB-7), `37ef9401` (§5 declared gap 4) and
`81920109` (Upstream cell + v0.9 changelog row).

| Hunk | Change | Prior finding it closes |
|---|---|---|
| `:5`, `:12`, `:26` | Upstream cell re-pinned to REQ v0.12, FSPEC v0.8, TSPEC v0.14, DECISIONS v0.3, PLAN v0.18; Version cell `0.8 → 0.9`; v0.9 changelog row records the DEC-ERR-01 re-grounding | **F-01 (v4, v5, v6)** |
| `:160` | PROP-PUB-7 widened from `publish.yml` ≡ `pr-tests.yml` to `publish.yml`'s `gate` ≡ **union of every PR-gate file's gate jobs**; traces gain BR-7.7 and C-6 | — (new absorption) |
| `:384-399` | §5 gains **declared gap 4** — BR-7.1's trigger-derived file scope and per-file rendered-alphabet equality ship in T17's carrier but no §2 row names them | — (new disclosure) |

## 2. Prior findings, re-checked at HEAD

| ID (v6) | Was | Now |
|---|---|---|
| **F-01** Upstream cell pinned PLAN at v0.8 while PLAN's header read v0.15 | Low | **Closed, and closed the expensive way.** All five pins now match HEAD headers exactly, verified one by one: REQ `0.12` (`REQ:18`), FSPEC `0.8` (`FSPEC:16`), TSPEC `0.14` (`TSPEC:12`), DECISIONS `0.3` (`DECISIONS:12`), PLAN `0.18` (`PLAN:12`) |

The v6 review predicted the re-grounding would be a no-op. It was not — it found one
real absorption (PROP-PUB-7) and one real disclosure gap (gap 4). That is DEC-ERR-01
working as designed, and it is worth saying plainly: the Low finding three rounds
running was carrying more weight than either reviewer credited it with.

## 3. New-issue scan over the delta, grounded in code

**PROP-PUB-7's new premise is true at HEAD, and it is true of the code, not only of
the spec.** BR-7.7 exists in FSPEC v0.8 (`FSPEC:548`) in exactly the form the property
transcribes — the tag gate must set-equal the union of every PR-gate file's gate-job
run commands, not `pr-tests.yml`'s alone — and cites C-6, which is defined in REQ
(`REQ:239`, "Publishing is gated on the same evidence a PR is"). Both trace targets
resolve; neither is a nonexistent authority.

The shipped carrier is where the property now points and asserts what the property now
says. `pdlc/engine/__tests__/ci-arrangement.test.js:666-701` builds `expectedCommands`
by iterating **every** entry of `PR_GATE_FILES` (`:686`) and set-equals it against
`publish.yml`'s `gate` block, with the failure message naming the union explicitly
(`:697`). The union is real in the workflow too, not just in the test's intent:
`publish.yml`'s gate job carries the fixture-machine legs (`:170-176`, launcher
real-spawn and `scripts/fixture-machine.mjs`) beside the five `pr-tests.yml` commands.
So the changelog's claim that this closes a **document-to-code gap and not a code gap**
is checkable and checks out.

**Declared gap 4's claims are each verifiable, including the negative one.** The
trigger-derived membership check exists (`ci-arrangement.test.js:552-564`, `PR_GATE_FILES`
keys set-equal the `pull_request`-triggered files, `publish.yml` excluded for being
tag-triggered); the per-file rendered-alphabet equality exists (`:566-582`). The gap's
load-bearing negative — *no §2 row names them* — I checked rather than accepted:
PROP-PUB-6 remains `pr-tests.yml`-scoped and PROP-GATE-5 remains Machine-level on row 6,
so the general offline rule is indeed carrier-less in §2 while being red-able in code.
Recording it as an unnamed carrier rather than an untested rule is the accurate framing.

**Set-equality re-verified mechanically, not asserted.** Extracted every `AT-` id from
PROPERTIES and from PLAN v0.18 and diffed the sets: **35 on each side, symmetric
difference empty**, unchanged across PLAN's v0.8 → v0.18 travel. Same method on the other
three transcription surfaces the v0.9 changelog claims to have checked: every `AC-` id
PROPERTIES cites exists in REQ v0.12, every `BR-` id exists in FSPEC v0.8, every `T\d\d`
task id is known to PLAN v0.18 — all three `comm -23` outputs empty. The changelog
describes a check that was actually performed and that I reproduce independently.

**Delta hazards against this round's bar.** No implementation echo entered: PROP-PUB-7's
expected set is FSPEC's rule transcribed, not `ci-arrangement.test.js`'s computed set
imported. No absence-only oracle: the property's negative ("containment would not catch a
*removed* command") sits inside a set-equality that states what must hold. No enumerated
contract lost its set-equality — the widening moved PROP-PUB-7 *toward* full enumeration,
from two files to the trigger-derived set. §7's counts (89 properties, column sum 95,
Unit 74) are untouched, correctly: no property was added, and gap 4 exists precisely
because minting `PROP-PUB-11` would have moved them under freeze.

## 4. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Low | Local | Gap 4 quotes the carrier's test title inside quotation marks, but not verbatim: it reads `"ci arrangement — rendered alphabet across PR-gate files equals §5.1 (BR-7.1)"` (`:389-390`) where the shipped title is `"ci arrangement — the rendered alphabet across all PR-gate files equals §5.1 (BR-7.1)"` (`ci-arrangement.test.js:566`). Two dropped words, and a `grep -F` on the quoted string returns nothing — the one operation a reader meeting this paragraph will perform. The v0.9 changelog quotes the union carrier the same loose way (*"publish.yml's gate job must set-equal EVERY PR-gate job's commands"*), which is the file's section comment at `:659`, not the assertion message at `:697`. Nothing derived is wrong; both tests exist and assert what the prose says they assert. Fix is to paste both strings verbatim next time the document is opened | §5 gap 4 (`:389`), changelog `:26` |

DEFERRED: Paste gap 4's and the changelog's carrier test titles verbatim from `ci-arrangement.test.js:566` and `:697` so `grep -F` finds them — F-01, next time the document is opened.
DEFERRED: PROP-GATE-5's carrier cell should name `ci-arrangement.test.js` (T17) beside T50 — PM round-6 F-10, already named as part of gap 4's closing edit.
DEFERRED: PROP-GATE-5's "sees six workflows where it saw five" says *workflows* where `statusCheckRollup` returns *checks*; pre-existing wording, not delta-introduced.

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | *(Carried from rounds 5 and 6, still open, still not a defect here.)* The TSPEC errata this document is explicitly conditional on — `node.below-floor`'s registration (§9 Q-1, PROP-CAT-2 / PROP-CAT-4) and the fixture-machine legs' home (§9 Q-2, PROP-GATE-5) — gate T45 and T50. Sequencing question for the orchestrator, not a document defect: the properties state the conditionality correctly either way |
| Q-02 | Gap 4 names `PROP-PUB-11` on T17 as the closing edit once the freeze lifts. Is there a durable home for that commitment outside this document's §5 — the queue, or PLAN's deferral ledger — so it is not lost if PROPERTIES is never reopened? |

## 6. Positive Observations

- **The re-grounding was done in the right order, and the document says so.** The v0.9
  changelog records the mechanical verification (`AT-`/`AC-`/`BR-`/task-id set checks)
  as having run **before** the pin bump, on the stated ground that a pin bump skipping
  the check is the exact failure the pin prevents. I re-ran all four checks independently
  and they come back the same. A changelog that describes a verification you can
  reproduce is worth more than one that asserts a conclusion.
- **The absorption was found by the process, not by luck.** PROP-PUB-7 had carried a
  two-file premise since it was written; nothing in this feature's diff would have
  surfaced it, because the *code* was already correct. It took walking FSPEC v0.7 → v0.8
  to find that the document had fallen behind its own carrier. This is the case
  DEC-ERR-01 exists for, and it argues against treating a stale version pin as cosmetic.
- **Gap 4 declines the tempting fix and explains why.** Widening PROP-PUB-6 to cover
  BR-7.1's per-file equality would have closed the gap in one cell — and destroyed
  PROP-GATE-5's ability to discriminate row 6. The document states that trade-off,
  names the correct fix (a new property, not a widened one), and defers it for a
  freeze reason rather than a difficulty reason. A reader inheriting this knows both
  what is missing and why it is still missing.
- **The gap is disclosed as an unnamed carrier, not as an untested rule.** That
  distinction is exactly right at HEAD — both assertions are shipped and red-able — and
  it stops a DoD reader from reading §5 as a coverage hole.

## 7. Recommendation

**Approved with minor changes**

The delta closes the Low that stood open for three rounds, and closes it by doing the
work the pin exists to trigger rather than by editing five characters. PROP-PUB-7's new
union premise is true of FSPEC v0.8 (`FSPEC:548`), of C-6 (`REQ:239`) and of the shipped
carrier and workflow (`ci-arrangement.test.js:686,697`; `publish.yml:170-176`). Declared
gap 4's positive and negative claims both check out against code. §4's 35-row
set-equality against PLAN §2.1 is re-verified empty in both directions despite PLAN
travelling v0.8 → v0.18, and the three other id transcription surfaces are clean. No
implementation echo, no absence-only oracle, no enumeration weakened; §7's counts stand
because no property moved. One Low remains — two quoted test titles are paraphrases
rather than transcriptions, which costs a reader one failed `grep` and nothing else. No
High open. Nothing here meets the freeze bar for blocking.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:f807d0684f79c65931da217c7f2258fd3310cf2576746bfa52ad2714e0c56759
APPROVAL-HASH-NORMALIZED: sha256:0a7fe32c2cffddce234f082eeb493c9c62e25ca05e7fabc1924027d09ea898ea
REVIEWED-COMMIT: 81920109a4e3b722f00bd8a3cbb0e50d4e4de6c9
UPSTREAM-STATE: REQ sha256:44d0e18836f534cb68444f6e5a0b26eebf3d2aafe7f7630ce1f38fed78b1d00f
UPSTREAM-STATE: FSPEC sha256:5ffc38a7f6ff1b19d31250a7d54dce32c3498941723cfb3f35102d2004027b06
UPSTREAM-STATE: TSPEC sha256:440711317830ec2cc111e58be51a5610ba174906eb1cd6c206e68e508b703833
UPSTREAM-STATE: DECISIONS sha256:05d305f8699fa494c368ddd9e383ab3b34f4fd02a139ae99914886d53c5c7f66
UPSTREAM-STATE: PLAN sha256:d2c3356a750662030b8a8d4a5bf2e767d115af6702bb781981b902c0eba16ae6

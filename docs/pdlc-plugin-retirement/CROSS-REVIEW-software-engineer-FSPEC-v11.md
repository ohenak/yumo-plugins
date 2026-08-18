# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.8)
**Date:** 2026-08-18
**Iteration:** 11 (delta confirmation — errata 3 and 5)

## Scope

Delta confirmation, not a re-review. The FSPEC was approved at `REVIEWED-COMMIT: fe306b11`
(v0.7) and re-confirmed against REQ v0.12 in SE v10. Three commits since — `8c5847a6`,
`76e40b98`, `1eccc97c` — carry the erratum edit and lift the document to v0.8. The one
question answered here: **does this delta resolve without breaking anything previously
approved?** Landing the routed items is necessary, not sufficient; the whole FSPEC is
re-measured against REQ v0.12 and the measured baseline at HEAD (DEC-ERR-03).

Answer: **no.** The class-10 correction is technically right — the reduced build step still
emits the probe CLI into `pdlc/workflows/dist/`, so `postWaveCommand` and `postWavePathspecs`
are still live values — but it landed **downstream only**. REQ C-5 (`REQ:229`), REQ AC-1.2's
term rationale (`REQ:319`) and the measured baseline's M-11h row
(`docs/_constraints/pdlc-retirement-baseline.md:63`) all still say the two values retire, and
§7.2 (`FSPEC:836`–`:837`) still asserts no criterion was relaxed. That is one High: the
contract chain now says two opposite things about the same commit class and no upstream
erratum is open to close the gap. The erratum-3 disposition itself lands cleanly.

## Delta examined

`git diff 638413b4..HEAD -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` —
seven hunks:

| # | Location | Change |
|---|---|---|
| 1 | `FSPEC:9`–`:16` | Upstream pin REQ v0.11 → **v0.12**; cross-review list compressed; version 0.7 → **0.8** |
| 2 | `FSPEC:162` | Class 10 restated as **prose only**; values stay; preflight assertions survive, `postWavePathspecs` tightened to set-equality |
| 3 | `FSPEC:163` | Class 11: `consolidate-learnings/SKILL.md`'s bundle reference **deleted, not rewritten**; points at §3.3 step 4 |
| 4 | `FSPEC:167`–`:170` | New **Held classes** note: class 6 on erratum 6; classes 7–12 on erratum 3, released |
| 5 | `FSPEC:192`–`:199` | §3.3 step 4 rewritten; **capability disposition** for `consolidate-learnings` decided |
| 6 | `FSPEC:347`–`:348` | §4.2 L-2's `postWavePathspecs` rationale restated as prose-only |
| 7 | `FSPEC:836`, `:847`–`:854` | §7.2 lead-in re-grounded to v0.12; §7.3 lead-in and two new erratum rows; erratum-9 row gains the SE v9 F-01 conjunct |

No other bytes moved. Everything outside these hunks is the text approved at `fe306b11`,
re-read here against the current upstream rather than re-litigated.

## Routed-item ledger

| Routed item | Landed? | Where |
|---|---|---|
| Class 11 — bundle reference **deleted**, not rewritten; capability disposition stated (erratum 3) | **Yes** | `FSPEC:163`, `FSPEC:192`–`:199` |
| Class 10 — values stay, prose only (erratum 5) | **Yes**, downstream only | `FSPEC:162`; upstream unchanged — see F-01 |
| `consolidationPreflight.test.js` assertion tightened containment → set-equality | **Yes** | `FSPEC:162`; matches HEAD's one-element `postWavePathspecs` (`.claude/pdlc.config.example.json`; `consolidationPreflight.test.js:205`–`:209`) |
| Held-class set recorded over §3.1's thirteen classes | **Yes**, wider than TSPEC T-5 asked | `FSPEC:167`–`:170`: class 6 on erratum 6, classes 7–12 on erratum 3. TSPEC T-5 (`TSPEC:1376`) names classes 7 and 11; the transitive closure through §3.1's ordering is 8, 9, 10 and 12 as well, so 7–12 is the correct closure |

All four routed items are on disk. The High below is not a missing routed item; it is what
landing item 2 in this document alone did to the chain above it.

## Findings

FINDING: High | delta | local | §3.1 class 10 (`FSPEC:162`), §4.2 L-2 (`FSPEC:347`), §7.2 lead-in (`FSPEC:836`) | Erratum 5 landed downstream only: REQ C-5, REQ AC-1.2's rationale and baseline M-11h still retire the values this FSPEC now keeps, and no upstream erratum is open
FINDING: Medium | delta | local | §7.3 lead-in (`FSPEC:847`–`:848`) | "no other erratum edits this document" is false at HEAD — TSPEC §6.1 erratum 10 (`TSPEC:1335`) requests an AT-1.3 / BR-SWEEP-6 edit and predates this round
FINDING: Medium | delta | local | §3.3 step 4 (`FSPEC:192`–`:199`) | "no host survives for a rewrite to name" is true of execution hosts but not of the module: `consolidate-learnings.js` survives, and SKILL.md's sentence names it as the performer of the pass
FINDING: Medium | delta | nonlocal | §2 (`FSPEC:75`), O-C (`FSPEC:815`) | Header now pins REQ v0.12 while two body passages still pin v0.11 — the doc contradicts itself about which upstream it traces
FINDING: Low | delta | local | Held classes (`FSPEC:167`–`:170`) | Class 6's own hold transitively holds 7–12 through §3.1's ordering; "releasing that hold" reads as though 7–12 are landable now
FINDING: Low | delta | local | §0 header (`FSPEC:11`) | Compressed cross-review list stops at SE v9 / TE v9; SE v10 and TE v10 exist on this branch

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Cross-Feature | *(delta, local.)* **The class-10 correction contradicts its own upstream, and §7.2 denies it.** `FSPEC:162` now reads "**values stay** (they still regenerate the surviving probe CLI)"; `FSPEC:347`–`:348` restates L-2's rationale as "M-11h is prose-only — the values … all survive". I verified the substance and it is right: HEAD's `postWaveCommand` is `node pdlc/workflows/build-runtime.mjs` and `postWavePathspecs` is `["pdlc/workflows/dist/"]` (`.claude/pdlc.config.example.json`), M-7 is *reduced* not deleted, and TSPEC TT-5 (`TSPEC:742`) pins the reduced builder emitting `pdlc/workflows/dist/pdlc-cli.mjs` — so both values still name live outputs. The defect is that the correction stopped at this document. Upstream still says the opposite in three places: REQ C-5 enumerates "the wave-gate config **values** (M-11h — the configured pathspec retires…)" among the removals that each land as their own commit (`REQ:229`); REQ AC-1.2's term rationale rests on "M-11h retires a *value*… The retired wave-gate values are caught where the partition already catches them" (`REQ:319`–`:321`); the measured baseline's M-11h row names both values as "Retired *values*" together with the two literals at `consolidationPreflight.test.js:205`–`:208` (`docs/_constraints/pdlc-retirement-baseline.md:63`), and REQ's own 0.8 changelog records that scoping as a deliberate round-4 decision (`REQ:33`–`:35`). An implementer reading REQ retires the values; one reading FSPEC keeps them and tightens the assertion that pins them. On top of that, §7.2's lead-in still states "No criterion was relaxed in the FSPEC to work around any of them" (`FSPEC:836`–`:837`) and §7.3 records the erratum as fully "accepted" — so nothing in the document signals that an upstream criterion is now contradicted. **Fix (cheap, no behaviour changes):** raise this as an upstream erratum against REQ C-5 / AC-1.2's rationale and baseline M-11h — the values survive because the reduced build step still emits M-9 under O-3 — and record it in §7.2 as *open*, not closed; class 10 keeps its landed prose-only text meanwhile. Tagged Cross-Feature: the baseline is a `docs/_constraints/` file two other documents read. |
| F-02 | Medium | Local | *(delta, local.)* §7.3's new lead-in says "Three TSPEC §6.1 errata are folded in here (v0.8); **no other erratum edits this document**" (`FSPEC:847`–`:848`). TSPEC §6.1 item 10 (`TSPEC:1335`–`:1357`) is an erratum against **this** document's AT-1.3 / BR-SWEEP-6 swept-surface limb, raised at `34215001` on 2026-08-17 — before all three commits of this round. It carries an explicit requested edit (restate the limb as *every surviving `*.test.js` module under `pdlc/workflows/__tests__/` the sweep edits at all, plus M-8's deleted modules*). Nothing approved is lost while it is pending — the erratum says so itself, and §5.5 already works to the wider superset — but a ledger that asserts completeness is exactly how a routed item stops being tracked. Add an open row for erratum 10, or narrow the sentence to "no other erratum is folded in **here**". |
| F-03 | Medium | Local | *(delta, local.)* The erratum-3 disposition rests on "after class 7 no host survives for a rewrite to name" (`FSPEC:194`). True of *execution* hosts — `consolidate-learnings.js` is ESM exports only, with no CLI entry, so the bundle was its only runnable host. Not true of the module: TSPEC's inventory row says it "survives as a module; **loses its only execution host**" (`TSPEC:70`), and the SKILL.md sentence being disposed names both — "The pass is performed in code by `pdlc/workflows/consolidate-learnings.js` (shipped as `pdlc/workflows/dist/consolidate-learnings.bundle.js`)" (`pdlc/skills/consolidate-learnings/SKILL.md:10`–`:11`) — with the whole body framed as "the **contract that** [code] implements". Two implementations satisfy the landed text: delete the parenthetical only (which *is* a rewrite naming the surviving module, contradicting the stated reason, and leaves a sentence claiming code performs a pass nothing invokes), or delete the sentence (leaving the contract body with no named performer). One outcome clause settles it at FSPEC altitude without specifying text: after the sweep, SKILL.md states exactly one true performer of the pass and names no host that nothing invokes (REQ G-3). |
| F-04 | Medium | Local | *(delta, nonlocal.)* The v10-deferred version bump landed in two of the three places I named: `FSPEC:9` and §7.2's lead-in now read v0.12, but §2's traceability preamble still reads "Every behaviour below traces to `REQ-pdlc-plugin-retirement.md` v0.11" (`FSPEC:75`) and O-C still reads "REQ v0.11 settles the manifest branch" (`FSPEC:815`). `FSPEC:800` ("REQ AC-5.2's enumerated allowed-difference set at v0.11") is the same class. Nothing behavioural changed between v0.11 and v0.12 for these passages, so this is a label sweep, not a re-grounding — but the document now names two different upstream versions as the one it traces. |
| F-05 | Low | Local | *(delta, local.)* The held-class note (`FSPEC:167`–`:170`) records classes 7–12 as released by erratum 3's disposition while class 6 remains held on erratum 6. Class 7's ordering obligation is "after class 6" (`FSPEC:159`) and 8–12 chain off class 7, so 7–12 are still blocked transitively. One clause — "classes 7–12 remain blocked behind class 6's hold until erratum 6 is disposed" — keeps the note from reading as a green light. |
| F-06 | Low | Local | *(delta, local.)* The compressed cross-review list (`FSPEC:11`) reads "SE v1, v3–v5, v7–v9; TE v1–v9". `CROSS-REVIEW-software-engineer-FSPEC-v10.md` and `CROSS-REVIEW-test-engineer-FSPEC-v10.md` both exist on this branch, and this file makes v11. Compression is a good change; the ranges just need to keep up. |

## Questions

| ID | Question |
|----|---------|
| Q-01 | With class 10 reduced to prose plus one assertion tightening, is it still a **deletion** class under REQ C-5's "each removal lands as its own commit"? If nothing is removed, C-5's enumerated wave-gate removal has no commit, and class 10's ordering obligation ("after class 7, the edited prose names deleted outputs") is the only thing still tying it to the sweep. Answering this is part of F-01's upstream erratum, not a separate ask. |
| Q-02 | §3.3 step 4 says consolidation stays "operator-invocable in session as `/pdlc:consolidate-learnings`". After the bundle retires, is the pass performed by the agent following SKILL.md's contract, or is `consolidate-learnings.js` still expected to run somehow? The six surviving `consolidation*.test.js` modules keep asserting over the module (`TSPEC:70`), so the module is not dead code — but nothing invokes it in session. F-03's clause would answer this; flagging it here because the *tests* are the reason the module survives, which is a different justification than the skill. |

## Positive Observations

- **The erratum-5 substance is correct and I verified it against HEAD, not against the doc.**
  `.claude/pdlc.config.example.json` carries exactly `node pdlc/workflows/build-runtime.mjs`
  and `["pdlc/workflows/dist/"]`; `consolidationPreflight.test.js:208`–`:209` asserts them with
  `toContain` and `toBe`; TSPEC TT-5 (`TSPEC:742`) pins the reduced builder's emission at
  `pdlc/workflows/dist/pdlc-cli.mjs`. The values do keep naming live outputs after the sweep, and
  AT-1.1's `dist/`-survives branch is the one TSPEC took. The correction is right; only its reach
  is short (F-01).
- **The set-equality tightening is the right shape and is satisfiable today.** `postWavePathspecs`
  is a one-element array at HEAD, so containment → set-equality is a strict strengthening that
  passes now and reds if a second pathspec is silently added — the same argument AT-1.4 makes for
  the check set. This is the kind of edit an erratum should produce.
- **The held-class note answers REQ v0.12's C-7 paragraph directly.** "A held class leaves AC-1.1
  unsatisfied on an unmerged branch — **not** a C-7 red, never registered as a tolerated failure"
  (`FSPEC:168`–`:170`) is exactly the distinction the new REQ paragraph draws, and it lands the
  half of my v10 F-02 that mattered most: the document now says in text that a held class is not a
  registered expected failure.
- **The closure over §3.1 is wider than TSPEC T-5 asked for, and correctly so.** T-5 holds classes
  7 and 11; the note holds 7–12. Computing the closure through the ordering column rather than
  transcribing the TSPEC's two class numbers is the difference between a ledger and a copy.
- **The erratum-9 row now carries the SE v9 F-01 conjunct.** `FSPEC:855` records that AC-1.3's
  separate "present and passing" conjunct still binds re-homed hosts, closing the last open item
  from that round without widening the clause.

## Recommendation

## Verdict

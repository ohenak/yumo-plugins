# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.0, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 6
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. The baseline reviewed at v5 was the REQ as of `73de2de` (the tree at
`668cec6`); this review covers `668cec6..HEAD` on that file — the v2.0 altitude split, commits
`05a0838`, `b3a0918`, `b473f2e`, `437b2ad`, `72b333c`, `04b359f`, `8d77618`. Sections unchanged since
v5 were not re-litigated.

## 1. Disposition of the v5 findings

**All four v5 findings are closed, and two of the four were closed at a different altitude than I
asked for — better than the fix I proposed.** Both v5 Highs were about this document specifying the
behaviour of shipped code it does not own; v2.0's answer was to stop doing that here at all. I
verified the relocations rather than accepting them: a finding is not closed by being moved unless
the new home actually carries it.

| v5 id | Sev | Status | Where it closed, and what was checked |
|---|---|---|---|
| **F-01** | **High** | ✅ closed, and at the root | I asked the REQ to choose between suppressing the unconditional recovery emit and admitting it. v2.0 does something better: it (a) promotes the control-flow facts into the shared baseline as **`M-8a`–`M-8j`** — `M-8b` states the two channels are disjoint and that *"a criterion that says one channel replaces text on the other is naming a substitution the module has no seam for"*, `M-8d` states the emit is unguarded and fires on every halt class — and (b) moves the criterion that needed them to `REQ-RCV-07`, where **O-6** specifies the *suppression seam* explicitly, **NR-3** scopes it to the two row-B variants, **R-14** names the widened-seam regression, and **O-10** carries the control leg (suppressed line **absent** on each refusing entry, **present** on a control halt of another class). That is option (i) of the two I offered, with the seam, the scope and the regression test that option needed. Nothing of it remains in this document, which now mints no operator string at all (§6). |
| **F-02** | **High** | ✅ closed by relocation, and the sequel leg exists | The torn-write residue and its sequel moved to `REQ-RCV-07` **AC-7.5** (byte confirmation, the value-tear analysis, *act 1*) and **AC-7.4** (the sanctioned repairs). The leg I asked for is there verbatim in that REQ's O-10: *"their sequel, asserted positively — from that residue, the next entry **after act 1** finds `A < H`, the clearance unspent … while the next entry **after act 1 was skipped** finds `A = H`, `W` = 1 and the clearance gone: **the pair**, because that entry is where the clearance is actually lost"*. That is the finding, answered as a mutation pair. What this REQ keeps is only the confirmation *obligation* and its fail-closed disposition, which is the right residue at this altitude. |
| **F-03** | Low | ✅ closed | §3.1 now reads *"`pdlc-rcv-fixed-point-stop` depends on this REQ because both its tests are stated over `W`, and `pdlc-rcv-panel-topology` depends on the two of them."* The antecedent is restored and the deleted *why* clause came back with it, which also retires half of Q-02's evidence problem. |
| **F-04** | Low/Process | ✅ closed, and **mechanised** | The document is now **477 lines / 52,052 bytes** against the 700 / 61,440 ceiling — 85% of the byte budget, from 99.995%. More durably, the finding was turned into a tool: `pdlc/hooks/scripts/check-req-size.sh` gained a **soft threshold at 90%** (630 lines / 55,296 bytes) whose message is precisely the lesson (*"Relocate shared baselines, thresholds and catalogue rows to `docs/_constraints/` now, before the next review round — do not fund the next revision by compressing this document."*), with `pdlc/workflows/__tests__/hookCompatibility.test.js` pinning it. A Process finding that ends as an executing check is the best available outcome. Both split halves sit under the soft threshold (477/52,052 and 505/52,627). |

**Independent re-verification of the split, since a relocation is only as good as its citations.**

- **Every `M-*` id this REQ cites exists in the baseline.** Cited: `M-1a`–`M-1e`, `M-2f`, `M-7a`,
  `M-7b`, `M-7d`, `M-7e`. All ten are defined rows in `docs/_constraints/pdlc-rcv-baseline.md` §2. No
  dangling id.
- **NB-4 holds mechanically.** A scan for `.js:` and for bare line references across the whole
  document returns **zero hits**. The claim *"this document now carries no line citation and no claim
  about shipped control flow"* is true as written, not aspirational.
- **Every `REQ-RCV-07` cross-reference resolves.** AC-7.1, AC-7.2, AC-7.3, AC-7.4, AC-7.5, AC-7.6,
  §6, O-6, O-10, O-12, R-10, R-11 all exist in
  `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md`. The two *step-level* citations are exact:
  AC-1.1's *"the strictly-increasing check on `WINDOW-START:` values (AC-7.1 step 2)"* matches step 2's
  *"strictly greater than every `WINDOW-START:` value before it"*, and §4/§6's *"its sole emitter and
  its `{reason}` selection are AC-7.1 step 4's"* matches step 4's *"exactly one S-16 notice … `{reason}`
  belongs to the first failing line in document order"*.
- **The catalogue delegation is sound.** Catalogue §2's S-13/S-14 rows do say *"AC-1.5(4)'s ordered
  algorithm"* and its S-16 producer cell says *"AC-1.5(4) step 4"*; §4's one-sentence substitution rule
  plus §4's own S-16 row cover both forms, and the catalogue is genuinely untouched.
- **The `N-13` collision claim is true.** `pdlc-rcv-fixed-point-stop` §7 N-13 is *"Re-specifying the
  round budget…"*; `pdlc-rcv-finding-quality` §7 N-13 is *"Deciding, mechanically, whether a reviewer
  applied AC-5.1's test correctly."* Two different non-goals under one id. The `NB-*` namespace is
  justified by evidence, not by taste — see F-03 below for the id class it did **not** cover.

## 2. Disposition of the v5 questions

| v5 id | Status | Note |
|---|---|---|
| **Q-01** (does this REQ intend to change the shipped *one recovery act per halt* invariant into *one per halt class*?) | ✅ answered, and by the split | The question is no longer this document's: the suppression seam is `REQ-RCV-07` O-6's, and it answers exactly what I asked — *"on the two row-B variants the refusal's own recovery text stands in its place, and **every other halt class keeps that line unchanged**"*, with that REQ's R-14 naming the widened-seam regression and its O-10 testing both sides. The generalisation is stated once, in the document that owns the seam, rather than as a per-row exception in a §6 table. |
| **Q-02** (is `W` guaranteed absent from every operator- and downstream-visible surface on a refusing entry?) | ⚠️ still open, but the evidence is back and the question is now **`REQ-RCV-07`'s** | The §3.1 clause that names why the successor depends on this REQ (*"both its tests are stated over `W`"*) was restored (F-03 closed). The refusing entry itself is now AC-7.2/AC-7.6 material, so the question belongs with row B's cells. Carried, **not re-filed here** — filing it against this document would ask it to specify a surface it deliberately no longer owns (NB-3). |
| **Q-03** (was a single in-entry retry of the confirmation read considered and rejected?) | ✅ no longer this document's | The byte confirmation is `REQ-RCV-07` AC-7.5. Carried there. |

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict

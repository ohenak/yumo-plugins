# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.1)
**Upstream at dispatch:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.8, sha256:3eb52debcd13aa37913322e7855628a9b237af278581e6773f48ceb1cfd72cba)
**Date:** 2026-08-28
**Iteration:** 3 (upstream-cascade confirmation — FSPEC's own bytes unchanged)

## Scope

Upstream-cascade confirmation, not a re-review. FSPEC v1.1 is byte-unchanged since my v2
approval (`REVIEWED-COMMIT: a8175794`); the approval's `UPSTREAM-STATE` pinned REQ
sha256:c18b7e88…, and that version of the REQ no longer exists. The erratum round moved the REQ
across three commits — `4e197abe5` (§4 C-5), `0756cefed` (§6 R-5, §7 A-1), `273d0ce00` (§1
changelog and Baseline pin) — plus the Baseline to v1.2 in `efbf3dad9`.

What the upstream edit actually changed, read at its current text, not from the changelog:

| Upstream site | Before (my approved version) | Now (v1.8) |
|---|---|---|
| §4 C-5 `decisionLedger.maxEntries` | `70`, **positive** integer | `70`, **non-negative** integer — `0` is a valid admits-nothing value |
| §4 C-5 `decisionLedger.maxBytes` | **`8000`**, positive integer, author analogy to `learningsInjection` | **`12500`**, non-negative integer, derived from Baseline v1.2's `M-7b`/`M-7c` |
| §6 R-5 | "`maxBytes` is an author analogy, not measured" | "Both bounds are now measured … but against one commit rather than a growth model" |
| §7 A-1 | `maxEntries` measured, `maxBytes` "remains a `learningsInjection` analogy, not measured" | Both defaults measured and cited by id (`M-6b`/`M-6c`, `M-7b`/`M-7c`) |
| Baseline pin | v1.1 | v1.2 (§8 `M-7a`…`M-7e` added; §1–§7, and the `Verified at` commit `8c673a09f`, unchanged) |

The one question asked: **does FSPEC still hold against the REQ as it now stands?** I read the
current upstream text at every site FSPEC leans on, not just the changelog's item list. The
type retyping and the R-5 rewrite cascade cleanly — FSPEC never restates a config type, and E-7
already treated `maxEntries` `0` as valid rather than as a fallback, which is exactly the
outcome the retyping was made to license. Two sites do **not** hold: FSPEC recites the old
`maxBytes` default as a literal, and FSPEC's §7 Assumptions restate A-1 in its retired form
while claiming to carry it "unchanged". A third is a version-pin staleness with no semantic
drift behind it.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | FSPEC recites the retired `maxBytes` default as a literal: `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md:111` reads "Defaults are `enabled` `false`, `maxEntries` `70`, `maxBytes` `8000` (REQ C-5)". REQ C-5 now says `12500` (`docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md:173`), and the Baseline the REQ derives it from records that `8000` "is *below* M-7b outright, so it drops lines against the standing corpus on day one" (`docs/_constraints/pdlc-decision-corpus-baseline.md:111`). The citation `(REQ C-5)` now attributes to the REQ a number the REQ does not carry. This is the single site the erratum's own cascade note predicted, and TSPEC/PLAN read the value from here | §3.1, defaults sentence (FSPEC:111) |
| F-02 | High | delta | local | FSPEC's §7 Assumptions carry A-1 in its **retired** form while asserting fidelity: `FSPEC:544-546` reads "Carried from REQ §7 unchanged … `maxBytes` (8000) is a `learningsInjection` analogy and is not measured". REQ §7 A-1 now reads the opposite — "Both defaults derive from measurements taken once against the Baseline's named commit and cited by id … `maxBytes` (12500) from `M-7b`/`M-7c`" (`REQ:377-380`) — and R-5's residual risk moved with it, from "not measured" to "measured against one commit rather than a growth model" (`REQ:330-333`). A-1 is an **operator-vetoable** assumption: an operator reading FSPEC would veto or resize a bound on a rationale the REQ has withdrawn. "Unchanged" is the load-bearing word and it is now false | §7 Assumptions, A-1 (FSPEC:544) |
| F-03 | Medium | delta | nonlocal | FSPEC's header pins are both stale: `Upstream … **v1.7**` (`FSPEC:9`) against REQ v1.8, and `Baseline … **v1.1**` (`FSPEC:11`, repeated at `FSPEC:43` and `FSPEC:331`) against Baseline v1.2. I checked the Baseline bump for semantic drift and found none — v1.2 is purely additive (§8 `M-7a`…`M-7e`), §1–§7 and the `Verified at` commit `8c673a09f` are byte-identical, so `M-1d`/`M-2e` and every AT-01/AT-03 fixture claim still hold. Medium, not High, for that reason. But the Baseline's own change control makes the pin normative — "Consumers cite this file **at its `Version`**" (`baseline:27`) — so a v1.1 pin is a defect in form even where the facts survive. Fix in the same edit as F-01/F-02 | Header table (FSPEC:9, :11); FSPEC:43; FSPEC:331 |
| F-04 | Low | delta | local | The erratum's own cascade note mis-routes the fix: `REQ:27` says "FSPEC **§3.3**'s recital of the default cascades". §3.3 is the fail-open path (`FSPEC:139`); the recital is in **§3.1** (`FSPEC:111`). The pointer is off by one subsection in the one sentence whose job is to aim the downstream edit. Correct the REQ's changelog reference to §3.1 | REQ §1 v1.8 changelog (REQ:27) |

FINDING: High | delta | local | §3.1 defaults sentence (FSPEC:111) recites `maxBytes` `8000` and attributes it to REQ C-5, which now says `12500`
FINDING: High | delta | local | §7 A-1 (FSPEC:544) carries the retired "`maxBytes` is an unmeasured `learningsInjection` analogy" claim while asserting it is carried from REQ §7 unchanged
FINDING: Medium | delta | nonlocal | Header pins Upstream REQ v1.7 (FSPEC:9) and Baseline v1.1 (FSPEC:11, :43, :331); upstream is REQ v1.8 and Baseline v1.2 (additive only, no fact drift)
FINDING: Low | delta | local | REQ:27's cascade note points at FSPEC §3.3; the recital it means is in §3.1

## Questions

| ID | Question |
|----|---------|
| Q-01 | The `12500` derivation lands on the Baseline as a **substance-byte floor plus a declared framing allowance** — `M-7d` is explicit that substance bytes "exclude every per-line separator, prefix and newline, because the concrete format of a rendered line is not this file's to fix — it belongs to the consuming TSPEC" (`docs/_constraints/pdlc-decision-corpus-baseline.md:112`). FSPEC BR-12 already scopes `maxBytes` to "the rendered index text alone … as it appears in the prompt" (`FSPEC:273-275`), i.e. **framing included**. Those two are compatible only if the 50 bytes/record of `M-7c` allowance is the framing budget BR-12's rendered form must fit inside. Is that intended to be said out loud in §7 as an obligation on the TSPEC's line format (a cheap clause, and the arithmetic is already TSPEC's at `TSPEC:435`), or is it deliberately left implicit because BR-12's rendered-text scoping plus `M-7c`'s named allowance already pin it? Not a finding — the FSPEC is not wrong either way, and the number is not FSPEC's to own. |
| Q-02 | Propagation surface, flagged rather than filed since it is downstream of this document: `8000` survives at six TSPEC sites — the headroom arithmetic (`TSPEC:435`, `:473`), the interface comment (`TSPEC:496`), the example config block (`TSPEC:760`), the shipped-defaults assertion (`TSPEC:942`), and its own §7 A-1 recital (`TSPEC:1361`). Two of those are executable-adjacent (`:760`, `:942`) rather than prose. Notably `TSPEC:1302` **is** ERR-2, the finding that produced this erratum — the TSPEC named the defect and then kept the old value in its own body, which is expected mid-erratum but means the TSPEC's cascade round has a wider surface than this one. Should the FSPEC edit and the TSPEC cascade land in one commit so no intermediate state of the branch carries two different C-5 defaults? |

## Positive Observations

- **The retyping cascades cleanly, and it fixes a latent contradiction I had approved.** REQ v1.7 typed `maxEntries` **positive**, while FSPEC E-7 (`FSPEC:315`) requires `0` to be "a valid admits-nothing value … **Not an error**, not a fallback to the default, not a halt". Under the old typing, `0` was wrong-typed and §3.1's table sent it back to the `70` default — the exact opposite outcome, in two documents I had both approved. The erratum retypes upstream rather than weakening E-7, so FSPEC's edge case is now *supported* by the REQ instead of quietly contradicted. Nothing in FSPEC needs to move for this: FSPEC never restates a config key's type, which is why the retyping cost it nothing.
- **The upstream fix was taken at the right altitude.** `maxBytes` was wrong because it was an analogy; the repair replaces the analogy with a measurement in the Baseline (`M-7a`…`M-7e`) and has the REQ cite it by id, rather than inlining a number into the REQ or letting the TSPEC pick one locally. That keeps the REQ's existing discipline — measured facts live in `docs/_constraints/`, cited by `M-*` id — and leaves FSPEC with exactly one literal to change.
- **The Baseline bump is genuinely additive, and I verified it rather than trusting the changelog.** `git diff` over the erratum range shows §8 appended, the `Version` line, and the two change-control counts ("§1–§8", "eight sections"); §1–§7 and `Verified at HEAD 8c673a09f` are untouched. So AT-01's `M-1d`/`M-2e` expected values, AT-03's frozen-fixture commit and every `M-*` claim I spot-checked in round 2 all still hold — the cascade here is a pin refresh, not a re-verification.
- **R-5's rewrite is honest about what measurement did and did not buy.** It does not claim the risk is gone; it renames it from "unmeasured" to "measured at one commit, not a growth model", cites `M-6d`/`M-7d` for that limitation, and keeps A-1's vetoable label as the mitigation. That is the residual risk actually present, and it is the reason F-02 matters: FSPEC currently states the *old* risk to the operator who holds the veto.

## Recommendation

**Needs revision**

FSPEC's own bytes are unchanged and its behaviour still holds against REQ v1.8 — the flows,
business rules, edge cases and acceptance tests are unaffected by the erratum, and E-7 is
better supported now than when I approved it. But the document is no longer a faithful
compression of its upstream at two sites, both of which state a superseded number or rationale
as current fact. One edit, four small changes, no re-review of settled sections:

1. **F-01** — `FSPEC:111`: `maxBytes` `8000` → `12500`, so the `(REQ C-5)` citation is true again.
2. **F-02** — `FSPEC:544-546`: restate A-1 as REQ §7 now has it — both defaults measured against the Baseline's named commit and cited by id, `maxEntries` (70) from `M-6b`/`M-6c` and `maxBytes` (12500) from `M-7b`/`M-7c` — keeping the operator-vetoable label, and drop "is not measured". If §7 carries any echo of R-5's rationale, it moves with it: the residual risk is now "measured at one commit, not a growth model".
3. **F-03** — `FSPEC:9` → REQ **v1.8**; `FSPEC:11`, `:43`, `:331` → Baseline **v1.2**. No fact behind these pins moved; the `Verified at` commit is unchanged.
4. **F-04** — routed upstream: `REQ:27`'s cascade note should say FSPEC **§3.1**, not §3.3.

Nothing else in FSPEC v1.1 is reopened by this round. My round-2 findings F-01/F-02/F-03
(the block-level malformation definition, AT-05's count word, AT-11's `valid` cross) remain as
recorded there and are unaffected by the erratum.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}

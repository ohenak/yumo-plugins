# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.2)
**Upstream at dispatch:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (sha256:3eb52de… — verified against the working tree)
**Date:** 2026-08-28
**Iteration:** 4 (erratum confirmation, not a re-review)

## Scope

The erratum edit is three commits — `c75797636` (lineage pins and changelog), `577cf6860` (the
`maxBytes` default in §3.1 and §7 A-1) and `f450e8de4` (the AT-01 fixture pin) — 18 insertions and 9 deletions over `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md`.
My round-3 verdict was **Needs revision** on four findings: F-01 (`§3.1` recited `maxBytes` `8000`),
F-02 (`§7` A-1 carried the retired "unmeasured `learningsInjection` analogy" rationale while claiming
to carry REQ §7 unchanged), F-03 (stale `Upstream`/`Baseline` version pins), F-04 (routed upstream —
REQ's own changelog aims the cascade at FSPEC §3.3 rather than §3.1).

The one question this round asks is **not** "did those four land" but **does FSPEC still hold as a
faithful compression of its upstream as that upstream now stands.** So I re-read the current text at
every site FSPEC leans on — REQ C-5, REQ §6 R-5, REQ §7 A-1, and the Baseline at every `M-*` id FSPEC
cites — rather than diffing against the item list. Three of the four routed items landed in FSPEC's
own bytes and I verified each against the upstream it is meant to mirror, not against my own wording
of the fix. The fourth was routed to the REQ and has not landed. Nothing FSPEC asserts about its
upstream is now false, and no section I previously approved is broken by the edit.

## Delta-Confirmation Findings

**Routed items — verified against upstream, not against the item list.**

- **F-01 (High, v3) — resolved.** `FSPEC:120` now reads "Defaults are `enabled` `false`, `maxEntries`
  `70`, `maxBytes` `12500` (REQ C-5)". REQ C-5 (`REQ:173`) carries `12500` as the `maxBytes` default,
  so the `(REQ C-5)` attribution is true again. `8000` survives nowhere in FSPEC except the v1.2
  changelog sentence at `FSPEC:21`, where it is correctly named as the *retired* value — that is a
  provenance record, not a recital, and it is the right place for the old number to live.
- **F-02 (High, v3) — resolved, and resolved by mirroring rather than paraphrase.** `FSPEC:552-555`
  now reads "both defaults are measured once against the Baseline's named commit and cited by id, not
  re-derived here — `maxEntries` (70) from `M-6b`/`M-6c`, `maxBytes` (12500) from `M-7b`/`M-7c`".
  REQ §7 A-1 (`REQ:377-380`) says the same thing in the same terms, and the retired "is not measured"
  clause is gone. The operator-vetoable label is kept, so the veto an operator holds is now over the
  rationale the REQ actually states. I also checked that no *other* FSPEC site echoes R-5's retired
  wording: `R-5` appears nowhere in FSPEC (the four `BR-5` hits at `FSPEC:79`, `:143`, `:231`, `:405`
  are a different id), so there is no second copy of the withdrawn rationale left behind.
- **F-03 (Medium, v3) — resolved at all four sites.** `FSPEC:9` pins REQ **v1.8**; `FSPEC:11`, `:52`
  and `:340` pin Baseline **v1.2**. I re-verified the Baseline bump is still additive rather than
  trusting my round-3 note: `git diff bdd9e1d11..efbf3dad9` shows §8 appended, the `Version` line, and
  two change-control count words; `Verified at HEAD 8c673a09f` and §1–§7 are untouched. Every `M-*`
  id FSPEC cites — `M-1d`, `M-2e`, `M-3a`/`M-3c`, `M-4a`/`M-4b`/`M-4d`/`M-4e`, `M-5a`/`M-5c`,
  `M-6b`/`M-6c`, `M-7b`/`M-7c` — resolves in Baseline v1.2, so AT-01's 41/4/7 → 45/48 line counts and
  AT-03's frozen-fixture commit still hold under the new pin.
- **F-04 (Low, v3) — routed upstream, not landed.** Refiled below as F-01.

Two findings, both Low, neither in FSPEC's own bytes. FSPEC is a faithful compression of REQ v1.8 and
Baseline v1.2 at every site I checked.

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | inherited | nonlocal | The REQ's own cascade note still mis-routes the fix it aims: `REQ:27` reads "FSPEC **§3.3**'s recital of the default cascades". §3.3 is the fail-open path (`FSPEC:148`); the recital was and is in **§3.1** (`FSPEC:120`). This was v3 F-04, routed upstream and not picked up — the FSPEC author read past the wrong pointer and edited the right line anyway, which is why it cost nothing this time. It is a one-word fix in the REQ (`§3.3` → `§3.1`) and worth taking because the sentence's only job is to aim a downstream edit; left alone it will mis-aim the next reader of the v1.8 changelog. Non-gating: FSPEC is correct regardless | REQ §1 v1.8 changelog (REQ:27) |
| F-02 | Low | delta | nonlocal | The Baseline's `Cited by` propagation list was not extended when this round minted a new citation into it. `baseline:6` lists FSPEC's citation sites as "(header, §1, §3.3, §4 BR-2/BR-8/BR-10, §5 E-4/E-9/E-10/E-11, §6 AT-01, §7 O-5)" — **§7 Assumptions is absent**, yet `FSPEC:555` now cites `M-7b`/`M-7c` there, ids minted in Baseline v1.2 itself. The file's own rule is explicit: "This list is the propagation path for a `Version` bump, so a new citation is added here in the same edit that mints it" (`baseline:6`). Same edit, same clause: the change-control paragraph now says `REQ` owns "§1–§8 entire" but the next sentence still says a successor's facts are "never interleaved into **§1–§7**" (`baseline:23-24`). Both are one-line fixes in `docs/_constraints/pdlc-decision-corpus-baseline.md`, and neither needs a `Version` bump under the file's own rule since the facts do not move. Low, not Medium: the list already names FSPEC as a consumer at six other sites, so a future bump would still reach this document | `docs/_constraints/pdlc-decision-corpus-baseline.md:6`, `:23-24` |

FINDING: Low | inherited | nonlocal | REQ §1 v1.8 changelog (REQ:27) | The cascade note still points at FSPEC §3.3; the recital it means is in §3.1 (FSPEC:120). Unlanded v3 F-04, FSPEC itself is correct
FINDING: Low | delta | nonlocal | Baseline `Cited by` list (baseline:6) | FSPEC §7 A-1 now cites the newly minted M-7b/M-7c, but the Baseline's propagation list was not extended in the same edit as its own rule requires; the change-control paragraph also still says "§1–§7" one sentence after "§1–§8"

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v3 Q-02 and now answerable as a fact rather than a worry: `8000` is gone from FSPEC but the **TSPEC still carries it** at six sites (`TSPEC:435`, `:473`, `:496`, `:760`, `:942`, `:1361`), two of them executable-adjacent (the example config block and the shipped-defaults assertion). The branch is therefore in an intermediate state where two documents state different C-5 defaults. That is expected mid-cascade and is the TSPEC round's work, not FSPEC's — I raise it only so the phase does not read this approval as "the cascade is complete". Is the TSPEC cascade already queued behind this confirmation? |
| Q-02 | Also carried from v3, still not a finding: the `12500` derivation is a substance-byte floor **plus a declared framing allowance** — `M-7d` is explicit that substance bytes exclude every separator, prefix and newline because line format "belongs to the consuming TSPEC" (`baseline:112`), while FSPEC BR-12 scopes `maxBytes` to the rendered index text *as it appears in the prompt* (`FSPEC:282-284`), framing included. Those reconcile only if `M-7c`'s 50 bytes/record is the budget BR-12's rendered form must fit inside. The REQ now says this out loud in C-5's rationale (`REQ:173`), which is a better home than FSPEC, so I am content to leave FSPEC silent — flagging only that the obligation is now carried by a rationale cell rather than by an `O-*` obligation on the TSPEC's line format. |

## Positive Observations

- **The edit is exactly as wide as the defect and no wider.** 18 insertions, 9 deletions, four sites:
  the two literals, the four version pins, and a changelog paragraph that names the retired value as
  retired. No settled section was reopened; the flows, business rules, edge cases and acceptance tests
  are byte-identical. That is the right shape for an erratum, and it is what makes this confirmation
  cheap to do honestly.
- **F-02 was fixed by mirroring the upstream, not by patching around my finding.** The easy fix was to
  delete "is not measured" and leave the rest. Instead §7 A-1 now restates the REQ's actual new
  rationale — measured once against a named commit, cited by id, not re-derived — in the REQ's own
  terms. An operator exercising the A-1 veto reads the same rationale in both documents, which is the
  whole point of the vetoable label.
- **The changelog keeps the retired number rather than erasing it.** `FSPEC:19-25` records that `8000`
  was the old default, that it was an unmeasured analogy, and that `12500` derives from `M-7b`/`M-7c`.
  Erratum edits that silently swap a literal leave the next reader unable to tell a correction from a
  typo; this one leaves a provenance trail, and it is the only place `8000` still appears in FSPEC.
- **The AT-01 fixture pin moved with the Baseline pin.** `FSPEC:340` now pins the frozen fixture copy
  at Baseline **v1.2**'s `Verified at` commit. It would have been easy to bump the header table and
  miss this one, since the commit hash behind it did not change — the value of the pin is that it
  names *which version's* commit, and getting it right when nothing observable moves is the discipline
  the Baseline's change-control clause is asking for.
- **I could re-verify the additive-Baseline claim mechanically.** Because the Baseline appends `M-7*`
  as a new §8 rather than editing §1–§7, one `git diff` settles whether any prior fact moved. That
  containment is why this confirmation is a pin refresh rather than a re-verification of every AT.

## Recommendation

**Approved with minor changes**

The delta resolves the three routed items that were FSPEC's to fix, and it breaks nothing I
previously approved. Measured against the upstream rather than against the item list: FSPEC v1.2 is a
faithful compression of REQ v1.8 and Baseline v1.2 at every site it leans on — C-5's defaults and
types, §7 A-1's rationale, R-5's residual risk (which FSPEC correctly does not restate at all), and
every `M-*` id it cites. FSPEC is clear to proceed downstream.

Two Low findings remain, neither in this document and neither gating:

1. **F-01** — `REQ:27`: change the cascade note's `§3.3` to `§3.1`. Routed upstream in v3 and not
   picked up; one word.
2. **F-02** — `docs/_constraints/pdlc-decision-corpus-baseline.md:6`: add FSPEC **§7 A-1** to the
   `Cited by` propagation list, since v1.2 minted the `M-7b`/`M-7c` citation that now lives there;
   and at `:23-24`, make the "never interleaved into §1–§7" clause say §1–§8 to match the sentence
   above it. Neither needs a `Version` bump — no fact moves.

My round-2 findings (the block-level malformation definition, AT-05's count word, AT-11's `valid`
cross) stand as recorded there and are untouched by this erratum. Nothing else in FSPEC v1.2 is
reopened.

## Verdict

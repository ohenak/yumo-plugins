# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.4)
**Date:** 2026-08-10
**Iteration:** 5
**Scope:** Delta confirmation under the erratum protocol. Diffed `9a95324f` (the sole commit touching
this document since v4), read my own v4 cross-review first, and judged (a) whether the routed erratum
items are absorbed and (b) whether the revision broke or left half-done anything it touched. Unchanged
sections were not re-litigated. Every upstream citation the new text leans on was re-measured at HEAD.

## 1. Erratum items — disposition

The six routed items collapse to two distinct defects, each raised by both reviewers in slightly
different words. Both are **resolved, and resolved the right way** — by moving PROPERTIES onto the
upstream decision rather than by re-opening it at this layer.

| Routed item | Disposition | Evidence, re-measured at HEAD |
|---|---|---|
| PROP-COR-09's conjunct (2) asserted `renderConsumedPair`'s output contains **both** basenames, contradicting the property's own title and REQ §4b's omission decision (pm-review ×2, se-author ×2) | **Resolved** | Conjunct (2) (`:397-401`) now reads *"the basename list `renderConsumedPair` renders is **set-equal to `{readable}`** — the readable basename present, the unreadable one **absent**, and **no third name**"*. Title and conjunct now agree, and both agree with REQ §4b (`REQ:613-616`: an unreadable basename "is instead **not consumed** — it is omitted from the `<!-- pdlc:consumed {passId} -->` pair"). The pre-erratum inclusion arm is gone from the document — `grep -n "unreadable" ` returns no surviving "contains both basenames" text |
| §O-5's parenthetical still carried the pre-erratum inclusion arm, *(counted, in the consumed pair, named)* (pm-review ×2, se-author ×2, cited at `:296`/`:299`) | **Resolved** | `:308-312` now reads *(counted, **omitted from** the consumed pair — which is rendered set-equal to `{readable}`, the readable name present and the unreadable one absent — and named in the report body)*, and the sentence gains the matching positive control: the observables cannot pass "nor on one that renders an empty pair". §O-5 and §4 are now stated on identical terms, which is what stops the next round re-deriving the contradiction from the oracle-design section |

Two things I checked specifically, because an erratum round is the easiest place to over-correct:

- **Set equality, not containment-plus-absence.** The correction did not settle for "readable present,
  unreadable absent" — it pins **set equality including "no third name"**, with the reason stated
  inline (NFR-5 requires a block naming *exactly* the consumed set, `REQ:562`). A containment oracle
  would have been satisfied by an implementation that also names a basename the enumeration never
  returned. This is the stronger of the two available fixes and it matches TSPEC §12.2's cell
  (`TSPEC:2835`) almost word for word, so the layers are not paraphrases of each other.
- **No collateral movement.** No property was added, removed, renumbered or re-homed. Distinct
  `PROP-*` ids at HEAD = **118**, and the symmetric difference against the pre-erratum blob
  (`9a95324f^`) is empty. PROP-COR-09's trailer is unchanged at `L2 · consolidationPass.test.js ·
  T20 → T31`, so the erratum did not quietly relocate an obligation while fixing its wording.

## 2. Independent re-measurement

Every factual claim the revision rests on is a claim about a file other than this one, so each was
measured at HEAD rather than taken from the document's prose.

| Claim | Verdict at HEAD |
|---|---|
| REQ §4b decides **omission**, not inclusion | **Exact.** `REQ:613-616`: the pair "gains no `unread:` field", and an unreadable basename "is instead **not consumed** — it is omitted from the `<!-- pdlc:consumed {passId} -->` pair, so it stays un-consolidated and the next pass retries it" |
| The rationale PROP-COR-09 gives for omission (a consumed-but-evidence-free entry biases the verdict) is REQ's, not invented here | **Exact.** `REQ:617-620` — such an entry "can only ever push a verdict toward `prevented` or `insufficient-evidence` and never toward `recurred`, which corrupts REQ-CONS-05's falsifiability loop in one direction" |
| TSPEC §12.2's cell states conjunct (2) as set equality with the "no third name" clause | **Exact**, `TSPEC:2835`, including the parenthetical reason. PROPERTIES is a faithful compression, not a re-derivation |
| NFR-5 requires a block naming *exactly* the consumed set | **Exact.** `REQ:562`, and `TSPEC:1044` restates the asymmetry ("a block must name **exactly** the consumed set (NFR-5)") |
| The unreadable entry still counts toward the volume trigger | **Exact.** `REQ:622-624` — it "**stays in the un-consolidated set and so still counts toward AC-1.2's volume trigger**; only the consumed pair omits it", which is conjunct (1) |
| `renderConsumedPair` is a pure renderer taking `basenames` | **Exact.** `TSPEC:842` — `renderConsumedPair(passId: string, basenames: string[]): string // pure`; `TSPEC:368` and `:1627` agree. The conjunct is stated at a subject that can actually produce it |
| The id set is unchanged at 118 | **Exact**, and verified mechanically both ways: `grep -oE 'PROP-[A-Z]+-[0-9]+' \| sort -u \| wc -l` = **118** at HEAD and at `9a95324f^`, and the symmetric difference between the two sets is **empty** |

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The erratum absorbed half of the authority it cites: the all-unreadable arm is now the only observable in REQ §4b with no property behind it.** PROP-COR-09 cites `TSPEC §12.2` in its trailer, but §12.2's cell (`TSPEC:2835`) specifies **two** fixtures in that case, not one. The second — *"**A second fixture in the same case carries the all-unreadable corpus** (§10.3 row 1b)"* — asserts positively that terminal status is exactly `no-op` (**not** `failed`, "the adjacent branch an implementer is most likely to reach for", and not `refused`), that the rendered pair's basename list is **empty**, and that `\|un-consolidated\|` is **2** with both basenames named as unread. PROP-COR-09 says "**One** fixture" (`:396`) and stops at the mixed case. Nothing else in the document covers it: `grep -n "unreadable"` returns hits only at `:22`, `:294`, `:308-311`, `:388-390` (PROP-COR-06, the unreadable **log**, a different subject) and `:395-405`; the strings `all-unreadable`, `entirely unreadable`, `row 1b` and `third cause` appear **nowhere** in PROPERTIES. PROP-PASS-11 does not close it — it enumerates only AC-1.4's causes **(i)** un-consolidated set empty and **(ii)** every promotion duplicate-suppressed (`:1366-1370`), i.e. the first and second causes, never the third. This is not a latent nicety: REQ's own erratum note (`REQ:26`) mints the arm — "§4b's all-unreadable pass keeps terminal status `no-op` (AC-1.4's third cause)" — and stakes it on a **pairing** rather than a code ("AC-7.1's consumed-by-basename list empty while the un-consolidated set is non-empty"), which is precisely the kind of two-field discriminator that silently degrades if nothing asserts it. TSPEC states in the same cell that **no register AT reaches any of these observables** and walks through why (AT-K3, AT-L2, AT-F13, AT-R7 cover AC-1.4's second and first causes only). So if PROPERTIES does not carry it, the property run does not test it. The v1.4 changelog's claim to have absorbed "REQ §4b / TSPEC §7.1's omission decision" is true of the omission arm and not true of the terminal-status arm §4b mints two sentences later (`REQ:624-626`) | §4 PROP-COR-09 (`:395-408`); §O-5 (`:308-312`); cf. `TSPEC:2835`, `REQ:26`, `REQ:624-628` |

**Why High rather than Medium.** I weighed it. The obligation *is* fully written down upstream in
TSPEC §12.2, so an implementer working from TSPEC would plausibly write the fixture anyway — that is
the argument for Medium. What decides it the other way is that PROPERTIES is the register the V-wave
runs from and the layer that claims completeness for its own set: §12.2/§12.3's tables map properties
to tasks, and an obligation absent from the register is absent from the run regardless of what TSPEC
says. The observable at risk is a terminal status distinguished only by a two-field pairing, whose
most likely wrong implementation (`failed`) TSPEC names explicitly. Shipping that untested is the
outcome the erratum round existed to prevent.

**The fix is small and needs no new id.** Follow TSPEC §12.2's own shape and extend PROP-COR-09 to
carry the second fixture in the same case — "a second fixture carries the all-unreadable corpus:
terminal status is exactly `no-op`, the rendered pair's basename list is **empty**, `|un-consolidated|`
is 2, and both basenames are named as unread" — plus the sentence §12.2 already supplies making each
fixture the other's control ("it keeps 'pair empty' from passing on a pass that enumerated nothing at
all, and this fixture keeps the mixed one's status assertion from passing on an implementation that
terminates every unreadable-touching pass `failed`"). The property count stays at 118. Two consequent
edits fall out: the title, which currently speaks only of an "entry", should cover the whole-corpus
arm; and §12.1's AC-1.4 row (`:1648`), which lists `PROP-PASS-11, PROP-RTE-06, PROP-EFF-06`, should
gain `PROP-COR-09`, since after this change PROP-COR-09 is the only property asserting AC-1.4's third
cause. The trailer's AC list would gain `AC-1.4` beside `AC-1.1, REQ §4b`.

I am deliberately **not** asking for this to be routed upstream as an erratum. Nothing upstream is
wrong here — REQ §4b, REQ's erratum note and TSPEC §12.2 all state the arm correctly and consistently.
The gap is this layer's alone, so it is a finding, not an erratum.

## 4. Questions

| ID | Question |
|----|---------|
| Q-01 | Was the all-unreadable arm consciously scoped out of this erratum round as "not one of the six routed items", or was it missed? If it was scoped out deliberately, I have no objection to closing it in a follow-up round rather than this one — but it should be recorded somewhere in the document rather than left silent, because the next reader diffs PROPERTIES against TSPEC §12.2 and finds one fixture where the cell specifies two. |

## 5. Positive Observations

- **The correction went to the stronger oracle.** Conjunct (2) could have been fixed with
  "readable present, unreadable absent" and satisfied every routed item. It instead pins **set
  equality with "no third name"** and states the reason inline. That closes a hole nobody had
  reported yet: a containment oracle passing an implementation that names a basename the enumeration
  never returned.
- **Both channels moved together.** The recurring failure mode in erratum rounds is fixing the
  property and leaving the oracle-design section describing the old behaviour — which is exactly what
  §O-5 was. §O-5 and §4 now state the arm on identical terms, so the contradiction cannot be
  re-derived from the other end of the document.
- **The changelog is honest and checkable.** "No property added, removed or renumbered; the set stays
  118" is the kind of claim that is either exactly true or embarrassing. It is exactly true, and I
  verified the set identity rather than just the count.
- **The erratum's provenance is carried, not paraphrased.** PROP-COR-09 now names REQ §4b's reasoning
  (the entry "stays un-consolidated and the next pass retries it, §10.4") instead of asserting the
  omission bare, so a future reader can tell the decision from the derivation.

## 6. Recommendation

**Needs revision**

One High finding is open (F-01), so the round does not converge. To be clear about what is being
asked: **the routed erratum items are fully and correctly absorbed** — if the only question were
"did the delta land", this would be an approval. The revision is blocked on a gap it surfaced rather
than caused: PROP-COR-09 now cites TSPEC §12.2 as its authority while implementing one of the two
fixtures that cell specifies, leaving AC-1.4's third cause with no property behind it and, per
TSPEC's own analysis, no register AT either.

The change is one added conjunct-pair inside the property PROP-COR-09 already owns, plus two
bookkeeping edits (the property title, and `PROP-COR-09` added to §12.1's AC-1.4 row at `:1648`). No
new property id, no re-homing, no upstream erratum — the count stays at 118.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 0}


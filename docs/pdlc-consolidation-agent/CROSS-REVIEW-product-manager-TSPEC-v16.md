# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 16
**Mode:** Delta re-review (`993b92eb..HEAD`, TSPEC v2.5 → v2.6)
**Scope:** 46 insertions / 9 deletions since round 15. Every round-15 finding re-verified
against HEAD (REQ, FSPEC, PROPERTIES read line-for-line, not via the changelog).
Changed sections scanned for new issues; unchanged sections not re-litigated.

## What changed, and what I measured

**F-01 (Medium) — the all-unreadable pass now has a routing row, a case and REQ's
discriminator. Resolved.** The repair landed in all three places the finding named, and each
half checks against HEAD:

- **§10.3 row 1b** (`TSPEC:2215`) routes it: `enumerateCorpus` succeeds with ≥1 basename and
  `_readFile` ⇒ `null` for every one ⇒ `no-op`, no reason code, empty consumed pair. It carries
  REQ's quiet-week discriminator verbatim in enumerated values — *consumed-by-basename list empty
  **while** the un-consolidated set is non-empty* ≡ `REQ-…:627-628` — and its "not row 1a" clause
  keeps the `failed`/`no-op` boundary stated where an implementer meets it.
- The row's streak claim is the one I most expected to drift, and it is correct: *"advances the
  same streaks AC-1.4's first cause does, since AC-1.4 keys streak advance on consumed-set
  emptiness and never on the `no-op` label"* ≡ `REQ-…:231-233` (*"the three causes differ exactly
  there (the first and third consume nothing, the second consumes)"*).
- **§10.4** (`:2254-2256`) now keeps only the accepted residue — the entry re-offered until the
  operator fixes it — and says the corpus-wide consequence is *handled, not accepted*. That is the
  distinction the round-15 finding was about, drawn in the document's own words rather than by
  deleting the sentence.
- **§12.2** (`:2833`) binds it: a second fixture *in the same case*, two enumerated basenames,
  `_readFile` ⇒ `null` for both, asserting terminal status exactly `no-op` (*not* `failed`, the
  adjacent branch), an empty rendered basename list, and `|un-consolidated| = 2` with both names in
  the report body. The mixed fixture is named as its control **in both directions**, which is what
  stops "pair empty" greening on a pass that enumerated nothing. §12.3 (`:2908`) records the second
  fixture and mints no id, so the register set-equality is undisturbed.

**F-02 (Low) — observable arity reconciled. Resolved.** §7.1 now reads *"three observables"*
(`:984-985`) and numbers them 1/2/3 — count, omission, report-body naming (`:1009-1013`) — with the
report-body obligation lifted out of the sub-clause of (2). §12.2 and §12.3 already said three; the
two sections now agree, and §12.2's three-conjunct oracle has three numbered antecedents to check
against.

**The v2.6 conjunct-(2) change is a real strengthening, not a restatement.** §12.2 now asserts the
rendered basename list is **set-equal to `{readable}`** — present, absent, *and no third name* —
where v2.5 asserted containment plus one absence. I checked the motive holds: NFR-5 wants a block
naming exactly the consumed set, and the old shape was satisfied by an implementation that also
named a basename the enumeration never returned.

**Upstream verified rather than assumed.** FSPEC §5.3 (`FSPEC-…:757-759`) does still read *"AC-1.4's
**two named causes**"* against REQ's three (`REQ-…:224-228`), and FSPEC's AC-1.4 → AT map
(`FSPEC-…:2370`) offers AT-K3, AT-L2, AT-F13, AT-R7 — none of them reaching the third cause. The
author's **ERRATUM: FSPEC** is correctly raised, not a hedge. PROPERTIES PROP-COR-09 conjunct (2)
still reads *"contains **both** basenames"* (`PROPERTIES:386-387`) and §O-5's parenthetical still
reads *"in the consumed pair"* (`:296`) — both contradict REQ §4b, so the **ERRATUM: PROPERTIES** is
correctly re-emitted unresolved.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **Row 1b routes the new `no-op` but does not carry AC-1.4's two "still" obligations, and the new fixture asserts neither.** AC-1.4 states them as properties of the *status*, not of a cause: *"A `no-op` pass **still emits the AC-5.2 effectiveness table**, restating each prior promotion's standing verdict and state …, and **still releases the AC-1.3 marker**"* (`REQ-…:228-230`). §10.3's other rows enumerate their observables in full, and row 1b (`:2215`) enumerates only status / reason code / pair / count / report-body naming. The release half is covered generically — §12.2's release row asserts `{taken?, released?}` set-equally over `TERMINAL_STATUSES`, and `no-op` is a member — but that case's `no-op` arm will be built on whatever `no-op` fixture is nearest, and an early return specific to "nothing was readable" would not red it. The table half has **no** catch-all at all: AT-M9 asserts the table is appended when step 11 completed, on a fixture that is not this one. So an implementer who reads row 1b as "nothing to consume, nothing to do" and short-circuits above step 11 ships a pass that terminates `no-op`, reports the unread basenames, and silently drops the effectiveness table — on precisely the pass where an operator most needs the standing verdicts, since this pass contributes no new evidence. **Fix:** add the two obligations to row 1b's observable column (step 11's table and step 16's release both run; the route is a normal termination through `finishPass`, not an early exit), and add one conjunct to §12.2's second fixture — the effectiveness table record is present in the log double's accumulated text, with the mixed fixture as its control in the same case. | AC-1.4 (`REQ-…:224-230`), AC-5.2 |
| F-02 | Low | Local | **The new fixture's status oracle is pinned against the module's own catalogue, where the argument that licenses that only covers set-equality.** §12.2's added sentence reads *"Both fixtures pin the status against the terminal-status catalogue §6.4 freezes, not against a retyped literal"* (`:2833`). For the release row one cell below, ranging over `TERMINAL_STATUSES` is licensed explicitly and at length: the oracle **is** set equality over the catalogue, and §11.3(b) independently pins the catalogue three ways so it cannot shrink silently. Here the assertion is a **single value** — "terminal status is exactly `no-op`" — for which reading the value out of the module under test buys nothing and is the implementation echo §12's own rules forbid; a PLAN task following this cell literally could write `expect(state.status).toBe(TERMINAL_STATUSES[i])`, which greens on a catalogue reordering. **Fix:** state the expected value as the literal `"no-op"` transcribed from REQ AC-1.4 / §4b, and cite §11.3(b) as what keeps the catalogue honest rather than as the source of the expectation. | AC-1.4, NFR-5 (oracle quality) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01's table conjunct, if accepted, also belongs downstream: PROPERTIES PROP-COR-09 will need the second fixture (it currently describes one mixed fixture only, `PROPERTIES:383-392`) and PROP-COR-11's empty-pair property (`:400`) is the nearest neighbour. Is that carried by the standing **ERRATUM: PROPERTIES**, or does it want a second item naming the all-unreadable fixture explicitly? |

## Positive Observations

- **The repair went where the behaviour lives, not where the finding was written.** The finding
  pointed at §10.4; the fix moved the behaviour to §10.3, kept only the genuine residue in §10.4,
  and named the difference in the document's own vocabulary — *handled, not accepted*. That
  distinction is now reusable by the next author facing the same choice.
- **REQ's discriminator was carried as values, not as a paraphrase.** Row 1b spells the quiet-week
  distinction as *consumed list empty **and** un-consolidated non-empty*, the same enumerated
  values REQ §4b uses, so an operator staring at a log row can tell a corpus nothing can read from
  a quiet week without consulting either document.
- **The `no-op`/`failed` boundary is stated at the point of confusion.** Row 1b names row 1a as the
  branch an implementer is most likely to reach for, and §12.2's fixture asserts *not `failed`*
  positively rather than trusting the row's prose. That is the difference between documenting a
  hazard and binding it.
- **Conjunct (2) was upgraded to set equality on its own initiative.** The round-15 findings did
  not ask for it; NFR-5 did, and the author noticed. Containment oracles over "exactly the consumed
  set" are the class of defect that ships and is found by an operator, not a test.
- **The upstream gap was routed, not folded in.** FSPEC §5.3's stale "two named causes" is the real
  cause of the missing register coverage, and it was raised as an erratum rather than patched
  locally into a TSPEC row that would then disagree with its own parent.

## Recommendation

**Approved with minor changes**

Both round-15 findings are resolved in mechanism, and I checked the mechanism rather than the
changelog: §10.3 row 1b, §10.4's narrowed residue, §12.2's second fixture and §12.3's record all
exist and agree with REQ AC-1.4 and §4b at HEAD. Nothing blocks. Two non-gating items for the next
revision:

1. **F-01 (Medium)** — carry AC-1.4's *"still emits the effectiveness table"* and *"still releases
   the marker"* into row 1b's observables, and bind the table with one conjunct on §12.2's
   all-unreadable fixture against the mixed control.
2. **F-02 (Low)** — assert `"no-op"` as a literal transcribed from REQ, citing §11.3(b) as the
   catalogue's independent pin rather than as the expectation's source.

Both errata the document raises are confirmed against HEAD and re-emitted below, unresolved.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}


APPROVAL-HASH: sha256:65e0ea12bc1dd110bc67e35094cc0a4ad7453ece30af600df853eefe169f1848
REVIEWED-COMMIT: d74d80d01303896d425197d28b8fe7aacaf3867e

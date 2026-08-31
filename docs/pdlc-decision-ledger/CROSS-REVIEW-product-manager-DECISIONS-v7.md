# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (v1.6)
**Date:** 2026-08-31
**Iteration:** 7
**Round type:** Upstream-cascade confirmation (TSPEC moved after approval)
**Scope:** Local

## Context

Cascade confirmation, not a re-review. I approved DECISIONS at v1.5 in round 6
(`REVIEWED-COMMIT: 420edb564`, `UPSTREAM-STATE: TSPEC sha256:fc57bc56…4c27504`). TSPEC has since
moved twice — `df2b10154` (v1.3, re-ground on REQ v1.10 / FSPEC v1.4) and `757922341` (cite FSPEC
E-7 by id) — so that approval was taken against a TSPEC that no longer exists. The one question I
answer is whether DECISIONS is still a faithful compression of TSPEC **as it now stands**, measured
against current upstream text rather than against the routed-item list.

**What actually moved upstream.** `git diff 3a17387d6..HEAD` over TSPEC is four loci and nothing
else: the header `Upstream` pin (`REQ v1.9 → v1.10`, `FSPEC v1.3 → v1.4`), the v1.3 changelog entry,
and three citations that named FSPEC by version numeral now naming it by id — §4.1's `nonNegativeInt`
rationale (`TSPEC:813`), §6.1's `F-13` row (`TSPEC:1134`) and §7.6's `AT-14` row (`TSPEC:1702`), each
`FSPEC v1.3's E-7` → `FSPEC **E-7**`. **No measured value moves.** `maxEntries` `70`, `maxBytes`
`12500` and the four corpus literals (6,305 / 10,859 / 12,059 / 441) are byte-identical across the
edit. REQ at HEAD is `sha256:9bc8bc32…05f10d`, matching this dispatch; FSPEC at HEAD is
`sha256:48691453…a11256`, **unmoved** from my v6 anchor. TSPEC alone cascaded.

**One correction to the dispatch premise.** The dispatch states DECISIONS' own bytes have not
changed. They have: `1c0881dae` landed **v1.6** after my v6 approval anchor, +18/−4 lines. The change
is the routed erratum item that discharges my own v6 `F-02` — the two stale `TSPEC v0.7` HEAD
recitals at `:111` and `:412` now read "at HEAD" with no version list. I therefore reviewed the
v1.6 bytes, not the v1.5 bytes I approved, and say so here so the anchor this round writes is not
read as covering a version I never saw. This is a Process observation, recorded below as `F-03`; it
does not change the answer to the question, because the delta moves DECISIONS *toward* HEAD, not
away from it.

## Options Considered

Three dispositions are available to a cascade confirmation, and the evidence below decides between
them: (a) **re-confirm** — DECISIONS still compresses TSPEC at HEAD faithfully; (b) **route back** —
some claim DECISIONS makes about TSPEC is now false, so the document owes an ordinary revision round;
(c) **halt** — the cascade broke a load-bearing product claim. I weighed (a) against (b) by
re-reading every passage where DECISIONS leans on TSPEC text, against TSPEC at HEAD rather than
against my v6 notes.

Every claim below was re-measured against TSPEC HEAD (`sha256:2c84d525…11be49b`) in this round.

| DECISIONS claim (site) | Leans on | Verdict at TSPEC HEAD |
|---|---|---|
| "§3.6 states `12500 − 1200 = 11,300`" (`:111`, `:412`) | TSPEC §3.6 | **Holds.** `TSPEC:719` reads "leaves `12500 − 1200 = 11,300` bytes for lines", verbatim |
| "~4,995 bytes of project-level headroom" (`:111`, `:412`) | TSPEC §3.6 | **Holds.** `TSPEC:280`, `:719-720`, `:753`, `:946` all carry ~4,995 against project-level 6,305 |
| "`M-6b`'s 441" (`:111`, `:412`) | TSPEC §3.6 / §7.3 | **Holds.** `TSPEC:729` ("at least 441 bytes of headroom"), `:755` (441 as 12,059 against 12,500), `:759-760` |
| "`ERR-2` marked resolved" (`:412`) | TSPEC §9.2 | **Holds.** `TSPEC:1848` reads `**ERR-2 (RESOLVED upstream — REQ v1.8)**`; `:290` confirms §9.2 marks it resolved |
| "every surviving mention of 8,000 is explicitly tensed as retired" (`:112`, `:412`) | TSPEC, whole document | **Holds.** All surviving sites are past-tensed or explicitly labelled retired: `:686-687` ("at the `8000` default … then current"), `:717` ("replaced the retired `8000`"), `:773` ("the retired `8000` admitted"), `:1848-1852` (ERR-2's record). No untensed live use |
| "§3.6, §4.3, §7.3, D-10 and §9.2 all read against `12500`" (`:412`) | TSPEC discharge list | **Holds.** The erratum touched none of these five sections; `:719` (§3.6), `:1335` (§7.3's `6,305 ≤ 11,300`), `:1408` and `:1848` (§9.2) all read against 12,500 at HEAD |
| "10,859 and 6,305 are current as cited" (`:113`) | TSPEC §3.6 table | **Holds.** `TSPEC:702` (6,305) and `:705` (10,859) unchanged by the erratum |
| DEC-DECLEDGER-15: "`0` is a valid admits-nothing value … FSPEC E-7 and REQ C-5 now agree" (`:385`) | TSPEC §4.1 — **a section the erratum edited** | **Holds, and the edit strengthens it.** `TSPEC:813` still states `nonNegativeInt` is deliberate and that E-7 requires `maxEntries` `0` *and* `maxBytes` `0` alike to yield zero in-scope decisions; only the pointer's numeral changed. DECISIONS already cited **`FSPEC E-7` by id**, so it needed no change to stay in step |
| DEC-DECLEDGER-16's ceiling/measurement rule and its re-evaluation trigger (`:324-337`, `:372`, `:400`) | TSPEC §3.6 / §7.3 framing pin | **Holds.** `TSPEC:760` still states the block total is "deliberately" not asserted as an equality, and `:1335` still pins the two halves separately. The v1.5 directional restatement I reviewed in round 6 remains an accurate compression |
| Header `Baseline` pin **v1.2** (`:12`) | TSPEC header | **Holds.** TSPEC HEAD still pins Baseline **v1.2** (`TSPEC:11`); the erratum explicitly records it unmoved |

**The by-id citation shift cuts in DECISIONS' favour.** The one convention TSPEC changed is exactly
the one DECISIONS already followed: `DEC-DECLEDGER-15` cites `FSPEC E-7` by id at `:385` and `:413`,
never by numeral. Where DECISIONS names REQ versions in decision prose (`:152`, `:310`, `:413`,
`:431`) it does so historically — "REQ v1.8's raise", "landed in REQ v1.8" — a record of which edit
moved a value, not a claim about HEAD, which is the same disposition TSPEC's own v1.3 changelog takes
and which `DEC-DOC-01` permits.

## Decision

**Option (a) — re-confirm. DECISIONS still holds against TSPEC as it now stands.**

The cascade was a pin-and-pointer erratum, not a substantive one. TSPEC's v1.3 edit advanced a header
version pin and converted three FSPEC pointers from numeral to id; it moved no measured value, named
no new `BR-`, `E-` or `AC-` id, and touched none of the five sections (§3.6, §4.3, §7.3, D-10, §9.2)
that DECISIONS' TSPEC-dependent claims actually rest on. Every one of those claims re-verifies against
HEAD text, quoted line-by-line above. The single TSPEC section the erratum did edit — §4.1, which
`DEC-DECLEDGER-15` cites — retains its substance intact, and DECISIONS was already citing `FSPEC E-7`
by id, so it needs no follow-on edit to stay faithful.

Two Mediums and one Low are recorded below. All three are **`inherited`** — none was introduced by
this cascade, and none falsifies a claim DECISIONS makes about upstream. Under the confirmation bar
the only blocking defect is a load-bearing claim falsified at HEAD, and there is none. No High
finding, delta or inherited, exists in this document.

## Consequences

- **The DECISIONS approval re-stamps against TSPEC HEAD.** Its `UPSTREAM-STATE` anchors should carry
  REQ `sha256:9bc8bc32…05f10d`, FSPEC `sha256:48691453…a11256`, TSPEC `sha256:2c84d525…11be49b`.
- **Downstream phases are not disturbed.** PLAN and PROPERTIES derive from DECISIONS' substance, and
  no DECISIONS substance moved. This confirmation opens no work for `te-author` or `se-author`.
- **`F-01` stays deferred, not dropped.** DEC-DECLEDGER-16's equality prohibition still reads against
  DECISIONS' own `12500 − 1200 = 11,300` recital. It is the one item worth landing in the next
  non-frozen touch of this document, and it is a wording fix, not a decision change.
- **The routed `TSPEC v0.7` item is closed.** v1.6 landed it at both loci, and — better than a
  re-pin — it retired the version list entirely rather than re-transcribing numerals that would go
  stale on the next erratum. That disposition should outlive this feature; see `Q-01`.

DEFERRED: restore "**asserted**" to DEC-DECLEDGER-16's equality prohibition, or add the
allowance-identity carve-out, so `12500 − 1200 = 11,300` is not self-condemned (`F-01`).
DEFERRED: reconcile DEC-DECLEDGER-13's "~154-byte mean line" with §3.6's project-level mean of 153
at consolidation (`Q-02`, carried from v2).

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Finding | Requirement ref |
|----|----------|-----------|----------|----------------|---------|-----------------|
| F-01 | Medium | inherited | nonlocal | `## Context` DEC-16 narrative (`:324-326`), `## Decision` DEC-16 row (`:372`) | Carried unresolved from v6. DEC-DECLEDGER-16's v1.5 restatement dropped the word **asserted** from the equality prohibition: v1.4 read "never a term in an **asserted** equality", v1.6 still reads "A ceiling may therefore never be a term in an equality" (`:324`). Read literally that condemns this document's own `12500 − 1200 = 11,300` recital at `:111` and `:412`, which is a ceiling-derived allowance stated as an identity — and which TSPEC §3.6 states in exactly that form at `TSPEC:719`, so the recital is faithful and the rule is what is mis-stated. The rule's operative test (substitution preserves the claim) is stated correctly and yields the right verdict on every real site, so no downstream artifact is misled today; the fix is a wording restoration — "never a term in an **asserted** equality, nor in prose stating an implementation's size as a standing fact" — plus an explicit line permitting a ceiling-derived allowance to be stated as an identity where it is only ever used as an upper bound | REQ-DECLEDGER-07; REQ C-5 |
| F-02 | Low | inherited | nonlocal | `## Context` v1.4 changelog entry (`:51-52`) | The v1.4 changelog reads "`TSPEC-pdlc-decision-ledger.md` **is now v0.7** and pinned at REQ **v1.9** / FSPEC **v1.3**" in the present tense, which is false at HEAD (TSPEC v1.3, REQ v1.10, FSPEC v1.4). v1.6 addresses this explicitly and defensibly — a changelog entry is "a record of what that edit did, not a claim about HEAD" (`:29-31`) — and TSPEC's own changelog takes the same disposition, so the convention is consistent and this is not a live defect. Recorded only because the present-tense "is now" is the one phrasing that reads as a HEAD claim rather than a dated record; a past-tense "was pinned at" in future changelog entries would remove the ambiguity at zero cost | REQ-DECLEDGER-07 |
| F-03 | Medium | inherited | nonlocal | Dispatch premise vs `1c0881dae` | The dispatch states DECISIONS' own bytes have not changed since my approval, but `1c0881dae` landed **v1.6** (+18/−4) after the v6 anchor at `420edb564`. The v1.6 content is benign and welcome — it discharges my own v6 `F-02` — so nothing product-facing is at risk, and I confirmed the v1.6 bytes rather than the v1.5 bytes I approved. The finding is that a cascade dispatch computed "own bytes unchanged" against a stale anchor: had the intervening edit been substantive rather than a routed erratum, the confirmation round would have re-stamped an approval over unreviewed content. The anchor a cascade dispatch reads should be re-derived from disk at dispatch time, and where the document has moved the round should be announced as a delta round, not a pure cascade | Process; DEC-ERR-03 |

FINDING: Medium | inherited | nonlocal | DEC-DECLEDGER-16 equality prohibition dropped "asserted", self-condemning this document's own `12500 − 1200 = 11,300` recital
FINDING: Low | inherited | nonlocal | v1.4 changelog states "TSPEC is now v0.7" in present tense, false at HEAD but defensibly scoped as a dated record
FINDING: Medium | inherited | nonlocal | Cascade dispatch claimed DECISIONS bytes unchanged, but v1.6 (`1c0881dae`) landed after the v6 approval anchor

All three findings are `inherited` and none is High, so none gates this phase. `F-01` and `F-02`
belong to DECISIONS' own next revision touch; `F-03` is a `Process` finding about the cascade
dispatch mechanism and is routed to harvest, not to this document's author.

## Questions

| ID | Question |
|----|---------|
| Q-01 | v1.6 retired the version list from both recitals rather than re-pinning it, on the reasoning that "a version numeral in prose is guaranteed staleness" (`:27-28`). TSPEC v1.3 reached the same conclusion independently for its FSPEC pointers. Two documents converging on the same rule in the same round is the signature of a durable constraint — should "cite upstream by id and by 'at HEAD', never by version numeral, outside dated changelog entries" be promoted to `docs/_constraints/DOMAIN-CONSTRAINTS.md` at harvest, as a strengthening of `DEC-DOC-01`? Non-blocking; raised so the signal is not lost with this file. |
| Q-02 | Carried from v2/v3/v4/v5/v6, still open and still non-blocking: DEC-DECLEDGER-13's "~154-byte mean line" (`6,305 / 41 = 153.8`) against §3.6's project-level mean of **153**. Rounding only; no conclusion turns on it, and I do not press it in a confirmation round. |

## Positive Observations

- **The document was already immune to the cascade that hit it.** TSPEC's v1.3 erratum existed to fix
  three FSPEC pointers that named a version numeral. DECISIONS cites `FSPEC E-7` by id at `:385` and
  `:413` and never by numeral, so the exact churn that forced an upstream edit produced **zero** work
  here. That is the `DEC-DOC-01` discipline paying out, and it is why this confirmation is short.
- **v1.6 fixed the right thing in the better way.** My v6 `F-02` asked for two stale "TSPEC v0.7"
  literals to be re-stamped to the then-current version. The author declined the literal request and
  did something stronger — retired the version list entirely in favour of "at HEAD" — which is why
  the very next TSPEC bump, landing days later, did not re-stale those two sites. A reviewer's
  suggested fix improved on in the revision is the loop working as intended.
- **The v1.6 changelog does the honest bookkeeping.** It names both loci, states plainly that no
  derived figure moves and no decision changes, and pre-empts the obvious objection by explaining why
  the v1.4 entry still says v0.7 (`:29-31`). A reader can audit the claim without leaving the file.
- **The five-section discharge list survived the cascade untouched and still verifies.** §3.6, §4.3,
  §7.3, D-10 and §9.2 all still read against `12500` at TSPEC HEAD, with `11,300`, ~4,995, 441 and
  `ERR-2 (RESOLVED)` all quotable at the lines cited. The worked example DEC-DECLEDGER-10/-12 keeps
  for future one-pass re-measurements is still a true example.

## Recommendation

**Approved with minor changes.**

DECISIONS remains a faithful compression of TSPEC as it now stands. The cascade moved a version pin
and three citation forms and nothing DECISIONS depends on; every TSPEC-derived claim in the document
re-verifies against HEAD text. No High finding exists, delta or inherited, so nothing gates this
phase. `F-01` (Medium) and `F-02` (Low) are carried to DECISIONS' next non-frozen touch as recorded
DEFERRED items; `F-03` (Medium) is a Process finding against the cascade dispatch mechanism and is
routed to harvest rather than to this document.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

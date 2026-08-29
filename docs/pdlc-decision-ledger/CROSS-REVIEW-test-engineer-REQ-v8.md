# Cross-Review: test-engineer — REQ (delta confirmation, v1.8 erratum)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.8)
**Date:** 2026-08-28
**Iteration:** 8
**Round type:** delta confirmation over a previously approved REQ
**Scope:** the v1.8 erratum edit only — C-5's two threshold rows, §6 R-5, §7 A-1, and the Baseline pin. Sections the edit did not touch were re-read for breakage, not re-litigated.

## Delta Under Review

`git diff 6fd604320..HEAD` over the REQ is 19 insertions / 11 deletions across four places, and
nothing else moves:

| Site | Change |
|---|---|
| Header table | Baseline pin `v1.1` → **`v1.2`**; Status version `1.7` → `1.8`; a v1.8 erratum changelog paragraph added |
| §4 C-5, `maxEntries` row | Type `positive integer` → **`non-negative integer`**, with the reason stated in the row: `0` is a valid admits-nothing value, not a malformed one falling back to `70` |
| §4 C-5, `maxBytes` row | Default `8000` → **`12500`**; type `positive integer` → **`non-negative integer`**; rationale re-sourced from analogy to `M-7b`/`M-7c` by id |
| §6 R-5 and §7 A-1 | The "unmeasured analogy" claim retired; R-5 restated as the *growth-model* residual risk (`M-6d`/`M-7d`), A-1 restated as both defaults measured-once-and-cited, still operator-revisable |

The edit is genuinely confined to C-5's two thresholds and the two clauses that recited their
provenance. No acceptance criterion, no `US-*`, no `G-*`, no `O-*` row changed bytes.

## Routed Items — Disposition

Nine routed items reduce to two distinct asks. Both land.

| Routed ask | Raised by | Landed? | Evidence at HEAD |
|---|---|---|---|
| Retype `maxEntries`/`maxBytes` **non-negative**, so FSPEC E-7's `maxEntries: 0` admits-nothing value is valid rather than malformed-falling-back-to-`70` (TSPEC ERR-1; `parseLearningsConfig` precedent) | se-author (×4), pm-review | **Yes** | REQ `:172–173` — both rows read `non-negative integer`; the `maxEntries` row states the semantics explicitly, the `maxBytes` row inherits it by "Non-negative as above" |
| Raise `maxBytes` off the falsified `8000` analogy to a **measured** value | pm-review (×2), te-review, se-author (×4) | **Yes** | REQ `:173` — `12500`, sourced to Baseline `M-7c`, which is a real entry in a real file at the pinned version (below) |
| Retire the "unmeasured analogy" recital that R-5 and A-1 carried | pm-review, se-author | **Yes** | §6 R-5 `:327–330` and §7 A-1 `:374–378` both now cite `M-6b`/`M-6c` and `M-7b`/`M-7c` by id; neither says "analogy" |

The non-negative retype is not merely a type-label change; it is now **oracle-consistent with an
existing AC.** REQ-DECLEDGER-07 (`:290`) already enumerated "`maxEntries` of `0`, as zero in-scope
decisions, not an error" as a stated boundary outcome. Under v1.7's `positive integer` that clause
described a value C-5 declared invalid — a boundary case whose expected value contradicted the
type row it was configured by. The delta removes that contradiction, and a tester can now write
the `maxEntries: 0` case against a single-valued expectation. That is the strongest thing in this
edit and it was not among the routed asks.

## Re-Derivation of the Measurement

I did not take `12500` on the REQ's word. Four checks, all at HEAD.

**1. The cited authority exists at the pinned version.** `docs/_constraints/pdlc-decision-corpus-baseline.md`
reads `Version: 1.2 · 2026-08-28`, `Verified at HEAD 8c673a09f`, and §8 carries `M-7a`–`M-7e`
(`:105–113`). The REQ pins Baseline **v1.2** in its header, so the pin and the cited ids agree.
This is the check that has failed three times across features (nonexistent-authority citations);
it passes here.

**2. The record count reproduces.** The strict heading predicate over
`docs/_decisions/DECISIONS-*.md` yields **41** lines at HEAD — the same 41 `M-1a`/`M-1d` and C-5
have been sized against since v1.5.

**3. `M-7a`'s substance sum reproduces to within the framing convention.** Summing
`len(id + one-line heading statement + file path)` over those 41 records gives **5,344** against
`M-7a`'s **5,262** — an 82-byte spread attributable to the section-number token my re-derivation
retains and `M-7d`'s convention excludes. Mean 130 against `M-7a`'s implied 128. The floor is real,
not asserted.

**4. The headroom claim is arithmetically true under the TSPEC's own rendering convention, which
is the stricter of the two.** Two conventions are in play and they must be reconciled before
`12500` can be called sufficient:

| Convention | 41 project-level | 63-record worst standing case (`M-6b`) |
|---|---|---|
| Baseline `M-7` **substance** (id + heading statement + path, no separators) | 5,262 | **9,296** (`M-7b`) |
| TSPEC §7.3 **rendered index bytes** (separators and `\n`-join charged) | 6,305 | **10,859**; **12,059** with the 1,200-byte framing/preamble budget (D-5) |

The REQ declares a **50 bytes/record** framing allowance on top of `M-7b` (`3,204` across 63).
The TSPEC's rendering actually consumes `12,059 − 9,296 = 2,763`, i.e. **44 bytes/record**. The
allowance therefore covers the real format with margin, and `12,500 − 12,059 = 441` bytes of
headroom survive against the worst standing case — roughly two further feature-level lines at the
observed mean. `8000` was below `M-7b` outright, so the delta moves the default from
*truncates-on-day-one* to *admits-the-worst-standing-case*. The routed ask is satisfied on its
merits, not just on its wording.

One superseded figure deserves a note so it is not re-litigated later: my and pm-review's earlier
`9,371` (project-level) and `16,283` (63-record) measurements — `CROSS-REVIEW-product-manager-TSPEC-v1.md:44`
— were taken against the round-1 §4.3 render format, which has since been slimmed. Under the
current format the same sets measure 6,305 and 10,859, independently reproduced in
`CROSS-REVIEW-product-manager-TSPEC-v3.md:22` and `CROSS-REVIEW-test-engineer-TSPEC-v4.md:92`.
`12500` is sized against the format the spec now renders. The retired figures are not evidence
against it.

## Breakage Check on Previously Approved Material

I re-read the REQ at HEAD rather than reasoning from the diff alone.

| Previously approved property | Still holds? | Note |
|---|---|---|
| C-3's key set is exactly three (`enabled`, `maxEntries`, `maxBytes`) | Yes | `:159` untouched; REQ-DECLEDGER-05's set-equality oracle (`:255`) still crosses exactly those three with {wrong type, malformed, absent} |
| REQ-DECLEDGER-07's bound semantics — `maxBytes` bounds the rendered index text alone | Yes | `:175`, `:286` untouched; the bound's *behaviour* is value-independent, which is precisely why A-1 can leave the values operator-revisable |
| `maxEntries` floor rationale (`M-6b` 63, `M-6c` 70 clears by 7) | Yes | Unchanged text, and `M-6b`/`M-6c` still exist in Baseline v1.2 |
| No AC transcribes `8000` as a literal expected value | Yes | Grep for `8000` across the REQ returns only the v1.8 changelog's historical recital (`:24`). No oracle in this document was silently invalidated by the value move |
| R-5 still names a residual risk rather than declaring the risk closed | Yes, and better | The old R-5 was "not measured"; the new one is "measured against one commit, not a growth model", which is the honest residual and is monitorable — a re-measurement that bumps Baseline `Version` is the observable trigger (`M-7d`, *Change control*) |

The last row matters for the re-evaluation-trigger check I owe on risk clauses: R-5's new form has
an **observable** trigger (Baseline version bump on re-measurement) where the old form had only a
standing caveat. Nothing regressed.

**Two recitals downstream did not cascade with the delta**, and are filed below rather than
waved through. They break no oracle in *this* document, which is why neither is High.

## Questions

| ID | Question |
|----|---------|
| Q-01 | With `maxBytes` now admitting `0`, is `maxBytes: 0` intended to read "as zero in-scope decisions, no index block at all" — exactly the mapping REQ-DECLEDGER-07 already gives `maxEntries: 0` — or "index block rendered, every line omitted"? F-01 asks for the clause; this question is what the clause should say. My reading is the former, for symmetry, but the expected value is the author's to fix, not mine to infer. |

## Positive Observations

- **The erratum fixed a latent oracle contradiction it was not asked to fix.** REQ-DECLEDGER-07's
  `maxEntries: 0` boundary clause has been in the document since v1.5, describing a value C-5's
  `positive integer` type declared invalid. A tester writing that case would have had to ask which
  clause wins. The retype resolves it, and it resolves it in the direction FSPEC E-7 and the
  shipped `parseLearningsConfig` precedent both already assume.
- **`12500` is cited by id, not transcribed.** The REQ names `M-7b`/`M-7c` and bumps its Baseline
  pin to the version that introduced them. That keeps the number re-derivable from a versioned
  substrate with change control, rather than frozen into REQ prose where drift would be invisible —
  the same discipline `maxEntries` already followed against `M-6b`/`M-6c`.
- **The framing allowance is declared, not implied.** `M-7d` deliberately refuses to fix a render
  format and requires the consumer to declare its own allowance on top of the substance floor. C-5
  declares 50 bytes/record. The TSPEC's actual format needs 44. The two documents meet at a stated
  number rather than at an assumption, which is what makes the sufficiency claim checkable at all.
- **R-5 got harder, not softer, while the risk it named was being closed.** Retiring the
  "unmeasured" claim would have licensed dropping R-5; instead it was restated as the growth-model
  residual with `M-6d`/`M-7d` cited. That is the right instinct.

## Recommendation

**Approved with minor changes.**

The delta resolves both routed items on their merits — the retype is oracle-consistent with an AC
that previously contradicted it, and `12500` re-derives from a Baseline entry that exists at the
pinned version and reproduces against HEAD. Nothing previously approved is broken.

Two Mediums and one Low are recorded, none gating. F-01 is the only one inside this document: the
retype made `maxBytes: 0` admissible configuration without giving it the stated outcome its sibling
`maxEntries: 0` has, so that boundary case currently has a two-valued expected value. One clause in
REQ-DECLEDGER-07, symmetric with the one beside it, closes it. F-02 and F-03 are the downstream
recitals of the retired `8000` and `positive integer` that the v1.8 changelog says "cascade" — the
cascade has not landed at HEAD, and until it does FSPEC and REQ disagree on a shipped default in
plain sight.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | Medium | delta | local | `maxBytes: 0` is now admissible configuration but has no stated outcome, so its boundary case is two-valued | §4 C-5 `maxBytes` row / REQ-DECLEDGER-07 boundary enumeration |
| F-02 | Medium | delta | nonlocal | FSPEC still recites `maxBytes 8000` and the retired analogy; the changelog's "cascades" has not landed at HEAD | FSPEC §3.3 `:111`, FSPEC §7 A-1 `:545` |
| F-03 | Low | delta | nonlocal | TSPEC's type comment, config sample and fixture defaults still carry `8000`; ERR-1/ERR-2 are now answered and can close | TSPEC `:496`, `:514`, `:760`, `:942`, §9.2 ERR-1/ERR-2 |

FINDING: Medium | delta | local | §4 C-5 `maxBytes` row / REQ-DECLEDGER-07 boundary enumeration | The retype from `positive integer` to `non-negative integer` makes `maxBytes: 0` valid configuration, but REQ-DECLEDGER-07 (`:288-290`) enumerates a stated outcome for `maxEntries: 0` ("as zero in-scope decisions, not an error") and for "a single line alone exceeding `maxBytes`" — not for `maxBytes: 0` itself. Its clause "Rendering is total, one stated outcome per boundary case" is therefore no longer satisfied by its own enumeration. A tester cannot write the `maxBytes: 0` assertion without choosing between two readings: no index block at all (the `maxEntries: 0` mapping), or an index block rendered with every line omitted (composing the single-line-exceeds rule). Under `positive integer` this case did not exist, so this is created by the edit. Fix: one clause beside the existing one — "`maxBytes` of `0`, as zero in-scope decisions" — restoring symmetry.
FINDING: Medium | delta | nonlocal | FSPEC §3.3 `:111` and §7 A-1 `:545` | The v1.8 changelog asserts in the present tense that "FSPEC §3.3's recital of the default cascades", but at HEAD FSPEC `:111` still reads "`maxEntries` `70`, `maxBytes` `8000` (REQ C-5)" and FSPEC `:545` still reads "`maxBytes` (8000) is a `learningsInjection`" analogy. Two approved documents now state different shipped defaults for the same key and attribute one of them to a rationale the REQ has retired. This is a downstream cascade, not a REQ defect — tagged `inherited`-adjacent by nature but genuinely introduced by this edit, hence `delta`/`nonlocal`, and non-gating for this phase. It needs to land before FSPEC is re-confirmed, or the FSPEC's own C-5 citation is false.
FINDING: Low | delta | nonlocal | TSPEC `:496`, `:514`, `:760`, `:942`, §9.2 ERR-1/ERR-2 | TSPEC's `ReviewConfig` comment (`// non-negative integer, default 8000`), its "C-5's \"positive integer\" type label" note, its config sample and its "C-5's shipped defaults" fixture all still carry `8000`; §9.2's ERR-1 and ERR-2 are the erratum entries this REQ round answers. Low rather than Medium because TSPEC is still in its own review loop and its ERR ledger exists precisely to be closed by this landing — but the fixture defaults at `:760`/`:942` are transcribed literals that will become wrong expected values the moment they are executed, so they are the ones to move first.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 4
**Scope:** REQ-pdlc-review-convergence v1.2, delta re-review against the v1.1 tree reviewed at iterations 2 and 3 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

The document **was revised this round**, substantially and on purpose. Round 3's empty-round finding
(F-08) is answered by its own AC.

- Baseline: `f4560d3` (*"docs(pdlc-review-convergence): SE REQ v3 — verdict"*), the commit carrying my
  v3 cross-review. `git diff f4560d3 HEAD -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
  is **+354 / −75** across 20 commits (`9ff3de8` … `6430f89`), tree clean.
- The version row now reads **1.2**, there is a *Revision note (v1.2)*, and **§10.7** maps every
  round-2/3 finding from both panels to where it is answered.
- Scanned sections: the header, §3 BL-01, §4.3 M-3d, §4.7, §5 (both definition tables and the string
  catalogue), AC-1.5(4), AC-2.2, AC-2.4, AC-2.7, **AC-2.8 (new)**, AC-3.2(2), AC-3.3, AC-3.4,
  AC-3.5(a)(e), AC-4.1, AC-4.7, §6, N-3, N-7, O-4, **O-12 (new)**, O-10, R-5, **R-8 (new)**, §9.3,
  §10.7. Unchanged sections I approved earlier are not re-litigated.
- Verification pass this round: three existing-code claims are **new or restated** in v1.2 and I checked
  all three against the citation baseline `9486c81` in one pass, plus one claim the REQ makes about the
  digest it reuses. Results are in *Positive Observations* and in G-03.

## Round-2/3 disposition

**All eight prior findings are closed.** Each was checked at the surface it named, not at the
revision note that claims it.

| Prior finding | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 — `DOC-BYTES:` cannot be written by `appendApprovalAnchors`; growth formula circular | High | **closed** | AC-4.1 now names **`appendRoundAnchors`**, an unconditional per-round writer that runs "after round N's reviewers have returned — before AC-2 is evaluated, and regardless of the round's verdict"; §5 carries a two-writer table separating it from `appendApprovalAnchors`; growth is restated as `DOC-BYTES(N) − DOC-BYTES(N−1)`, both endpoints past; §6's `DOC-BYTES:` row and O-4 restated to match. The read-instant/persist-instant split is stated explicitly and is the right fix. |
| F-02 — a failed verifier round reads as *crashed* | High | **closed**, twice over | §5's *panel shape* and *crashed* are now stated over the **on-disk role-slug set alone** with the marker explicitly excluded; AC-2.4 gains a "why over slugs" paragraph; and AC-3.5(a) independently widens the Given to "a single verifier — **whatever verdict it returned**". Belt and braces, correctly, since either alone would close it. |
| F-03 — AC-3.2(2)'s "not counted" rule has no reader | High | **closed** | Reading 2 chosen and stated: the verifier excludes the finding from **its own** trailer; "The loop performs no subtraction and parses no findings table"; `blocking(N)` keeps one definition. §5's S-9 receiver, N-3 and R-5 all restated consistently. R-5 additionally records the failure direction (a verifier that ignores it halts *earlier*, never later) — that is the right thing to say about an unenforced clause. |
| F-04 — trailer placement unspecified; anchor makes a trailer-less file *malformed* | Medium | **closed in substance** (one residue, G-05) | AC-3.4 now requires the trailer to be the first non-empty line after `VERDICT:` and excludes anchor lines as candidates; AC-2.7 gains a five-row observation table whose fourth row makes an anchor line read *unavailable*. The operator-facing inversion is fixed. The two clauses do not agree on the reader's algorithm — see G-05. |
| F-05 — AC-1.5(3)'s reset has no durable observable | Medium | **closed in substance** (one residue, G-04) | AC-1.5 gains clause 4: `WINDOW-START: {N}` appended by the loop to the resolved POSTMORTEM, one-shot consumption, fail-closed receive side; §5's durability table gains both rows. The consumption half was not asked for and is a genuine improvement. Its durability across a *second* halt is unstated — see G-04. |
| F-06 — §4.7 pins claims to the unreachable `d11dad5` | Low | **closed** | Both bullets restated at `9486c81`, with the v1.1 pin recorded as the defect rather than deleted. |
| F-07 — `7bc559a` called a merge commit | Low | **closed** | §3 BL-01 now says "single-parent, not a merge commit"; the closing paragraph drops the parenthetical. |
| F-08 — a re-review round dispatched with no intervening revision | Low/Process | **closed, and mechanised** | AC-2.8 makes a zero-delta round a halt with its own reason (S-11), `DOC-SHA256:` (S-10) supplies the exact endpoint, R-8 records the authoring-side residue and binds it to the runtime-measurement spike, O-12 specifies the plumbing, §9.3 gains the binding row. This is more than the finding asked for and the reasoning in "Why this is a halt and not a notice" is correct. |

The five open findings below are **all new in v1.2** — every one of them is in text this revision
added. None re-litigates a section I approved.

## Findings

New ids (`G-`) so they cannot be confused with the closed `F-` series.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| G-01 | High | Local | **AC-2.2 and AC-4.7 contradict each other on the S-3/S-4 co-occurrence**, and both clauses are new in v1.2. AC-2.2 says that on the last admitted round the fixed-point test and the budget "can both be satisfied; the `notice` cell then carries S-3 and S-4 in that order". AC-4.7's precedence table, row 2, says of exactly those two notices: "at most one of the two can appear on a round". A test author writing O-10's assertion for the co-occurrence case AC-2.2 constructs gets opposite expected cells from the two clauses, against a document whose own bar is "derive the exact cell, character for character, from this document alone" (AC-4.7). One of the two must be retracted. | AC-2.2, AC-4.7 precedence row 2, O-10 |
| G-02 | Medium | Local | **AC-2.8's S-11 notice has no report row to land in.** AC-4.7 emits "one row per round" and ranks S-11 first in the `notice` precedence, but AC-2.8 says round N is "**not** dispatched and **not** counted against AC-1's budget" — so round N produces no cross-review files, and §5's durability table derives the round set from the `CROSS-REVIEW-{role}-{doc}-v{N}` basenames (M-1d), which will not contain N. Either there is no row for N (and S-11 is unreachable in the column that lists it), or there is one whose `panel-shape`, `blocking`, `growth-bytes` and `classification` cells are all underivable — and mechanically applied, that row renders as `crashed` / `unavailable` / empty / `unmeasurable` with three spurious S-5/S-6 notices, presenting a no-revision halt as a crash. Neither reading is stated. | AC-2.8, AC-4.7, §5 durability table, O-8, O-12 |
| G-03 | Medium | Local | **`DOC-SHA256:` does not digest the bytes `DOC-BYTES:` counts**, contrary to AC-4.1's two claims about it. AC-4.1 says it is "the SHA-256 of the same bytes `DOC-BYTES:` counts", and §6 and AC-4.1 both close the question by saying it "reuses the hashing the tier-1 approval anchors already perform". That hashing is `sha256Hex` (`pdlc/workflows/orchestrate-dev.js:848`), whose first act is `canonicaliseForDigest` (`:767`) — CRLF/CR → LF, exactly one trailing newline — and whose JSDoc states the normalisation is applied "INSIDE `sha256Hex`, never by a caller" (`:752-759`). `DOC-BYTES:` counts raw bytes. FSPEC is therefore told both to reuse a canonicalising digest and to digest the raw bytes; the two cannot both hold, and which one is chosen decides AC-2.8's answer on a line-ending-only revision. | AC-4.1, S-10, §6 `DOC-SHA256:` row, AC-2.8, O-4 |
| G-04 | Medium | Local | **AC-1.5(4)'s `WINDOW-START:` anchor lives in a file the halt path rewrites, and nothing protects it.** The existing halt dispatches an agent with the bare prompt `Write docs/{feature}/POSTMORTEM-{phase}-{feature}.md` (`pdlc/workflows/orchestrate-dev.js:1912-1918`) — no read-modify-write, no preservation obligation, and the REQ amends neither that prompt nor O-5/O-12 to add one. After a reset (`RESOLVED: yes` + `WINDOW-START: 4`) the loop can halt again and rewrite that same path. If the agent preserves the human's `RESOLVED: yes` but not the loop's `WINDOW-START:` — the likelier outcome, since only the former is documented as precious — the reset reads as **unconsumed** on every subsequent invocation, which is precisely the "silently restores the per-invocation budget AC-1.1 exists to abolish" failure clause 4 was added to prevent. AC-1.5(4)'s fail-closed receive side covers absent/duplicate/unparseable values, not a clobbered file. | AC-1.5(4), §5 durability table rows 3–4, AC-1.4, O-5, O-12 |
| G-05 | Medium | Local | **AC-3.4 and AC-2.7 define the trailer reader as two different total functions.** AC-3.4 says the reader "**skips** lines matching the anchor grammar when locating the candidate line"; AC-2.7's table row 4 says that when "the first non-empty line after `VERDICT:` is an **anchor line** … rather than a count trailer", the count is *unavailable*. On the input `VERDICT:` → anchor line → valid count trailer, AC-3.4 yields a readable count and AC-2.7 yields *unavailable*. DC-01 requires the receive side to be total **and single-valued** before FSPEC authoring; two clauses of the same REQ giving different answers to the same observation is not that. Separately, AC-3.4's enumeration of the anchor set omits `DOC-SHA256:` (four keys where AC-2.7's row 4 lists five), so the skip-set itself has two memberships. | AC-3.4, AC-2.7 observation table, S-10, O-9, O-10 |

## Findings in detail

### G-01 (High) — the two new co-occurrence clauses disagree

AC-2.2, the paragraph added to answer TE Q-02:

> On the last admitted round the fixed-point test and the budget can both be satisfied; the `notice`
> cell then carries S-3 and S-4 in that order.

AC-4.7, the precedence table added to answer TE F-04, row 2:

> S-3 `fixed-point:` / S-4 `budget-exhausted:` — the other halts; **at most one of the two can appear
> on a round**.

These are the same round and the same cell. The rest of the precedence table is sound and the ordering
choice is defensible; the defect is one justification clause that asserts mutual exclusion the sibling
AC explicitly denies.

**Required change:** delete "at most one of the two can appear on a round" from row 2 and state instead
that when both hold they render in the order S-3 then S-4 (which is what AC-2.2 says and what the row's
own position already implies). Then make O-10 name the two-halt row alongside the crashed-round row it
already names, so the case is asserted rather than assumed.

### G-02 (Medium) — S-11 has no row

AC-2.8 is well argued and I agree with the halt. Its report surface is the gap.

Round N is never dispatched, so it writes no `CROSS-REVIEW-{role}-{doc}-v{N}.md`. Every column of
AC-4.7's schema except `round` is derived from files at that round: `panel-shape` from the slug set
(empty ⇒ `crashed`), `blocking` from the trailers (absent ⇒ `unavailable`), `growth-bytes` and
`classification` from the round's `DOC-BYTES:` anchor (absent ⇒ `unmeasurable`). Applied literally, the
halt row reads

```
N | crashed | unavailable | | unmeasurable | no-revision: … ; not-comparable: crashed-round ; not-comparable: unavailable-count ; growth-unmeasurable: no-anchor
```

— i.e. the operator's primary evidence that the *author* did nothing is presented as a *crash*, with
three notices that are artefacts of the halt rather than observations about the run. The alternative
reading — the round does not exist, so there is no row — makes S-11 unreachable in the very column
AC-4.7 lists it in, and leaves the halt reason visible only in the POSTMORTEM.

**Required change:** state in AC-2.8 (or AC-4.7) which of the two it is. The cheaper and more honest
one is a row for N whose `panel-shape`, `blocking`, `growth-bytes` and `classification` cells are all
**empty** — round N was not dispatched, so there is nothing to report about it — with `notice` carrying
S-11 alone. Say so explicitly, because AC-4.7's own bar is character-for-character derivability, and
add the row to O-10 beside the crashed-round row.

### G-03 (Medium) — which bytes are digested

Verified at the citation baseline `9486c81`:

- `sha256Hex(text)` (`pdlc/workflows/orchestrate-dev.js:848`) computes `utf8Bytes(canonicaliseForDigest(text))`.
- `canonicaliseForDigest` (`:767`) normalises CRLF and lone CR to LF and forces exactly one trailing
  newline.
- Its JSDoc (`:752-759`) makes the normalisation non-optional and caller-invisible on purpose: *"Both
  are applied INSIDE `sha256Hex`, never by a caller, so no two call sites can disagree about which bytes
  were digested."*

So the digest the tier-1 anchors perform is **not** over the bytes `DOC-BYTES:` counts, and AC-4.1's
sentence *"It is the SHA-256 of the same bytes `DOC-BYTES:` counts"* is false of the mechanism the same
paragraph tells FSPEC to reuse. Consequence for AC-2.8: on a revision that changes only line endings or
trailing newlines, `DOC-SHA256` is unchanged while `DOC-BYTES` differs, so the conjunction fails and the
round proceeds. That is the safe direction, which is why this is Medium and not High — but the REQ
should be right about its own subject, and the choice is REQ-altitude precisely because §6 closes it
("reuses the hashing … already perform") rather than leaving it to O-4.

Note also that the two anchors render the same digest differently: `APPROVAL-HASH:` carries the
`sha256:{64 hex}` prefixed form produced by `approvalHashOf` (`pdlc/workflows/orchestrate-dev.js:950`),
while S-10 fixes `DOC-SHA256:` as bare 64 hex. That is a legitimate choice — the receivers differ — but
it is a second reason to say plainly which function produces the value.

**Required change:** in AC-4.1 and §6, state which bytes are digested. Either (a) `DOC-SHA256:` is
`sha256Hex` of the document as read at `t0`, i.e. **over the canonical form**, and say so, dropping the
"same bytes `DOC-BYTES:` counts" claim; or (b) it is a raw digest, in which case it is **not** a reuse
of the tier-1 hashing and O-4 must say so. (a) is preferable: it inherits the canonicalisation
discipline the digest family was built around, and AC-2.8's conjunction with `DOC-BYTES:` already
recovers the byte-exactness the canonical form drops.

### G-04 (Medium) — the reset anchor is not protected from the halt path

Verified at `9486c81`: the budget halt writes the POSTMORTEM by dispatching an agent with the prompt
`Write docs/${feature}/POSTMORTEM-${phase}-${feature}.md.` plus a section list
(`pdlc/workflows/orchestrate-dev.js:1912-1918`), then confirms only that the path exists
(`:1939-1940`). There is no read of the prior file, no merge, and no instruction to preserve anything.
AC-1.5(4) places both the reset's origin and its consumption record inside that same path.

Three outcomes are possible and the REQ picks none:

| The halt agent … | Result |
|---|---|
| overwrites the file wholesale | `RESOLVED: yes` and `WINDOW-START:` both vanish ⇒ unresolved POSTMORTEM ⇒ phase refuses, fail-closed. Benign. |
| preserves `RESOLVED: yes` and drops `WINDOW-START:` | the reset reads **unconsumed** ⇒ a fresh 3-round window on **every** subsequent invocation — the exact defect clause 4 names. |
| preserves both | correct. |

The middle row is not exotic: `RESOLVED: yes` is documented repo-wide as operator-owned and precious,
`WINDOW-START:` is a line this REQ invents and no prompt mentions.

**Required change:** one clause. Either (a) require the halt path to preserve any existing
`RESOLVED:` / `WINDOW-START:` lines when it rewrites the POSTMORTEM, and add that obligation to O-5 (it
is a prompt amendment, so O-9 is the natural home); or (b) put `WINDOW-START:` somewhere the halt path
does not rewrite. (a) is smaller and keeps the reset's two halves in one file, which is what makes the
one-shot rule readable.

### G-05 (Medium) — one reader, two definitions

AC-3.4:

> The trailer reader therefore **skips lines matching the anchor grammar** when locating the candidate
> line.

AC-2.7, row 4 of the observation table:

> A `## Verdict` section exists and the first non-empty line after `VERDICT:` is an **anchor line**
> (`APPROVAL-HASH:`, `REVIEWED-COMMIT:`, `REVIEW-MODE:`, `DOC-BYTES:`, `DOC-SHA256:`) rather than a
> count trailer ⇒ *unavailable*.

On `VERDICT:` / anchor / trailer these disagree. AC-3.4's placement rule makes that input
non-conforming, but DC-01 totality is *about* non-conforming input, and R-7 accepts a transitional
period in which files are written by un-amended SKILLs — the ordering is not hypothetical while an
idempotent re-append (M-4b) and a lagging SKILL coexist.

Secondly, AC-3.4's enumeration lists four anchor keys and omits `DOC-SHA256:`, which v1.2 itself added.
The generic phrase "matching the anchor grammar" saves it, but the closed catalogue is stated twice with
different membership, which is the defect shape §5 exists to prevent.

**Required change:** state the reader once. Recommended: *skip anchor lines; the candidate is the first
non-empty non-anchor line after `VERDICT:`; no candidate ⇒ unavailable; candidate that does not parse
after `recoverVerdict` ⇒ malformed*, with the anchor set given once by reference to §5's catalogue
rather than re-enumerated. Then rewrite AC-2.7's row 4 as "the section contains **nothing but** anchor
lines after `VERDICT:`" so the table classifies the same observations the algorithm produces.

## Questions

Q-01 … Q-06 from v2/v3 are **closed** by v1.2 and are not restated. Three new, each the fastest route
into the finding beside it.

| ID | Question |
|----|---------|
| Q-07 | AC-2.2 was added to answer TE Q-02, and it answers it by asserting co-occurrence; AC-4.7's row 2 was added to answer TE F-04, and it denies co-occurrence. Which is the intended rule — and if S-3 and S-4 do co-occur, is the POSTMORTEM's reason line the same `; `-joined string as the report cell, or only the first notice? (G-01) |
| Q-08 | On an AC-2.8 halt, does the AC-4.7 table gain a row for the undispatched round N, and if so what do its four non-`notice` cells contain? (G-02) |
| Q-09 | Is `DOC-SHA256:` computed over the document as read, or over `canonicaliseForDigest`'s output? The REQ asserts the first and prescribes reuse of a function that does the second. (G-03) |

## Positive Observations

- **Every open finding from rounds 1–3 is closed, and closed at the mechanism rather than at the
  wording.** The `appendRoundAnchors` / `appendApprovalAnchors` split (AC-4.1, §5's two-writer table) is
  the correct shape of the fix for F-01, and separating the *read* instant from the *persist* instant is
  a better answer than the one I asked for — it makes the anchor describe the bytes the reviewers were
  actually given, which is the property that matters.
- **F-02 is closed twice, independently.** Restating panel shape over the slug set *and* widening
  AC-3.5(a)'s Given means either fix alone would suffice. AC-2.4's "why comparability is stated over
  slugs" paragraph explains why the redundancy is deliberate. That is the right posture for a
  fail-closed discriminator.
- **AC-2.8 exceeds what F-08 asked for.** I filed the empty round as Low/Process and expected it to land
  in the run report. Making it a first-class halt with its own reason, its own anchor, a stated
  fail-open direction ("a missing anchor is evidence about the writer, not about the author, and must
  never manufacture a halt"), and an R-8 that separates the symptom from the cause and binds the cause
  to an existing spike — that is a materially better answer than the finding.
- **R-5's new sentence about failure direction** — a verifier that ignores AC-3.2(2) writes a *higher*
  count, so AC-2 halts earlier, never later — is the single most useful line added in v1.2. It converts
  an unenforceable clause into one whose worst case is bounded and stated.
- **Three restated existing-code claims verify.** At `9486c81`: `scanLines` is at `:569` and the JSDoc
  quoting *"a quoted example anchor cannot fabricate an ambiguity"* is at `:1907-1910`, exactly as
  AC-6.4's new exemption cites it; `tier1ApprovalRecord` is a plain declaration at `:2478` and
  `tier2ApprovalRecord` is `async` at `:2528`, exactly as M-3d now says. The citation discipline is
  holding under revision, which is the thing that usually breaks first.
- **AC-6.4's exemption 2 is a real catch and correctly sited.** Without it the document is a permanent
  counter-example to its own checker, and the argument for putting the exemption at REQ altitude
  ("it decides the checker's output on a real corpus") is right.
- **The header's baseline paragraph now says the baseline is a fixed ancestor and how to navigate from a
  later commit.** That removes the whole class of "the line moved" findings from future rounds.

## Mechanical fixes

Not findings. Apply without discussion; none affects the recommendation.

| id | Where | Fix |
|---|---|---|
| MF-1 | §5, S-4 | The row now shows only the **rendered specimen** `budget-exhausted: rounds 1..3 of 3`, so the general format string is no longer stated anywhere. After an AC-1.5(4) reset the render is `rounds 4..6 of 3`, which is derivable but nowhere written. Show the form and one specimen: `budget-exhausted: rounds {first}..{last} of {MAX_REVIEW_ROUNDS}` → *"e.g. `rounds 1..3 of 3`, or `rounds 4..6 of 3` after a reset"*. |
| MF-2 | AC-3.4, second bullet | Add `DOC-SHA256:` to the anchor-key enumeration, or replace the enumeration with a reference to §5's catalogue. (Folded into G-05's required change; listed here so it is not lost if G-05 is answered only at AC-2.7.) |
| MF-3 | §5, catalogue lead-in | "This REQ introduces eleven" is correct (S-1 … S-11) and the by-kind ordering note is welcome, but the table still reads S-1, S-2, **S-10, S-11**, S-3 … S-9. One sentence naming the four kinds in order would let a reader confirm the grouping without reconstructing it. |
| MF-4 | Header, Cross-Reviews row | It lists v1 … v3 for both reviewers; v4 will need adding when this round is answered. Worth a note that the row is maintained per round, so it is not re-raised each time. |

## Recommendation

## Verdict

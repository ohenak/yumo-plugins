# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 7
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of `01624628..HEAD` — eight document commits: `d5ed31a5` (§11.2 conjunct 4 item (i) takes
the invoking-tree bound from `TSPEC:1724`, TE F-01), `da869757` (§11.3 item 3 retired; the
credential-helper lane stated, TE F-02), `c9b710f9` + `d0265525` + `e7d7d865` (the DEC-CONS-07
two-halves supersession and its reconciliation through cost, testability, triggers, reversibility,
the §11.2 unasserted row and §10 — PM F-13), `8ae08458` (the supersession carried to the index,
heading, PLAN obligation and PROPERTIES bullet — PM F-14), `c42654f8` (sweep counts restated 11/14
and a recipe as wide as the claim — PM F-15, TE F-03), `50e28b23` (the Decision block flagged at the
point of reading; why the `_readFile` rejection outlived the empty payload).

I read my v6 cross-review, ran
`git diff 01624628..HEAD -- docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
(194 insertions, 79 deletions), and confined this pass to the changed spans plus my three open v6
findings.

Changed spans: §2's DEC-CONS-01 and DEC-CONS-07 index rows; §3's decision sentence and its
inbound-residual bullet; §9's heading, Decision preamble, both accepted-cost paragraphs, the
anchor-sweep note (rewritten into a five-bullet supersession), the `_readFile` rejected-alternative
bullet, Reversibility, Re-evaluation triggers and both Testability conjuncts; §10's closing
boundary paragraph; §11.1's DEC-CONS-04/07 obligation row; §11.2's conjunct 4 item (i), its
DEC-CONS-07 consequence bullet, the *unasserted* table's first two rows and the *Anchor provenance*
paragraph; §11.3's preamble and items 1 and 3. Everything else is untouched and not re-litigated.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-13 | **High** | **Resolved, and past the remedy I asked for** | I asked for four things: extend the supersession to both halves, state that `present` is now `file_missing` alone, state that an empty marker is truncated and reclaims, and reconcile `DECISIONS:679` and `:685-687`. All four are done, and the entry goes further. The note now opens "**Both halves of the Decision are superseded, not one**" and **withdraws** the earlier claim by name ("that is withdrawn — it is exactly backwards about the probe"). The probe bullet quotes `TSPEC:987-988` verbatim; I re-resolved it — "the layer reads **`file_missing` alone as absent**, and treats `{ok:true}` and `file_empty` alike as **present**" — plus `TSPEC:1026` ("decision 2 above reads `file_missing` alone as absent") and §13.1 row 13 (`TSPEC:2590`). The consequence bullet states outright that the entry's *rejected* first alternative is the shipped behaviour and cites `TSPEC:1940` (§10.3 row 4: empty ⇒ `markerVerdict` ⇒ `reclaim`, `reclaimed-stale-lock`, id `unknown`) and `TSPEC:2640`. `DECISIONS:687` no longer says "zero-byte"; `:692` now reads "a **released** `.consolidation-lock` means free"; `:695-700` keeps the conclusion and replaces the mechanism with "released ⇒ a parseable `RELEASED:` line ⇒ **E-11b** ⇒ `free` at any age" (`TSPEC:1016-1018`, `:1040` — both resolve). Beyond the ask: Reversibility, the Re-evaluation triggers (two of three struck as answered/taken), both Testability conjuncts, §10's boundary paragraph and §11.2's *unasserted* row were reconciled in the same pass. |
| F-14 | **Medium** | **Resolved on all four surfaces I named** | (a) §2's index row now carries "**payload and probe both superseded** by `TSPEC:974-977` … and `TSPEC:987-988` … Write downstream work against the TSPEC form, never against this row's". (b) §9's heading is "… — **both halves superseded upstream** (`TSPEC:974-977`, `:987-988`)". (c) §11.1's obligation row no longer says "empty-vs-unparseable fixture pair"; it names the **four-fixture** case (`TSPEC:2640`) — AT-M3's `""` and neither-verb fixtures reclaim, AT-M11's two `RELEASED:` fixtures do not, at either age — and states explicitly that the ownership manifest is unchanged. (d) §11.2's DEC-CONS-07 bullet gained three lettered sub-points: the `RELEASED:` payload with the read-back conjunct (`TSPEC:998-1003`, `:2443`), `file_missing`-alone-as-absent, and the four-fixture pairing with the positive/negative argument. `50e28b23` also added the flag to the **Decision block itself**, which I had not asked for and which is where a reader who skips headings actually lands. |
| F-15 | Low | **Resolved, and the arithmetic is now right** | The paragraph publishes `grep -onE 'TSPEC[^ ]* ?§?[0-9.]*:[0-9]+(-[0-9]+)?'`, states that the narrower first-pass pattern "returned **40** of the **42** sites present at the sweep commit (`01624628`), missing exactly the two `TSPEC §7.1:806` sites", and adds "Re-run it after any TSPEC move — the site count is a function of the revision, not a constant." I ran both patterns against `git show 01624628:…`: narrow **40**, wide **42**, and `diff` of the two outputs shows exactly `444:TSPEC §7.1:806` and `489:TSPEC §7.1:806`. The counts also moved from "ten across twelve" to "**eleven** across **fourteen**", which is the correction I had *not* caught: counting occurrences in the pre-sweep file (`2566d28d`) gives 618×1, 1832×1, 1522×1, 1595-1601×2, 787-788×2, 117×**2**, 793-796×1, 962-966×1, 2522×1, 1325×1 = 13, plus the bare `:684` continuation = 14. My v6 verification of "twelve" was itself wrong by one; this revision found it. |
| Q-04 | — | **Answered upstream; retired** | I asked from v2 onward whether AC-4.2's `present (redacted)` path had any shipped mechanism. `TSPEC:1693-1698` picks one: the push stays on `_git` and carries `-c credential.helper=!f(){ echo username=x; echo password=$VAR; };f`, which `rtShellQuote` transports intact and `git` expands through its own shell one process below the transport. I verified `rtShellQuote` at `pdlc/workflows/runtime-adapter.js:667-669` (POSIX single-quote wrapping, total) and the rejected command-string-seam alternative at `TSPEC:1700-1704`. No open product question remains here. |
| Q-05 / Q-06 / Q-07 / Q-08 | — | Still open, still not findings | Carried forward. Q-08 is partly answered in practice — the author chose "annotate in place", thoroughly — but the structural question it asks is still live for the next document. |

All three v6 findings are resolved. The verdict turns on the new material.

## Verification of the changed sections

I resolved every anchor the changed spans introduce, against the TSPEC, the FSPEC and
`runtime-adapter.js` at HEAD, rather than taking the document's word for any of them.

- **The DEC-CONS-07 supersession is fully cited and every cite lands.** `TSPEC:966-977` carries "no
  removal verb anywhere in reach … **FSPEC §4.1's BR-14a settles the payload**" and then
  "`releaseMarker` is `await _writeFile(markerPath, "RELEASED: {passId} {ISO-8601}")`";
  `TSPEC:987-988` is the probe reversal verbatim; `:996-1003` states the three-outcome discrimination
  and names the write double's last recorded contents as the observable; `:1015-1020` records that
  FSPEC v11.3 answered and this layer adopted; `:951` has `parseMarker` total over both forms;
  `:1036` "never empty in the steady state"; `:1040` the hand-deleted/released agreement;
  `:1940` routes an empty marker to `reclaim` with `reclaimed-stale-lock` and id `unknown`; `:2590`
  is §13.1 row 13; `:2443` is T-13 asserting the last recorded contents **match** the sentinel;
  `:2640` is the four-fixture sentence quoted word-for-word. Upstream of those, `FSPEC:2585` is
  BR-14a, `:2678` E-11 ("Reachable **because** §4.1 releases by writing a `RELEASED:` sentinel"),
  `:2679` E-11b. Nothing in the note is asserted without a cite, and no cite misses.
- **The consequence bullet does the harder thing: it explains why the rejection dissolved rather
  than deleting it.** It states that the rejected "empty ⇒ `reclaim`" alternative is now the shipped
  behaviour, and gives the reason — under an *empty* release a released marker and a truncated one
  are the same observed state, so reclaiming on empty would fire on every steady-state pass; under
  the sentinel there are three distinguishable observations. `TSPEC:2590` makes exactly that argument
  in its own words ("under it a released marker and one truncated mid-take are the same observed
  state … withdrawn on FSPEC's answer, not on taste"). Independently reached, same conclusion.
- **The Testability rewrite is a real oracle correction, not a re-labelling.** The superseded pairing
  ("`""` ⇒ `free`, no record") was backwards on its first member and the entry says so. The shipped
  set is four fixtures in one case, and the document keeps the *structural* reason the pairing exists:
  "an implementation that reclaims on every take passes the reclaim fixtures alone, and one that never
  reclaims passes the `RELEASED:` fixtures alone, so only the pairing falsifies both." That is a
  paired positive/negative oracle stated as such — each negative arm has a positive control on the
  same path — and it matches `TSPEC:1940`'s own falsification note. The struck "the unreachable half
  is **not** tested" sentence is replaced by an explicit assertion that both arms are tested, and the
  §11.2 *unasserted* table row is withdrawn with "A PROPERTIES author must **not** read this row as
  licence to omit it" — an absence-license removed rather than left standing.
- **DEC-CONS-01's new lane checks out against code, not just against the TSPEC.**
  `TSPEC:1685-1690` states the push half was wrong and why (`rtShellQuote` POSIX single-quotes every
  `_git` argv element); I read `pdlc/workflows/runtime-adapter.js:667-669` and it does exactly that,
  totally. `TSPEC:1693-1698` picks the credential-helper lane and `:1700-1704` records the
  command-string-seam alternative as rejected, on the reason the document repeats (it "moves the push
  out of §9.3's `_git`-argv classifier"). The document's claim that the push therefore stays in the
  **clone** domain and inside AT-Q7's `push` obligation is verifiable at `TSPEC:1725`: that domain is
  classified as "`_git` whose argv begins `["-C", cloneDir]`", the helper argv does, and `push` is in
  its obliged column. The residual paragraph's conclusion — "the argv element that reaches the
  transport holds the variable *name*, so there is still no credentialed value for an error message to
  echo" — follows from the helper form and is the same claim NFR-2 needs.
- **§11.3 item 3(b) is correctly reported as closed.** `TSPEC:1405` now reads "non-disclosure **on the
  outbound path** is structural (§5.3) rather than reviewed. It is **not** structural inbound, **and
  this row does not claim it is**", and carries the 300-character combined-output residual. The
  changelog entry the document points at, `TSPEC:51-57`, records both erratum-round halves. The
  narrower anchor-level erratum the item keeps open is still open at HEAD, re-measured rather than
  re-asserted: `TSPEC:1405`'s tail still cites `TSPEC:1522` for `openClone` (measured `:1602`) and
  `TSPEC:52` still spells the row as `:1325`, which is a blank line.
- **§11.2's conjunct 4 item (i) is right, and the FSPEC defect it raises is real.** `TSPEC:1724` is
  the invoking-tree row and its permitted column is exactly `read-branch`, `read-status`,
  ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index`, obliged `add`, `commit` — the set the document
  now transcribes. `FSPEC:2154` (AT-Q7c) does spell the upper bound `{add, commit, read-branch,
  read-status}` and calls it "its permitted set", which is the pre-widening four-verb set;
  `TSPEC:1718-1719` records "exactly four widenings", and `TSPEC:1745` maps ⊕ `read-index` to
  "§7.1's corpus enumeration". Since AT-Q7c's Given is a `promoted` pass and every pass enumerates a
  corpus, at least one widened verb is observed on that Given — so a property transcribing FSPEC's
  bound is red on correct code, as the document says. Its cross-check against §5 domain 1 also holds:
  `DECISIONS:291-297` names the same seven verbs from the same `TSPEC:1724` row.
- **No substantive regression against anything I approved.** DEC-CONS-03's domains and verb sets,
  DEC-CONS-05's evidence structure, DEC-CONS-06's decision and exclusion, §11.6(e)'s guard sentence,
  and the six-status release set-equality (still sourced to
  `docs/_constraints/pdlc-consolidation-vocabularies.md:38-43`) are all unchanged. Nothing was traded
  away to buy the supersession.

Two things in the changed spans did not verify, and both are anchor hygiene rather than contract
defects; they are F-16 and F-17 below.

## Findings

All three v6 findings are resolved. No High or Medium finding is open — old or new. Two Low findings
ride out of the changed spans; neither can steer a PLAN or PROPERTIES author wrong.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-16 | Low | Local | **The DEC-CONS-07 reconciliation swept its `TSPEC:` anchors and left its `FSPEC:` anchors where the old FSPEC put them; two are stale, one of them in text this revision wrote.** The document carries 19 `FSPEC:` citation sites over six distinct values (`:415`, `:442`, `:1060-1063`, `:2154`, `:2585`, `:2678`, `:2679`). I resolved all six at HEAD. Four land. Two do not. (a) **`FSPEC:415`**, cited at two sites — `DECISIONS:658` ("FSPEC §4.1's marker-lifetime row **says** the marker is '**Removed** at step 16'") and `DECISIONS:993` (§11.3 item 1, **written in this revision**: "§4.1's lifetime row **said** 'Removed at step 16' (`FSPEC:415`)"). `FSPEC:415` at HEAD is an unrelated §3 consumed-block row ("A basename appearing both in the legacy region and in a block"). The quoted phrase is not at that line and is not anywhere in the FSPEC as a lifetime row: `FSPEC:435` now reads "Released \| at step 16, by the pass that took it — an **in-place rewrite**…", `:436` reads "Removed \| **never by the pass**", and `:441` says in terms that "a lifetime row that said 'removed at step 16' would state a capability the runtime does not have". (b) **`FSPEC:442`**, cited at `DECISIONS:678` for "§4.2's fourth row assigns … 'reclaimed, recording `reclaimed-stale-lock`'" — `FSPEC:442` at HEAD is the §4.1 sentence "release is specified as the one operation available: an in-place write to the same path". The §11.3 item 1 site is the sharper one because it is new text certifying a closed round; the `:658` site additionally states in the **present tense** an upstream claim the FSPEC now explicitly disclaims. Nothing downstream breaks — the entry's conclusion (no seam can remove a file, so release is a write) is exactly what `FSPEC:441-442` endorses, and every *live* upstream cite in the entry (`:2585`, `:2678`, `:2679`) resolves — so this is a reader who cannot find the record, not an author who writes the wrong oracle. It is Low for that reason and no other. Fix: retarget `:415`⇒`:435-436` (with `:441` for the explanation) at both sites, retarget `:442` to §4.2's current fourth row, put `DECISIONS:658` into the past tense the §11.3 twin already uses, and say in the *Anchor provenance* paragraph that its warranty covers `TSPEC:` anchors only — the FSPEC set is unswept, which is precisely why these survived two anchor rounds. | AC-1.3 |
| F-17 | Low | Local | **The widened recipe is still narrower than the document's own citation vocabulary, and the revision's own count is the proof.** The *Anchor provenance* paragraph now publishes `grep -onE 'TSPEC[^ ]* ?§?[0-9.]*:[0-9]+(-[0-9]+)?'` and asserts it "admits **both** spellings this document uses". There is a third: a bare backticked continuation anchor after a prefixed one — `` (`TSPEC:618`, `:684`) ``, `` (`TSPEC:2202-2203`, `:2201-2202`) ``, `` (`TSPEC §7.1:806`, `:841-842`) ``, "restated at `:1699`". The paragraph's own arithmetic depends on one of them: it counts **fourteen** stale citation sites, and the fourteenth is the pre-sweep bare `:684` (`DECISIONS:100` at `2566d28d` read "(`TSPEC:618`, `:684`)"), which the published pattern cannot match — the sentence even flags it, "two anchors in one sentence, counted as two", without noticing that the recipe sees only one of the two. At HEAD the wide pattern returns 92 prefixed sites while 122 bare `` `:NNN` `` tokens exist in the file (most are `runtime-adapter.js` continuations, but `:1699`, `:2201-2202`, `:841-842`, `:850` and others are TSPEC ones). So the same defect F-15 named — a reproducible method published narrower than the claim it certifies — survives inside the fix for F-15, one spelling down. Nothing is stale today; the cost lands on the next re-sweep after a TSPEC move. Fix: either widen once more to admit the continuation form (matching the bare token when the nearest preceding file token is `TSPEC`), or state plainly that continuation anchors are resolved by hand alongside the mechanical set and give both counts, so a re-runner can tell whether they have the whole set. | AC-3.8 |

## Questions

| ID | Question |
|----|---------|
| Q-05 | *(carried unchanged from v2.)* DEC-CONS-04's observability paragraph names a forensic signature — two `.consolidation-log.md` records with distinct `passId`s carrying the same `(failure-mode-id, action)` key — that nothing computes. Should it appear in the operator-facing release note beside the drift-gate row §11.1 already flags? |
| Q-06 | *(carried unchanged from v3.)* `REQ:288` obliges a **pathspec** on both invoking-tree calls and explicitly rejects `commitPaths`' bare `git commit -m` shape. The obligation conjunct asserts the two verbs are *observed*, but a verb-level observation still cannot see the pathspec. Which oracle owns the pathspec — an AT in the register, or an argv-shape assertion like domain 3's? |
| Q-07 | *(carried from v5.)* A mechanical link-resolver would have caught F-10, F-16 and F-17; it would not have caught F-13, a stale *claim* whose anchors all resolved. Is there a cheaper convention that catches both — e.g. every DECISIONS entry carrying a one-line `Superseded-by:` field that the TSPEC's §13.1 row is required to match, so a supersession is a set comparison rather than a prose paragraph a reader has to find? |
| Q-08 | *(carried from v6, answered in practice.)* The author chose "annotate in place", and did it thoroughly enough that §2's index row, the heading and the Decision block all now carry the flag. The structural question stands for the next document: should §2's index only ever list *live* decisions, with overturned entries relocated to a short "superseded" section? Not a finding — the in-place annotation works. |
| Q-09 | *(new.)* §11.3 now retains two closed items struck through, as "the record of settled rounds", and one live item. That is the right instinct — a closed erratum is evidence a question was asked and answered — but the section's title is still *Errata raised, not settled here*, which now describes one of its three items. Does the PLAN's reader need §11.3 partitioned (live / closed), so "what is still handed up" is a set they can read off rather than derive from strikethrough? |

## Positive Observations

- **F-13 was answered by conceding the reviewer's point in the document's own voice.** The note does
  not quietly swap the wrong sentence out; it says "An earlier draft of this note said the `present`
  half 'carried' and only the payload moved; that is **withdrawn** — it is exactly backwards about
  the probe, and getting it wrong costs an oracle rather than a grep." That is the second time in
  three rounds this document has recorded a withdrawal rather than an edit (§5 domain 1 did the
  same), and it is why the anchor-level findings that remain are cheap to check: the document tells
  me where it changed its mind.
- **The consequence bullet is the best thing in the revision.** Discovering that your entry's
  *rejected* alternative is what shipped is an uncomfortable finding to write down. The document
  writes it down, names the fixture set that proves it (`TSPEC:2640`), and then does the part almost
  nobody does — reconstructs *why* the rejection was correct at the time and what dissolved it
  ("under an *empty* release a released marker and a truncated one are the same observed state").
  A future reader who wonders whether the rejection was sloppy has the answer in place.
- **The Testability fix removes an absence-license instead of relabelling it.** The old §11.2 row
  told a PROPERTIES author that FSPEC §4.2's empty arm was unreachable and must not be tested. That
  row is now struck with "**row withdrawn; this arm IS asserted**" and the explicit warning not to
  read it as licence to omit. Combined with the four-fixture pairing and its stated falsification
  argument, DEC-CONS-07 now hands downstream a paired oracle where it previously handed a hole.
- **DEC-CONS-01's index row went from hedged to settled, on evidence.** "the `git` half is
  **provisional**" became a named lane with a mechanism, a rejected alternative and a code cite I
  could check (`runtime-adapter.js:667-669`). Q-04, open since v2, closes on it. The document did not
  declare the question settled — the TSPEC settled it, and the document reports that with anchors.
- **The sweep found an error in my own v6 verification.** I certified "ten stale values across
  twelve sites"; the true pre-sweep count is eleven across fourteen, because `:117` occurred twice
  and the bare `:684` continuation existed at all. The revision corrected both. A revision that
  audits its reviewer's arithmetic is doing more than answering findings.
- **Nothing was traded away across eight commits of churn.** I checked DEC-CONS-03's verb sets,
  DEC-CONS-05's evidence structure, DEC-CONS-06's exclusion, §11.6(e)'s guard sentence and the
  six-status set-equality specifically for silent weakening, and found none.

## Recommendation

**Approved with minor changes**

All three v6 findings are resolved — F-13 (High) and F-14 (Medium) past the remedies I asked for,
F-15 with the counts corrected beyond what I had caught — and nothing I approved in earlier rounds
was weakened. On the substance of every decision in this document I remain: approve. I walked the
one product test that matters at this gate — can a PLAN or PROPERTIES author read this document and
write the wrong artifact? — across §2's index rows, §9's heading, Decision block, costs, note,
alternatives, reversibility, triggers and both testability conjuncts, §10's boundary paragraph,
§11.1's obligation row, §11.2's conjunct 4 and DEC-CONS-07 bullet and *unasserted* table, and
§11.3's three items. Every one of those surfaces now points at the shipped TSPEC form, and I
verified each against the TSPEC, the FSPEC and `runtime-adapter.js` at HEAD rather than against the
document's own account of them. There is no path here to a wrong oracle.

Two Low findings ride out, both anchor hygiene, both entirely fixable inside this document:

1. **F-16** — `FSPEC:415` (two sites, one of them new text in §11.3 item 1) and `FSPEC:442` are
   stale; the phrase "Removed at step 16" no longer exists in the FSPEC, which now says the opposite
   at `:436` and explains why at `:441`. `DECISIONS:658` additionally states it in the present tense.
   Retarget both, past-tense `:658`, and note in *Anchor provenance* that its warranty covers
   `TSPEC:` anchors only — the FSPEC set has never been swept, which is why these survived two
   anchor rounds.
2. **F-17** — the widened recipe admits two spellings and the document uses three; the paragraph's
   own fourteenth stale site (the bare `:684` continuation) is one its published pattern cannot see.
   Widen once more, or state that continuation anchors are hand-resolved and give both counts.

Neither blocks the document from being carried downstream, which is what "Approved with minor
changes" means here: I would hand this DECISIONS to a PLAN author today, and I would expect these
two corrections to land in the next commit that touches the file rather than in a round of its own.

I am **not** asking for changes to the DEC-CONS-07 supersession, the four-fixture testability
conjunct, DEC-CONS-01's credential-helper lane, §11.2's conjunct 4 item (i), or §11.3's
closed-but-retained items — all five are correct, all five are better than what they replaced, and I
would keep every one of them verbatim.

Two upstream errata leave this review. The first is new and is raised by the document itself in
§11.2's conjunct 4: `FSPEC:2154` spells AT-Q7c's invoking-tree upper bound `{add, commit,
read-branch, read-status}` and calls it "its permitted set", but that is FSPEC §6.5's pre-widening
set — TSPEC §9.3 (`TSPEC:1724`) permits three further non-mutating reads, at least one of which
(`read-index`, `TSPEC:1745`) is observed on AT-Q7c's own `promoted` Given, so a property
transcribing FSPEC's bound is red on correct code. The second is the carry-forward I re-measured at
HEAD rather than re-raised on faith: `TSPEC:1405` still cites `TSPEC:1522` for `openClone` (measured
`:1602`) and `TSPEC:1832` for §10.3 row 1a (measured `:1937`), and the changelog pointer at
`TSPEC:52` still spells the NFR-2 row as `:1325`, a blank line. This document corrected its
inherited copies in the v5 sweep; the TSPEC remains the only carrier. The two TSPEC errata from v2
are now **closed** upstream (`TSPEC:1685-1698` for `rtShellQuote`/the push lane, `TSPEC:1405` for the
qualified non-disclosure row) and I do not re-emit them.

## Verdict

VERDICT: Approved with minor changes

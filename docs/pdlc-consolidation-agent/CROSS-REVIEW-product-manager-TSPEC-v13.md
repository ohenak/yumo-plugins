# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 13
**Mode:** Delta re-review (`efe88578..HEAD`, TSPEC v2.2 → v2.3)
**Scope:** the 293/146 diff since round 12. v12's two High findings were about a version pin
asserted but not performed; this round the mechanism moved, so the diff is checked as a
behaviour change against the REQ that decided it, not as bookkeeping. Sections untouched by the
diff are not re-litigated.

## What changed, and what I measured

v2.3 performs the absorption v2.2 only claimed. Both v12 High findings are **resolved in the
mechanism**, and I checked them the only way they can be checked — against the REQ text at HEAD and
against real `git`, not against the TSPEC's prose.

**Upstream text, quoted verbatim at HEAD.** REQ §3.1 step 1 (`REQ-…:131-149`) carries all four
sentences the TSPEC now quotes: *"The second half is not deliverable and is **withdrawn**"*,
*"**One predicate remains guaranteed by construction** …"*, *"A `.gitignore`d LEARNINGS file *is*
corpus … does **not** apply `--exclude-standard`"*, and *"An index entry with no working-tree file
is *not* corpus … restricted to paths present in the working tree"*. FSPEC AT-P7 at HEAD
(§13.2 register, *The consumed predicate and the corpus*, row for AT-P7) reads *"the **two
predicates** are evaluated over each case"* and *"Scope is the predicate, and only the predicate"*.
So §13.3's absorbed-and-closed rewrite is true of the documents as they actually stand, and F-04's
mis-cited subsection is correct now (§13.2, not §13.7).

**The three new mechanism claims, measured on a scratch repository rather than taken on trust.**
Built one repo with a tracked LEARNINGS, one under `docs/completed/`, one `.gitignore`d, one staged
then unlinked, and one inside a nested `git init`:

| §7.1 / §10.4 claim | Measured | Verdict |
|---|---|---|
| dropping `--exclude-standard` admits the ignored LEARNINGS **and changes nothing else** | `--cached --others` returns the ignored path; the flagged call omits exactly it; zero `docs/discarded/`-shaped extras either way | Holds |
| `ls-files --deleted` over the identical pathspecs returns **exactly** the staged-but-deleted path and nothing else | returns that one path only | Holds |
| a LEARNINGS in a nested repository is in `glob.glob`'s set and in **neither** `--cached` nor `--others` | `glob.glob` returns it; `ls-files` returns neither | Holds |

So first-set-minus-`--deleted`-set really is "present in the working tree" for every case the REQ
names, and the surviving divergence class §10.4 accepts is the one that actually survives.

**Code anchors in the diff, all checked.** `_now` is a destructured options default at
`orchestrate-dev.js:1623`, `:3182`, `:8417` and at no other site (`grep -n '_now = () =>'` returns
exactly those three); the stale `:1396` is gone from all three places that used to say
"module-level default" (§5.1's comment, §5.5's seam table, §12.2's `rtConsInjections` row), which is
more than the one site the finding landed on. The pinned-clock precedents are real
(`advisoryDodSeams.test.js:129`, `:1116`; `advisoryDisabled.test.js:276`). The hook symbols §3.2 now
locates by name all exist at HEAD: `CORPUS_GLOBS` (`nudge-consolidation.sh:60`), its comprehension
(`:61`), `region_split` (`:29`, used `:72`), the `pending` fall-through (`:73`) and the
`PDLC_PENDING:` stderr line (`:78`). `--exclude-standard` survives in the TSPEC at 13 places and
**every one of them is historical or negative** — the argv, AT-P1's pin, §9.3's row and §12.2's T-08
row are all clean.

**Where the absorption did not reach: §13.1, the decision table.** The behaviour moved in §7.1,
§9.3, §10.4, §11.1, §12.2 and §13.3, and two rows of §13.1 were left describing the pre-v2.3
mechanism and the pre-v2.1 REQ. That is F-01 and F-02, and §13.1 is the one section where a stale
row does not stay local: rows 6 and 10 are both named as DECISIONS-warranted (`TSPEC:2813`).

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§13.1 row 6 still declares the enumeration decision unsettled and still routes it upstream — the settled question DEC-ERR-01 forbids re-raising — and it is the one row that carries a DECISIONS obligation.** At `TSPEC:2804` row 6 ends: *"**This decision relaxes REQ `:115-116`'s "keeping one enumeration as well as one predicate", so it is not settled here**: §13.3 raises it as a REQ/FSPEC erratum, and this row records what this layer would ship if the relaxation is accepted."* Three separate things in that sentence are now false at HEAD: REQ v2.1 **withdrew** that clause and says so in place (`REQ-…:131-133`); §13.3 no longer raises anything on it — the TSPEC's own rewrite calls it *"absorbed and closed"*, *"kept in the past tense … not as a live dependency"*; and the shipped shape is not conditional on an acceptance, it is the shape REQ decided. This is not a prose slip in a narrative section: `TSPEC:2813` names rows 6 and 10 among those for which *"DECISIONS is warranted"*, so a DECISIONS author transcribing row 6 writes a settled REQ question back into a promoted project-level artifact as open — and a PLAN reader sees a decision whose delivery is contingent. The row also carries the **only** surviving `REQ-…:NNN` line pointer in the document, which is precisely the citation form §12.3's newly widened rule now forbids for *every* upstream document — so the rule and the last violation of it landed in the same revision. **Fix:** rewrite row 6's closing clause to record the round trip as closed (REQ §3.1 step 1 withdrew the "one enumeration" half; FSPEC v11.6 re-scoped AT-P7 to the predicate; §7.1 absorbed both), delete "not settled here" and "if the relaxation is accepted", and re-cast the pointer as *REQ §3.1 step 1, "One predicate, two enumerations (erratum, v2.1)"*. | REQ §3.1 step 1, *"the second half … is **withdrawn**"*; REQ-CONS-02; DEC-ERR-01 (`docs/_decisions/DECISIONS-review-severity-bars.md`) |
| F-02 | Medium | Local | **§13.1 row 10 still says the corpus is enumerated with *one* `_git` read; §7.1 now issues two.** Row 10 (`TSPEC:2808`) reads *"Enumerate the corpus with **one** `_git(["ls-files", …])` read, `:(glob)`-anchored"*, against §7.1's *"**Two reads, not one**"* and §9.3's two rows. The rationale behind row 10 is untouched — the `_listFiles` seam still cannot walk directories (`runtime-adapter.js:915`, `:929-931`, both correct at HEAD) — so this is the count, not the decision, and it is one word plus a clause. It matters because row 10 is the other DECISIONS-warranted row that touches this mechanism, and because a task owner sizing the enumeration task off §13.1 alone would provision one call and one argv pin where AT-P1 now demands two of each. **Fix:** state the chosen option as two `_git(["ls-files", …])` reads — the `--cached --others` enumeration and the `--deleted` subtraction over the identical pathspec pair — naming REQ §3.1 step 1's second bullet as why the second read exists. | REQ §3.1 step 1, second bullet; AC-1.2 (the volume count's evidence base) |
| F-03 | Low | Local | **§3.2's hook row describes four production edits as pending that are already on the branch, while §10.4 says the opposite four hundred lines later.** §10.4 now states *"The edit has since landed: `CORPUS_GLOBS` and its comprehension are at HEAD"* — true, and all four edits are there (`:60-61`, `:29`/`:72`, `:73`, `:78`). §3.2's row still reads as a work order (*"The single `os.path.join` glob replaced by …"*, *"All four are **production** edits in one shipped file ⇒ one owning task"*). Both sentences are individually defensible — §3.2 is a file-touch table and the PLAN's ownership manifest derives from it — but a reader who takes §3.2 as the statement of remaining work will size a task that is already done, and the two sections now disagree in tense about the same four edits. **Fix:** keep the row (ownership is still needed for the file) and add the landed-at-HEAD note §10.4 already carries, so the manifest reads as ownership rather than as outstanding work. | REQ §5 (in-scope edits); AC-1.1 traceability |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §13.3 keeps exactly one open item — should the durable log row carry an `unread:` field beside `consumed`? — and notes it is *"now narrowed by (b)"*. It is narrowed a long way: since the `--deleted` subtraction the only way a file reaches the consumed pair unread is a permissions error or a mid-pass unlink, which is not the "silently marked consumed forever" population the question was raised about. Is it still worth a vocabularies §3 field-set change, or is the honest answer now "no, the report body suffices, and this is withdrawn"? Either answer closes it; carrying it as open into DECISIONS is the outcome I would avoid. |
| Q-02 | §11.1's L4 git case gains an ignored fixture member whose conjunct is *"that basename **is** in the result"*. I measured that this reds against a re-introduced `--exclude-standard` through real git, so the oracle is sound. Worth one sentence in the case's own words: the fixture's `.gitignore` must name the feature directory *before* `git add -A` runs, otherwise the member lands tracked and the conjunct passes for the wrong reason. That is an authoring hazard, not a spec defect — but it is the kind that produces a green test with no oracle. |

## Positive Observations

- **The absorption is a real behaviour change, argued as one.** v2.3 does not quietly reword §7.1; it
  drops a flag, adds a read, retires a divergence class, re-scopes the unreadable-body branch, adds
  two fixture members and two conjuncts at L4, and widens §9.3's verb table — and the changelog says
  in its first sentence that this is *"a behaviour change, not bookkeeping"*. That is the opposite of
  what the v12 finding was about, and it is the right correction.
- **The losing argument is kept, and its cost is stated as *paid*.** §10.4 keeps the
  promotion-provenance argument for `--exclude-standard` verbatim, marks it as weighed and lost, and
  says the price is now paid rather than avoided. A weaker revision would have deleted the argument
  and left a reader unable to tell whether it was ever made. This is the shape I want when a REQ
  overrules a TSPEC's provisional choice.
- **The one reasoning error is named as an error, not smoothed over.** §10.4 previously called the
  staged-but-deleted class *"genuinely not closable at this layer"*; v2.3 says that reasoning
  *"was wrong in one direction"* — it assumed convergence had to come from widening the hook, when
  narrowing the pass closes it for one extra read — and it then re-uses the surviving half of that
  argument for the nested-repository class, where it does apply. Correcting a claim and salvaging the
  part that was right is harder than either deleting or defending it.
- **The `--deleted` subtraction is pinned by an oracle that can actually see it.** §12.2's T-08 row
  gains a third conjunct that observes the subtraction over a scripted double (two paths in, one
  deleted, the *other* asserted present), and §11.1's L4 case runs it against real git — the only
  place anywhere that does. Both are stated positive-and-negative, so neither greens on an empty
  result, and the argv pin now reds on each of the two one-token edits that would silently revert a
  decided REQ rule.
- **The `_now` correction was carried to every site, not just the one the finding hit.** The finding
  named §5.6(b); the revision also fixed §5.5's seam-default row and §12.2's `rtConsInjections`
  exclusion, and left "module-level default" surviving in exactly one place — §5.6(b)'s narration of
  what the earlier draft got wrong. Three anchors, all correct at HEAD, and the term now means one
  thing document-wide.
- **§12.3's citation rule was widened by admitting the scope was itself the defect.** *"A citation
  rule is about the form of a pointer, so it can have no per-document scope."* Three of the four
  stale REQ pointers are re-cast; F-01 is the fourth, and it is the last one in the document.

## Recommendation

**Needs revision**

One High finding, and it is a one-cell edit. Everything the v12 round asked for landed in the
mechanism — the flag is gone, the `--deleted` read is in, the divergence set is one class, §13.3
records a closed round trip, and I verified each against the REQ text and real `git` rather than
against the TSPEC's prose. What did not land is **§13.1, the decision table**, which still describes
the pre-v2.3 mechanism and quotes a REQ clause that no longer exists:

1. **F-01 (High)** — row 6: delete *"not settled here"*, *"§13.3 raises it as a REQ/FSPEC erratum"*
   and *"if the relaxation is accepted"*; record the round trip as closed; re-cast the document's last
   surviving `REQ-…:NNN` pointer per §12.3's own widened rule. This blocks because §13.1 is the
   DECISIONS source (`TSPEC:2813`), so the row would carry a settled REQ question upstream as open
   into a promoted artifact — the DEC-ERR-01 failure by name.
2. **F-02 (Medium)** — row 10: "one `_git` read" ⇒ two reads, naming why the second exists.
3. **F-03 (Low)** — reconcile §3.2's tense with §10.4's landed-at-HEAD statement about the same four
   hook edits.

No erratum against REQ or FSPEC: every upstream sentence this revision quotes is present verbatim at
HEAD, and AT-P7's re-scoping is exactly as described. Nothing approved at v10–v12 was disturbed by
these fixes, and no oracle in the diff weakened.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}


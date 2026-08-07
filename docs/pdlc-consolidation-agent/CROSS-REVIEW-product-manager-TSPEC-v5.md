# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.4)
**Date:** 2026-08-06
**Iteration:** 5
**Scope:** Local (per-finding tags in the table)
**Delta base:** `74f990a` (the commit I reviewed at v4) → HEAD `9436e87`; `git diff` over the document is 188 insertions / 38 deletions across §1.1, §4 (the seam interface and `CheckReply`), §5.2, §7.1, §7.3, §10.1, §10.4, §11.1, §11.2, §11.3(f), §12.1, §12.2, §12.3, §13.1 row 6 and §13.3. Only changed sections are re-read.

## Prior findings — disposition

| v4 ID | Sev | Status | Evidence in the revision |
|---|---|---|---|
| F-14 | Medium | **Resolved, on both axes I named** | The pin pair is now split by level *and* by file, everywhere, and the earlier reading is withdrawn by name rather than quietly overwritten. §7.1 replaces the "both L3 source-text reads in `consolidationHookParity.test.js`" sentence with a two-row table — pin (a) is "the argv `enumerateCorpus` **hands `_git`**, element-by-element, per AT-P1's conjunct 1", **L1**, `consolidationPredicate.test.js`; pin (b) is the **L3** source-text read of the hook's declaration, `consolidationHookParity.test.js` — and adds the paragraph "An earlier draft of this paragraph placed **both** … That was wrong and is withdrawn on both axes", reproducing both of my arguments (a source-text grep "cannot see a call site that builds a different array at runtime"; §12.3's table "is the input to the PLAN's file-ownership manifest"). §11.3(f) is corrected in the same direction and says so ("they are deliberately **not** both this file's … An earlier draft of this paragraph claimed both"). §11.1's L4 row now reads "two non-AT cases", §12.2's T-08 row carries the explicit "**The two pins sit at different levels and in different files deliberately**", §12.3 marks AT-P1 "whose first conjunct *is* §7.1's pin (a)" and its hook-parity row ends "§7.1's **pin (a)** does **not** live here". I grepped the document for the three stale spellings (`both owned by this same file`, `both L3 source-text`, ``:28`'s two glob``) — none survives. Five sections, one reading. |
| F-15 | Low | **Resolved, and closed harder than I asked** | I asked the document to pick one of two forms. It picks the first and then closes a second failure mode I had not raised. §7.1 quotes the shipped line — I re-verified it at HEAD: `nudge-consolidation.sh:28` is `learnings = glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))`, and neither literal glob string occurs in the file — then specifies this feature's edit as a named module-level tuple, `CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")` with `os.path.join(proj, *g.split("/"))`, which keeps the shipped `os.path.join` portability. Pin (b) is then stated "over the **declaration, never a line number**", with the additional argument that a line-anchored pin is invalidated by this feature's own edits to the same heredoc (the second glob, the relocated early exit at `:29-30`, the `PDLC_PENDING:` line — all verified present in the shipped script as the lines the feature will move). The set-equality half survives verbatim ("exactly … and no third") and gains a conjunct that `glob.glob(` occurs once and inside the comprehension, which closes the third-pattern-through-a-second-call-site hole the set assertion alone would not see. The §3 file-inventory row, §10.4 and §12.2's T-08 row are all updated to `CORPUS_GLOBS`. |
| F-16 | Low | **Resolved** | T-11's cell no longer leaves the provenance to inference. It now reads: "**Where those three expected values come from is the whole oracle, so it is stated without ambiguity: they are transcribed from the fixture LEARNINGS corpus the pass was handed, never from `state.promotions[i]` or any other field of the produced record.**", and reproduces the reason I gave — the case runs at L2 where the record is produced by the pass under test, so reading the expected strings off the record "would green it even when the pass and the renderer drop the same field together — which is exactly the AC-3.2 failure an operator sees (a PR body citing nothing)". That is the relational-oracle reading, said in one direction only. |

Q-10 and Q-11 are both answered, and answered by routing rather than by settling. Q-10: §7.1 gains "Answering the reviewer directly on the durability of that evidence" — it concedes the consequence in my own terms ("a LEARNINGS file can be permanently marked consumed while contributing zero evidence to any promotion"), declines to mint an `unread:` field here because the log record's field set is a `pdlc-consolidation-vocabularies.md` §3 contract and minting one is "the same REQ §4b breach as minting a reason code", and hands the question to §13.3, which now carries it as the batch's third question. It also does the thing I did not ask for and should have: the three observables get a `(no FSPEC AT)` row in §12.2 and a file in §12.3, so the decision is falsifiable rather than merely argued. Q-11: §10.4 and §13.3 both now state the asymmetry — "the hook has **no** `--exclude-standard` to drop (`glob.glob` sees ignored files unconditionally), so dropping it on the JS side is the one edit that makes the two sides agree" — and §13.3 says outright that "one of the two answers strictly reduces the divergence set the relaxation is being requested for; the erratum says so rather than presenting them as neutral alternatives". That is exactly the information the REQ reviewer needs to decide, and it is now in the erratum rather than in my question.

## Findings

*(filled below)*

## Questions

*(filled below)*

## Positive Observations

*(filled below)*

## Recommendation

*(filled below)*

## Verdict

*(filled below)*

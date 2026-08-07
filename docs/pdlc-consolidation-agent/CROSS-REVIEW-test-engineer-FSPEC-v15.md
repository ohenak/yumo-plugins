# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-07
**Iteration:** 15
**Scope:** DELTA CONFIRMATION of the Phase D erratum round only. Diff reviewed: `99aff9bc..91059d41`
(one commit, 18 insertions / 4 deletions in one file), against my v14 **Approved with minor changes**.
I did not re-read the document. I read the diff, the three hunks it touches, and re-verified at HEAD
every anchor the new text cites — TSPEC §9.3's widening table, FSPEC §4.3's release ordering, and
§15.3's change register.

## Erratum disposition

The seven erratum items routed into this round are one finding restated by three reviewers across
three rounds: **AT-Q7c (`FSPEC:2154`, now `:2168`) spelled the invoking-tree upper bound as §6.5's
pre-widening literal `{add, commit, read-branch, read-status}` and called it "its permitted set",
while TSPEC §9.3 had since recorded three non-mutating widenings against that set — and at least one
of them is observed on AT-Q7c's own `promoted` Given, so a property transcribing the row was red on
correct code.** It is resolved.

| Item | Disposition | Evidence |
|---|---|---|
| The bound is stale w.r.t. TSPEC §9.3's widenings (te ×3, se ×2, pm ×2 — one finding) | **Resolved** | AT-Q7c's *Then* now reads "contained in that domain's permitted set **as recorded at the implementing layer** — §6.5's frozen `{add, commit, read-branch, read-status}` ∪ every widening TSPEC has recorded against it under DEC-LAYER-01, which at TSPEC §9.3 is ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index` (all three non-mutating), giving `{add, commit, read-branch, read-status, read-object, read-remote, read-index}`" (`:2168`). I checked the widening table it names rather than trusting it: `TSPEC-pdlc-consolidation-agent.md:1724` — row "git, invoking tree", permitted-not-obliged column `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index` — and the per-widening justification table at `:1741-1745`, which binds `git ls-files --cached --others --exclude-standard` to ⊕ `read-index` and names §7.1's corpus enumeration as its cause. The seven-member union the row spells is **exactly** the union of that row's obliged and permitted columns. No transcription error, no extra member, and `read-auth` (the fourth widening) is correctly **not** in it — it is a PR-seam verb, not an invoking-tree one. |
| …and the row must stay green when TSPEC widens again | **Resolved, in the stronger form** | The repair is a rule before it is a literal: "What the row fixes is the **shape** of the bound — obliged-below, permitted-above, no merge or branch verb in either — not a literal frozen ahead of the widenings the seam table's own DEC-LAYER-01 clause invites." That is the sentence that makes the row survivable, and it is the one I would have asked for had the edit only swapped the seven-member literal in. See L-02 for its residual cost. |
| §6.5 left unedited | **Correct, and I checked it is deliberate rather than missed** | §6.5 is byte-unchanged in this diff. That is right: `:1056-1059` makes §6.5 "the frozen statement TSPEC inherits", with widening "a **recorded TSPEC decision** against this set, never a silent reading of it". Editing §6.5 to absorb TSPEC's widenings would invert the layering the erratum's own repair depends on and would silently retire the record of *which* layer widened *what*. The header block says so explicitly (`:21-22`). |

Two Low locator findings from the v14 round rode along in the same commit. Both are repaired and both
verified at HEAD:

- **te v14 L-01** — §4.2's two-producer table cited "§4.3 `:511-512`" for the release-after-append
  ordering; it now cites `:557-558`, and `557-558` is exactly "Release is unconditional for every
  marker-holding pass, including `failed`: it runs at step 16 after the terminal row is appended".
  Correct to the line.
- **se v14 F-01** — AT-P7 cited the change register as "§14 (`:2401`)"; it now cites "§15.3
  (`:2449`)". §15.3 opens at `:2445` and `:2449` is the `nudge-consolidation.sh` row, the one that
  records the `:28` glob widening and the `:41` predicate re-scoping AT-P7 depends on. Correct to the
  line, and correct on the section number, which had also drifted (§14 → §15.3).

## Findings

Two **Low**. Nothing High or Medium: the erratum is resolved, and nothing I approved in fourteen
prior rounds is broken by this diff. Both Lows are the same second-order cost the erratum itself is
an instance of — a bound spelled as a literal in a document that does not own the literal — and
neither would make a test author write a wrong test today.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-01 | Low | Local | **AT-Q7, one row above the repaired one, still states its containment bound by pointing at §6.5's columns, and its Given observes the same three widened reads.** AT-Q7 (`:2166`) says "observed ⊆ that domain's permitted set (§6.5's obliged ∪ permitted columns)" and, later in the same cell, "`fetch` and the non-mutating reads (`read-branch`, `read-status`) are permitted". Its Given is a **PR-opening** pass, which is a superset of AT-Q7c's `promoted` pass — so it observes `read-index` (§7.1's corpus enumeration) in the invoking tree too, plus `read-remote` (§9.1 step 2's clone source, same-repo case) and `read-object` (§8.5 row 3's existence test). Read as a literal transcription instruction it is red on correct code for precisely the reason AT-Q7c was. I file this **Low**, not Medium, and the distinction is not cosmetic: AT-Q7c named a seven-character-per-verb *set literal* and called it "its permitted set", so a test author transcribed it directly and had no reason to look further; AT-Q7 delegates **by reference** to a table whose own footer (`:1056-1059`) says the implementing layer inherits and widens it, and TSPEC §9.3 — the layer a test is actually written from under DEC-LAYER-01 — carries the widened row correctly. The by-reference form is the form that survives a widening. If the author disagrees, the repair is one clause: give AT-Q7's parenthetical the same "as recorded at the implementing layer" phrase AT-Q7c now carries. No new rule, no new AT, no change to any oracle's strength. | §13.5 AT-Q7 (`:2166`) vs AT-Q7c (`:2168`) |
| L-02 | Low | Local | **The repaired row now carries a downward literal that can drift the same way the old one did.** AT-Q7c states the shape rule correctly and generically ("§6.5's frozen set ∪ every widening TSPEC has recorded against it under DEC-LAYER-01") and then instantiates it as a seven-member literal "which at TSPEC §9.3 is …". The instantiation is accurate today — I checked all seven members against `TSPEC:1724` — but it is an FSPEC row pinned to a TSPEC table's current contents, so a fifth recorded widening restages exactly this erratum. The mitigation is already in the text and is why this is Low rather than Medium: the row says in terms that what it fixes is the shape "not a literal frozen ahead of the widenings", so a reader who finds the literal short of TSPEC's table has the governing sentence in the same cell telling them which one wins. Worth recording as a known drift point rather than repairing — deleting the literal would cost more than it saves, since the literal is what makes the row transcribable without a second document open. | §13.5 AT-Q7c (`:2168`) |

## Questions

## Positive Observations

## Recommendation

## Verdict

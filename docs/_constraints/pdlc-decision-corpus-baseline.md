# Baseline — the closed-decision corpus this repository actually holds

| Field | Value |
|---|---|
| Kind | **Project-level shared reference.** Read-only input to `pdlc-decision-ledger` and its successors; **not** a pipeline artifact, not reviewed, not queue-eligible. |
| Cited by | `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (§2 G-1, §4 C-5, §5 REQ-DECLEDGER-01, §5 REQ-DECLEDGER-04, §6 R-5, §7 O-1, §7 O-5, §7 O-6, §7 Assumptions A-1); `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (header, §1, §3.3, §4 BR-2/BR-8/BR-10, §5 E-4/E-9/E-10/E-11, §6 AT-01, §7 O-5, §7 Assumptions A-1). This list is the propagation path for a `Version` bump, so a new citation is added here in the same edit that mints it. |
| Version | 1.2 · 2026-08-28 |
| Verified at | HEAD `8c673a09f` on `feat-pdlc-decision-ledger`, 2026-08-28 |

**Why this file exists.** How many closed decisions this repository records, where they sit, and
which files record none is a fact about the corpus rather than about any one consuming feature.
`REQ-pdlc-decision-ledger` spent five review rounds re-stating that fact as a recognition
predicate inside a goal clause, and each round's rewrite was true against the corpus the previous
round had cited and false against one it had not looked at
(`docs/pdlc-decision-ledger/POSTMORTEM-R-pdlc-decision-ledger.md`, *Best-Guess Root Cause*). A
predicate over a live corpus is contestable with one more counterexample forever; a measurement
taken once against a named commit is not. Taking it here, once, is the post-mortem's
Recommendation 1 form (a), and it is what the pm-author altitude rule (SKILL.md 5f) directs:
reference shipped facts as `M-*` facts measured into `docs/_constraints/` and cited by id, never
inlined as a contract the REQ itself must defend.

**Change control, and who owns these sections.** `REQ-pdlc-decision-ledger` owns every section of
this file — §1–§8 entire — and changes none belonging to anyone else; a successor feature's facts
belong in its own new section of this file, or in its own file, never interleaved into §1–§7. All
eight sections are **owned normative prose**: no table here is transcribed row-for-row into a
downstream document, so no downstream oracle ranges over this file's markup. Consumers cite this
file **at its `Version`**; a content change that is not accompanied by a version bump is itself a
defect. Every number below was re-derived from the working tree at the `Verified at` commit —
which *is* the post-mortem commit, `docs(pdlc-decision-ledger): Phase R post-mortem — round budget
exhausted`. The measurement tree differed from that commit only by this file itself, then
untracked, and the in-progress REQ v1.6; neither is a `DECISIONS-*.md`, so no number below moves.
The distinction is worth stating precisely because a tree-walking measurement is exactly what an
untracked local file perturbs.

## 1. What was measured, and by what reading

Every fact below counts **decision records**, not mentions of a decision id. A record is a line
that is a markdown heading whose content, after the heading marker and any leading section number,
opens with an id of the form `DEC-{NAMESPACE}-{NUMBER}` with `NUMBER` decimal — `## DEC-TERM-01: …`,
`## 3. DEC-CONS-01: …`, `### DEC-A6-01: …`. The file scope is `DECISIONS-*.md`.

That reading is stated here **as the reading the numbers were taken under**, so that a consumer can
reproduce them. It is **not** a requirement: which predicate the shipped index uses is TSPEC's
(`REQ-pdlc-decision-ledger` §7 O-1). What the REQ takes from this file is the *extent* of the set at
this commit, cited by id — not the rule that produced it.

The corpus is **25** tracked `DECISIONS-*.md` files: 12 under `docs/_decisions/`, and 13 across 12
feature directories.

## 2. M-1 — the project-level record set under `docs/_decisions/`

| ID | Fact |
|---|---|
| **M-1a** | `docs/_decisions/` holds **41** decision records, carrying **41** distinct ids. No id is recorded twice within that directory, so the raw carrier count and the distinct-id count coincide. |
| **M-1b** | The per-file breakdown, in path order, is: `DECISIONS-advisory-wave-gate-questions.md` **0**, `DECISIONS-anchor-provenance.md` **1**, `DECISIONS-erratum-routing.md` **4**, `DECISIONS-loop-termination.md` **2**, `DECISIONS-model-availability.md` **2**, `DECISIONS-plugin-distribution.md` **7**, `DECISIONS-review-convergence.md` **2**, `DECISIONS-review-severity-bars.md` **12**, `DECISIONS-seam-defaults.md` **1**, `DECISIONS-spec-layer-boundary.md` **1**, `DECISIONS-test-oracle-mechanics.md` **6**, `DECISIONS-wave-gates.md` **3**. Sum: 41. |
| **M-1c** | Eleven of the twelve project-level files contribute at least one record; one contributes none (M-4a). |
| **M-1d** | **The 41 ids themselves**, in the M-1b path order, grouped by their file. `DECISIONS-advisory-wave-gate-questions.md` — *(none)*; `DECISIONS-anchor-provenance.md` — `DEC-ANCHOR-01`; `DECISIONS-erratum-routing.md` — `DEC-ERRROUTE-01`, `DEC-ERRROUTE-02`, `DEC-ERRROUTE-03`, `DEC-ERRROUTE-04`; `DECISIONS-loop-termination.md` — `DEC-TERM-01`, `DEC-TERM-02`; `DECISIONS-model-availability.md` — `DEC-MODEL-01`, `DEC-MODEL-02`; `DECISIONS-plugin-distribution.md` — `DEC-DIST-01`…`DEC-DIST-07`; `DECISIONS-review-convergence.md` — `DEC-CONV-01`, `DEC-DW-01`; `DECISIONS-review-severity-bars.md` — `DEC-SEV-01`, `DEC-SEV-02`, `DEC-SEV-03`, `DEC-ERR-01`, `DEC-BAR-01`, `DEC-BAR-02`, `DEC-ERR-02`, `DEC-ERR-03`, `DEC-DOC-01`, `DEC-FRZ-01`, `DEC-ERR-04`, `DEC-SEV-04`; `DECISIONS-seam-defaults.md` — `DEC-SEAM-01`; `DECISIONS-spec-layer-boundary.md` — `DEC-LAYER-01`; `DECISIONS-test-oracle-mechanics.md` — `DEC-ORACLE-01`…`DEC-ORACLE-06`; `DECISIONS-wave-gates.md` — `DEC-WAVE-01`, `DEC-WAVE-02`, `DEC-WAVE-03`. Note that two of these files hold more than one namespace — `DECISIONS-review-convergence.md` two, `DECISIONS-review-severity-bars.md` five, interleaved rather than grouped — so the list is not reconstructible from M-1b's counts. |

## 3. M-2 — feature-level records

| ID | Fact |
|---|---|
| **M-2a** | Thirteen `DECISIONS-*.md` files sit in twelve feature directories, under three directory shapes: `docs/{feature}/` (in-flight — `docs/orchestrate-dev-workflow/`), `docs/completed/{feature}/` (shipped), and `docs/discarded/{feature}/` (`docs/discarded/pdlc-rcv-budget-stop/`, 4 records). |
| **M-2b** | Distinct ids per feature **directory**: `pdlc-headless-engine` **22**, `pdlc-advisory-tier` **11**, `pdlc-engine-distribution` **10**, `pdlc-learnings-injection` **10**, `pdlc-loop-economics` **10**, `pdlc-consolidation-agent` **8**, `pdlc-wave-resume` **8**, `pdlc-engineering-loop` **7**, `orchestrate-dev-workflow` **6**, `pdlc-advisory-wave-gate` **4**, `pdlc-rcv-budget-stop` **4**, `pdlc-plugin-retirement` **0**. |
| **M-2c** | **One feature directory holds two `DECISIONS-*.md` files.** `docs/completed/pdlc-headless-engine/` holds `DECISIONS-pdlc-headless-engine.md` (**14** records) and `DECISIONS-headless-engine-obligations.md` (**8** — `## DEC-HE-01`…`08` at `:11,37,62,87,108,130,155,184`). The eight `DEC-HE-*` ids are recorded nowhere else in the repository. Consequence for a consumer: a file-scope naming only `DECISIONS-{feature}.md` makes those eight invisible to their own feature; a directory glob over `DECISIONS-*.md` does not. The two readings differ by 8, and only on this feature. |
| **M-2d** | The largest single feature **file** is `DECISIONS-pdlc-headless-engine.md` at **14** distinct ids. The largest feature **directory** is `docs/completed/pdlc-headless-engine/` at **22**. These are the two candidate feature-side terms for the floor in §7. |
| **M-2e** | **The 100 feature-level ids themselves**, per directory, under the M-2b directory-glob reading. `pdlc-headless-engine` **22** — `DEC-ENG-01`…`DEC-ENG-14` and `DEC-HE-01`…`DEC-HE-08`; `pdlc-advisory-tier` **11** — `DEC-ADV-01`…`DEC-ADV-11`; `pdlc-engine-distribution` **10** — `DEC-EDIST-01`…`DEC-EDIST-10`; `pdlc-learnings-injection` **10** — `DEC-LI-01`…`DEC-LI-10`; `pdlc-loop-economics` **10** — `DEC-LOOPECON-01`…`DEC-LOOPECON-10`; `pdlc-consolidation-agent` **8** — `DEC-CONS-01`…`DEC-CONS-08`; `pdlc-wave-resume` **8** — `DEC-WVR-01`…`DEC-WVR-08`; `pdlc-engineering-loop` **7** — `DEC-LOOP-01`…`DEC-LOOP-07`; `orchestrate-dev-workflow` **6** — `DEC-ODW-01`…`DEC-ODW-06`; `pdlc-advisory-wave-gate` **4** — `DEC-A6-01`…`DEC-A6-04`; `pdlc-rcv-budget-stop` **4** — `DEC-BUD-01`…`DEC-BUD-04`; `pdlc-plugin-retirement` **0** — *(none; M-4b)*. Sum 100. Every namespace above is held by exactly one directory, which is the same fact M-5a states from the other side. |

## 4. M-3 — the one twice-opened id block

| ID | Fact |
|---|---|
| **M-3a** | Exactly one file records any id more than once: `docs/completed/pdlc-engineering-loop/DECISIONS-pdlc-engineering-loop.md`, which carries **13** records over **7** distinct ids. `DEC-LOOP-01`…`06` each open twice; `DEC-LOOP-07` opens once (`:618`). |
| **M-3b** | The two openings are two blocks of the file, not scattered duplicates. `## Options Considered` (`:232`) contains the first opening of each: `:237`, `:249`, `:259`, `:282`, `:322`, `:337`. `## Decision` (`:355`) contains the second: `:363`, `:397`, `:420`, `:465`, `:508`, `:582`. |
| **M-3c** | **The second opening is the one that carries a decision.** The first states the question — `### DEC-LOOP-01 — where the session's state lives` (`:237`); the second states the outcome — `### DEC-LOOP-01: Session state travels in a caller-echoed token, not a durable file` (`:363`). Consequence for a consumer: a dedupe key resolving to the **last** record in the file selects the deciding block on this corpus and satisfies a field contract requiring a one-line statement of what was decided; a key resolving to the first does not. This is the sole HEAD witness either way. |
| **M-3d** | Every other id in the corpus is recorded exactly once, so first and last coincide and no other expected value moves under either key. |

## 5. M-4 — what contributes nothing, and why

| ID | Fact |
|---|---|
| **M-4a** | `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md` contributes **zero** records. Its only `DEC-` token is prose, a range shorthand at `:14` — "(DEC-AWG-Q1…Q5 map onto Q-1…Q-5 below)" — which is a citation rather than a record, and whose final segment is non-numeric besides. `DEC-AWG-Q2`, `Q3` and `Q4` occur nowhere in the repository. Its five decisions are carried as `- **Q-1**` … `- **Q-5**` bullets (`:19`, `:59`, `:84`, `:99`, `:132`), which carry no id at all. |
| **M-4b** | `docs/completed/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` contributes **zero** records. Its ten headings are `### DEC-01` … `### DEC-10` (`:37`, `:45`, `:53`, `:61`, `:76`, `:84`, `:92`, `:100`, `:108`, `:116`) — no namespace segment. Whether such ids should be normalised is a separate question, not a fact about this corpus. |
| **M-4c** | `docs/_decisions/` holds four non-`DECISIONS-*.md` files: `.consolidation-log.md` and three `CONSOLIDATION-PROPOSAL-*.md` (`2026-07-29`, `2026-08-19-1`, `2026-08-27-1`). They fall outside the file scope. Independently, the log's four line-leading corroboration items (`:275`, `:277`, `:279`, `:281`, under a bolded lead line at `:271`, "Corroborated, not re-promoted") name `DEC-ERRROUTE-01`, `DEC-ERRROUTE-03`, `DEC-TERM-02` and `DEC-ORACLE-06` — all four already recorded as headings in sibling files under `docs/_decisions/`. Two independent reasons, same exclusion. |
| **M-4d** | **One file mixes records with non-records.** `docs/completed/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` carries 4 records (`### DEC-A6-01`…`04`, `:261`, `:315`, `:362`, `:420`) alongside **eight** headings that contain a `DEC-` id but record nothing: four question headings whose ids carry no namespace (`### For DEC-01 — …`, `:208`, `:217`, `:231`, `:251`) and four back-references where the id does not open the heading (`### What follows from DEC-A6-01`, `:443`, `:493`, `:509`, `:526`). Consequence for a consumer: on this one file the id-opens-the-heading rule and the numeric-`NUMBER` rule each exclude four headings that a looser reading would admit. |
| **M-4e** | A file with no decision record yields an ordinary empty result. Nothing in the corpus distinguishes it from a failure to read, so the two are distinguished by construction rather than by measurement. |

## 6. M-5 — cross-file duplication at HEAD

| ID | Fact |
|---|---|
| **M-5a** | **Zero** ids are recorded in more than one file. Sweeping all 25 files, no distinct id appears as a heading-carried record in two of them — not across `docs/_decisions/` and a feature directory, and not across two feature directories. |
| **M-5b** | Consequence for a consumer: any cross-file precedence or tie-break rule is **inert at this commit** and has no HEAD instance to transcribe. It is exercisable only against a constructed corpus, which makes it a synthetic-fixture obligation for PROPERTIES rather than a fact this file can supply. |
| **M-5c** | The semantically intended resolution, where a corpus ever produces one, is that a record under `docs/_decisions/` wins over a feature-directory record of the same id — a decision promoted to project level renders in its promoted form. Stated here as the intent behind the measurement, not as a rule: the rule is TSPEC's. Note that a path-ordering tie-break is not equivalent to it and is not well-defined without naming a collation — byte order and case-folded collation invert on `_`, `0x5F`. |

## 7. M-6 — the floors that follow

| ID | Fact |
|---|---|
| **M-6a** | Under the **single-file** feature reading (M-2d, 14), the floor is `41 + 14` = **55**. |
| **M-6b** | Under the **directory-glob** feature reading (M-2c/M-2d, 22), the floor is `41 + 22` = **63**. This is the governing figure for any consumer whose file scope is `DECISIONS-*.md` within a feature directory. |
| **M-6c** | A cap of **70** clears M-6b by 7 and M-6a by 15. A cap of 60 clears M-6a but is *below* M-6b, so under the directory-glob reading it drops a line against the standing corpus on day one. |
| **M-6d** | These floors are the corpus at one commit, not a growth model. A consumer wanting headroom sizes it against M-6b; a consumer re-taking the measurement bumps this file's `Version` (see *Change control*). |

## 8. M-7 — the byte floors that follow

| ID | Fact |
|---|---|
| **M-7a** | **Substance bytes**, per record, are the bytes of its id, its one-line heading statement and its file path. Summed over the **41** project-level records (M-1a, enumerated at M-1d): **5,262**. |
| **M-7b** | Summed over the M-6b worst standing case — those 41 plus the **22** of the largest feature directory (M-2c/M-2d, `docs/completed/pdlc-headless-engine/`) — **9,296** over 63 records; mean **148**, maximum **238**. Under the M-6a single-file reading the same sum is smaller, so M-7b governs any consumer whose file scope is the directory glob. |
| **M-7c** | A byte cap of **12,500** clears M-7b by **3,204**, which is **50** bytes per record of per-line framing allowance across all 63. A cap of **8,000** is *below* M-7b outright, so it drops lines against the standing corpus on day one whatever the framing costs. |
| **M-7d** | Substance bytes are a **floor, not a rendering.** They exclude every per-line separator, prefix and newline, because the concrete format of a rendered line is not this file's to fix — it belongs to the consuming TSPEC. A consumer sizes against M-7b and declares its own framing allowance on top; a consumer re-taking the measurement bumps this file's `Version` (see *Change control*). |
| **M-7e** | Measured on the same tree as §1–§7, at the same `Verified at` commit, by the same re-derivation. The two feature directories that hold zero records (M-4b) and the four non-`DECISIONS-*.md` files (M-4c) contribute nothing here either, for the reasons given there. |

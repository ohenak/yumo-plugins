# TSPEC — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer,product-manager}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 2.8 | 2026-08-10 |

> **v2.8 (erratum: FSPEC v11.7 minted AT-K3b; absorb it).** Round-16 erratum round, raised by
> pm-review, te-author and se-review on the same cell. §12.2's unreadable-corpus row still asserted
> that the whole-corpus observable — the pass terminating `no-op` with an empty consumed pair
> (§10.3 row 1b) — was reached by "no register AT either". FSPEC **v11.7** minted **AT-K3b** (FSPEC
> §13.6 register; bound to AC-1.4 as its third cause in §13.7) for exactly that condition, so the
> clause was false at HEAD. **Absorbed, not re-litigated** (DEC-ERR-01): the gap sentence is replaced
> by the citation, §12.2's second fixture is stated as AT-K3b's discharge with the register's
> remaining conjuncts (no proposal file, no reason code, the empty-pair-while-un-consolidated-non-empty
> discriminator), and §12.3 assigns **AT-K3b** to `consolidationPass.test.js` — the register
> re-derivation moves to **v11.7 / 100 ids**, restoring the id→file set equality that was short one
> id. AT-K1…AT-K7 stay in `consolidationCredential.test.js`: the split is by subject, so the AT-K
> family spans two files, which the equality permits. No other section is touched.

> **v2.7 (erratum: two HEAD claims about this feature's own landed edits).** te-review v15
> erratum round: (a) §3.2's `CLAUDE.md` row still described the tracked-runtime-artifact
> enumeration as `:58-60` with a three-count closing sentence at `:62` — the shape of the
> *pre-feature baseline*. That edit has since landed on this branch (`927ecd15`, task T33):
> HEAD carries five bullets at `CLAUDE.md:58-62` and a count-free sentence at `:64`. The row
> now reads as landed and keeps only the rationale for the shape the edit took. (b) §12.2's
> `CLAUDE.md` row asserted "verified at HEAD, where `rows[].id` is exactly `orchestrate-dev`,
> `orchestrate-queue`, `pdlc-cli`" — `distribution-manifest.json` at HEAD carries **four** rows,
> `consolidate-learnings` among them, since the rebuild landed. Both citations are re-anchored:
> what was true of the baseline is said of the baseline, what is true at HEAD is said of HEAD.
> §8.3 carried the same three-id claim in one clause and is re-anchored with it. No decision,
> oracle or scope changes: the CLAUDE.md case remains set equality against the manifest's rows,
> in both directions, which is precisely why a fourth row needed no oracle edit.
>
> **v2.6 (the all-unreadable pass gets a routing row and a case).** te-review v15 F-01 (**High**,
> pm-review v15 F-01 the same finding at Medium): v2.5 absorbed REQ §4b's terminal status for a pass
> that could read nothing — `no-op`, AC-1.4's third cause — into §10.4's *deliberately not handled*
> list, where it bound no oracle: §10.3 had no row (its nearest neighbour, row 1a's unlistable
> corpus, terminates `failed` and says *"Never `no-op`"*), §12.2's unreadable-corpus row carried a
> **mixed** fixture whose consumed pair is non-empty by construction, and no register AT reaches the
> third cause (FSPEC's AC-1.4 → AT map offers AT-R7's all-suppressed and AT-P6/E-08's empty-corpus
> fixtures — the second and first causes). Fixed where the behaviour lives: **§10.3 row 1b** routes
> it, carrying REQ's quiet-week discriminator (consumed empty **and** un-consolidated non-empty) and
> its "not row 1a" clause; **§10.4** keeps only the genuinely-accepted part, the entry re-offered
> until the operator fixes it; **§12.2** gains a **second fixture in the same case** (two enumerated
> basenames, `_readFile` ⇒ `null` for both) asserting terminal status exactly `no-op`, an empty
> consumed pair and `|un-consolidated| = 2`, with the mixed fixture as its control in both
> directions; **§12.3** records the second fixture and mints no id. te-review F-02 (Low): §12.2's
> conjunct (2) is now **set equality** against `{readable}` rather than containment-plus-absence,
> the shape NFR-5's *"exactly the consumed set"* requires. pm-review F-02 (Low): §7.1 enumerated
> *"two observables"* while §12.2/§12.3 said three — §7.1 now numbers three (count / omission /
> report-body naming), the report-body obligation no longer living inside a sub-clause of (2). One
> **ERRATUM: FSPEC** raised for the deeper cause te-review names: FSPEC §5.3's proposal-file table
> still reads *"AC-1.4's **two named causes**"* against REQ's three. The **ERRATUM: PROPERTIES** of
> v2.5 is re-emitted unresolved.
>
> **v2.5 (REQ §4b's consumed-pair decision absorbed — behaviour change).** pm-review v14 F-01
> (**High**): §7.1's arm 2 decided an unreadable corpus entry **into** the consumed pair on a
> convergence argument, while REQ §4b (erratum, REQ v2.1) had already decided the opposite remedy —
> the entry is **omitted** from the pair, stays un-consolidated and is **retried next pass**, because
> a consumed-but-unread entry can only push a verdict toward `prevented`/`insufficient-evidence` and
> never toward `recurred`, corrupting REQ-CONS-05's falsifiability loop in one direction. **Absorbed,
> not re-litigated** (DEC-ERR-01): §7.1's arm 2 rewritten to omission with REQ's reason quoted and
> this layer's superseded convergence argument answered rather than deleted; §12.2's `(no FSPEC AT)`
> row and §12.3's `consolidationPass.test.js` row now assert conjunct (2) as *the pair names the
> readable basename and **not** the unreadable one*, keeping the readable member as the positive
> control so the conjunct cannot pass on an empty pair; §13.3 re-cast from *answered here* to
> **answered upstream and absorbed**, keeping only the falsifier (the same basename reported
> unreadable on two consecutive passes) as the trigger to re-raise upstream; §10.4 gains the retried
> entry as a third, explicitly **retryable** residue class beside the nested repository, set-equal
> with §13.3's list, and records the `no-op` terminal status REQ §4b fixes for a pass that consumed
> nothing. One **ERRATUM: PROPERTIES** emitted — PROP-COR-09's title and its conjunct (2) already
> disagree across the boundary. te-review v14 F-01 (**Medium**): §11.1's ignored-fixture build-order
> guard named `git status --ignored --porcelain`, which (measured) collapses the ignored member to
> `!! docs/ign/`; the guard now specifies **`-uall`**, with `git check-ignore -v {path}` as the stated
> alternative. F-02 (Low): `ls-files --error-unmatch` is an **exit-status probe** (measured: exit 1),
> not a listing, and the bullet now says so. F-03 / pm-review F-02 (Low): §11.2's `seams.js` anchors
> corrected — function form `:405-406`, array form `:407-408`, and `mergeDoubles.js`'s fall-through
> `{ok:true, stdout:"", stderr:""}` at `:209`.

> **2.4 (the new oracles made runnable; the round trip recorded as closed everywhere).** v2.3's
> mechanism stands; this round repairs its own partial sweep. **te-review v13 F-01 (High) — the
> mandated `_git` double could not express the mechanism it was mandated for.** §7.1 issues two
> `ls-files` reads, but §11.2 bound `_git` to `mergeDoubles.js`'s `fakeGit`, which keys its script by
> git *subcommand* (`mergeDoubles.js:200-207`) and so answers both calls identically — making the
> `--deleted` set equal the enumeration set, the corpus **always empty**, AT-P1's conjuncts 2–3 red on
> correct code, and every L2 corpus fixture silently green. §11.2 is re-pointed at `seams.js`'s
> `fakeGit` (`:389`), whose script may be a per-call function or array and which records
> `.calls`/`.invocations` — the capability already ships, so no factory is added and no helper is
> widened; the map form is ruled out for corpus and clone fixtures, with the reason stated. (This also
> reconciles T-13, which already drove `asAsync(fakeGit)` over a **sync** double.) **§13.1 row 6
> (pm-review F-01 High, te-review F-02)** no longer presents a settled decision as erratum-pending:
> REQ §3.1 step 1 withdrew the "one enumeration" half, §13.3 records the trip closed, and the
> document's last surviving `REQ-…:NNN` pointer is re-cast per §12.3's own widened rule. **Row 10
> (pm-review F-02)** now states two `_git` reads rather than one, naming the subtraction, since it is
> what a PLAN task sizes the enumeration from. **te-review F-03:** the hook's line pointers were stale
> in the same revision that forbade them — `:28`/`:41`/`:43`/`:29-30`/`:44-48` are re-anchored by
> symbol (`CORPUS_GLOBS`, `region_split`, `pending`, `THRESHOLD`, `PDLC_PENDING:`, the `PY_BIN` probe)
> across §7.1, §11.1, §11.3(f) and §12.2, and §7.1 stops narrating a landed edit in the future tense;
> the quoted debug snippet is corrected to HEAD's `sorted(set(…))`. **te-review F-04:** `ls-files`
> output is unordered (measured), so §7.1 now states that every corpus oracle is a **set** oracle and
> binds §11.1's real-git case. **pm-review F-03:** §3.2's hook row keeps its ownership claim and adds
> the landed-at-HEAD note (`b22834b7`) §10.4 already carried, so the two sections agree in tense.
> Questions closed: the `unread:` field question is **answered no and no longer handed upstream** —
> the subtraction removed the population that motivated it, leaving transient faults the report body
> names, with the observation that would reverse it recorded (§13.3, §7.1); §11.1's ignored fixture
> member gains the build-order guard (`.gitignore` written *before* `git add -A`, asserted) that keeps
> it from passing for the wrong reason.

> **2.3 (REQ v2.5's two corpus rules absorbed — a behaviour change, not bookkeeping).** v2.2 asserted
> a re-pin to `REQ v2.5` without performing it; pm-review v12 F-01/F-02 caught that §7.1 still shipped
> both corpus-membership rules against REQ §3.1 step 1's decision. **Absorbed, not re-raised** — the
> REQ decided both classes, and routing a settled question back upstream is the anti-pattern
> DEC-ERR-01 names. (a) **`--exclude-standard` is dropped** from §7.1's argv, AT-P1's pin, §9.3's
> permitted-call row and §12.2's T-08 rows: an ignored LEARNINGS *is* corpus. The argument §10.4 made
> for keeping it (promotion from a source no reviewer sees in a diff) is kept as recorded history and
> its cost is now stated as *paid*, not avoided. (b) **A second `_git` read, `ls-files --deleted` over
> the identical pathspec pair, is subtracted** from the enumeration, so an index entry with no
> working-tree file is not corpus; this is an obligation, not residue. §10.4's class (ii) — "genuinely
> not closable at this layer" — is corrected: it is closed by narrowing the *pass*, not by widening
> the hook. (c) The divergence set falls from two classes to **one** (a LEARNINGS inside a nested git
> repository, measured on a scratch tree), which §10.4 now names and accepts. (d) §13.3's enumeration
> erratum is rewritten as **absorbed-and-closed** on both halves — REQ withdrew "one enumeration",
> FSPEC v11.6 re-scoped AT-P7 to the predicate — keeping only the then-open `unread:` field
> question, narrowed by (b) and closed at v2.4. (e) §11.1's L4 git case gains the two fixture members and conjuncts
> it previously declined to add while the question was open, so the flag and the subtraction are
> pinned against real git and not only against a scripted double. Lows folded in: AT-P7 re-cited to
> FSPEC §13.2; §12.3's citation rule widened to **every** upstream document with the four stale REQ
> pointers re-cast (scoping it to one document was itself the defect); §12.2's provenance sentence
> scoped to FSPEC §13 as a whole; the hook row re-measured by symbol. te-review v12: §5.1's probe
> comment now scopes its agreement claim to the *state* and not the reason's provenance (F-01);
> §7.3 decides that surrounding whitespace is tolerated and §11.4's generator draws it into the
> well-formed arm, closing a property that would have redded on conforming code (F-02); `_now` is a
> **destructured** injection default at `:1623`/`:3182`/`:8417`, not a module-level one at the stale
> `:1396` (F-03) — and the term is reconciled across all three sites that use it, not only in §5.6(b)
> where the finding landed: §5.5's seam-default row and §12.2's `rtConsInjections()` exclusion both
> said "module-level default" and now say "destructured parameter default", so the phrase survives in
> exactly one place, §5.6(b)'s narration of what the earlier draft got wrong (F-03, second half).

> **2.2 (round-10 Lows and one question, no mechanism change).** Five corrections, none touching a
> decision, obligation, oracle strength or acceptance criterion. (a) **The FSPEC is no longer cited
> by line anywhere.** pm-review F-01 and te-review L-01 both landed on hand-copied `FSPEC-…:NNNN`
> coordinates going stale (v11.4 moved every register locator +34; v11.6 moved them again), so all
> twelve are re-cast as *§-number + heading + id* and §12.3 states the rule — including its
> corollary for erratum entries, which is pm-review v11's F-01. (b) §12.3's register measurement is
> re-derived at FSPEC **v11.6**: still **99**, still set-equal to §12.3's table with an empty diff
> both ways, and the version qualifier is now a re-derivation date rather than a pin, since
> `consolidationTraceability.test.js` is what must red on a fourth drift. (c) §11.6 discloses that
> `rtCheckFile`'s catch-all routes *any* unrecognised probe reply to `file_missing`
> (`runtime-adapter.js:830`) while the double routes only genuine absence there, so §7.3 decision
> 2's absent arm is **fail-open** on a garbled reply and no L2 fixture can reach it — te-review
> L-02. §5.1's agreement claim is scoped to the file states, which is all decision 2 rests on. (d)
> §11.4 gains the **`parseMarker`** strategy (te-review L-03), stated as an iff with a round-trip
> conjunct, since v2.0 widened that grammar to two forms plus a `state` discriminant; T-09's row in
> §12.2 now carries the count. (e) te-review Q-01 answered: T-13's conjunct (ii) and the
> release-set case **pin `_now`** rather than shape-matching the timestamp, in the shape the shipped
> suites already use, so `{ISO-8601}` is a literal expected value and a release stamped with the
> take's instant reds.

> **2.1 (erratum round 9, targeted edit — no restructuring).** Three cross-reference errata, nothing
> else; no mechanism, decision or obligation changes. (a) §7.9's NFR-2 / §7.4 row (`:1418`) cited the
> inbound-residual render sites by stale line — §10.3 row 1a is at `:1950`, not `:1832`, and
> `openClone`'s signature is at `:1615`, not `:1522`; both pointers re-measured at HEAD and corrected.
> (b) §10.3 row 4 and §13.1 row 13 both called the empty-or-neither-form marker state "FSPEC §4.2's
> **fourth** row"; it is the **fifth** — *"Present but **empty**, or a line that is neither form"* —
> and the fourth is the stale `IN-PROGRESS:` reclaim row, so an AT fixtured from the old wording
> would have built the wrong state and proved nothing about **E-11**. Both sites now name the fifth
> row. (The line numbers this entry originally carried for those two rows had themselves drifted by
> 2.2 — see the citation rule in §12.3 — so both sites, and this entry, name the rows by their text.) (c) the 1.7 changelog entry located the NFR-2 row at "§8, `:1325`" — **the wrong section**;
> the row lives in §7.9. (This entry originally added "a blank line at HEAD" of the stale target.
> That was true when the erratum was raised and false by the time it was written, because this
> entry's own 13-line insertion moved the content down. It is struck at 2.2, and the general rule
> is now stated in §12.3: an erratum entry cites what a pointer **should** name, never narrates what
> the stale one currently hits, because the edit that carries the narration invalidates it.) The same stale `TSPEC:1325` pointer in §13.1
> row 1's inbound-residual note is corrected with it, being the same fact.

> **2.0 (mechanism change, not a patch — hence the major bump).** The marker's **release form** is
> re-decided on FSPEC v11.3, which answered the question v1.8 was still routing upstream. §7.3 now
> adopts **BR-14a**'s in-place write of `RELEASED: {passId} {ISO-8601}`; `parseMarker` recognises the
> `RELEASED:` form and `markerVerdict` maps it to `free` at any age with no reason code (**E-11b**);
> `present` reads `file_missing` **alone** as absent, so an empty marker is a *truncated* one and is
> reclaimed with `reclaimed-stale-lock` (**E-11**). §7.3's approved premise is untouched — no seam can
> unlink, and a sentinel write needs no unlink — and the `file_empty ≡ absent` equivalence it leaned
> on stops being load-bearing. Knock-ons, all priced: §5.1's `CheckReply` probe comment, §10.3 rows 4/4a collapsed
> into one reclaim row matching the register, §12.2's marker row inverted (`""` ⇒ reclaimed) and
> retired into **AT-M3**/**AT-M11**, T-13's and the release-set case's oracle re-stated against the
> sentinel, §12.3's AT-M3 partial-coverage disclosure and AT-M11 divergence both **withdrawn**,
> §13.1 row 13 re-decided, §13.3's marker bullet closed. **No erratum is raised against the FSPEC
> about the release form: the upstream decided, so this layer absorbs.** Three further repairs in the
> same pass: §12.2's `CLAUDE.md` ↔ manifest oracle names its one exclusion (the manifest carries no
> row for itself) so set equality is achievable without weakening to containment; §12.2's closing
> paragraph is re-cast into the past tense now that both register gaps have landed as `AT-Q13` /
> `AT-R7`; and §13.3's matching hand-off bullet, which had still handed the PLAN those two gaps as
> **open**, is re-cast the same way — it now states that the PLAN writes the two cases as `AT-Q13` /
> `AT-R7` and must not re-raise either erratum.

> **1.8 (erratum round 8, targeted edit — no restructuring).** Five Phase-P errata, nothing else:
> (a) §12.3's register measurement re-taken — **99 ids at FSPEC v11.3**, not "96 at v11.1" — with the
> reader-summary status of the number stated (`consolidationTraceability.test.js` re-derives both
> sides at run time); (b) the three ids v11.3 minted are **assigned**: `AT-M11` to
> `consolidationPass.test.js` beside its pair AT-M3, `AT-Q13` and `AT-R7` to
> `consolidationRoute.test.js`, so the PLAN's T05 has a file for every register id; (c) §12.2's T-11
> and T-12 rows record the erratum landing — their interim `(no FSPEC AT)` cases are re-labelled
> `AT-Q13` / `AT-R7` rather than written twice; (d) §3.2 gains the `CLAUDE.md` row (its `:62`
> "Those three" is already false at HEAD — `dist/pdlc-cli.mjs` is tracked and manifest-stamped — and
> false again when this feature's bundle lands), and §12.2 gains falsifying tests for it and for the
> two `SKILL.md` production edits, which had none; (e) §11.3(c) names its **third** scan axis,
> `runtimeBundle.test.js:26`'s two-member `BUNDLES`, which drives six L3 suites a new bundle would
> otherwise ship exempt from. One divergence is **raised, not settled**: AT-M11 spells the released
> marker as FSPEC §4.1's `RELEASED:` sentinel while §7.3 decides the empty form (§12.3's AT-M11 note).
> §7.3 is left as approved. **— superseded at 2.0: that divergence is settled, the sentinel adopted,
> and the raise withdrawn. This entry is retained as the decision record, not as a live statement.**

> **1.7 (erratum round 7, targeted edit — no restructuring).** Two Phase-D errata, nothing else:
> (a) the NFR-2 / §7.4 row in §7.9's `renderPrBody` obligation table (`:1418` — *not* §8 `:1325`, as
> this entry originally misrecorded; corrected at 2.1) no longer states non-disclosure as unqualifiedly
> "structural" — it is structural **outbound**, and the row now records the inbound residual
> (`rtGit`'s 300-character combined-output failure reply, `runtime-adapter.js:951`, rendered per
> §10.3 row 1a and §9.1), carried under DEC-CONS-01's qualification; (b) §9.2's claim that the
> credentialed push reaches `git` by shell expansion is corrected — `rtShellQuote`
> (`runtime-adapter.js:668-670`) single-quotes every `_git` argv element — and a lane is picked
> (credential helper on `_git`, expanded by `git`'s own shell), with the command-string-seam and
> `gh`-for-both alternatives recorded as rejected. §5.3's summary sentence and §13.1 row 1 are
> aligned to (b).

> **Scope in one line.** The mechanism for one consolidation pass: one new workflow module
> (`pdlc/workflows/consolidate-learnings.js`), the seam protocol it is injected with, the pure
> functions its behaviour decomposes into, the one edit it makes to shipped code
> (`resolveAdvisoryRung`'s optional `skill` parameter), and the test strategy that falsifies each.

## 1. Scope, inputs, and what this document decides

This TSPEC is written against `FSPEC-pdlc-consolidation-agent` **v11.6** and `REQ-…` **v2.5** — the
versions it has actually absorbed. The earlier "v11.1 / v2.0" was the pin the document opened at and
had been false since v2.0 adopted FSPEC v11.3's **BR-14a** by name. The pin was re-taken at v2.2 and
**performed at v2.3**: v2.2 asserted the re-pin while §7.1 still shipped REQ §3.1 step 1's two
corpus-membership rules the other way round, which is the one thing a version pin must not do. v2.3
absorbed both (§7.1, §10.4), so the pin and the mechanism now agree. Unlike the re-pin itself, that
absorption **does** change behaviour — the enumeration drops `--exclude-standard` and subtracts an
`ls-files --deleted` read. Where the FSPEC names an observable, this document names the module, function, seam and
type that produce it, and the test level that falsifies it.

**Binding upstream references, cited by pinned `Version`, never restated:**

| File | Version | Taken from it |
|---|---|---|
| `docs/_constraints/pdlc-consolidation-vocabularies.md` | 1.4 | §1 vocabularies, §2 phase observable, §3 log grammar, §4 pass identity and trailers |
| `docs/_constraints/pdlc-advisory-corpus-baseline.md` | 1.0 | §1 surviving records, §2 absent at HEAD, §3 reuse the resolver, §4 the escalations-not-resolutions limit |
| `docs/_constraints/DOMAIN-CONSTRAINTS.md` | — | DC-01 (closed/total contracts), DC-04 (oracle is a pure function of an injected root), DC-05, DC-08 (cite-and-reuse the sibling), DC-09/DC-10 (altitude) |
| `docs/_decisions/DECISIONS-spec-layer-boundary.md` | — | DEC-LAYER-01: this layer pins the literals the FSPEC deferred (FSPEC §14.1 T-10) |
| `docs/_decisions/DECISIONS-test-oracle-mechanics.md` | — | the canonical seam-double rule reused in §11 |

### 1.1 The ten obligations the FSPEC handed here, and where each is discharged

| # | Obligation (FSPEC §14.1) | Discharged at |
|---|---|---|
| T-01 | Function names, seam signatures, module placement | §3, §4, §5 |
| T-02 | Build entry, `distribution-manifest.json` row, and **how the bundle reaches `resolveAdvisoryRung`** | §8.2, §8.3 |
| T-03 | How the §6.1 temporary clone is created, located, removed | §9.1 |
| T-04 | Injected seams for file IO, git, PR API, **and capture of the resolver's `_log` stream** | §5, §8.4 |
| T-05 | The `resolveAdvisoryRung` call site, `rungState` threading, and the shape of the signature widening | §8.1 |
| T-06 | The `ESCALATIONS.md` parse implementation | §7.7 |
| T-07 | The `.gitignore` pattern's exact text | §3.2 |
| T-08 | Shared code vs. two implementations for the corpus enumeration | §7.1; the decision itself is §13.1 row 6 (**two implementations**). The predicate half is held **equal** (AT-P7); the enumeration half is held by **two literal pins** (§7.1) with §10.4's one remaining divergence class (a nested git repository) as the accepted residue. REQ §3.1 step 1 withdrew the "one enumeration" half and decided both former classes; §13.3 records that round trip as closed |
| T-09 | At least one property strategy per parameterisable component | §11.4 |
| T-10 | The spellings of the "unavailable" observables | §6.5 |

### 1.2 What this document deliberately does not decide

- **Fixture construction and set-equality domains** — PROPERTIES', per `DEC-LAYER-01`. The FSPEC's
  §14.5 register (LD-1 … LD-5) passes through this layer unchanged; §11.5 lists which test file each
  lands in, never the fixture itself.
- **Behaviour.** Every branch below is the FSPEC's. Where this document appears to add a rule it is
  naming a mechanism the FSPEC required and left open (a literal, a seam, a decomposition).
- **Coverage floors and mutation budgets** — PROPERTIES'.

### 1.3 Altitude self-check

Per DC-09/DC-10 this document carries mechanism, not requirements: no new status, reason code,
route, verdict or field name appears here. Every enumerated value written to a log row, an artifact
or a record is a `pdlc-consolidation-vocabularies.md` §1 row at `Version` 1.4, and every literal
this document *does* pin (§6.5) is a value §1 has no row for and the FSPEC explicitly deferred under
DEC-LAYER-01.

Two in-module control values are **not** vocabulary and are never rendered: `routeOf`'s
`"proposal-file"` outcome (§7.6) and `enumerateCorpus`'s `{unlistable: true}` (§7.1). Each names a
branch the FSPEC states and §1 has no row for; each is recorded — the first as ER-6 in §12.4, the
second as §10.3 row 1a's no-reason-code disposition — and neither is minted into a catalogue,
because minting one would be the REQ §4b breach this check exists to catch.

## 2. Technology stack and new dependencies

**No new runtime dependency, and no new dev dependency.** The stack is exactly the shipped one:

| Layer | Choice | Why, and the shipped precedent |
|---|---|---|
| Language | ES module JavaScript with JSDoc types, Node ≥ 20 | `pdlc/workflows/*.js`; the workflow runtime loads only the built bundle, so the source stays a jest-importable ES module |
| Interfaces | JSDoc `@typedef` + injected seam parameters (structural typing), not TypeScript | the repo ships no TS toolchain; `orchestrate-dev.js` / `orchestrate-queue.js` express every service boundary as a defaulted injection parameter (`orchestrate-queue.js:1033-1046`). §5 states each boundary as a typed protocol in that form |
| Test runner | jest 29 (`pdlc/workflows/package.json` — its **only** devDependency) | unchanged |
| Property generation | `__tests__/helpers/driftGenerators.js`'s seeded xorshift32 (`seeded`, `resolveSeed`) | DC-08 cite-and-reuse: the repo deliberately ships **no** property-testing library. §11.4 draws from this module and adds none |
| Seam doubles | `__tests__/helpers/seams.js` (`fakeFs`, `fakeGit`, `fakeListFiles`), `mergeDoubles.js` (`fakeGit`, `fakeGhRun`, `passingGh`, `fakeSleep`, `fakeNow`), `advisoryDoubles.js` (`makeAgentDouble`, re-exports) | DC-08 again. §11.2 adds **no** new double for `_agent`, `_git`, `_ghRun`, `_readFile`, `_writeFile`, `_appendFile`, `_listFiles` — only the two seams that do not exist yet (§5.3) get a new factory, and it lands in `advisoryDoubles.js`'s sibling module rather than in a test file |
| Hash / time | none needed | `passId` is derived from the log (§7.2), not from a counter or a UUID |

**Node built-ins are unavailable in the runtime bundle** (`build-runtime.mjs` header: no `import`,
no `fs`, no `process`). Every capability the pass needs beyond pure computation is therefore a
seam (§5) — including the two the shipped adapter does not yet have (§5.3). This is the single
constraint that shapes §9's design more than any other: the pass cannot call `mkdtemp`, cannot read
`process.env`, and cannot spawn a subprocess.


## 3. Project structure — files created and modified

### 3.1 New files

| Path | Role | Notes |
|---|---|---|
| `pdlc/workflows/consolidate-learnings.js` | the pass — one ES module, `export default async function main({…})`, every IO through a defaulted injection parameter | mirrors `orchestrate-queue.js`'s shape (`:1033`), so `build-runtime.mjs` can strip and wrap it with the existing `stripModuleSyntax` / `wrapModule` pair (`build-runtime.mjs:45`, `:55` — the declarations, not their doc comments at `:44` / `:54`) with no new build machinery |
| `pdlc/workflows/dist/consolidate-learnings.bundle.js` | generated runtime artifact | §8.2 |
| `pdlc/workflows/__tests__/helpers/consolidationDoubles.js` | the **one** canonical double module for this feature's two new seams and its log/corpus fixtures | excluded from jest by the shipped `testPathIgnorePatterns` (`package.json`); re-exports rather than re-declares every double that already exists (§11.2) |
| `pdlc/workflows/__tests__/consolidation*.test.js` | the suites — one file per §11.1 group | §11.5 names the split |

The pass is **one module, not a package.** `orchestrate-dev.js` is ~10.7 kLoC in one file and
`orchestrate-queue.js` ~1.7 kLoC; the build inlines whole module bodies into an IIFE
(`wrapModule`), and a multi-file module would need a build change for no behavioural gain. The
decomposition is by **exported pure function** (§4), not by file.

### 3.2 Modified files

| Path | Change | Constrained by |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | `resolveAdvisoryRung` (`:1833`) gains an optional `skill` parameter defaulting to `ADVISORY_RUNG_SKILL` (`:1797`), threaded to `dispatchAt`'s `_agent` call (`:1841`) and therefore to both the memoised path (`:1844-1849`) and the two-rung path | §8.1; FSPEC §15.3, §14.1 T-05 |
| `pdlc/workflows/build-runtime.mjs` | one new `bundles` row (the array is `:448-471`), plus `consolidate-learnings.js` read alongside the other two sources (`:83-85`) and a `CONS_META` / `CONS_ENTRY` pair beside `QUEUE_META` (`:127`) / `QUEUE_ENTRY` (`:185`) | §8.2 |
| `pdlc/workflows/runtime-adapter.js` | two new adapter functions — `rtEnvPresent` and `rtMakeTempDir` — plus a `rtConsInjections()` bundle beside `rtDevInjections` (`:1086`); **and** the absolute-path widening of `rtWriteFile` (`:802-811`) **alone**, whose prompt today says `relative to the repository root` (`:805`, the only occurrence of that string in the file). `rtReadFile` is **not** modified — see §5.6(a) | §5.3, §5.6, §9.1, §9.2 |
| `pdlc/workflows/dist/orchestrate-dev.bundle.js`, `dist/orchestrate-queue.bundle.js`, `dist/pdlc-cli.mjs`, `dist/distribution-manifest.json` | rebuilt **in the same commit** as the two rows above | §8.3 |
| `pdlc/hooks/scripts/nudge-consolidation.sh` | The single `os.path.join` glob replaced by a named two-literal **`CORPUS_GLOBS`** tuple and a comprehension over it, widening the corpus to `docs/completed/*/` and giving §7.1's pin (b) a declaration to read; the basename predicate scoped to the two §3.2 regions via **`region_split`**; the early exit replaced by a **`pending`** fall-through; **and** one env-gated **`PDLC_PENDING:`** debug line that emits the pending **set** on stderr, without which AT-P7 has no oracle (§7.1). Located by symbol, never by line index — the same rule §7.1 imposes on pin (b)'s oracle, and for the same reason: this feature's own edits to the heredoc shift every line in it. All four are **production** edits in one shipped file ⇒ one owning task. **All four have since landed** (commit `b22834b7`; §10.4, §7.1) — `CORPUS_GLOBS` and its comprehension, `region_split` and its use, the `pending` fall-through with no early exit above it, and the `PDLC_PENDING:` line are all at HEAD. The row stays because the *ownership* claim is what the PLAN's manifest derives from and that is unchanged: this file is still one task's, and its remaining work is the oracles that pin these edits, not the edits | §7.1, §10.4 |
| `pdlc/skills/consolidate-learnings/SKILL.md` | `:56` (was the `Date Completed` date boundary) now carries the block/legacy predicate; `:62`'s `DECISIONS-{topic}.md` route gains `{topic} = failure-mode-id` | FSPEC §3.2, §5.2 |
| `pdlc/skills/harvest-learnings/SKILL.md` | a `Phases exercised` row in the metadata table (`:72-79`, after the `Harvested from` row at `:77`); a `failure-mode-id` line in the §5 Open Items convention, stated as a **verbatim copy from the handed open-promotion list** | FSPEC §8.3, §8.4 |
| `.gitignore` | **exact text** (T-07): a comment line `# pdlc consolidation in-progress marker — working tree only (AC-1.3)` followed by the single pattern `docs/_decisions/.consolidation-lock` | §3.3 |
| `CLAUDE.md` | the tracked-runtime-artifact enumeration gains a `pdlc/workflows/dist/consolidate-learnings.bundle.js` bullet and the closing sentence is rewritten count-free. **Landed on this branch in `927ecd15` (T33)**: HEAD carries five bullets at `CLAUDE.md:58-62` and the count-free sentence "These are the tracked, shipped outputs." at `:64`; the row is kept for the rationale, which is why the edit took that shape rather than a smaller one. **The sentence was already false at the pre-feature baseline** (`:58-60` enumerated, `:62` counted), before this feature changed anything: `pdlc/workflows/dist/pdlc-cli.mjs` is tracked (`git ls-files pdlc/workflows/dist/` returns four paths) and carries its own `distribution-manifest.json` row, so the enumeration lists three of four and the sentence miscounts them. This feature's bundle makes it wrong a second time, which is why the fix is the count-free rewrite plus the missing `pdlc-cli.mjs` bullet, not a `three` → `four` substitution that would be stale again on the next artifact. **This is a production edit in a shipped, tracked file** ⇒ one owning task, and it carries the falsifying oracle §12.2's CLAUDE.md row states — the enumeration is asserted set-equal to the manifest's artifact rows, so a future artifact that lands without a bullet reds rather than drifting | §8.3, §12.2 |

`pdlc/.claude-plugin/plugin.json`'s `version` is bumped by the release step, not by this feature's
implementation tasks; the manifest's `pluginVersion` stamp follows it (§8.3).

### 3.3 The `.gitignore` pattern, decided (T-07)

`docs/_decisions/.consolidation-lock` — a repository-root-relative path **containing a separator**,
written without a leading slash and without `**/`. Per gitignore(5) a pattern with a non-trailing
separator is already anchored to the `.gitignore`'s own directory, which the shipped
`/.claude/workflows/` entry documents at length in its own comment block (verified at HEAD, that
comment is the last block of the file). A slash-free `\.consolidation-lock` or a `**/`-prefixed form
would match at every depth, so any future file of that basename anywhere in the tree would be
ignored without anyone deciding it should be — which is what anchoring exists to prevent. The
gitignore(5) ground is the whole argument; no fixture is claimed here, because §11 creates none of
that name.

**T-07 is falsified by a test, not by a maintainer check.** `consolidationBuild.test.js` reads the
tracked `.gitignore` and asserts the comment line and the pattern line **verbatim and adjacent**, in
the shape `runtimeBundle.test.js` already uses for source-text assertions (`:1570-1584`). Text that
CI cannot read can be rewritten slash-free in one commit and nothing goes red; §12.2 names the test.

### 3.4 Consumer-visible surface

The pass is invoked as `/pdlc:consolidate-learnings`. That name already resolves to the **skill**
of the same name; after this feature it also resolves to a workflow bundle, exactly the
`orchestrate-queue` shape REQ §5 names (a skill and a bundle sharing one name). Nothing in
`pdlc/hooks/hooks.json` changes: no hook can start a pass (FSPEC §2.1), and `nudge-consolidation.sh`
keeps its advisory-only role (`:47-48` print `additionalContext` and exit 0).

## 4. Module architecture — decomposition and dependency graph

### 4.1 The shape: one impure driver over a wall of pure functions

`main()` is the only function that touches a seam. Every decision the FSPEC states — the predicate,
the datum, the id derivation, the merge, the verdicts, the streaks, the routing, the suppression,
the counting, the row rendering — is a **pure function of already-read text**, exported for direct
unit test. This is not a style preference: FSPEC §8.3's "no model judgment, two runs over the same
inputs cannot disagree" and §14.1 T-09's property obligations are only assertable if the decision is
reachable without standing up a pass.

```
main({ …seams })                       ← the only impure function
 ├─ resolveConsolidationConfig         (pure)   §7.8
 ├─ enumerateCorpus            ←_git (ls-files) §7.1
 │   ├─ parseCorpusListing             (pure)   §7.1
 │   └─ classifyCorpus                 (pure)   §7.1
 ├─ cadenceDatum / triggerFor          (pure)   §7.2
 ├─ mintPassId                         (pure)   §7.2
 ├─ takeMarker         ←_checkFile/_readFile/_writeFile §7.3
 ├─ renderConsumedPair                 (pure)   §7.1
 ├─ dispatchClustering         ←resolveAdvisoryRung    §8.1
 ├─ parseEscalations                   (pure)   §7.7
 │   └─ seamCandidates                 (pure)   §7.7
 ├─ parseLogRecords                    (pure)   §7.4
 │   ├─ effectivenessTable             (pure)   §7.5
 │   ├─ openPromotionList              (pure)   §7.5
 │   └─ suppressionVerdict             (pure)   §7.6
 ├─ deriveProposals                    (pure over the clustering reply)  §7.4
 │   ├─ failureModeId                  (pure)   §7.4
 │   ├─ mergeProposals                 (pure)   §7.4
 │   └─ remediationChoice              (pure)   §7.5
 ├─ routeProposal                      (pure)   §7.6   ← the only caller of routeOf
 │   ├─ routeOf                        (pure)   §7.6
 │   ├─ consuming-repo write   ←_appendFile
 │   ├─ proposal file          ←_writeFile      §7.9  renderProposalFile
 │   └─ PR route               ←_git/_ghRun/_envPresent/_makeTempDir  §9  renderPrBody
 ├─ renderTerminalRow / renderReport   (pure)   §7.9
 └─ commitConsumingRepoPaths   ←_git             §9.4
```

**Dependency direction is one-way.** No pure function calls another module's impure helper, and no
pure function closes over `main`'s scope. `main` threads a single `PassState` (§6.1) through the
sequence, which is what makes FSPEC §2.2's "terminates = a jump to step 14" implementable as an
early `return await finishPass(state, …)` rather than as an exception (§10.1, §10.2).

### 4.2 Where each function lives

All of the above are exported from `pdlc/workflows/consolidate-learnings.js` **except** four
reused imports, which are not re-authored (DC-08):

| Reused symbol | Source at HEAD | Used for |
|---|---|---|
| `resolveAdvisoryRung` | `orchestrate-dev.js:1833` | every agent dispatch the pass makes (§8.1) |
| `MERGE_GUARD_DEFAULTS` | `orchestrate-dev.js:48-53` | §7.6's routing predicate — read, never copied |
| `mergeCommandFor` | `orchestrate-dev.js:319` | the sole place a literal `gh` command string is built (§9.2 extends its `switch` rather than adding a second builder) |
| `gitWithLockRetry` | `orchestrate-dev.js:8617` | the `index.lock` retry class on §9.4's commit |

`commitPaths` (`:8669`) is **not** reused: its commit is a plain `git commit -m` with no pathspec
(`:8690`), which FSPEC §5.4 forbids here. The reused shape is `commitQueueRow`'s two-call form
(`orchestrate-queue.js:1576`; add `:1577`, commit `:1580-1585`) and `commitAdvisoryRecord`'s
mirror (`:1615`), including their shared `NOTHING_TO_COMMIT_RE` treatment (`:1631-1635`).

### 4.3 How the imports reach the bundle

`consolidate-learnings.js` imports those four symbols from `./orchestrate-dev.js` as an ordinary ES
module import, exactly as `orchestrate-queue.js` does today. The **bundle** cannot import, so
`build-runtime.mjs` inlines the dev module and re-binds the names in the consolidation IIFE's
prelude — the mechanism `queueModule`'s prelude already uses (`build-runtime.mjs:113-123`, a
`const X = __dev.X;` line per symbol). §8.2 states the four lines this adds and the four names
`devModule`'s export list gains.


## 5. Interfaces — the injected seam protocol

Every service boundary is a **defaulted injection parameter of `main()`**, the shape
`orchestrate-queue.js:1033-1046` establishes. Production wiring comes from
`runtime-adapter.js`'s new `rtConsInjections()`; tests pass doubles. The default value of every
seam is the module's own `default*` implementation where one is meaningful and `null` where the
capability must be *installed* (the `_runCommand` precedent: `NO_RUN_COMMAND = null`,
`orchestrate-dev.js:6699`, taken as the default at `:8921`).

### 5.1 The protocol (T-01, T-04)

```ts
interface ConsolidationSeams {
  // ── existing seams, contracts unchanged from runtime-adapter.js ──
  _agent(skill: string, prompt: string, opts?: {model?: string}): Promise<string>;
  _readFile(path: string): Promise<string | null>;          // null = absent OR unreadable
  _writeFile(path: string, contents: string): Promise<void>;
  _appendFile(path: string, text: string): Promise<void>;   // ONE whole record per call
  _checkFile(path: string): Promise<CheckReply>;            // existence/non-empty gate — §7.3
  _listFiles(dirPath: string): Promise<ListReply>;          // NOT string[] — see below
  _git(argv: string[]): Promise<{ok: boolean; stdout: string; stderr: string}>;
  _ghRun(command: string): Promise<{ok: boolean; stdout: string; stderr: string}>;
  _log(message: string): void;
  _phase(label: string): void;

  // ── the two seams this feature adds (§5.3) ──
  _envPresent(name: string): Promise<boolean>;              // NEVER returns the value
  _makeTempDir(passId: string): Promise<string | null>;     // absolute path, or null on failure
}

// The listing seam's real, closed contract at HEAD (runtime-adapter.js:905-931;
// the same four-member set is frozen for the doubles as LIST_FAILURE_VALUES,
// __tests__/helpers/seams.js:58-63).
// The presence probe's contract at HEAD (runtime-adapter.js:817-831). What §7.3 depends on
// is ONLY the `file_missing` reason: it is the sole absent state. `{ok:true}` and
// `{ok:false, reason:"file_empty"}` are BOTH present — the first a held or RELEASED: marker,
// the second a truncated one (FSPEC E-11) — and that is why the marker's `present` flag comes
// from here and not from _readFile, whose single `null` cannot name a reason. Do not build on
// the emptiness boundary itself: the two implementations disagree on where it sits.
// `rtCheckFile` decides emptiness by BYTE SIZE (`test -s`, runtime-adapter.js:823), while
// `fakeFs.checkFile` decides it by TRIMMED CONTENT (`String(self.files[path]).trim() === ""`,
// __tests__/helpers/seams.js:298) — so a marker holding a single newline is {ok:true} in
// production and {ok:false, reason:"file_empty"} under the double. Under §7.3 that divergence
// cannot change a verdict: both replies are present, so both reach `markerVerdict` through
// `parseMarker` over the same text. On the one state this layer reads — a missing file — the two
// agree on the STATE but NOT on its provenance: the shipped adapter's catch-all routes any
// unrecognised probe reply to `file_missing` (runtime-adapter.js:830), so in production that
// reason has a wider producer than a genuinely absent file, while the double emits it only on a
// genuinely absent key (__tests__/helpers/seams.js:292-306). Read this comment as scoping the
// agreement to the state, never to the reason's provenance — §11.6 states the consequence in
// full, including that AC-1.3's mutual exclusion is fail-open on that path and that no L2
// fixture can reach it.
type CheckReply = {ok: true} | {ok: false; reason: "file_missing" | "file_empty"};

type ListReply = {ok: true; files: string[]}
               | {ok: false; reason: "dir_missing" | "not_a_directory"
                                   | "unreadable" | "bad_argument"};

// NOT a seam. A destructured injection default, the shipped pattern (orchestrate-dev.js:1623,
// :3182, :8417 — each a `_now = () => Date.now()` default in a function's options
// destructuring). That is what makes T-13's clock pin possible: a caller may pass _now,
// while production supplies none and gets Date.now(). See §5.6(b).
_now(): number;
```

**`_listFiles` is transcribed, not simplified.** An earlier draft of this section declared it
`Promise<string[]>`, which is the shape the *doubles* have and not the shape the adapter has: an
implementation that reads `{ok:false,…}` as truthy and iterates it yields zero files with no error,
so the bug is silent and no absence-only assertion can see it. DC-01 obliges the closed/total form on
both sides. This pass does not in fact call `_listFiles` (§7.1 enumerates through `_git`), but the
seam stays in the protocol because `main()` threads the standard injection bundle, and a contract
stated wrongly in a protocol is a contract a future edit will code against.

**Every seam call is `await`ed without exception.** The adapter's implementations are async and the
test doubles are sync (`__tests__/helpers/seams.js` header states the asymmetry and names it the
central hazard); a missing `await` therefore passes every unit test and fails only in production.
§11.3 states the compensating control.

### 5.2 Seam semantics this pass depends on, verified at HEAD

| Seam | Property relied on | Where verified |
|---|---|---|
| `_readFile` | maps a missing **or unreadable** file to `null` rather than throwing | `runtime-adapter.js:493`; `orchestrate-queue.js:1056-1063`'s comment states the same for the drift gate |
| `_appendFile` | appends the given text, no read-modify-write | `runtime-adapter.js:863` — this is what makes vocabularies §3's write-granularity rule implementable at all |
| `_git` | argv form, so `["-C", dir, …]` reaches a **different tree** without any shell quoting concern; returns `{ok, stdout, stderr}` and never throws | `runtime-adapter.js:945-957`, parse at `:967` |
| `_ghRun` | takes a fully built command **string**; the prompt carries an "issue AT MOST ONCE" clause because some `gh` commands mutate | `runtime-adapter.js:995-1006` |
| `_log` | plain sink; the resolver writes `ADVISORY_MODEL_FALLBACK:` through it (`orchestrate-dev.js:1858-1860`) and nowhere else | §8.4 depends on this |
| `_writeFile` | **repo-root-relative today, and that is a blocker this feature must clear** — `rtWriteFile`'s prompt reads "Write the following content to `"${path}"`, **relative to the repository root**" (`runtime-adapter.js:805`) | §5.6(a) states the widening |
| `_readFile` | **already absolute-safe; no change** — `rtReadFile` (`:493`) reaches disk through `rtReadProbe` (`:369`) and the chunk read, both of which transport a shell command (`[ ! -f "${path}" ]`, `wc -c < "${path}"`, `sed -n`) prefixed by a *cwd* instruction ("Run this exact command from the repository root", `:374`). A cwd instruction resolves an absolute `${path}` verbatim; there is no path-resolution clause to widen. `grep -n "relative to the repository root" pdlc/workflows/runtime-adapter.js` returns exactly one line, `:805`, inside `rtWriteFile` | §5.6(a) states why nothing changes |
| `_git` | `["-C", dir, …]` and `["ls-files", …]` are the only two forms this pass uses to reach a tree | §7.1, §9.3 |

`_git`'s `-C` capability is the single fact that makes FSPEC §6.5's **git-seam-split-by-tree**
implementable without a second seam: a call is classified into the invoking-tree domain or the clone
domain by whether its argv begins `["-C", cloneDir]`. §9.3 states the classifier; §11.3 states the
spy that reads it.

### 5.3 The two new seams, and why each must exist

The runtime has no `process` and no `fs` (`build-runtime.mjs` header), so neither capability can be
obtained in-module.

**`_envPresent(name) => Promise<boolean>`.** FSPEC §7.2 resolves the credential from the environment
variable named by `consolidation.credentialEnv`, and NFR-2 / §7.4 forbid that value from reaching any
log, artifact, PR body or report. A seam returning the **value** would put the secret inside the JS
process and inside the agent transcript that transported it — the transcript being a surface neither
the FSPEC nor the REQ can redact. The seam therefore returns a **boolean only**, and the adapter's
prompt is built so the value is never emitted:

```
rtEnvPresent(name):
  agent: run exactly:  [ -n "${<name>:-}" ] && echo PRESENT || echo ABSENT
         reply with that one word and nothing else.
  → true iff the reply is exactly "PRESENT"; any other reply, including an
    unparseable one, is false (fail-closed onto AC-4.3's degradation, never onto
    a claimed credential).
```

The credential's **value** reaches `gh` by shell expansion inside the transported command, and
reaches `git` by expansion **one process lower**, inside the credential helper `git` itself runs —
because `rtShellQuote` single-quotes every `_git` argv element (`runtime-adapter.js:668-670`), so no
`$VAR` in a `_git` argv expands at transport time (§9.2). Either way it is never a JS string and
never an argv element the pass logs.

**`_makeTempDir(passId) => Promise<string|null>`.** FSPEC §6.1 requires the guard-set edit to be
made in a separate clone under a temporary directory. The pass cannot call `mkdtemp`. The adapter
creates it and returns the path:

```
rtMakeTempDir(passId):
  agent: run exactly:  mktemp -d -t pdlc-consolidation-<passId>
         reply with the created path and nothing else.
  → the trimmed reply when it is a single absolute POSIX path; otherwise null.
```

`null` is a §6.3 `api-failure`-class degradation input, not a halt (§10.3 row 7). The `mktemp -d -t`
form is chosen over a hand-built `/tmp/…` literal deliberately: `/tmp` is world-writable, and a
predictable path derived from `passId` is a symlink-attack surface and collides across two users on
one host. `-t` is honoured on both supported platforms (macOS bash 3.2 and Linux bash 5), the same
matrix `.github/workflows/pr-tests.yml` already runs.

### 5.4 The one seam that is deliberately *not* added

There is no `_runCommand`. Everything the pass does through a shell is either a `git` argv (`_git`)
or a `gh` command string (`_ghRun`), and both are transported by adapters whose replies are already
a closed `{ok, stdout, stderr}` contract. `rtRunCommand` (`runtime-adapter.js:1034`) returns a
trailer plus an output tail, which is the wrong shape for a call whose stdout the pass must parse
(a PR URL, a `gh pr list --json` payload).

### 5.5 Seam defaults, and what an unwired seam does

| Seam | Module default | Behaviour when the default stands |
|---|---|---|
| `_agent`, `_readFile`, `_writeFile`, `_appendFile`, `_checkFile`, `_listFiles`, `_git`, `_log`, `_phase` | the module's own `default*` (the `orchestrate-queue.js:1034-1046` pattern) | ordinary operation **under jest only** — in the runtime every one of them throws; see below |
| `_now` | `() => Date.now()` — a **destructured parameter default, not an adapter seam** (§5.6(b)) | ordinary operation; because the default is destructured it stays *caller-overridable*, which is what T-13's clock pin uses |
| `_ghRun` | `null` | the PR route degrades with `api-failure` before any call is attempted; the proposal file still carries the diff (§10.3) |
| `_envPresent` | `null` | treated as "no credential variable observable" ⇒ §7.2 falls through to the `local-gh` probe, then to `absent` |
| `_makeTempDir` | `null` | the PR route degrades with `api-failure`; the pass never falls back to working in the invoking tree, which AC-3.8 forbids outright |

Each `null` default is the FSPEC's fail-safe direction, not a new branch: an uninstalled capability
degrades the PR route and never touches the invoking tree, never halts the pass, and never reads as
a credential the pass does not have.

**"Ordinary operation" is a jest-only claim, and for `_checkFile` that matters.** The
`orchestrate-queue.js:1034-1046` pattern this row cites obtains `fs` through a dynamic import —
`defaultReadFile` is `const { readFileSync } = await import("fs")` (`orchestrate-queue.js:948-955`) —
and the workflow runtime has no `import()` and no `fs` (`build-runtime.mjs` header; the same
constraint §4.3 states). So in the bundle these defaults are **not** ordinary operation: they throw.
That is tolerable for the seams the pass drives on every path (`_readFile`, `_git`) because the pass
dies at step 1 and someone notices. `_checkFile` is the exception, and the difference is the whole of
§7.3's safety: its only consumer is a probe that is *supposed* to be negative on a healthy tree, so a
default that returned a legal `{ok:false, reason:"file_missing"}` on failure would be
indistinguishable from a quiet tree — `markerVerdict` would return `free` on every pass, AC-1.3's
mutual exclusion would be off in production, and every L2 fixture would stay green because the
`refused` path is exercised only through `fakeFs`. **`defaultCheckFile` therefore fails loudly**: it
throws on any I/O failure and never returns a `CheckReply`. It deliberately does **not** copy the
never-throw internal contract of the shipped `checkFileNonEmpty`, whose every catch returns
`{ok:false, reason:"file_missing"}` (`orchestrate-dev.js:3690-3692`) — that shape is right for a
caller deciding whether a *document* exists and wrong for one deciding whether a *lock* is held.
That default is not separately asserted, and deliberately: §12.2's `rtConsInjections()`
set-equality row makes the production path unable to reach it, and no suite drives a module
default. The residual exposure is bounded to a hand-written harness that omits the seam.

The load-bearing consequence is that an unwired seam must be caught by an assertion, not by a
default: §12.2's `rtConsInjections()` set-equality row is what makes "the composition root hands over
every §5.1 member" falsifiable. It exists because this repo has shipped the omission once already —
`runtime-adapter.js:1098-1100` carries the note in its own words ("`_writeFile`'s adapter existed
since the first bundle but was never in this object") — and the repair's precedent test
(`adapterProbe.test.js:253-258`, "wires all three into `rtDevInjections`") is the shape, widened from
per-name containment to set equality because §5.1 is an enumerated contract.

### 5.6 One adapter contract this feature changes, one it deliberately leaves alone, and the clock it does not

**(a) `_writeFile` gains absolute paths; `_readFile` needs nothing.** §9.2 writes the guard-set edit
and the PR body *inside the clone*, whose directory comes from `mktemp -d` (§5.3) and is therefore
**outside the repository**. `rtWriteFile`'s shipped prompt says the opposite of what that needs — it
instructs the agent to resolve the path "relative to the repository root"
(`runtime-adapter.js:805`) — so this is a real capability the feature must add, not a path the
shipped seam already serves.

The **read** side is a different case, and an earlier draft of this section got it wrong. There is no
read-side widening, because there is nothing to widen: `rtReadFile` (`:493`) never states a
path-resolution rule at all. It reaches disk through `rtReadProbe` (`:369`) and the chunked line
read, each of which transports a **shell command** — `if [ ! -f "${path}" ] || [ ! -r "${path}" ]`,
`wc -c < "${path}"`, `shasum -a 256 "${path}"` (`:374-378`) — under the *cwd* instruction "Run this
exact command from the repository root" (`:374`). A cwd instruction is not a path-resolution
instruction: every one of those shell forms resolves an absolute `${path}` verbatim today. The
measurement that settles it: `grep -n "relative to the repository root" pdlc/workflows/runtime-adapter.js`
returns **exactly one** line at HEAD, `:805`, inside `rtWriteFile`. This is recorded positively so
that a later reader does not "harmonise" the two prompts and add a clause with no behavioural motive.
It is also consistent with what §7 and §9 actually do inside the clone: the clone traffic is *writes*
(the guard-set edit, the `--body-file` body) plus `_git`; no `_readFile` call with an absolute path
appears anywhere in this document.

The widening is therefore **one clause in one prompt**, `rtWriteFile`'s:

> …to `"${path}"` — relative to the repository root when the path is relative, and **verbatim when
> the path is absolute** (a leading `/`). Do not resolve it against the repository root in that case.

Three properties keep the widening bounded: it is **additive** (every relative path behaves exactly
as it does today, which `runtimeBundle.test.js`'s shipped adapter assertions still pin); it is
**non-mutating of any tracked tree**, because the only absolute paths this pass ever forms come from
`_makeTempDir`'s reply and are never constructed in-module (§5.3); and it is **falsified**, not
reviewed — §11.3(e) states the adapter-source assertion that pins `rtWriteFile`'s widened clause
verbatim (one prompt, not two), and §11.6 no longer exempts it. Routing the clone's writes through `_git` instead was
rejected: git has no write-a-working-tree-file verb short of `hash-object -w` plus `update-index`,
which is three mutating calls in the clone domain to replace one path argument.

**(b) `_now` is a destructured injection default, not a seam.** `rtDevInjections` (`runtime-adapter.js:1086-1110`)
supplies no clock: its members are `_agent`, `_parallel`, `_pipeline`, `_phase`, `_log`, `_checkFile`,
`_readFile`, `_hashFile`, `_checkCi`, `_mergeWorktree`, `_writeFile`, `_appendFile`, `_listFiles`,
`_git`, `_ghRun`, `_runCommand` and the probe seams. The shipped pattern is a **destructured default
in the options object** — `_now = () => Date.now()` at `orchestrate-dev.js:1623`, `:3182` and `:8417`
— and this pass takes it. The distinction matters and is not pedantry: a destructured default is
*overridable by a caller*, which is exactly what lets §12.2's T-13 pin the clock and assert a literal
`{ISO-8601}` rather than shape-match a regex, in the same way three shipped suites already do
(`advisoryDodSeams.test.js:129`, `:1116`; `advisoryDisabled.test.js:276`). An earlier draft called
this a "module-level default" and cited `orchestrate-dev.js:1396`, which does not name a `_now`
default at HEAD — a line-drift of exactly the class §12.3's citation rule exists to prevent, under
the very mechanism T-13 leans on.

The consequence is observable and is stated so a test author knows what to pin: `Date.now()` in the
bundle runs in the **workflow host process's** timezone, not in an operator-chosen one. §7.2's
`today` — the `{YYYY-MM-DD}` half of `passId` — and `cadenceDatum`'s day comparisons therefore both
read the host's local calendar, and a pass minted either side of host-local midnight lands on
different dates. Every `today` is passed *into* the pure functions, so no L1 test needs a clock; the
L2 suites pin `TZ` explicitly (`fakeNow` / `FIXED_NOW_MS`, `mergeDoubles.js`) rather than inheriting
the runner's.

## 6. Data model — types

JSDoc `@typedef`s in `consolidate-learnings.js`, stated here in TS notation. Every enumerated union
below is transcribed from `pdlc-consolidation-vocabularies.md` §1 at `Version` 1.4 — **transcribed,
never widened**: §11.3's AT-L5 harness compares the module's frozen catalogue arrays against that
table in both directions.

### 6.1 Pass state and configuration

```ts
type TerminalStatus = "promoted" | "promoted-degraded" | "no-op"
                    | "skipped-cadence" | "refused" | "failed";
type ReasonCode = "consolidation-in-progress" | "reclaimed-stale-lock"
                | "advisory-model-unresolved" | "no-cadence-datum" | "writes-uncommitted"
                | "credential-unavailable" | "repository-unresolved" | "api-failure"
                | "branch-exists" | "duplicate-suppressed"
                | "no-advisory-corpus" | "advisory-corpus-empty";
type Trigger    = "cadence" | "volume" | "manual";
type Route      = "constraints" | "decisions" | "PR" | "degraded";
type Action     = "promote" | "revise" | "retire";
type Verdict    = "prevented" | "recurred" | "insufficient-evidence";
type PromoState = "ineffective" | "unmeasurable";
type Credential = "present (redacted)" | "absent" | "local-gh";
type Phase = "R"|"F"|"T"|"D"|"P"|"PR"|"I"|"PT"|"CR"|"DOD"|"H"|"PUB"|"MERGE";

interface ConsolidationConfig {          // §7.8 — per-key independent fallback
  cadenceHours: number;                  // 168
  volumeThreshold: number;               // 5
  staleLockMinutes: number;              // 60
  pluginRepository: string | null;       // null ⇒ the current repository
  credentialEnv: string;                 // "PDLC_PLUGIN_REPO_TOKEN"
  unmeasurablePasses: number;            // 3
}
interface ConfigParse {                  // the parseAdvisoryConfig-shaped return
  config: ConsolidationConfig;
  sectionMalformed: boolean;
  invalidKeys: string[];
}

interface PassState {
  passId: string | null;                 // null until step 5
  trigger: Trigger | null;
  status: TerminalStatus | null;
  reasons: Set<ReasonCode>;              // a row may carry several (§10.1)
  rung: string | null;                   // the model id the pass actually ran on
  credential: Credential;                // "absent" until §7.2's resolution runs
  consumed: string[];                    // basenames the pass actually read: the step-2
                                         // enumeration minus any entry whose body `_readFile`
                                         // returned `null` for (REQ §4b, §7.1). Frozen once the
                                         // bodies are read; it is what step 7's pair renders.
  proposals: Proposal[];
  records: FailureModeRecord[];          // appended one-per-proposal as each routes
  effectiveness: EffectivenessRow[] | null;   // null ⇒ step 11 never ran
  suppressions: Suppression[];
  notices: ParseNotice[];
  prUrl: string | null;                  // this pass's own PR only
  branch: string | null;
  markerHeld: boolean;
}
```

`reasons` is a `Set` because FSPEC §10.3 admits more than one code per row and vocabularies §1's
composition rule makes the legal set a function of the recording point, not of insertion order;
rendering sorts it into the catalogue's declaration order so the row is byte-stable across runs
(§7.9).

### 6.2 Proposals and records

```ts
interface Proposal {                 // the pass's in-flight unit, before it routes
  failureModeId: string;             // §7.4's derivation
  phase: Phase;
  symptom: string;                   // one line, non-keying free text
  artifact: string;                  // SUBJECT — canonical repo-root-relative path
  kind: 1 | 2 | 3;                   // FSPEC §5.2: 1 constraint, 2 decision, 3 process learning
  target: string;                    // decided by kind; the ONLY field routing reads
  action: Action;
  diff: string | null;               // the concrete edit; PR/proposal-file routes require it
  elidedKinds: (1|2|3)[];            // §7.4's merge compensation, for report item 4
  elidedArtifacts: string[];         // §7.4's tie-break compensation, same item
}

interface FailureModeRecord {        // the eight fields, exactly (FSPEC §8.1)
  failureModeId: string; phase: Phase; symptom: string; artifact: string;
  target: string; passId: string; action: Action; route: Route;
}

interface EffectivenessRow {
  failureModeId: string;
  artifact: string | null;           // null ⇒ rendered as §6.5's unavailable literal
  verdict: Verdict;
  state: PromoState | null;
  remediation: "revision" | "retirement" | null;   // null ⇒ the field is ABSENT, not empty
}

interface Suppression { failureModeId: string; action: Action;
                        evidence: {kind: "pr"; url: string}
                                | {kind: "pass"; passId: string | null}; }

interface ParseNotice { subject: string; missingField: string; detail?: string; }
```

`FailureModeRecord.route` is `Route`, the four-member union — so a promotion routed to the proposal
file records `"degraded"` until ER-6 lands (§7.6, §12.4). `FailureModeRecord` is a **closed
eight-field record on both sides** (DC-01): the writer emits all
eight on every kind and on the `degraded` route (AT-F20), and the reader is total over any subset
(§7.4's `parseLogRecords` yields a partial record plus the notice list, never a filled default). The
two halves are separate typedefs so the reader's type cannot drift into the writer's.

### 6.3 Corpus and advisory types

```ts
interface CorpusFile { path: string; basename: string; }
interface Predicate  { consolidated: Set<string>; unconsolidated: string[];
                       basenameCollisions: string[][]; }   // §7.1's reported collision
interface EscalationCounts {          // §7.7
  bySeamFeature: Map<string, Map<string, number>>;
  totals: Map<string, number>;
  distinctFeatures: Map<string, number>;
  entryCount: number;
  corpusState: "absent" | "empty" | "present";
}
```

### 6.4 Frozen catalogues

Every union above is also a module-level `Object.freeze([...])` array —
`TERMINAL_STATUSES`, `REASON_CODES`, `TRIGGERS`, `ROUTES`, `ACTIONS`, `VERDICTS`, `PROMO_STATES`,
`CREDENTIAL_VALUES`, `PHASE_CATALOGUE` — plus `REASON_CODE_STATUSES`, a frozen map from reason code
to its permitted status set (vocabularies §1's third column, transcribed verbatim at `Version` 1.4).
Freezing is the shipped discipline (`MERGE_GUARD_DEFAULTS`, `orchestrate-dev.js:48`; `MERGE_MODES`
`:55`; `ADVISORY_SEAMS` `:1669`) and is what lets §11.3's oracle range over the module's own
constants rather than over strings scraped from a fixture.

`REASON_CODE_STATUSES` is **read, not enforced away**: the renderer checks that a code it is about
to write is legal with the row's status and, when it is not, drops the code and emits a notice
rather than writing an illegal row (§7.9). That is the mechanism behind FSPEC §7.3's "recorded
**when the pass's terminal status admits that code**" and behind ER-4's named loss — the code the
erratum would legalise is exactly the one this check drops today.

### 6.5 The "unavailable" literals, pinned (T-10)

The FSPEC fixes four observables and defers their spelling here. One literal serves all four, so a
reader learns it once:

```js
export const UNAVAILABLE = "(unavailable)";
```

| Site | Rendering |
|---|---|
| FSPEC §8.3's effectiveness row with no `artifact` | the path cell is `(unavailable)` — never blank, never a guessed path |
| FSPEC §10.3's `suppressed-by:` entry with a short `passId` | `{id}:{action} → pass:(unavailable)` — the `pass:` prefix is retained, so the carrier stays legible and `pass:undefined` is unproducible |
| FSPEC §8.1's §8.4 steps 2–3 harvest question with a missing half | the missing clause renders as `… on artifact (unavailable) …`, the question still asked |
| FSPEC §6.5's seam permitted-set widening | not a literal — a recorded TSPEC decision; §9.3 states the sets this layer inherits and the rule for changing one |

`(unavailable)` is deliberately parenthesised and lower-case: it can be neither a repository path
(no path in this repo is parenthesised), nor a `passId` (`{YYYY-MM-DD}-{n}`), nor a vocabularies §1
value, so no reader can mistake it for data. **It is never written into a failure-mode record** —
records are appended as written and never repaired (FSPEC §10.2); the literal is a *rendering* of a
missing field at the point of display, in the report body and in the terminal row only.

## 7. Algorithms

Each subsection names the exported function, its signature, its purity, and the FSPEC branch it
implements. Unless stated otherwise every function here is **pure, total and synchronous**.

### 7.1 The corpus and the two-region predicate (FSPEC §3.1, §3.2, §3.4)

```ts
enumerateCorpus(_git): Promise<{files: CorpusFile[]} | {unlistable: true, detail: string}>
parseCorpusListing(stdout: string): CorpusFile[]                          // pure, total
classifyCorpus(files: CorpusFile[], logText: string | null): Predicate     // pure
renderConsumedPair(passId: string, basenames: string[]): string           // pure
```

**Enumeration is one `_git` read, not a directory walk.** The seam a directory walk would need does
not exist. `rtListFiles` (`runtime-adapter.js:905`) transports `ls -p -A "${d}" | grep -v '/$'`
(`:915`) — `-p` appends `/` to directory names and the `grep -v` deletes every one of them — and its
reply validator then rejects any line carrying a separator at all (`:929-931`). So `_listFiles`
returns the regular *files* directly under a directory and can never return a subdirectory name, in
either direction; there is no other listing seam in the adapter (`rtDevInjections`, `:1086-1110`).
A design that walked `docs/*` would find zero feature subdirectories in production on every run,
while every unit test drove `fakeListFiles` (`__tests__/helpers/seams.js:132-166`), whose map form
returns whatever the spec supplies — a double more capable than the seam it doubles, which is the
DC-07 "production path ≠ unit path" failure exactly.

The pass therefore asks git. **Two reads, not one**, because REQ §3.1 step 1 decides corpus
membership by presence *on disk* and no single `ls-files` invocation expresses that:

```js
_git(["ls-files", "--cached", "--others", "--",
      ":(glob)docs/*/LEARNINGS-*.md", ":(glob)docs/completed/*/LEARNINGS-*.md"])
_git(["ls-files", "--deleted", "--",
      ":(glob)docs/*/LEARNINGS-*.md", ":(glob)docs/completed/*/LEARNINGS-*.md"])
```

`enumerateCorpus` returns the **first set minus the second**. Both reads carry the identical
pathspec pair, so the subtraction is over one namespace and cannot silently widen.

**Why the second read exists (REQ §3.1 step 1, second bullet).** REQ decides that *"an index entry
with no working-tree file is **not** corpus … the pass's enumeration is restricted to paths present
in the working tree"*. `--cached` is precisely what admits such a path: measured on a scratch
repository, a LEARNINGS committed and then deleted from the worktree is still returned by
`--cached --others`, and `ls-files --deleted` over the same pathspecs returns exactly that path and
nothing else. Subtracting the `--deleted` set is therefore the minimal mechanism that discharges the
obligation, and it keeps `--cached` — which is still needed, since a tracked-and-present LEARNINGS
appears under no other selector. This is an **obligation, not an accepted residue**: a staged-but-
deleted LEARNINGS must not reach the volume count and must not enter a consumed pair.

**Why `--exclude-standard` is absent (REQ §3.1 step 1, first bullet).** REQ decides that *"a
`.gitignore`d LEARNINGS file **is** corpus. Membership is presence on disk under the two globs, not
tracked-ness"*, and states the consequence by name: *"the pass's enumeration therefore does **not**
apply `--exclude-standard`."* The flag is dropped here accordingly. Measured on the same scratch
repository, dropping it admits an ignored `docs/{f}/LEARNINGS-{f}.md` and changes nothing else — in
particular `docs/discarded/` stays at zero hits, because that exclusion is performed by `:(glob)`
and never by the ignore rules (point 2 below). §10.4 records the argument that ran the other way and
why REQ's decision governs.

Four properties of the enumerating call, each verified against this repository at HEAD:

1. **It returns repository-root-relative paths**, one per line, which is what `CorpusFile.path`
   needs anyway — the walk would have had to reassemble them from a directory and a basename.
2. **`:(glob)` magic is load-bearing, not decoration.** Without it git's default wildmatch lets `*`
   cross a `/`, and `docs/*/LEARNINGS-*.md` then matches `docs/discarded/{feature}/LEARNINGS-*.md`
   (measured: two hits at HEAD, under `docs/discarded/pdlc-rcv-budget-stop/` and
   `docs/discarded/pdlc-review-convergence/`). With `:(glob)` the same pathspec matches exactly the
   one-level-deep set and those two hits are zero. Exclusion of `docs/discarded/` is therefore still
   by *not enumerating* — the pathspec cannot name it — and not by a filter a later edit can drop.
3. **`--cached --others`** is one set, not two calls: a LEARNINGS harvested but not yet committed is
   still corpus, and so — per REQ §3.1 step 1 — is an ignored one, which is why no
   `--exclude-standard` appears. Tracked-ness is not the membership test; presence on disk is, and
   the `--deleted` subtraction above is what makes "on disk" true rather than merely intended.
4. **Both calls are reads.** `ls-files` reads the index and the worktree and mutates nothing; §9.3
   records the pair as the `read-index` verb in the invoking-tree domain.

`parseCorpusListing` is the pure half: split on newline, drop empty lines, and map each path to
`{path, basename}` by its last `/`. `enumerateCorpus` **never opens a file**.

**The corpus is a set, and every oracle over it is a set oracle.** `ls-files` does not sort its
output and does not return it in pathspec order — measured on a scratch tree, `--cached --others`
returned the untracked path *ahead* of the tracked ones — so the order of `parseCorpusListing`'s
result is a fact about git, not about this feature, and **no assertion anywhere may depend on it**.
Concretely: a `toEqual` over a `CorpusFile[]` or a basename array must sort both sides or compare as
sets, membership conjuncts are the preferred form, and this binds the real-git L4 case in §11.1 most
of all, since it is the one place an unsorted listing actually reaches an assertion. An order-sensitive
oracle here would go intermittently red on a correct implementation. §11.4's determinism rows carry
the same rule for the generated cases.

**AT-P1's oracle is the argv, not the fixture.** AT-P1 (FSPEC §13.2 register, *The consumed predicate and the corpus*) is purely an enumeration
claim — a LEARNINGS under `docs/completed/{feature}/` is in corpus, one under
`docs/discarded/{feature}/` is not — and §12.3 runs it at **L1**, over the `_git` double. Run
naively that is an implementation echo: the `docs/discarded/` exclusion would be decided by whatever
lines the fixture author put in the double's scripted stdout, not by the pathspec, and it is the one
exclusion the REQ calls out by name (REQ §3.1 step 1, *"abandoned work is not evidence about a
delivered pipeline"*). So the row's oracle is stated here and is **two conjuncts, one of them positive**:

1. **Literal argv, both calls.** The two arrays `enumerateCorpus` hands `_git` are asserted
   element-by-element against the literals `["ls-files", "--cached", "--others", "--",
   ":(glob)docs/*/LEARNINGS-*.md", ":(glob)docs/completed/*/LEARNINGS-*.md"]` and
   `["ls-files", "--deleted", "--", ":(glob)docs/*/LEARNINGS-*.md",
   ":(glob)docs/completed/*/LEARNINGS-*.md"]`, **both `:(glob)` prefixes included in each**, because
   point 2 above makes the magic prefix the thing that performs the `docs/discarded/` exclusion. An
   edit that drops a prefix, adds a third pathspec, **re-introduces `--exclude-standard`**, or drops
   the `--deleted` call is red on this conjunct regardless of what any fixture contains. The last two
   arms are the ones that pin REQ §3.1 step 1's two decided classes: each is a one-token edit that
   would otherwise revert a decided requirement in silence.
2. **Positive membership over the parsed listing.** Given a scripted stdout carrying one
   `docs/completed/{f}/LEARNINGS-{f}.md` line, that basename is in the corpus — so the row is not
   an absence-only assertion about `docs/discarded/`.
3. **The subtraction is observed, not assumed.** Given a first-call stdout carrying two LEARNINGS
   paths and a second-call (`--deleted`) stdout carrying one of them, the corpus is exactly the
   other — and, in the same case, the surviving basename is asserted *present*, so the conjunct
   cannot be satisfied by an implementation that returns the empty set. This is the L1 oracle for
   REQ §3.1 step 1's second bullet; the class is unreachable from the L4 fixture harness, which is
   why §11.1's rule forbids a git-visibility fixture there.

The second conjunct is deliberately *not* "a `docs/discarded/` line is filtered out": nothing in the
module filters it, and a test asserting that would pin a filter that must never exist. The
`docs/discarded/` half of AT-P1 is discharged by conjunct 1 — the pathspec is the filter, and the
pathspec is what the test reads.

`{ok: false}` from the seam is **not** an empty corpus. `enumerateCorpus` returns
`{unlistable: true, detail: stderr}`, and `main` dispositions it through §10.2's **`failNoReason`**
— terminal status `failed`, **no** reason code, the pathspec and `stderr` pushed onto §8.4's
`dispatchLog` for the report body. No new reason code is minted for it: vocabularies §1 at
`Version` 1.4 has no row for a corpus read failure, and inventing one here would breach REQ §4b and
this document's own §1.3 altitude check. `{unlistable: true}` is an in-module control value, never a
rendered one — it appears in no log row, no artifact and no §6.4 catalogue.

This is the same fail-safe direction §7.7 takes for `ESCALATIONS.md` ("never as empty: the two codes
make different claims"), applied to the corpus rather than contradicted one section earlier: an
unlistable corpus must never terminate `no-op`, which would be indistinguishable from a genuinely
empty one and would advance the cadence datum on a pass that read nothing. §10.3 row 1a carries it.

`classifyCorpus` is the predicate. Its algorithm, in order:

1. `boundary = logText.indexOf("<!-- pdlc:consumed")`. `-1` (or `logText == null`) ⇒ the legacy
   region is the whole text and the block region is empty.
2. **Legacy region** = `logText.slice(0, boundary)`; membership is bare substring containment — the
   shipped test (the `pending` comprehension in `nudge-consolidation.sh`) applied to a bounded slice.
3. **Block region** = the concatenation of every span from an opening `<!-- pdlc:consumed {id} -->`
   to the next `<!-- /pdlc:consumed -->`, or to end-of-text when no closer follows (the truncated
   append of E-04); membership is per-line equality against a trimmed line.
4. A closer with no opener contributes nothing and moves no boundary (E-05) — it is simply never
   reached, because a span is opened only by an opener.
5. `unconsolidated` = enumerated basenames in neither region, de-duplicated as a **set of
   basenames**; `basenameCollisions` records every group of ≥2 distinct paths sharing a basename
   (E-09), reported by §7.9 and never repaired.

**An enumerated file whose body cannot be read, decided.** The trigger for this class is a file that
is **present in the working tree and enumerated, but whose body `_readFile` returns `null` for** —
AT-P8's IO-error case, reachable on file permissions, a mid-pass unlink, or an IO error between the
enumeration and the read. It is *not* the staged-but-deleted entry: since the `--deleted`
subtraction above, such a path is never enumerated at all, so it can never reach this branch. Its
three observables are fixed — the first by this layer, the second and third **upstream, and
absorbed here**:

1. **It counts toward `|un-consolidated|` for the AC-1.2 volume test.** The test is over the
   *enumeration*, and AC-1.1 forbids reading any LEARNINGS body at tick time, so the count cannot
   depend on readability without violating the tick contract. REQ §4b decides the same thing in its
   own words — such a basename *"stays in the un-consolidated set and so still counts toward
   AC-1.2's volume trigger"*.
2. **It is *omitted* from the consumed pair, stays un-consolidated, and the next pass retries it.**
   This is REQ
   §4b's decision (*"An enumerated basename whose body cannot be read is instead **not consumed** —
   it is omitted from the `<!-- pdlc:consumed {passId} -->` pair"*), and this document **absorbs**
   it rather than re-deciding it. An earlier revision of this section decided the opposite arm — the
   entry *in* the pair — on a convergence argument: excluding it would leave the file
   un-consolidated, tripping the threshold on every subsequent pass, the "nudged forever, never
   clearable" shape §10.4 treats as the worst outcome. **REQ answered that argument rather than
   overlooking it**, and the answer is the reason inclusion is wrong: an entry marked consumed while
   contributing no evidence can only ever push a verdict toward `prevented` or
   `insufficient-evidence` and never toward `recurred`, which corrupts REQ-CONS-05's falsifiability
   loop in one direction. Convergence bought at the price of a one-directional bias in the
   effectiveness loop is not a trade this layer may make. The retry is bounded by the population, not
   by a counter: since the `--deleted` subtraction, what remains here is a permissions error or a
   mid-pass unlink — an operator-visible fault the report body names on every pass until the operator
   clears it at the source. §10.4 records the retried entry as accepted residue, and §13.3 carries the
   observation that would falsify the "transient" premise.
3. **Its basename is named in the report body** as an entry the pass could not read. Since the pair
   omits it and no reason code is minted, this naming is the pass's only positive disclosure of the
   fault, and it is re-emitted on every pass until the operator clears it at the source. It is stated
   as its own observable rather than as a sub-clause of (2) because §12.2 binds it as its own
   conjunct against a readable control.

**A corpus in which *every* enumerated body is unreadable terminates `no-op`** — AC-1.4's third cause
(REQ §4b, `REQ-pdlc-consolidation-agent.md:625-631`), reached by applying the omission of (2) to every
member: the consumed set is empty, so no status and no reason code is added. §10.3 row 1b routes it,
and it is not §10.3 row 1a's unlistable corpus, which terminates `failed`: there the *enumeration*
failed and the corpus's size is unknown; here the enumeration succeeded, its members are known, and
only their bodies are unreadable.

No reason code is minted for it (REQ §4b; vocabularies §1 at `Version` 1.4 has no row), so the
evidence is the report body's named list and nothing else. This is distinct from `{unlistable: true}`
above, which is the *enumeration* failing and terminates `failed`; here the enumeration succeeded and
one member of it is unreadable.

**The `unread:` field question is answered upstream, and absorbed here.** An earlier revision of this
section raised it: if such an entry were marked consumed while contributing zero evidence, the only
trace would be one pass's transient report body — so should the durable log row carry the unreadable
basenames (an `unread:` field beside `consumed`)? REQ §4b answers **no**, and answers it by removing
the premise rather than by declining the field: the entry is not consumed at all, so there is nothing
for a field to disclose that the un-consolidated set does not already carry (*"Omission needs no new
field, no new reason code and no vocabulary row, and it is not silent: the basename remains in the
un-consolidated set that both the hook and the next tick compute"*). This layer would in any case have
been the wrong place to decide it — the log record's field set is a
`pdlc-consolidation-vocabularies.md` §3 contract, and minting a field here is the same REQ §4b breach
as minting a reason code — so §13.3 records the question as **answered upstream and absorbed**, not as
answered here, and keeps only the observation that would reopen it upstream.

These obligations are not left to inspection either: §12.2 carries a `(no FSPEC AT)` row for
them and §12.3 assigns it a file.

The two membership tests differ deliberately — substring in the legacy region, per-line in the block
— and that asymmetry is the point: a block must name **exactly** the consumed set (NFR-5), while the
legacy region must reproduce the shipped predicate over prose that names full paths.

**T-08 decided: two implementations, whose predicates are held equal by a differential test.** The pass is JavaScript in
a bundle that cannot import; the hook is a Python heredoc inside bash that no JS test can import
(the `PY` heredoc in `nudge-consolidation.sh`). Extracting a shared implementation would need a third
artifact and a language boundary neither side has today. The two are therefore written separately to
one stated algorithm and pinned by AT-P7's differential harness (see 11.3(f)), which runs both over
one fixture table and asserts set equality (§11.3). The hook's edit was minimal and mechanical, and
**has landed at HEAD** — it is described here in the past tense and located by symbol, never by line
index, per §12.3: the single `os.path.join` glob became the two-literal `CORPUS_GLOBS` tuple and the
comprehension over it given below, and the membership comprehension (now bound to `pending`) tests
against the two regions computed by the `region_split` helper rather than against `logtext` whole.

**Both enumerations are pinned literally, so a divergence larger than §10.4's one remaining class reds.**
AT-P7 feeds both sides one basename list and therefore holds the *predicate* half only (§11.3(f)).
That leaves the enumeration pair with no equality oracle — but it does not leave it unguarded, and
the guard is not "inspection". Two literal pins, **at two different levels and in two different
files**, because the two sides are observable by different means and pretending otherwise would
weaken the stronger of them:

| Pin | What it asserts | Level | File |
|---|---|---|---|
| (a) **JS side** | the argv `enumerateCorpus` **hands `_git`**, element-by-element, per AT-P1's conjunct 1 above | **L1**, over the `_git` double | `consolidationPredicate.test.js` (§12.3, where AT-P1 lives) |
| (b) **hook side** | the tracked `pdlc/hooks/scripts/nudge-consolidation.sh` declares **exactly two** corpus glob patterns and no third | **L3**, a source-text read | `consolidationHookParity.test.js` (the file that owns the two implementations' relationship) |

An earlier draft of this paragraph placed **both** in `consolidationHookParity.test.js` as L3
source-text reads. That was wrong and is withdrawn on both axes. On **level**: a source-text grep of
the JS module's own text cannot see a call site that builds a different array at runtime, where an
assertion on the array actually handed `_git` can — and this pair is the compensating falsifier a
REQ relaxation is being conceded against, so the weaker reading is not the one to ship. On **file**:
§12.3's table is the input to the PLAN's file-ownership manifest (batch-safety rule 2), so which file
owns an assertion is a PLAN-level fact, not prose. §11.1's level table, §12.2's T-08 row and §12.3's
file table all state the split above; this paragraph now agrees with them.

**Pin (b) needs a form the shipped script did not have, so this feature's edit gives it one.** Before
this feature the enumeration read `learnings = glob.glob(os.path.join(proj, "docs", "*",
"LEARNINGS-*.md"))` — the pattern existed only as three `os.path.join` components, neither literal
`docs/*/LEARNINGS-*.md` nor `docs/completed/*/LEARNINGS-*.md` occurred anywhere in the file, and a pin
written over a line index would anyway have been invalidated by this feature's own edits to the same
heredoc (a second glob, the relocated early exit, the `PDLC_PENDING:` line all shift it). The edit has
since landed: `CORPUS_GLOBS` and its comprehension are at HEAD, located by name. Both problems are closed by one edit: the two
patterns become **single string literals in one named module-level tuple**, and the enumeration
ranges over that tuple:

```python
CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")
learnings = [p for g in CORPUS_GLOBS for p in glob.glob(os.path.join(proj, *g.split("/")))]
```

The `*g.split("/")` keeps the shipped `os.path.join` portability (the separator is still the
platform's, never a hardcoded `/`) while making the pattern itself readable as one literal. Pin (b)
is then stated over the **declaration, never a line number**: locate the `CORPUS_GLOBS = (…)`
assignment by name, extract its string literals, and assert the set is **exactly**
`{"docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md"}` — plus one conjunct that
`glob.glob(` occurs in the file exactly once and inside the comprehension over `CORPUS_GLOBS`, so a
third pattern cannot be added through a second call site the set assertion would not see. "Exactly
two, no third" is the falsifier and it is unchanged; only the anchor and the literal form move.

Together they make the divergence set *derivable and closed*: the two enumerations differ only where
`git ls-files --cached --others` minus `--deleted`, over those two `:(glob)` pathspecs, differs from
`glob.glob` over the same two patterns in `CORPUS_GLOBS`. Since §7.1 absorbed REQ §3.1 step 1, the
two classes this document previously accepted are **closed** — an ignored LEARNINGS is now in both
sets, a staged-but-deleted one in neither — and what remains is the single class §10.4 names
(a LEARNINGS inside a nested git repository). An implementation that widens either side —
a third pathspec, a dropped flag, a third `CORPUS_GLOBS` member, a `**` in one of them — is red on a
pin rather than silently admitting a third divergence class. That is the compensating falsifier for the half AT-P7 cannot reach; §12.2's T-08
row and §13.1 row 6 carry it. Whether "one enumeration" may be held by pins rather than by an
equality was a REQ/FSPEC decision rather than this layer's, and it has been made: REQ §3.1 step 1
**withdrew** the "one enumeration" half and FSPEC v11.6 re-scoped AT-P7 to the predicate alone, which
is exactly the shape pinned here. §13.3 records that round trip as closed.

**A third hook edit exists, and it is what makes AT-P7 an oracle at all.** The shipped hook cannot
emit a set: it prints one JSON object whose `additionalContext` is prose carrying a **count** (the
`msg` / `json.dumps` block), and it prints it only when `n >= THRESHOLD` with `THRESHOLD = 5`; below
five it prints nothing and exits 0. Every fixture that discriminates the two-region
predicate — the truncated block (E-04), the stray closer (E-05), the basename collision (E-09), the
legacy/block boundary — has fewer than five pending files, so an oracle reading that message is
blind on all of them, and a count-above-five comparison would pass unchanged if the hook's
two-region logic were deleted outright. The hook therefore gained, immediately after `pending` is
computed and before the threshold test, the block that stands at HEAD:

```python
if os.environ.get("PDLC_CONSOLIDATION_DEBUG") == "1":
    names = sorted(set(os.path.basename(p) for p in pending))
    sys.stderr.write("PDLC_PENDING:" + ",".join(names) + "\n")
```

Three constraints on it, each falsified rather than promised: it writes to **stderr**, so the
SessionStart stdout contract (a JSON object, or nothing) is byte-unchanged; it is **env-gated off**,
so an ordinary session sees nothing; and it fires **regardless of `THRESHOLD`**, which is the whole
point. The channel is itself tested — an AT runs the hook with the variable unset over a
five-file corpus and asserts that neither stream carries `PDLC_PENDING:`, and a second runs it with
the variable set over a one-file corpus and asserts the line is present — because a debug channel
nobody falsifies is the one that quietly starts emitting the operator's file list. Without this
line T-08's "held equal by a differential test" is not true, and the decision would have to be
re-argued on evidence a count-above-threshold oracle can actually supply; §13.1 row 6 records that
dependency.

**Placement: after `pending` is computed, and the early exit had to go.** The hook previously returned
early (`if not learnings: sys.exit(0)`) before `pending` existed, so a zero-corpus fixture would emit
no line at all and the harness would have to read `∅` from **silence** — an absence-only reading of
the one channel the whole differential rests on, indistinguishable from "the hook did not run". The
edit therefore replaced that early exit with a fall-through, so `pending` is always computed and the
debug line is reached on every path; the `n >= THRESHOLD` test (already false for `n == 0`) carries
the no-output behaviour unchanged. At HEAD there is no early exit between the corpus glob and
`pending`, which is the state this describes. That keeps the shipped stdout contract byte-identical on
a zero corpus while making `PDLC_PENDING:` (with an empty value) a **positive** observation of `∅`.
§11.3(f)'s fixture table gains a zero-corpus row to exercise it.

**How the PLAN must route this edit: production code, not test scaffolding.** It ships in
`pdlc/hooks/scripts/nudge-consolidation.sh`, a consumer runs it on every `SessionStart`, and
`bash -n` in CI's `Shell scripts parse` job covers it — so it belongs to the hook's owning
implementation task alongside the `CORPUS_GLOBS` glob and `region_split`/`pending` predicate edits
(one file, one task, per batch-safety rule 2), never to a test-helper task. Since all four edits are
already at HEAD (§10.4), that task's remaining work is ownership of the file, not authorship of the
edit — §3.2's row states it in those terms. The release note names it as a new,
default-off debug channel, alongside §8.3's drift-gate notice.

**One side effect of the relocated exit, named deliberately.** Removing the early exit means a
zero-corpus session now reaches the `.consolidation-log.md` read (the `os.path.isfile(log)` guard and
its `try`), where the hook previously exited first. That is a new read on a `SessionStart` path in
every repository that ships this plugin. It is safe — the read is already
guarded by `os.path.isfile` and wrapped in a `try` with `errors="ignore"` — and it is deliberate,
because the debug line must be reached on every path for `∅` to be observable. It is **in scope for
the release note**, which names both halves of this edit rather than only the visible one: a new
default-off `PDLC_PENDING:` stderr channel, and one additional guarded read of
`docs/_decisions/.consolidation-log.md` on zero-corpus sessions. Stdout is byte-unchanged either way
(the `n >= THRESHOLD` test is already false for `n == 0`).

### 7.2 Trigger, datum and `passId` (FSPEC §2.3, §2.5)

```ts
cadenceDatum(logRows: LogRow[]): number | null                    // pure
triggerFor({unconsolidated, datum, now, config, direct}): Trigger | "skipped-cadence"   // pure
mintPassId(logText: string | null, today: string): string         // pure
```

`cadenceDatum` scans **parsed rows**, not raw text, and returns the `date` of the most recent row
whose `status` is in `{promoted, promoted-degraded, no-op, failed}` — "most recent" by the row's own
`date`, not by file position (AT-C5's Given puts a later `refused` row last). `null` is the empty
datum set, which `triggerFor` counts as elapsed.

`triggerFor` evaluates volume, then cadence, then `skipped-cadence`, and returns `manual`
unconditionally when `direct` is set. `now` comes from `_now()` — no function here reads a clock.

`mintPassId` scans every row's `pass:` field for the literal `{today}-` prefix, parses the suffix as
a decimal integer, and returns `{today}-{1+max}`, or `{today}-1` when none parses. A row whose
`pass:` field is absent or unparseable contributes no candidate and never aborts the scan (E-10).
`today` is derived from `_now()` in the invoking environment's local calendar and passed in, so the
function stays pure and property-testable over an arbitrary multiset of rows (T-09 row 2).

### 7.3 The marker (FSPEC §4.1, §4.2)

```ts
parseMarker(text: string | null): {state: "in-progress" | "released",
                                   passId: string, at: number} | null            // pure
markerVerdict(parsed, present, nowMs, staleLockMinutes): "free"|"refuse"|"reclaim"  // pure
takeMarker(state, seams): Promise<…>                                             // impure
releaseMarker(state, seams): Promise<void>                                       // impure — step 16
```

`parseMarker` accepts exactly **two** one-line forms and nothing else: `IN-PROGRESS: {passId}
{ISO-8601}` ⇒ `{state: "in-progress", …}`, and `RELEASED: {passId} {ISO-8601}` ⇒
`{state: "released", …}` — the released form FSPEC §4.1 decides (**BR-14a**) and FSPEC §4.2 gives its
own outcome row (**E-11b**). Anything else — empty, truncated, multi-line, a third verb, an
unparseable timestamp — yields `null`.

**Surrounding whitespace is tolerated; interior structure is not.** `parseMarker` applies `.trim()`
to the whole text before matching, so a leading or trailing newline — which an ordinary `_writeFile`
of a one-line file leaves behind — parses exactly as the bare line does. What "exactly two one-line
forms and nothing else" excludes is *interior* structure: a second non-empty line, an embedded
newline, or padding **within** the line (between the verb, the `passId` and the instant, where the
separator is a single space). This has to be decided here rather than left to the implementer,
because §11.4's property generator draws "leading/trailing junk" as a near-miss expected to yield
`null`: without this sentence an implementer who trims and a generator author who counts whitespace
as junk produce a property that reds on conforming code. Whitespace is **not** junk; it is the
adjacent boundary the `file_empty` probe already treats the same way (the double's
`String(...).trim() === ""`, `__tests__/helpers/seams.js:298`), so trimming here keeps the two
boundaries consistent rather than introducing a third convention.

`markerVerdict` maps a **released** marker to `free` **without consulting its age**: staleness is a
property of a *held* marker and a released one is not held, so neither the refusal arm nor the
reclamation arm may fire and **no reason code is written**, at either side of `staleLockMinutes`
(E-11b; AT-M11 is its oracle, and its two fixtures — one seconds old, one older than
`staleLockMinutes` — are exactly the pair that catches an implementation routing every
non-`IN-PROGRESS:` file through the stale-lock arm). It maps a **present but unparseable** marker to
`reclaim`, never to `refuse`: an unparseable marker carries no timestamp, so it can never age out,
and refusing on it would wedge the cadence permanently. The `present` flag is what separates that
case from an absent file (`free`), so the two `null`s are never conflated.

**What release does, and where `present` comes from — both decided, because the two answers must
agree or a steady-state pass either reclaims a lock nobody holds or steps silently over a pass that
died inside its own take.** There is no removal verb anywhere
in reach: §5.1's protocol declares none, and the adapter ships `rtWriteFile` (`runtime-adapter.js:802`),
`rtAppendFile` (`:863`), `rtListFiles` (`:905`), `rtGit` (`:945`) and no unlink of any kind; `git rm`
is outside §9.3's invoking-tree verb set and would not apply anyway, since the marker is untracked
and `.gitignore`d by §3.3. AC-1.3 also settles the shape upstream — taking and releasing it "are
in-place rewrites of a whole small file" (REQ AC-1.3) — and **FSPEC §4.1's BR-14a settles the
payload**: the marker "is released by an **in-place write** of `RELEASED: {passId} {ISO-8601}` —
never by removing the file, which no seam can do". So:

1. **`releaseMarker` is `await _writeFile(markerPath, "RELEASED: {passId} {ISO-8601}")`** — one seam
   call, no git call, carrying this pass's own `passId` and the instant of the release, leaving the
   file **present and parseable** on disk. It is the only write step 16 makes; §10.1's comment naming
   a `_git` alternative was wrong and is corrected there. The released form is a **sentinel line, not
   an empty file**, and BR-14a states why in the FSPEC's own words: truncating would make a released
   marker and a marker whose write died mid-flush the same observed state, collapsing the two
   outcomes §4.2 keeps apart as E-11b (released ⇒ free, no reason code) and E-11 (truncated ⇒
   reclaimed, `reclaimed-stale-lock`, abandoned id `unknown`).
2. **`present` is true unless the presence probe reports the file *missing*.** `rtCheckFile`
   (`runtime-adapter.js:817-831`) returns `{ok:true}` for a file that exists and is non-empty, and
   `{ok:false, reason:"file_empty"}` / `{ok:false, reason:"file_missing"}` otherwise; this layer reads
   **`file_missing` alone as absent**, and treats `{ok:true}` and `file_empty` alike as **present**.
   That is the discrimination the sentinel release makes necessary and possible: under it a zero-byte
   marker is no longer the normal end state of a pass but a **truncated** one, so it must reach
   `markerVerdict`'s `reclaim` arm and record `reclaimed-stale-lock` (E-11), which it can do only with
   `present` true. `takeMarker` therefore probes with `_checkFile` for `present` and reads with
   `_readFile` for the content `parseMarker` consumes; `present` is never derived from
   `_readFile(...) !== null`, whose single `null` conflates *missing* with *unreadable* and so cannot
   name the one reason that decides this arm. `_checkFile` is in §5.1's protocol for this reason and
   is doubled by `fakeFs` already (§11.2).

The two decisions are one decision read from both ends: release leaves a parseable `RELEASED:` line,
and the presence probe calls absent only what is not there at all — so *released*, *truncated* and
*absent* are three distinguishable states with three FSPEC-decided outcomes (E-11b, E-11, §4.2 row 1)
rather than two states sharing one observation. The observable a test can hold is the **write
double's last recorded contents for the marker path** — the `IN-PROGRESS:` line during the pass, the
`RELEASED: {passId} {ISO-8601}` line after it — which is how §10.1 restates T-13's conjunct (ii).

**What this cost upstream, and how it was settled — the record is kept because the reasoning is
still load-bearing, not because the question is still open.** An earlier revision of this section
decided release as an in-place write of `""` and treated `file_empty` as absent, and priced the
consequence honestly: FSPEC §4.2's `empty (truncated write)` arm, E-11 and AT-M3's truncated *Given*
became unreachable, because an empty file was then precisely what a *successful release* left on
disk, so *released* and *truncated mid-take* were the same observed state and no probe could separate
them. That narrowing was **raised upstream as an erratum against FSPEC §4.1/§4.2** rather than
absorbed, carrying the product question that decides it — *when a pass dies mid-take, must the
durable log witness it?*

**FSPEC v11.3 answered, and this layer adopts the answer rather than re-routing the question.**
`BR-14a` decides the release form (an in-place write of `RELEASED: {passId} {ISO-8601}`, never a
removal); `E-11b` decides that a `RELEASED:` marker is taken like an absent one at any age with no
reason code; and `E-11` now reads "Reachable **because** §4.1 releases by writing a `RELEASED:`
sentinel and never by truncating" — the empty arm is reachable again, and §4.2 answers the product
question in terms: the durable log **must** witness a pass that died inside its own take, so the
reclaiming pass records `reclaimed-stale-lock` with the abandoned id `unknown`. Nothing in the
approved argument above is contradicted by that: **§7.3's premise is "no seam can unlink", and an
in-place write of a non-empty sentinel needs no unlink either** — it satisfies the same premise with
a different payload. What stops being load-bearing is the `file_empty ≡ absent` equivalence, which
existed only to keep a released marker from reading as present-and-unparseable; with the sentinel
there is nothing empty to mistake, so decision 2 above reads `file_missing` alone as absent and the
FSPEC's three outcomes land on three distinguishable observations. **No erratum is raised here**:
the upstream has decided, so the correct action is to absorb.

Two consequences worth stating once, because they will be asked again at DoD. (1) `parseMarker`
still returns `null` for empty text, and on an empty *file* that `null` **is** now the deciding
input: `present` is true, so `markerVerdict` reaches `reclaim` and the pass records
`reclaimed-stale-lock` with the abandoned id `unknown` — E-11 exactly, and AT-M3's fixture (a). The
two `null`s are still never conflated, because the absent file never reaches `parseMarker`'s result
at all: its `free` arm is decided on the presence flag. (2) **The marker file is permanent but never
empty in the steady state**, one per consuming repo, carrying the last pass's `RELEASED:` line from
the first pass onward. §3.3 `.gitignore`s it, so it never reaches a diff, a PR or a fresh-clone
bootstrap check; the only surface on which it appears is a literal `ls docs/_decisions/`, where a
`RELEASED:`-carrying `.consolidation-lock` means *free*, not *stuck*. An operator deleting the file by
hand produces `file_missing`, which §7.3 treats as absent and which takes exactly as a released marker
does (FSPEC §4.1: "an absent file and a `RELEASED:` file are the same free state to §4.2") — so the
manual channel and the pass channel agree, and neither can wedge the cadence. A zero-byte file on that
same listing is the one state that is *not* routine: it means a pass died mid-write, and the next pass
says so in the log.

Take is `_checkFile`, then `_readFile`, then `_writeFile` — **observe-then-write, not atomic** — three seam calls on the
take path, not two, and §10.4 item 1's race window is the span across all three. The
probe is a third call, not a substitute for the read: `_checkFile` produces `present` and `_readFile`
produces the text `parseMarker` consumes, and decision 2 above forbids deriving either from the
other. FSPEC §4.5 / O-C3 prices
this race and asks whether the runtime offers an atomic create-exclusive primitive. **It does
not**: `_writeFile` is `rtWriteFile` (`runtime-adapter.js:802`), an agent-transported whole-file
write with no exclusive-create mode, and no adapter seam exposes one. This TSPEC takes the
observe-then-write form and **records the decision** rather than inventing a lock: an
exclusive-create seam would be a new agent transport whose observation (whether the file already
existed) is exactly as racy as the read it replaces. §13 carries it.

**Take is check, read, write, then read back.** `rtWriteFile` (`runtime-adapter.js:802-811`) awaits an agent
dispatch, inspects no reply and returns `undefined`; the adapter's own comment at `:798-801` says
the cache entry is deliberately not repopulated from `contents` because "an agent-mediated write is
a request, not proof of the bytes on disk — the next read re-verifies against a probe, which is the
only evidence this adapter trusts". A take with no read-back therefore lets the pass proceed through
all sixteen steps believing it holds a lock it does not hold, which is precisely the guarantee
AC-1.3 rests on. `takeMarker` closes it with the re-read the adapter's comment names:

```
check → read → verdict → write → read back → parseMarker
      → confirm parsed.state === "in-progress" && parsed.passId === state.passId
```

**That order is the spec of record, and it is testable text rather than prose.** `verdict` is
`markerVerdict(parsed, present, …)`, so `present` must already exist when it runs — which is why
`check` is first and why an earlier draft's `read → verdict → …` line was wrong: transcribed
literally it forces the `_readFile(...) !== null` derivation decision 2 forbids, which cannot name the
one probe reason — `file_missing` — that decides the absent arm, and so cannot tell a file that is not
there from one that could not be read. It is withdrawn by name here rather than silently rewritten.
`fakeFs` accumulates an ordered `calls` array whose intended use its own header advertises
(`__tests__/helpers/seams.js:241` — `expect(fs.calls.map((c) => c.op)).toEqual([…])`), so a
call-order oracle over `takeMarker` is a natural L2 assertion, and the expected prefix it holds is
`["check", "read", "write", "read"]` — one expected value, not two. Stated to remove the
ambiguity, not to mint a case: no §12.2 row obliges a call-order assertion, and none is added
under the freeze. It stays **authoring guidance only**, and deliberately so now that the register
itself carries the discriminator: AT-M3's fixture (a) and AT-M11 falsify a wrong verdict by
*behaviour* — an **empty** marker resolves `reclaim` and records `reclaimed-stale-lock`, paired
against AT-M11's **`RELEASED:`** fixtures, which resolve `free` and record nothing at either age —
which is the stronger oracle, since it fails on any
implementation that reaches the wrong verdict however it ordered its calls. A later editor who
wants the call-order case should know it would add nothing this suite has not already got.

A read-back that returns `null`, an unparseable marker, a `RELEASED:` line, or **another pass's**
`passId` is a failed take. The pass terminates `refused` with `consolidation-in-progress` (the same disposition as an
observed fresh marker — from the pass's own vantage the lock is not its own either way), records no
consumed pair, and commits nothing, per §4.4. §10.3 row 5a carries it. The read-back costs one seam
call on the one path where a wrong answer is unrecoverable, and it is a *positive* post-condition —
the AT asserts the terminal status **and** the marker file's content on disk, never "no second pass
ran".

The read-back does **not** close the race of §10.4 item 1: two passes can both read free, both
write, and the later writer's read-back succeeds while the earlier writer's fails. That asymmetry is
an improvement (one of the two now knows), not a lock, and §10.4 states the residue unchanged.

### 7.4 The id, proposals, and the intra-pass merge (FSPEC §8.1, §8.2, §5.2)

```ts
failureModeId(phase: Phase, artifact: string): string          // pure, total
targetFor(kind: 1|2|3, artifact: string, id: string): string   // pure
mergeProposals(proposals: Proposal[]): Proposal[]              // pure
parseLogRecords(logText: string|null): {records, notices}      // pure, total
```

**The derivation**, from FSPEC §8.1, as three ordered substitutions:

```js
const slug = artifact.replace(/[/.]/g, "-").toLowerCase()
                     .replace(/[^a-z0-9-]+/g, "-")
                     .replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
return `${phase.toLowerCase()}-${slug}`;
```

Order is fixed here because two orders disagree: collapsing runs **after** the separator
substitution is what makes `pdlc/skills/a-b.md`, `pdlc/skills/a/b.md` and `pdlc/skills/a.b.md` one
id — the collision FSPEC §8.1 prices and AT-R6b fixture 2 asserts. Collapsing first would leave
three ids and silently falsify that fixture.

`targetFor`: kind 1 ⇒ `docs/_constraints/DOMAIN-CONSTRAINTS.md`; kind 2 ⇒
`docs/_decisions/DECISIONS-{id}.md`; kind 3 ⇒ the subject `artifact` itself. The id is passed in
rather than recomputed, so kind 2's target can never be derived from a differently-normalised path
than the one that keyed it.

`mergeProposals` groups by `(failureModeId, action)` — never by kind, never by target — and folds
each group of ≥2 into one:

| Folded field | Rule | FSPEC |
|---|---|---|
| `kind` | the **numerically lowest** in the group (1 outranks 2 outranks 3) | §8.2 precedence |
| `artifact` | the **lexicographically first** candidate, byte order over the canonical paths **as written** | §8.2 tie-break |
| `target` | `targetFor(foldedKind, foldedArtifact, id)` — so `target` follows `artifact` exactly when the folded kind is 3 | §8.2's third note |
| `symptom` | the group's symptoms joined into **one line** with `; ` | §8.2 consequence 1 |
| `elidedKinds` | every distinct kind in the group other than the folded one | §10.4 item 4 |
| `elidedArtifacts` | every candidate path other than the survivor, in byte order | §10.4 item 4, subject axis |

Two properties fall out and are asserted rather than assumed: the fold emits **no** suppression and
**no** reason code (nothing was withheld — AT-R6b's negative half), and it is a pure function of the
group, never of proposal order (byte order is total over distinct strings, and a group's members are
distinct by construction, identical proposals being already one).

`parseLogRecords` is the receive side. It reads each failure-mode record block into a **partial**
record and, for each field the block does not carry, appends one
`ParseNotice{subject, missingField}`. It never fills a default, never rewrites the log, and never
throws. **Which contract skips a partial record is not this function's business** — it hands every
record and every notice to the readers, and each reader applies its own arm (§7.5, §7.6). That is
FSPEC §8.1's "per field, per reader" rule made structural rather than conventional.

### 7.5 Effectiveness, streaks, remediation, the open list (FSPEC §8.3 – §8.7)

```ts
phasesExercised(learningsText: string): Set<Phase>                          // pure
effectivenessTable(records, consumedTexts, config): EffectivenessRow[]      // pure
openPromotionList(records): string[]                                        // pure
remediationChoice(id, records, prStates, headExists): "revision"|"retirement"|null  // pure
```

`phasesExercised` prefers the LEARNINGS' own `Phases exercised` metadata row when present;
otherwise it applies vocabularies §2's mapping to that file's `Harvested from` row, **per file**: a
`CROSS-REVIEW-{role}-{docType}-v{N}` basename decides that docType's phase, `CODE_REVIEW-*` decides
`DOD`, and `POSTMORTEM-{phase}-*` decides that `{phase}` verbatim and takes precedence. Any phase
the mapping cannot decide counts as **not exercised** — the direction that routes to
`insufficient-evidence` and never to a guessed `prevented`.

`effectivenessTable` emits **one row per distinct id in `records`**, in first-seen order, evaluating
the three arms in FSPEC order. Two receive-side arms are structural rather than conditional: a
record with no `failureModeId` contributes **no** row (a row cannot be keyed on an absent id), and a
record with no `phase` contributes a row whose verdict falls to `insufficient-evidence`. Streak
state (`ineffective`, `unmeasurable`) is computed by folding the log's rows **in file order**,
counting only the populations FSPEC §8.5 and §8.7 name — which differ, and are therefore two
separate folds over one row sequence rather than one fold with a flag.

`openPromotionList` returns the ids for which **no** record carries `action: "retire"` with a
`route` other than `"degraded"`. A record short of `action` or `route` cannot close an id (it stays
open); a record short of `failureModeId` contributes **no member at all**. The list's length is what
§7.9's report item 10 prints.

`remediationChoice` evaluates FSPEC §8.5's four rows top-down. It returns `null` on row 1 (the
ladder has ended — the caller records `duplicate-suppressed` and reports the field as `retirement`)
and on the short-`artifact` arm (the file-existence test cannot run, so nothing is proposed).
Row 3's `headExists` is supplied by the caller from one
`_git(["cat-file", "-e", "HEAD:" + artifact])` probe — a **read**, resolving to the `read-object`
verb §9.3 adds to the invoking-tree domain as a recorded widening, never a checkout and never a
filesystem stat the runtime cannot perform.

### 7.6 Routing and suppression (FSPEC §5.1, §6.4)

```ts
routeOf(target: string): RouteDecision                                // pure
routeProposal(proposal: Proposal): RouteDecision                      // pure — the ONLY caller of routeOf
enactedByLog(pair, records): {enacted: boolean, passId: string|null}  // pure
enactedByPr(pair, prStates): {enacted: boolean, url: string|null}     // pure

// The RANGE of both routing functions. Four members, exactly — this is the type a
// set-equality oracle asserts against. "degraded" is NOT in it: no conforming
// implementation of either function can return it (see below).
type RouteDecision = "PR" | "constraints" | "decisions" | "proposal-file";

// The RECORD field's domain, which is a different set: Route (§6.1) is the
// four-member vocabulary value written to FailureModeRecord.route, and "degraded"
// is one of its members. RouteDecision and Route overlap in three members and are
// neither a subset nor a superset of one another.
// Route = "constraints" | "decisions" | "PR" | "degraded"      (§6.1)
```

**Routing reads the action, not only the target — and the function that does so is named.** FSPEC
§8.6 makes a retirement or revision follow the same propose-only path as a promotion, "route decided
by the promotion's own `target` (§8.1), exactly as §5.1 decides any target", with one arm that is
*not* an application:

| Where the promotion landed | `action: promote` | `action: revise` / `retire` |
|---|---|---|
| a `MERGE_GUARD_DEFAULTS` path | PR | **PR**, in its own commit under that action (AC-3.3) |
| `DOMAIN-CONSTRAINTS.md` / `DECISIONS-{topic}.md` | append | **proposal file, never applied** (AC-5.4, FSPEC §8.6 row 2) |
| any other consuming-repo path | proposal file only | proposal file only (FSPEC §5.1 row 4) |

`routeProposal` is that table, and it is the **only** caller of `routeOf`:

```js
export function routeProposal(p) {
  const r = routeOf(p.target);                       // "PR" | "constraints" | "decisions" | "proposal-file"
  if (r === "PR") return "PR";                       // guard-set: every action goes through the PR
  if (p.action === "promote") return r;              // append, or the proposal file
  return "proposal-file";                            // AC-5.4: never applied by the pass
}
```

Making it a stated function rather than an implication is the point of the finding it answers: with
`routeOf` alone in the call graph, an implementer removes or rewrites a promoted constraint in the
consuming repo, which is exactly the "never applied by the pass" prohibition the whole propose-only
symmetry rests on. §4.1's graph names `routeProposal`, and `routeOf` is reachable from nowhere else.

**Two sets, and the reason they must be named separately.** `RouteDecision` is the routing
functions' **range** and has exactly four members; `Route` (§6.1) is the record field's vocabulary
and also has four, but a *different* four. The two differ in one member each way: `"proposal-file"`
is reachable from `routeProposal` and is not a `Route`; `"degraded"` is a legal `Route` and is
**unreachable** from either routing function — `routeProposal`'s three branches can return only
`"PR"`, `routeOf`'s answer (`constraints` / `decisions` / `proposal-file`), or `"proposal-file"`.
This is stated as two named types rather than one union because §6 makes every enumerated contract a
**set-equality** oracle over the full enumeration: an oracle written against a union that is wider
than the range would red on correct code, and the predictable repair — weakening it to containment —
would stop failing when a route is deleted, which is the failure the oracle exists to catch. So the
routing oracle asserts `range(routeProposal) = RouteDecision` (four members, both directions) and the
record oracle asserts the `route` field ∈ `Route`; neither type appears in the other's assertion.

**`routeOf` has an outcome the `Route` union cannot express.** `"proposal-file"` is
`routeOf`'s answer for FSPEC §5.1 row 4 and for every `revise`/`retire` diversion above, and
vocabularies §1 at `Version` 1.4 has no `Route` row for it (§6.1's four-member union is transcribed
correctly from `pdlc-consolidation-vocabularies.md:38-65`). That gap is **upstream**, recorded as
ER-6 in §12.4 and not patched here.

Until ER-6 lands, `FailureModeRecord.route` for a proposal-file promotion is written
**`"degraded"`** — the one legal value whose meaning is already "the promotion reached nothing but
`CONSOLIDATION-PROPOSAL-{passId}.md`", which is FSPEC AT-Q12's own gloss on it. The consequence is
correct rather than merely legal: §7.6's `enactedByLog` does not enact on a `degraded` record, so
the proposal is re-proposed on the next pass — which is what an item awaiting operator approval
should do, and is the direction AT-Q12 asserts. The loss ER-6 would recover is that a *routed*
propose-only item and a *degraded* PR attempt are indistinguishable in the record; the report body
(§7.9 item 4) names each promotion's route in full and is the discriminator meanwhile.

**And the discriminator is asserted, not merely stated.** A discriminator no test reads is not a
discriminator. `consolidationReport.test.js` carries the two-fixture control alongside its AT-L rows:
one pass whose promotion was *routed* propose-only (a `revise` on a `DOMAIN-CONSTRAINTS.md` target,
§7.6's table row 2) and one whose PR attempt *degraded* (`branch-exists`). Both write
`route: "degraded"` to the record — that is the ER-6 loss, and the test asserts it rather than hiding
it — while the report bodies differ: the degraded one names a reason code from vocabularies §1
(`branch-exists` / `api-failure` / `repository-unresolved`) and the routed one names none. The
assertion is that exact difference, in both directions. Without it the interim would be a claim; with
it, ER-6 landing is a *simplification* of a passing test rather than the repair of a silent
ambiguity.

`routeOf` normalises the target — repository-root-relative, no leading `./`, no `..` segment, `/`
separators — and returns `"PR"` when it is prefixed by **any member of `MERGE_GUARD_DEFAULTS`**
(imported from `orchestrate-dev.js:48-53`, never copied: a copy would silently survive a change to
the constant, and set-equality with it is AT-R1's whole point). Otherwise it returns `constraints`
for `docs/_constraints/DOMAIN-CONSTRAINTS.md`, `decisions` for `docs/_decisions/DECISIONS-*.md`, and
`"proposal-file"` for every other consuming-repo path. `guardVerdict` (`:732`) and
`effectiveGuardPaths` (`:709`) are **not** called: both are reachable only from Phase MERGE's ladder
and the advisory-envelope check and both decide about *that run's own* PR, so calling them would
claim an enforcement neither performs. The pass reads the constant and decides for itself.

**Suppression has one key and two carriers**, and each carrier is a separate pure function so
neither can accidentally consult the other's evidence:

- `enactedByLog` is a function of `(failureModeId, action)` **and** `route`, and of nothing else. A
  record whose `route` is `degraded` does not enact. A record short of `failureModeId`, `action` or
  `route` cannot be evaluated ⇒ `absent` ⇒ the promotion is re-proposed. A record short of only
  `passId` **still enacts** — the predicate does not read that field — and returns
  `{enacted: true, passId: null}`, which §7.9 renders with §6.5's literal. This is the one arm
  where the reader's general skip rule is inverted, and it is inverted *in the return type* rather
  than in a caller's conditional, so no caller can get it wrong.
- `enactedByPr` reads the `PDLC-CONSOLIDATION-PROMOTIONS` trailer of PRs observed `open` or
  `merged`. State is read at poll time with no memory: a reopened PR is `open`; a `closed`-unmerged
  PR is not in the key set. §9.2 states the one `gh` call that supplies `prStates`.

### 7.7 The advisory corpus (FSPEC §9.2, §9.3 — T-06)

```ts
parseEscalations(text: string | null): EscalationCounts      // pure, total
seamCandidates(counts): {over: string|null, tie: string[], under: string[]}   // pure
```

The parse target is the **metadata table row**, never the heading. `renderEscalationEntry`
(`orchestrate-dev.js:2763`) emits `| Feature | ${feature} |` at `:2782` and `| Seam | ${seam} |` at
`:2783`; the heading it emits at `:2776` carries the same two values joined by em dashes, which a
feature name containing an em dash makes ambiguous. `parseEscalations` therefore splits the text on
`/^## /m` into entries and, within each, matches
`/^\|\s*Feature\s*\|\s*(.+?)\s*\|\s*$/m` and the corresponding `Seam` row. An entry missing either
row is **skipped with a parse notice** and attributed to no key; the read never aborts (E-12).

`corpusState` is `absent` when `_readFile` returned `null` — which covers unreadable as well as
missing, and is the fail-safe direction the FSPEC fixes ("never as empty: the two codes make
different claims") — `empty` when the text parses to zero entries, and `present` otherwise.

`seamCandidates` ranges over **every entry in the file**: no filter on `Feature`, none on date, no
relation to the consumed set (BR-37a). Over-escalation requires both conjuncts — ≥2 distinct
features **and** a total strictly exceeding every other seam's; a tie returns `tie` and no
candidate. Under-exercise requires a non-empty corpus with ≥1 *other* seam escalating and this seam
at zero. Seam identity comes from `ADVISORY_SEAMS` (`orchestrate-dev.js:1669`), imported.

**The whole-file range is the FSPEC's, and PROPERTIES must fixture against it.** FSPEC §9.5 settled
that `seamCandidates` ranges over every entry with no filter on `Feature`, none on date and no
relation to the consumed set (BR-37a); the REQ's AC-6.3 text still reads "across the consumed
window". This layer transcribes the FSPEC, so it is not a defect here — but a PROPERTIES fixture
written from the REQ's wording would falsify a conforming implementation. §11.5 carries the note.

### 7.8 Configuration (FSPEC §11 — the `parseAdvisoryConfig` precedent)

```ts
parseConsolidationConfig(text: string | null): ConfigParse    // pure, total
```

Structurally identical to `parseAdvisoryConfig` (`orchestrate-dev.js:1682`), whose five observed
states are verified at HEAD (`:1689`, `:1693-1696`, `:1698`, `:1700-1701`, `:1705-1713`) and
reproduced key-for-key: absent file, unparseable JSON, missing section, non-object section
(`sectionMalformed: true`), and per-key type rejection that names the key in `invalidKeys` while
leaving every other configured key at its configured value.

It is a **separate function, not a generalised one.** Refactoring `parseAdvisoryConfig` into a
shared parameterised parser would edit a guard-set file for a second reason and put a shipped,
tested advisory path at risk for a cosmetic gain; the FSPEC's reuse obligation is over the *rung
ladder*, which is behaviour, not over a config parser, which is twelve lines of shape. The
duplication is bounded and is pinned by a test that asserts the two functions agree on all five
states (§11.3).

`pluginRepository` is the one key whose failure is not a parse fallback: a non-null value that does
not resolve is `repository-unresolved` and the §9 degradation, decided at the PR-route attempt, not
at parse time.

### 7.9 Rendering — the log records and the report body (FSPEC §10.2 – §10.4)

```ts
renderConsumedPair(passId, basenames): string          // §7.1, one whole record
renderFailureModeRecord(record): string                // one whole record
renderEffectivenessTable(rows): string                 // one whole record
renderTerminalRow(state): {text: string, dropped: ReasonCode[]}
renderReportBody(state): string
renderPrBody(state, enacted: Proposal[]): string        // the PR body file (AC-3.2, AC-3.7)
renderProposalFile(state, deferred: Proposal[]): string // CONSOLIDATION-PROPOSAL-{passId}.md (AC-3.5)
renderPromotionCommitMessage(proposal, passId): string  // PDLC-PROMOTION-ID trailer (AC-3.3)
```

Four appends in a fixed order (consumed pair → failure-mode records → effectiveness table →
terminal row), **one `_appendFile` call per record**, never a batch. The granularity is the
contract, not an implementation detail: it is what makes a partially-routed pass readable from the
log (AT-M9's discriminating conjunct), and it is why the failure-mode record is appended **as each
proposal routes** rather than after the routing loop.

`renderTerminalRow` emits the FSPEC §10.3 field set, splitting exactly as that section does:
enumerated-class values are drawn from §6.4's frozen catalogues; free-form values (`pass:`, `date:`,
`consumed:`, `branch:`, `deferred:`, `pr:`, `suppressed-by:`, `rung:`) are data. It returns the
codes it **dropped** as illegal-with-this-status (§6.4), so the caller can put them in the report
body — the mechanism by which ER-4's named loss stays legible rather than silent.

`suppressed-by:` renders `{id}:{action} → {evidence}` with exactly two evidence spellings, chosen by
the suppression's own carrier and never by the writer: a PR URL, or `pass:{passId}` — degrading to
`pass:(unavailable)` (§6.5) when the enacting record carried no `passId`. The entry is never
dropped, and `pass:undefined` is unproducible because the renderer takes `passId: string | null`
and maps `null` to the literal.

`renderReportBody` emits the ten items of FSPEC §10.4 in order, each **present even when empty**
(DC-01 receive-side totality: a reader must be able to tell "no promotions" from "the section was
dropped"). Item 4 names each promotion's route — including, for a `revise`/`retire` diversion, that
its record's `route` reads `degraded` under ER-6 (§7.6) — and, for a merged promotion, its
`elidedKinds` and `elidedArtifacts`; item 10 prints `openPromotionList(...).length` as a number.

**The two operator-facing artifacts are renderers like every other surface**, not prose an agent
composes. Both are pure functions of `PassState` plus a proposal list, so both are L1-testable
without standing up a pass, and both are written through a seam by `main` — never by a dispatched
agent (the id and the trailers are the pass's own data, and an LLM cannot be relied on to reproduce
a set-equality).

**`renderPrBody(state, enacted)`** produces the bytes `--body-file` reads (§9.2). Three obligations
land on it:

| Obligation | What the renderer emits |
|---|---|
| AC-3.2 | one section per enacted promotion naming (i) the **source LEARNINGS by feature name**, derived from `state.consumed`'s basenames rather than restated, (ii) the failure mode the edit targets — its `failureModeId` and one-line `symptom` — and (iii) the AC-2.3 pattern evidence that cleared the bar, carried verbatim from the clustering reply |
| AC-3.7(c), REQ-CONS-03 | the three vocabularies §4 trailers, last, in that section's order: `PDLC-CONSOLIDATION-PASS: {passId}`; `PDLC-CONSOLIDATION-SOURCES: {sorted consumed basenames}`; `PDLC-CONSOLIDATION-PROMOTIONS: {sorted `{failure-mode-id}:{action}` pairs}` |
| NFR-2 / §7.4 | nothing derived from the credential. The renderer takes no credential argument at all, so non-disclosure **on the outbound path** is structural (§5.3) rather than reviewed. It is **not** structural inbound, and this row does not claim it is: on a non-zero exit `rtGit` asks its transport agent for "the LAST 300 characters of its **combined output**" (`pdlc/workflows/runtime-adapter.js:951`), which `rtParseTransportReply` (`:967`) surfaces as `stderr` (`:977`), and this feature renders that field into report bodies — §10.3 row 1a's "pathspec and `stderr` in the report body" (`TSPEC:1950`) and `openClone`'s `{failure, detail}` on the credentialed clone/push path (`TSPEC:1615`). That residual is bounded by what `git` prints on failure, not by the seam's interface, and it is carried — not closed — under the same qualification DEC-CONS-01 records ("honoured by construction outbound and by implementation discipline inbound"; `DECISIONS-…:93-120`). The rendered artifacts themselves stay credential-free because the value never becomes a JS string to render (§9.2) |

`PDLC-CONSOLIDATION-PROMOTIONS` is the NFR-4 duplicate key and is **derived from `enacted`, not
assembled beside it**: the renderer computes the pair set from the same array it renders sections
from, so the trailer is set-equal to the proposals the PR enacts by construction rather than by
discipline. That closure matters because §7.6's `enactedByPr` *reads* this trailer — the pass's own
idempotence depends on this writer, so writer and reader are pinned to one another by AT-Q4's
round-trip (§12.2). Sorting is byte order over the pair strings, so the trailer is stable across
runs and a diff of two passes is readable. A revision or retirement sharing the PR (AC-3.3) joins
the set under the **retired promotion's own** `failure-mode-id` — no second id is minted (AC-5.1).

`renderPromotionCommitMessage` emits one commit's subject plus `PDLC-PROMOTION-ID: {id}:{action}`,
the per-commit trailer of vocabularies §4, so commit → proposal is readable without counting
(AC-3.3). It is a separate one-line function because §9.2's per-edit commit is the only caller and
its output is the one thing in the clone that must be exactly transcribable.

**`renderProposalFile(state, deferred)`** produces
`docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md`, written **when and only when** the pass has
something to propose that it does not enact (FSPEC §5.3) — so a pass that enacts everything writes
no file, and one is never created empty. Per deferred item it emits: the `failureModeId`, the
`action`, the target, **the full proposed diff inline** (AC-3.5 — the `Proposal.diff` field, never a
summary of it), and the **failure class recorded by name** — the reason code (`credential-unavailable`,
`repository-unresolved`, `api-failure`, `branch-exists`) for a degraded PR attempt, or the
propose-only cause for an AC-5.4 diversion. When the pass also opened a PR, the file's header
carries `state.prUrl`, which is AC-3.4's second clause; when there is no proposal file, AC-3.4's
second clause is vacuous and the URL lives in the terminal row's `pr:` field alone (§12.2 row T-11
records that reading).

A deferred item whose `diff` is `null` renders the diff block as §6.5's `(unavailable)` and still
emits every other field: a proposal short of its edit is a worse artifact than one that says so, and
dropping the item would lose the promotion — the AC-3.5 failure this fallback exists to prevent.

## 8. Reuse of the advisory rung ladder, and the bundle wiring

### 8.1 The signature widening, exactly (T-05)

`resolveAdvisoryRung`'s current signature is `({ _agent, _log, _state, prompt })`
(`orchestrate-dev.js:1833`) and its inner `dispatchAt` calls
`_agent(ADVISORY_RUNG_SKILL, prompt, { model })` at `:1841`. The edit is one destructured parameter
and one substitution:

```js
export function resolveAdvisoryRung({ _agent, _log, _state, prompt, skill = ADVISORY_RUNG_SKILL }) {
  …
  function dispatchAt(model) {
    return _agent(skill, prompt, { model });          // was: ADVISORY_RUNG_SKILL
  }
```

Four constraints on that edit, each of which the implementation must satisfy and a test must
falsify:

1. **Optional, defaulting to `ADVISORY_RUNG_SKILL` (`:1797`).** The shipped call site
   (`:3132`, inside `runAdvisorySeam`) passes no `skill` and is not edited. AT-M10 is the
   regression: the resolver called without `skill` dispatches `"se-review"` on the primary rung, on
   the fallback rung, and on the memoised path.
2. **Threaded to the one `_agent` call, therefore to every path.** `dispatchAt` is the sole
   dispatch site — it is declared at `:1840`, and the memoised path (`:1844-1849`) and the two
   ladder rungs (`:1851`, `:1861`) all
   go through it — so a pass cannot resolve on one skill and dispatch on another. This is why the
   parameter is threaded through `dispatchAt` rather than passed separately at each rung.
3. **Exactly one ladder remains.** No second constant, no second resolver, no per-caller model
   list. `MODEL_ADVISORY` (`:1652`) and `MODEL_ADVISORY_FALLBACK` (`:1653`) stay module-private and
   are not re-exported; the corpus baseline §3's "reuse the resolver, do not restate the ladder" is
   satisfied by import, so its drift-observable escape hatch is not taken.
4. **The function stays non-`async` and `.then`-chained.** Its doc comment (`:1820-1826` — the
   "Deliberately NOT `async`" block; `:1819` is the preceding blank comment line) states
   that the hop count is load-bearing: the shipped caller races the returned promise against a
   `_sleep`-built deadline, and an `async` body would add microtask hops and let the deadline win on
   hop count. Adding a defaulted parameter changes no hop; converting the body would break a caller
   this feature does not otherwise touch.

**The pass's own call is a new call site, not an instance of a shipped pattern.** The queue threads
`rungState` into `runAdvisorySeam` (`orchestrate-queue.js:1245-1256`), not into the resolver; the
resolver's only shipped call site is `orchestrate-dev.js:3132`. The pass therefore owns its own
`{ resolved: null }` state (the shape `orchestrate-queue.js:1120` initialises) and calls the
resolver **bare** — no deadline, no `_sleep`, no `{kind:"preempted"}` fifth shape. That shape is the
shipped call site's disposition (`:3130-3134`), not the resolver's, and the pass has no seam budget
to enforce; so FSPEC §2.6's four rows stay set-equal to the resolver's own return and throw set, and
a hung dispatch is bounded only by the runtime's no-progress watchdog — recoverable through §7.3's
stale-lock reclaim, which is why that reclaim is not merely a nicety.

Every dispatch the pass makes (step 8 clustering, step 12 remediation authoring, step 13 proposal
authoring) goes through the same resolver with the same `rungState`. Memoisation makes FSPEC §2.6
rows 2 and 3 unreachable after step 8 (`:1844-1849`: with `_state.resolved` set the cached rung is
used and no ladder is entered); row 4 remains reachable at every dispatch, which is exactly why
S-11c exists.

### 8.2 The bundle, and how it reaches the resolver (T-02)

**Decision: inline, as the two shipped bundles already do.** `build-runtime.mjs` reaches across
modules only by inlining a whole module body (`bundles`, `:448-471`); the queue bundle is
`[QUEUE_META, BANNER, adapter, devModule, queueModule, QUEUE_ENTRY]` (`:450-453`) and `pdlc-cli.mjs`
wraps the same dev body as `__dev` (`cliArtifact`, `:291`). The consolidation bundle takes the same
form:

```js
{
  file: "consolidate-learnings.bundle.js",
  contents: stripCommentsForRuntime(
    [CONS_META, BANNER, adapter, devModule, consModule, CONS_ENTRY].join("\n\n")
  ),
}
```

with `consModule = wrapModule("__cons", stripModuleSyntax(consSource), ["main", "meta"], prelude)`
and the prelude re-binding the four reused symbols the same way `queueModule`'s does
(`:113-122`):

```js
"const resolveAdvisoryRung = __dev.resolveAdvisoryRung;",
"const MERGE_GUARD_DEFAULTS = __dev.MERGE_GUARD_DEFAULTS;",
"const mergeCommandFor      = __dev.mergeCommandFor;",
"const gitWithLockRetry     = __dev.gitWithLockRetry;",
```

Two of those four are not on `devModule`'s current export list (`:86-105`), which publishes
`resolveAdvisoryRung` and `commitPaths` but not `MERGE_GUARD_DEFAULTS`, `mergeCommandFor` or
`gitWithLockRetry`. The list therefore gains three names. `gitWithLockRetry` is **not** exported
from `orchestrate-dev.js` today (it is a module-private `async function` at `:8617`); exporting it
is part of this feature's edit to that file, and it is a pure addition — no call site changes.

**What inlining decides, stated because T-02 asks.** The consolidation bundle inherits
`orchestrate-dev`'s module-level constants by value at build time, so a drift in the widened
resolver reaches **four** tracked artifacts, not three: `dist/orchestrate-dev.bundle.js`,
`dist/orchestrate-queue.bundle.js`, `dist/pdlc-cli.mjs` and the new
`dist/consolidate-learnings.bundle.js`. All four are rebuilt by one `build-runtime.mjs` run and all
four are diffed by CI's `Generated artifacts are in sync` job, so a commit that rebuilds three of
four fails it. The alternative — a fifth artifact holding only the resolver, imported by all — is
not available: the runtime forbids `import` entirely.

`CONS_ENTRY` mirrors `QUEUE_ENTRY` (`:185-213`): it reads `args` (a bare string or an object) into
the one optional input, spreads `rtConsInjections()`, and returns `await __cons.main({…})`.
`CONS_META` is a hand-written pure literal, first statement, carrying `name`, `description`,
`whenToUse`, one declared input (`{name: "direct", type: "boolean", required: false}` — the manual
entry point of FSPEC §2.1) and a `phases` list of the four operator-visible stages
(Enumerate / Trigger / Promote / Report). It is hand-written for the reason the file's own comment
gives at `:125-126`: `meta` must be a pure literal and the first statement, so each bundle carries
its own copy rather than re-exporting the module's.

### 8.3 The manifest and the release stamp

`distribution-manifest.json` carries one row per artifact with its own `sha1` (ids
`orchestrate-dev`, `orchestrate-queue`, `pdlc-cli` at the pre-feature baseline). The rebuild adds
a fourth row, `consolidate-learnings` — present at HEAD since the build landed — **and re-stamps
the three existing rows** whose bytes changed because the
dev module they inline changed. That is a property of the manifest, not a per-feature choice: it is
touched once per artifact the rebuild changes, not once per feature.

`sync-workflows.sh` needs no edit: it copies every row of the manifest, so the new bundle reaches
`.claude/workflows/` by the shipped mechanism. `--check` will report the new row as `missing` until
the first sync, which is the designed signal, not a regression.

**And it blocks the queue until the operator syncs — deliberately, and it must be written down.**
`orchestrate-queue`'s drift gate runs before `QUEUE.md` is even read and returns
`outcome: "blocked"` on a row that is still `missing`, so the first queue invocation after this
feature lands refuses until `sync-workflows.sh` has run. That is the gate working, not a regression:
a consumer whose `.claude/workflows/` lacks the new bundle cannot run the pass anyway, and the
alternative — a gate that ignores a missing row — is the silently-stale-copy failure the gate
exists to prevent. §13.3 hands the PLAN the obligation to say so where a queue operator will read
it: the feature's release note and `pdlc/RELEASE-CHECKLIST.md` both name the required
`sync-workflows.sh` run, and the repo's own bootstrap already documents the two-command order.

**No AC or FSPEC row owns it, and that is the correct place for it.** The interruption is not
behaviour this feature specifies: it is the *shipped* drift gate's existing contract
(`docs/_queue/QUEUE.md`'s gate, `distribution.checkEnabled`) meeting a new artifact row, and it fires
identically for any feature that adds a bundle. Inventing an AC for it would push a distribution
mechanic into a functional spec that decides pass behaviour. So its discharge **is** the §13.3
release-note obligation — stated here so the choice is visible rather than looking like an omission,
and stated in the two places an operator actually reads before running a queue.

### 8.4 Capturing the resolver's `_log` stream (T-04)

`ADVISORY_MODEL_FALLBACK:` is emitted through `_log` (`orchestrate-dev.js:1858-1860`, the template
literal at `:1859`) and never appears in the resolver's return value. FSPEC §10.4 item 2 and AT-M7
require that line **verbatim** in the report body, so the pass cannot pass its plain `_log` through.

**Mechanism: a tee.** `main` builds

```js
const dispatchLog = [];
const teeLog = (msg) => { dispatchLog.push(String(msg)); _log(msg); };
```

and passes `teeLog` as the resolver's `_log`. The operator still sees every line on the run log
(nothing is swallowed), and the pass holds the text it must render. The same buffer carries FSPEC
§2.6 row 4's error message: the resolver returns `{kind: "dispatch-error", err}` (`:1857`, `:1867`),
so `main` pushes `String(err?.message ?? err)` onto `dispatchLog` at the point it dispositions the
row — one capture serving both report-body obligations, which is what T-04 asks for.

The buffer is **report-body only**. It never reaches the log row (whose fields are closed, §7.9),
never reaches an artifact, and is not a vocabularies §1 value — so it cannot breach REQ §4b.

## 9. The pull-request route — clone, commit, credential

### 9.1 The temporary clone (T-03)

```ts
openClone(passId, config, seams): Promise<{dir: string} | {failure: ReasonCode, detail: string}>
```

Three steps, all through seams, none of them touching the invoking tree's refs:

1. `dir = await _makeTempDir(passId)` (§5.3). `null` ⇒ `{failure: "api-failure"}` — there is no
   fallback into the invoking tree, because AC-3.8 forbids one outright.
2. `remote` = the clone source. In the same-repo case (`pluginRepository == null`) it is the
   invoking repository's **origin URL**, read with `_git(["remote", "get-url", "origin"])` — a
   non-mutating read of the invoking tree, resolving to `read-object` in §9.3's verb table. Cloning
   the *working tree path* is deliberately not done: it would carry the tree's local branches and
   its possibly mid-pipeline HEAD, and FSPEC §6.1 requires the clone to be cut from the **fetched
   default branch**. In the two-repo case it is `https://github.com/{pluginRepository}.git`. An
   `origin` that does not resolve is `repository-unresolved`.
3. `_git(["clone", "--depth", "1", "--single-branch", remote, dir])`. `--depth 1` because the clone
   exists only to carry one commit per edit and be pushed; nothing here reads history. `git clone`
   checks out the remote's default branch, which is exactly the FSPEC's "cut from the fetched
   default branch" and needs no separate `fetch` — hence `fetch` sitting in §9.3's
   *permitted-but-not-obliged* column rather than in the obliged one.

Every subsequent call in the clone is `_git(["-C", dir, …])`. **Removal**: the pass issues no
removal. `mktemp -d` places the directory under the OS temp root, which the OS reclaims; a removal
step would be a mutating call in a domain whose verb set §9.3 closes, and a failed removal would
have to be dispositioned into a vocabulary that has no row for it. The directory is small (a
depth-1 clone) and its residue is inspectable, which matches AC-3.6's decision to leave the
`consolidation/{passId}` branch undeleted for the same reason.

### 9.2 Branch, commits, body, and the PR calls

| Step | Call | Verb (§9.3) |
|---|---|---|
| branch | `_git(["-C", dir, "checkout", "-b", "consolidation/" + passId])` | `create-branch` |
| per edit | write the file in the clone, then `_git(["-C", dir, "add", "--", path])` and `_git(["-C", dir, "commit", "-m", msg + trailer, "--", path])` | `add`, `commit` |
| push | `_git(["-C", dir, "push", "origin", "consolidation/" + passId])` | `push` |
| duplicate poll | `_ghRun(mergeCommandFor("consolidationPrs", {repo}))` | `read-pr` |
| open | `_ghRun(mergeCommandFor("consolidationCreate", {…}))` | `create-pr` |

Writing a file **inside the clone** uses the `_writeFile` seam with an absolute path under `dir` —
and that **is** a new capability, granted by §5.6(a)'s prompt widening, not an existing one. The
shipped prompt says "relative to the repository root" (`runtime-adapter.js:805`) and `dir` is
outside the repository, so the earlier claim that "no new capability is needed" was wrong in the one
direction that matters: three things depend on this working — the guard-set edit committed in the
clone, the PR body file, and with it the whole `--body-file` mechanism. §5.6(a) states the widened
contract and §11.3(e) states the assertion that pins it; §11.6 no longer exempts it. Only the
**write** prompt changes: every path this pass hands `_readFile` is repo-root-relative (the corpus
files enumerated by `ls-files`, the log, the marker), and `rtReadFile`'s shell-command transport
resolves an absolute path verbatim anyway (§5.6(a)), so there is no read-side edit here and none is
needed.

NFR-1 is untouched: the only guard-set path the pass ever writes is inside the throwaway clone,
never in any tree the invoking repository checks out. The widening does not weaken that — an
absolute path is only ever one `_makeTempDir` returned, and the pass constructs none itself (§5.3).

`mergeCommandFor` (`orchestrate-dev.js:319`) is extended with two surfaces rather than a second
builder being written. Its doc comment (`:310-312`) states the rule in Phase MERGE's scope — "the
SOLE place every `gh` command string used by Phase MERGE is built, so a single audit of this
function's body accounts for every literal command the phase can run" — and this feature **widens
that scope rather than opening a second builder**: the audit property is worth more repo-wide than
scoped, and the alternative puts two `gh` string builders in one bundle. The comment is edited to
say so:

```
case "consolidationPrs":   // one call supplies §7.6's prStates
  return `gh pr list --repo ${params.repo} --state all --limit 100 --search "PDLC-CONSOLIDATION-PASS in:body" --json url,state,body`;
case "consolidationCreate":
  return `gh pr create --repo ${params.repo} --head ${params.head} --base ${params.base} --title ${params.title} --body-file ${params.bodyFile}`;
```

`--body-file` rather than `--body` is deliberate and load-bearing for NFR-2/§7.4: the body is
written to a file in the clone, so no part of it is ever an argv element in a command string the
adapter logs on failure. `--state all` with a `--json state` field is what lets §7.6 apply the FSPEC
state table (`open`/`merged` in the key set, `closed`-unmerged not) with **one** call.

**The credential never becomes a JS value.** When `_envPresent(credentialEnv)` is true, the pass
prefixes the transported command with the variable *by name*:
`GH_TOKEN="$PDLC_PLUGIN_REPO_TOKEN" gh pr create …` (the actual name coming from config). The shell
inside the transport expands it; the pass holds only the name. That is what makes FSPEC §7.4's
"never echoed back through a subprocess argument" structurally true rather than a review promise —
there is no code path on which the value exists in the module. That statement is exact for the `gh`
half: `_ghRun` takes a **command string** which `rtGhRun` interpolates verbatim into the transported
command (`pdlc/workflows/runtime-adapter.js:995`), so an environment prefix written by the module is
expanded by the shell that runs it.

**The push half is different, and an earlier draft of this section was wrong about it.** `_git`
takes **argv**, and `rtGit` passes every element through `rtShellQuote`
(`pdlc/workflows/runtime-adapter.js:668-670`), which POSIX single-quotes it. A `$VAR` written into a
`_git` argv element — including an `-c http.extraheader=…$PDLC_PLUGIN_REPO_TOKEN…` element — is
therefore transported **literally** and never expanded, so the credentialed push cannot reach `git`
by shell expansion through this seam. Nor may the module hold the value instead: NFR-2 and
DEC-CONS-01 forbid it. The lane this layer picks is **neither of those**:

- **Chosen.** The push stays on `_git` (so §9.3's clone-domain classifier and its `push` obligation
  are unchanged) and carries the credential as a **git credential helper**, not as a header value:
  `_git(["-C", dir, "-c", "credential.helper=!f(){ echo username=x; echo password=$PDLC_PLUGIN_REPO_TOKEN; };f", "push", …])` (the variable name coming from
  `consolidation.credentialEnv`). `rtShellQuote` single-quoting that element is exactly what is
  wanted: the helper text reaches `git` intact, and `git` runs it through **its own** shell, which
  expands the variable from the environment it inherited. Expansion happens one process below the
  transport, so the module still holds only the name and the value still never becomes a JS string.
- **Rejected — route the push through a command-string seam of `rtGhRun`'s shape.** It closes the
  finding, but it adds a second git transport whose argv is unquoted, moves the push out of §9.3's
  `_git`-argv classifier (whose domain test is literally "`_git` whose argv begins
  `["-C", cloneDir]`"), and so re-opens a frozen FSPEC §6.5 set for a mechanism the chosen form
  already provides.
- **Rejected — `gh` for both.** `gh` has no push verb; the push would still be `git` underneath.

With `local-gh` the push uses the ambient credential helper and carries no `-c` element at all.

`credential:` resolution order is §7.2's: variable present ⇒ `present (redacted)`; else a working
`gh` auth probe (`_ghRun("gh auth status")`) ⇒ `local-gh`; else `absent` + `credential-unavailable`.
It runs **at the first PR-route attempt and at most once per pass**, so a pass with no guard-set
proposal never runs it and reports `absent` as its null.

### 9.3 The three seam domains and their verb sets (FSPEC §6.5, inherited)

The FSPEC froze these sets and made widening a **recorded TSPEC decision** under `DEC-LAYER-01`
("a widening is a recorded TSPEC decision against this set, never a silent reading of it"). This
layer records **exactly four widenings**, every one in a permitted-but-not-obliged column, every one
non-mutating, each marked ⊕ below. Every other cell is transcribed unchanged from **FSPEC §6.5's own
table** — the anchor, not a version, for the reason §12.3 states: the four ⊕ widenings are what this
layer decides, and everything else is a transcription whose authority is the named FSPEC section at
whatever version is current. Be clear about what does **not** police this: §11.3(a)'s containment
oracle asserts `observed ⊆ permitted` against **this table**, transcribed into the test — it pins
the implementation to the spec, not the spec to its upstream. A cell that drifts from FSPEC §6.5
is caught by review of that section, which is why the anchor is named rather than a line or a
version cited.

| Domain | How a call is classified | Obliged | Permitted, not obliged | Absent always |
|---|---|---|---|---|
| PR seam | every `_ghRun` call | `read-pr`, `create-pr` | ⊕ `read-auth` | `merge`, `enable-auto-merge`, `merge-pr`, `squash-merge`, `close-pr`, `update-pr` |
| git, invoking tree | `_git` whose argv does **not** begin `["-C", cloneDir]`, and is not the `clone` call | `add`, `commit` | `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index` | `checkout`, `switch`, `stash`, `reset`, `rebase`, every merge verb |
| git, clone | `_git` whose argv begins `["-C", cloneDir]`, plus the `clone` call itself | `clone`, `create-branch`, `add`, `commit`, `push` | `fetch`, `read-branch`, `read-status` | every merge verb |

**Widening 1 — `read-auth` on the PR seam.** AC-4.4 makes local `gh` authentication the *shipping*
credential for the same-repo case, and §9.2 observes it with `gh auth status`. That call touches no
pull request, so under FSPEC §6.5's domain definition ("every call that reads or mutates a pull
request in the target repository") it would fall into **no domain at all** and be invisible to
AT-Q7's oracle — the precise blindness §6.5 exists to remove. Binning it into the PR seam under its
own read verb keeps every `_ghRun` call classified, so the spy's containment assertion still ranges
over the whole seam. It is non-mutating and is no merge verb, so the assertion loses no strength.
An erratum against the FSPEC asks §6.5 to state the domain by transport (`_ghRun`) rather than by
subject (a pull request).

**Widenings 2–4 — three named reads in the invoking tree, each classified as what it reads.** The
pass makes three non-mutating git reads of the invoking tree that FSPEC §6.5's closed set has no
verb for, and each gets its **own** verb:

| Call | Verb | Why the pass makes it |
|---|---|---|
| `git cat-file -e HEAD:{path}` | ⊕ `read-object` | FSPEC §8.5 row 3's file-existence test at HEAD (§7.5), which the runtime cannot ask of a filesystem it does not have |
| `git remote get-url origin` | ⊕ `read-remote` | §9.1 step 2's clone source in the same-repo case |
| `git ls-files --cached --others -- :(glob)…` | ⊕ `read-index` | §7.1's corpus enumeration |
| `git ls-files --deleted -- :(glob)…` | `read-index` (already widened by the row above) | §7.1's working-tree restriction — REQ §3.1 step 1's second bullet. Same verb, same domain, no further widening: it reads the index against the worktree and mutates neither |

An earlier draft folded `read-remote` into `read-object` "because a two-verb widening is easier for
a test author to transcribe exactly than a three-verb one". That is withdrawn, and it was wrong on
its own terms: reading remote configuration is not reading the object database, transcription cost
is the weakest possible ground for widening a set whose entire purpose is to make AT-Q7's
containment assertion mean something, and it did the very thing §13.1 row 9 records this layer as
having *rejected* — mis-classifying into an existing verb rather than naming a new one. The concrete
cost was that `resolveSeamVerb` became lossy at the boundary: an implementation that later reached
for `git remote add` would classify as the already-permitted `read-object` and pass containment.
With one verb per read, `remote add` resolves to a mutating remote verb that is in no permitted set
and reds. `read-status` would have been the same mis-classification for `cat-file`, and §6.5 forbids
reading a further verb into a closed set silently — which is why all three are recorded, not folded.

All four widenings are **permitted, never obliged**, so no Given asserts their presence and an
implementation that resolves the branch name, the file's existence, the remote or the corpus some
other way still conforms.

Classification is by **resolved operation**, not function name: the resolver maps an argv or a
command string to a verb, so `checkout -b` and `switch -c` in the clone both resolve to
`create-branch`, and a merge issued through any spelling of `_ghRun` resolves to `merge`. The
classifier has two exported pure halves, `resolveSeamDomain` and `resolveSeamVerb`, so the spy
in §11.3 reads the contract's own classification rather than re-implementing it — and a verb the
classifier cannot resolve returns `"unknown"`, which is in no permitted set and therefore fails the
containment assertion rather than passing silently.

**Both halves are the module's, not the spy's.**

```ts
resolveSeamDomain(seam: "_git"|"_ghRun", argvOrCommand, cloneDir: string|null)
  : "pr" | "git-invoking" | "git-clone"          // total — never null
resolveSeamVerb(domain, argvOrCommand): string   // "unknown" when unresolvable
```

`resolveSeamDomain` exists because an earlier draft left the **domain** half to the test: `domain`
is an *input* to `resolveSeamVerb`, so the module classified the verb and never the domain, and the
spy computed the domain itself from the clone directory — half the contract re-implemented in test
code, which is the exact failure this paragraph claims to avoid. It also did not cover the whole
set: the rule is "`_git` whose argv begins `["-C", cloneDir]`, plus the `clone` call itself", and
the clone call is `_git(["clone", "--depth", "1", "--single-branch", remote, dir])` (9.1 step 3),
which carries **no** `-C` prefix. A hand-written special case in the test for the one call that
*establishes* the domain is precisely where a mis-binned call hides: binned into the invoking-tree
domain, `clone` is in no permitted set and AT-Q7 reds for the wrong reason; binned nowhere, it
disappears from both assertions. `resolveSeamDomain` returns `"git-clone"` for it **by name**, and
`cloneDir === null` — no clone opened — makes every `_git` call `"git-invoking"`.

Because that function is total over the three domains, the spy carries a **fourth** assertion the
earlier three lacked: every observed call is classified into **exactly one** domain, and the union
of the three observed sets equals the set of all observed calls. Without it a call that falls out of
the partition is silently exempt from containment, which is AT-Q7's whole subject.

The branch name for `branch:` comes from `git rev-parse --abbrev-ref HEAD` (`read-branch`), the
shipped observation `readHeadBranch` (`orchestrate-dev.js:3520`) makes through `_git` at `:3524`.

### 9.4 The consuming-repo commit (FSPEC §5.4)

```ts
commitConsumingRepoPaths(paths, message, seams): Promise<{committed: boolean, reason?: "writes-uncommitted"}>
```

Two calls, pathspec on **both**, mirroring `commitQueueRow` (`orchestrate-queue.js:1576`; add
`:1577`, commit `:1580-1585`) and `commitAdvisoryRecord` (`:1615`):

```
git add    -- {paths}
git commit -m {msg} -- {paths}
```

`paths` is exactly the §5.4 write set the pass actually wrote — `DOMAIN-CONSTRAINTS.md`,
`DECISIONS-{topic}.md`, `.consolidation-log.md`, `CONSOLIDATION-PROPOSAL-{passId}.md` — and
**never** `docs/_decisions/.consolidation-lock`, which appears in no pathspec of any pass. Never
`-a`, never pushed. `commitPaths` (`orchestrate-dev.js:8669`) is explicitly not used: its commit is
a plain `git commit -m` with no pathspec (`:8690`), which would sweep a mid-pipeline staged index
into the pass's commit.

Both calls go through `gitWithLockRetry` (`:8617`) for the `index.lock` class. A "nothing to commit"
result is a **return, not a warning** — the `NOTHING_TO_COMMIT_RE` treatment
`commitAdvisoryRecord` uses (`orchestrate-queue.js:1631-1635`) — so an empty stage records no
`writes-uncommitted`. Any other refusal records `writes-uncommitted`, leaves the writes correct on
disk, and **does not change the terminal status**.

## 10. Error handling

Every failure scenario the FSPEC enumerates, with the mechanism that produces its stated behaviour.
The organising rule: **no seam failure throws out of `main`.** Seams return `{ok:false,…}` or `null`;
pure functions are total; the only exception `main` can see is the resolver's halt rejection, and it
is caught at exactly one site (§10.2).

### 10.1 Terminating branches are returns, not exceptions

FSPEC §2.2's "terminates = a jump to step 14" is implemented as an early `return await finishPass(state)`,
where `finishPass` performs steps 14–16: append the terminal row, run the 9.4 commit, release the
marker. There is one exit, so a terminated pass still returns exactly one report and no new
termination point can forget to write one.

**The three steps are guarded, not unconditional.** An earlier draft said "unconditionally … there
is only one exit" and carved out no status. That is wrong twice, and both errors are load-bearing:

| Guard | Terminal status it protects | Why |
|---|---|---|
| `state.status !== "skipped-cadence"` gates **all three** steps | `skipped-cadence` | FSPEC §2.2 names it as "the one terminal branch that is **not** a jump": step 4 took no marker and wrote no record, so there is nothing to append (§2.4, AC-7.2). AC-1.1 requires the tick to exit "having read no LEARNINGS body … and writes no log row"; AC-1.3's datum rule requires that "ticking cannot advance the datum" (REQ-CONS-01), which a row per `/loop` tick would falsify every tick — and the log would grow without bound |
| `state.status !== "refused"` gates the **commit** | `refused` | FSPEC §4.3's Commits column reads "**no** — it writes its AC-7.2 row and commits nothing", restated at §4.4 with the reason: a pathspec stages a **whole file**, so a refused commit would capture the winner's in-flight log at an arbitrary mid-pass instant |
| `state.markerHeld` gates the **release** | `refused` | already stated in §6.1 — the loser never unlocks the winner (FSPEC §4.3) |

So `finishPass` is:

```js
async function finishPass(state) {
  if (state.status === "skipped-cadence") return report(state);   // no row, no commit, no marker, no git call
  await appendTerminalRow(state);                                 // step 14 — _appendFile
  if (state.status !== "refused") await commitConsumingRepoPaths(...);  // step 15 — _git
  if (state.markerHeld) await releaseMarker(state);               // step 16 — _writeFile only (§7.3)
  return report(state);
}
```

**`finishPass` is `async`, and every one of its steps and every one of its call sites is `await`ed.**
This is normative, not incidental. All three steps reach a seam — `appendTerminalRow` is step 14's
`_appendFile`, `commitConsumingRepoPaths` is step 15's `_git`, `releaseMarker` is step 16's — so
§5.1's "every seam call is `await`ed without exception" reaches them transitively through the module
functions that wrap them. Correspondingly, `main()` writes `return await finishPass(state)` at
**every** terminating branch, including the two in §10.2.

The reason this is spelled out rather than left to the reader is that **nothing in §11 falsifies it
by construction**. §11.3(c)'s static audit scans call sites of *injected seam identifiers*;
`finishPass`, `appendTerminalRow`, `commitConsumingRepoPaths` and `releaseMarker` are module
functions, so a missing `await` on any of them is invisible to it. And every L2 test drives **sync**
doubles (`seams.js`'s header names this as the central hazard), under which an un-awaited promise
settles before the assertion runs — green suite, broken production, where `main()` resolves a report
claiming a terminal row that is still pending and a marker (AC-1.3) still held.

So the oracle is stated explicitly, because it is the only shape that distinguishes *written* from
*scheduled*: **an L2 assertion that reads the log double and the marker double after `main()`'s
promise resolves** — not inside the pass, not from the report — and finds (i) the terminal row
present in the log double's accumulated text and (ii) the marker **released**, stated against the
observable §7.3 decides: the write double's last recorded contents for
`docs/_decisions/.consolidation-lock` **match the released form — `RELEASED: {passId} {ISO-8601}`** — having been the
`IN-PROGRESS: {passId} …` line at an earlier point in the same double's recorded history. An earlier
draft said "gone"; that describes a state no declared seam produces, since §7.3's release is an
in-place `_writeFile` of the `RELEASED:` sentinel and the protocol has no removal verb. Conjunct (ii) carries
the take-side half because a bare "no marker" is equally true of a pass that never took one (a
`refused` or `skipped-cadence` fixture, or a take that did not land — §10.3 row 5a); asserting the
take and then the release is the positive-then-negative pair the §11.3 oracles already use, and it
is what makes this row cover AC-1.3 rather than merely coexist with it. `fakeFs` supports the
history half directly — it accumulates `writes`/`calls` rather than only a current-state map
(`__tests__/helpers/seams.js:243-251` declares `writes`/`calls`; `:281` pushes every write, and
`:292` is the `checkFile` half §7.3's `present` reads through).

Driven by the **macrotask-deferring** variants of the doubles (`consolidationDoubles.js`'s `asAsync`
wrapper; §11.2 states why a microtask deferral could not falsify anything), a missing `await` inside
`finishPass` fails both conjuncts while every other suite stays green. The defect this catches is
specifically the intra-`finishPass` one — `main()`'s own `return await finishPass(state)` call sites
are a stack/`try` improvement rather than a behavioural one, since an `async` function's `return p`
already adopts `p`. §12.2's T-13 row carries it, with the mutation check §11.2 requires.

`skipped-cadence` reaches that first line from **exactly one place**: `main()`'s step-4 branch, where
`triggerFor` (§7.2) returns `"skipped-cadence"` — before `mintPassId`, before `takeMarker`, before
any LEARNINGS body is read. Nothing downstream can produce the status, which is what makes the
carve-out a single early return rather than a condition threaded through the pass. The report body
it returns carries the status alone (FSPEC §10.1 row 3), which is AC-C3's positive conjunct — the
four absences alone would also be satisfied by a pass that never ran.

A `refused` pass likewise writes no consumed pair: the pair is step 7, downstream of the step-6
refusal, so its absence is structural rather than a fourth guard (AT-M1, AT-M6b).

`state.reasons` is a `Set`, so a composing code (`reclaimed-stale-lock`, `writes-uncommitted`,
`no-advisory-corpus`, `advisory-corpus-empty`, `no-cadence-datum`) is added where it is observed and
survives to the row regardless of which branch terminates the pass — subject only to §6.4's legality
check at render time.

### 10.2 The one caught exception

`resolveAdvisoryRung` **throws** (as a rejection) when neither rung resolves (`:1868`). Every call
site in the pass is therefore wrapped:

```js
let dispatched;
try { dispatched = await resolveAdvisoryRung({…}); }
catch (err) { return await finishPass(fail(state, "advisory-model-unresolved")); }
if (dispatched.kind === "dispatch-error") { … return await finishPass(failNoReason(state, err)); }
```

`failNoReason` is the FSPEC §2.6 row-4 shape: status `failed`, **no** reason code, the error's
message pushed onto §8.4's `dispatchLog` for the report body. It is a distinct helper from `fail`
precisely so that "no reason code" is a named intention in the source rather than an omission a
future edit repairs by inventing a code — which would breach REQ §4b until ER-2 lands.

### 10.3 The failure table

| # | Failure | Mechanism | Observable |
|---|---|---|---|
| 1 | Log absent / unreadable | `_readFile` ⇒ `null`; `classifyCorpus` treats it as empty text | every basename un-consolidated; empty datum ⇒ `no-cadence-datum` |
| 1a | **Corpus unlistable** — `_git(["ls-files", …])` returns `{ok:false}` (§7.1) | `enumerateCorpus` ⇒ `{unlistable: true, detail}`; `main` calls `failNoReason` | `failed`, **no** reason code (vocabularies §1 at 1.4 has no row for it, and §1.3 forbids minting one), the pathspec and `stderr` in the report body. Never `no-op`: an unlistable corpus and an empty one are different claims, and only the latter may advance the cadence datum |
| 1b | **Every enumerated body unreadable** — `enumerateCorpus` succeeds and returns ≥1 basename, and `_readFile` ⇒ `null` for **every** one of them | §7.1's omission applied to every member: each is omitted from the consumed pair, so `state.consumed` is empty and no promotion can be derived | `no-op` — AC-1.4's **third** cause (REQ §4b, `REQ-…:625-631`) — with **no** reason code (none is minted for unreadability; vocabularies §1 at 1.4 has no row) and the consumed pair rendered **empty**. Every enumerated basename stays un-consolidated, still counts toward AC-1.2's volume trigger, is named in the report body as unreadable, and is retried next pass (§10.4). Distinguishable from a quiet week in enumerated values alone, per REQ §4b: here AC-7.1's consumed-by-basename list is empty **while** the un-consolidated set is non-empty; a quiet week has both empty. Not row 1a: there the *enumeration* failed and the corpus size is unknown, which must never read as `no-op`; here the enumeration succeeded. Consuming nothing, it advances the same streaks AC-1.4's first cause does, since AC-1.4 keys streak advance on consumed-set emptiness and never on the `no-op` label |
| 2 | Log truncated mid-block | §7.1 step 3's open-span-to-EOF rule | consumption never lost |
| 3 | Unparseable log row | `mintPassId` / `cadenceDatum` skip it | derivation never aborts |
| 4 | Marker present and **unparseable** — either **empty** (a write truncated mid-take) or a line that is neither `IN-PROGRESS:` nor `RELEASED:` | `_checkFile` ⇒ `{ok:true}` or `{ok:false, reason:"file_empty"}`, both of which are `present` (§7.3 decision 2) ⇒ `markerVerdict` ⇒ `reclaim` | `reclaimed-stale-lock`, abandoned id `unknown`. This is FSPEC §4.2's **fifth** data row — *"Present but **empty**, or a line that is neither form"*; the fourth is the stale `IN-PROGRESS:` reclaim row, and the two are named by their row text rather than by line, because both have already drifted twice and **E-11** in full — **both** arms reachable, because §4.1's `RELEASED:` sentinel (**BR-14a**) is what keeps a released marker out of this row: it parses, and **E-11b** sends it to `free` with no reason code. Falsified by **AT-M3**'s two fixtures — (a) the empty marker, (b) the non-`IN-PROGRESS:`/non-`RELEASED:` line — held in the same case against **AT-M11**'s two `RELEASED:` fixtures, which must record neither reason code at either age; without that pairing an implementation that reclaims on every take passes AT-M3, and one that never reclaims passes AT-M11 |
| 5 | Marker held and fresh | `refuse` | `refused` + `consolidation-in-progress`; no consumed pair, no commit |
| 5a | **Marker take did not land** — read-back absent, unparseable, or another pass's `passId` (§7.3) | `takeMarker`'s read-back conjunct; `rtWriteFile` (`runtime-adapter.js:802-811`) reports nothing, so the write alone is not evidence | `refused` + `consolidation-in-progress`; no consumed pair, no commit; the AT asserts the terminal status **and** the marker file's content on disk |
| 6 | Neither rung resolves | §10.2's `catch` | `failed` + `advisory-model-unresolved` |
| 7 | Dispatch error (any dispatch) | §10.2's `kind` check | `failed`, no reason code, message in the report body |
| 8 | `_makeTempDir` ⇒ `null` | §9.1 step 1 | `api-failure`, proposal-file fallback with the full diff |
| 9 | `origin`/`pluginRepository` unresolved | `_git`/`_ghRun` `{ok:false}` | `repository-unresolved` + the configured value verbatim |
| 10 | Push or PR-create fails | `{ok:false}` with `stderr` | `api-failure` + the API's status text; auth rejections classify as `credential-unavailable` by observation, per FSPEC §6.3 |
| 11 | Head branch exists remotely | `gh pr list` finds the head, or push is rejected non-fast-forward | `branch-exists` + the existing branch and any PR for it |
| 12 | No credential and no `gh` auth | §9.2's resolution order | `credential: absent` + `credential-unavailable` + degradation |
| 13 | Git refuses the §9.4 commit | after `gitWithLockRetry` | `writes-uncommitted`; status **unchanged**; writes correct on disk |
| 14 | Nothing staged | `NOTHING_TO_COMMIT_RE` | a return, not a warning |
| 15 | `ESCALATIONS.md` absent/unreadable | `_readFile` ⇒ `null` | `no-advisory-corpus`; **no** seam proposal of any kind |
| 16 | Escalation entry missing `Feature`/`Seam` | §7.7's per-entry skip | parse notice; no count under a guessed key; read continues |
| 17 | Failure-mode record short of a field | §7.4's partial record + per-reader arm | parse notice; the pass reaches its terminal status; the record's bytes are unchanged |
| 18 | Config absent / malformed / one bad key | §7.8 | per-key fallback, reported in the body; never a reason code, never a halt |
| 19 | Two files sharing a basename | §7.1's `basenameCollisions` | one set member; the collision **reported** |
| 20 | Corpus id matching no record | §7.5's verdict input | parse notice; counts toward no verdict; no promotion invented |

### 10.4 What is deliberately not handled

- **A second pass racing the marker.** §7.3's observe-then-write take (three seam calls: check, read,
  write) cannot exclude it; the blast radius is
  bounded by append-only writes and by the PR-route carrier, and the residual consuming-repo
  duplicate is FSPEC §4.5's stated exposure. Nothing here claims to close it.
- **Recovering a corpus consumed by a pass that died at step 8** (O-C1). No vocabularies §1 field
  can express "re-consume these", and inventing a record type would breach REQ §4b.
- **An enumerated LEARNINGS whose body cannot be read is re-offered on every pass until the
  operator fixes it.** REQ §4b decides it is omitted from the consumed pair (§7.1), so it stays in
  the un-consolidated set, keeps counting toward AC-1.2's volume trigger and is drawn again next
  pass. That is a **retryable** residue, not a cleared one, and it is operator-visible twice over:
  the hook nudges on the basename, and every pass's report body names it as an entry it could not
  read. It is accepted rather than closed because the remaining population — a permissions error or
  a mid-pass unlink — has a fix at the source that no pass can perform, and the alternative
  (consuming it anyway) biases REQ-CONS-05's falsifiability loop in one direction, which REQ §4b
  refuses. §13.3 carries the observation that would falsify the "transient fault" premise this
  acceptance rests on. What is accepted here is only the *residue* — the entry re-offered until the
  operator fixes it. The corpus-wide consequence, a pass that could read nothing terminating `no-op`,
  is **handled, not accepted**: it is §10.3 row 1b, with a case in §12.2.
- **Clone removal failure.** §9.1 issues no removal, so there is no failure to handle.
- **The two enumerations disagreeing on a git-visibility edge case.** §7.1 enumerates the pass's
  corpus with `git ls-files --cached --others` minus `ls-files --deleted`; the hook keeps `glob.glob`
  (`CORPUS_GLOBS`, `nudge-consolidation.sh:60-61`), which does not consult git. **The two classes this
  section previously accepted are now closed, by REQ §3.1 step 1 rather than by this layer** — see
  *What the REQ decided, and what it cost* below. One class survives and is accepted here:

  **A LEARNINGS file inside a nested git repository** is in the **hook's** set and not the pass's.
  `glob.glob` walks the filesystem and sees it; `ls-files` does not descend into another repository's
  worktree, and reports neither its tracked nor its untracked contents (measured on a scratch tree: a
  `docs/nested/` holding its own `git init` and one `LEARNINGS-nested.md` is returned by `glob.glob`
  and by neither `--cached` nor `--others`). The operator-visible residue is the same shape class (i)
  used to have — a nudge no pass can clear — but the population is far smaller and is not something
  the REQ's evidence argument reaches: a LEARNINGS inside a vendored or nested repository is not this
  repository's record of its own work. Closing it would mean teaching the hook to *exclude* nested
  repositories, i.e. putting a `git` invocation on a `SessionStart` path that must also work in a
  non-repository and with no git on `PATH` — the same shipped-hook robustness cost this feature
  declined before, and declines again, for a rarer class.

  **Dropping the flag does not re-admit `docs/discarded/`, and that is why REQ's answer was cheap to
  absorb.** An earlier draft of this bullet said that dropping `--exclude-standard` "re-admits the two
  `docs/discarded/` directories §7.1's `:(glob)` anchoring exists to exclude". That was **false, and
  it contradicted §7.1 point 2 of this same document**, which says correctly that the exclusion is
  performed by `:(glob)`. Measured at HEAD, the shipped call —
  `git ls-files --cached --others -- ':(glob)docs/*/LEARNINGS-*.md'
  ':(glob)docs/completed/*/LEARNINGS-*.md'` — returns the **same five** paths the flagged call
  returned and **zero** under `docs/discarded/`; it is dropping `:(glob)` that re-admits them (seven
  paths). The two are independent, and only one of them excludes `docs/discarded/`. Had they not been
  independent, absorbing REQ §3.1 step 1 would have cost this document the one exclusion the REQ
  names by name.

  **What the REQ decided, and what it cost.** Both former classes were handed upstream as an erratum,
  and REQ v2.1 answered both in §3.1 step 1. The answers, and this document's absorption of them:

  - **Former class (i) — the ignored LEARNINGS — is closed by dropping `--exclude-standard`.** REQ
    decided that a `.gitignore`d LEARNINGS *is* corpus, on the nag-that-never-quiesces argument: the
    hook cannot see `.gitignore`, so keeping the flag left an operator nudged forever about a file
    the pass was forbidden to consume. §7.1 drops the flag.

    **The argument that lost, kept as history because it is the real price.** An ignored LEARNINGS is
    a file its own repository has said is not part of its record, and consolidating it promotes
    evidence into `DOMAIN-CONSTRAINTS.md` from a source no reviewer will ever see in a diff. That
    cost is now *paid*, not avoided, and it is worth a reader knowing it was weighed rather than
    overlooked. REQ weighed it and chose convergence, and the asymmetry this section identified is
    why that direction was the convergent one: the hook has **no** `--exclude-standard` to drop, so
    dropping it on the JS side was the only edit that could make the two sides agree.
  - **Former class (ii) — the staged-but-deleted LEARNINGS — is closed by the `--deleted`
    subtraction.** REQ decided that an index entry with no working-tree file is *not* corpus, since
    it has no body and is therefore evidence about nothing. This section previously called the class
    "genuinely not closable at this layer", reasoning that closing it meant teaching the hook
    `git ls-files`. **That reasoning was wrong in one direction and is corrected here:** it assumed
    convergence had to be reached by widening the *hook*, when the class is closed by narrowing the
    *pass* instead — one extra `ls-files --deleted` read on a side that already shells out to git,
    at no cost to the hook's `SessionStart` robustness at all. The cost that argument correctly
    identified applies to the surviving nested-repository class, where the hook really is the side
    that would have to change; it did not apply here.

  The residue accepted meanwhile is now one class, not two, and it is stated above. It is not a
  correctness divergence — the pass consumes only what its own enumeration returned — and no *further*
  class can arise silently, because §7.1's literal pins make the divergence set derivable from the two
  enumerations' own text. This is why T-08 is narrowed to the **predicate** (§12.2) and why §13.1
  row 6 says which half AT-P7 holds equal.

## 11. Test strategy

### 11.1 Levels

| Level | What it ranges over | Seams | Where |
|---|---|---|---|
| **L1 — pure function** | every §7 function, called directly on literal inputs | none | `consolidationPredicate.test.js`, `consolidationIdentity.test.js`, `consolidationEffectiveness.test.js`, `consolidationParse.test.js` |
| **L2 — orchestration** | `main()` end-to-end with doubles for every seam; the §12 acceptance tests live here | all doubled | `consolidationPass.test.js`, `consolidationRoute.test.js`, `consolidationCredential.test.js` |
| **L3 — build, artifact & source text** | the bundle is emitted, is in sync, carries no `import(`, and its `meta` is first and literal; plus the source-text oracles (§3.3's `.gitignore`, §11.3(e)'s adapter prompts, §12.3's AT set-equality) | none | the **await-audit and bundle** assertions extend the shipped `runtimeBundle.test.js` in place (they edit its own `AWAIT_SCAN_SOURCES` and `AT19_SEAM_NAMES` sets); the feature-scoped source-text oracles live in `consolidationBuild.test.js` and `consolidationTraceability.test.js`, so this feature adds no row to a shipped suite that is not a set member of one it already owns |
| **L4 — differential** | the JS predicate against the shipped `nudge-consolidation.sh` over one fixture table | a real `python3`/`bash` subprocess | `consolidationHookParity.test.js` (AT-P7). The same file also carries two non-AT cases: one **L3** source-text case — §7.1's pin (b), the hook-side enumeration pin over the `CORPUS_GLOBS` declaration — which runs whether or not the L4 rows degrade, since it shells out to nothing; and one **L4** pathspec-semantics case (below) |
| **L5 — property** | the four T-09 components | none | `consolidationProperties.test.js` |

L3 is a **set over two axes**: the sources scanned (`AWAIT_SCAN_SOURCES` gains
`consolidate-learnings.js`) and the seam names scanned for (`AT19_SEAM_NAMES` gains `_envPresent`
and `_makeTempDir`) — §11.3(c). L3 also carries §11.3(e)'s adapter-prompt assertion and §3.3's
`.gitignore` text assertion, both source-text checks in the shape `runtimeBundle.test.js` already
uses.

L4 is the only level that shells out. It never touches the repository's own `docs/` tree — the
differential harness writes its fixture
corpus into a temp directory and points the hook at it through `CLAUDE_PROJECT_DIR` (read into `proj`
in the hook's heredoc, immediately above the `CORPUS_GLOBS` declaration), which
is what makes the harness a pure function of an injected root (DC-04).

**One further L4 case, and why it is worth a subprocess.** Pin (a) asserts the argv the pass hands
`_git`; what makes *that particular* argv correct — that `:(glob)` stops `*` crossing a `/`, so
`docs/discarded/` is excluded by the pathspec and not by a filter — is measured in §10.4's prose and
otherwise asserted by nothing. A measurement in a document is not an oracle. So the file carries one
`(no FSPEC AT)` L4 case that runs **exactly the argv pin (a) pins** through a real `git`, and asserts
zero results under `docs/discarded/` and at least one under `docs/completed/`. It runs against a
**temp repository the case builds itself** (`git init`, three LEARNINGS files under
`docs/{f}/`, `docs/completed/{f}/`, `docs/discarded/{f}/`, `git add -A`), reached with `_git`'s
own `["-C", dir, …]` form — never against the repository under test, so DC-04 holds here exactly as
it does for the differential harness, and the assertion cannot drift as this repo's own `docs/` tree
grows. It is **outside** the differential fixture table and therefore outside the executed-row counter
below — its subject is git, not the hook, and folding it in would make `executed === TABLE.length`
false for a reason that has nothing to do with the interpreter probe.

**What that case now also covers, since REQ §3.1 step 1 decided the two classes.** An earlier draft
of this paragraph recorded a deliberate gap: the fixture was built with `git init` + `git add -A`, so
every path was reached through `--cached`, `--exclude-standard` was **inert**, and pinning the flag
half would have pinned an answer this document had declined to give. That reason has expired — REQ
decided both classes — so the gap closes rather than being carried, and the fixture gains **two
members** and **two conjuncts**:

- **An ignored LEARNINGS.** The temp repository gains a `.gitignore` naming one feature directory and
  a LEARNINGS inside it. The conjunct: that basename **is** in the result. Against a re-introduced
  `--exclude-standard` this reds through a real `git`, which is the half AT-P1's argv pin cannot
  reach — the argv pin catches the token, this catches the *behaviour* the token would change.
  **Build order is load-bearing and the case must assert it.** The `.gitignore` must be written, and
  must name the feature directory, **before** the `git add -A` above runs; otherwise that member is
  committed as a *tracked* file, `--cached` returns it, and the conjunct passes for the wrong reason —
  green while `--exclude-standard` is once again inert, which is precisely the state this member was
  added to escape. The case therefore takes one guard conjunct alongside the membership one: the
  ignored path is reported as ignored (`!!`) by **`git status --ignored --porcelain -uall`**, and does
  not appear in `ls-files --cached` output. The `-uall` is load-bearing: measured on a scratch tree
  built exactly as this fixture is (`.gitignore` naming the directory, written before `git add -A`),
  plain `git status --ignored --porcelain` — and `--ignored=matching` — collapses the ignored member to
  its **directory**, printing `!! docs/ign/`, and only `-uall` prints the file path
  `!! docs/ign/LEARNINGS-ign.md`. Transcribing the flagless command reds the guard on a correct build,
  and the cheapest wrong repair is to weaken it back to the state this member was added to escape.
  `git check-ignore -v {path}` is the equally acceptable alternative, and answers for the exact path:
  exit 0, naming the matching pattern (`.gitignore:1:docs/ign/`). `git ls-files --error-unmatch {path}`
  may also be used, but it is an **exit-status probe, not a listing** — measured, it exits **1** and
  writes `error: pathspec … did not match any file(s) known to git` to stderr — so a conjunct using it
  asserts the non-zero status, never an absence from stdout. A fixture whose premise is untested
  is an oracle that reports on the fixture rather than on the code.
- **A staged-but-deleted LEARNINGS.** One fixture file is `git add`-ed and then unlinked from the
  worktree. The conjunct: that basename is **not** in the result. This is the only oracle anywhere
  that runs the `--deleted` subtraction against real git rather than against a scripted double.

Both conjuncts are positive-and-negative in the sense §11.3 requires: each names a basename that must
be present alongside the one that must be absent, so neither can be satisfied by an empty result. The
case remains outside the differential fixture table and the executed-row counter — its subject is
still git, not the hook.

**A skipped L4 is distinguishable from a passing one.** The hook's own `PY_BIN` probe (the
`for cand in python3 python py` loop and the `[ -z "$PY_BIN" ] && exit 0` guard after it)
degrades to a silent `exit 0` when no usable interpreter is found, and a differential test that
inherits that degradation silently is the test that will be skipped on the platform where it
matters. So the suite uses jest's `test.skip` — which reports as **skipped**, not passed, in the run
summary — and emits a `console.warn` naming the probed candidates (`python3`, `python`, `py`) in the
branch where it finds none. Answering the reviewer's question directly: the notice is the jest
reporter's skip line plus that warning, and CI's `Unit tests` job surfaces both.

An earlier draft added a second assertion here — "the probe either found an interpreter **or**
recorded the notice" — and it is **withdrawn**: the harness itself emits that notice in the branch
where the probe found nothing, so the disjunction is a tautology over the harness's own control flow
and can only pass. It is replaced by the one thing in this area that is falsifiable: **the count of
executed differential rows is either the full fixture table's length or exactly zero**, asserted
unconditionally. All-or-nothing is the real invariant — a harness that silently ran *some* rows
(a mid-table interpreter failure, a fixture that threw and was swallowed) is red, where the
disjunction was green.

**Where that count comes from, since only one of the two answers is an oracle.** It is **not** read
from the fixture table's length — that is derivable from the table itself and would be
self-satisfying. The harness holds a counter that each row increments **as its last statement, after
its own assertions have passed**, and the disjunction `executed === TABLE.length || executed === 0` is
asserted by its **own top-level `test()`, declared last in the file — never an `afterAll`**. That
placement is load-bearing and the reviewer's question is what surfaced it: jest does not run a
block's `beforeAll`/`afterAll` when every test in that block is skipped, so an `afterAll` form would
leave the all-skip world's `executed === 0` **unobserved** rather than asserted — the one world the
sentence below claims it covers. A plain `test()` is declared unconditionally and runs in both worlds,
which is what makes `0` an outcome the suite states rather than one it merely does not contradict.
Declaring it last is what makes its reading of the counter come after every row that increments it.
So an interpreter that dies at row 4 of six leaves `executed === 3`, which is neither, and reds; a
row that throws and is swallowed never reaches its increment, and reds; a wholesale `test.skip` of
the suite leaves `executed === 0`, which passes, which is the one legitimate all-skip case.

**The degradation is decided once, before any row runs, and it skips every row — never a subset.**
The `PY_BIN` probe is performed once at module scope; if it finds no usable interpreter the file
declares each differential row through `test.skip` and emits the `console.warn` above. There is no
"degraded probe" path on which rows still execute against a weakened comparison, which is the only
way `executed === TABLE.length` could be reached with nothing real behind it: a row either runs the
real interpreter or is not declared as a running test at all. The counter assertion itself
is **not** skipped — it is its own unconditional `test()` (above), so it runs in both worlds, which
is what makes `0` an asserted outcome rather than an unobserved one.

### 11.2 Test doubles — reuse first (DC-08)

| Seam | Double | Source |
|---|---|---|
| `_agent` | `makeAgentDouble({script, throwOn})` | `__tests__/helpers/advisoryDoubles.js` — already built to drive `isModelResolutionError` from a scripted rejection *message*, which is exactly what FSPEC §2.6 rows 2–4 need |
| `_git` | `fakeGit(script)` — **`seams.js`'s, not `mergeDoubles.js`'s** | `__tests__/helpers/seams.js:389`. Decided below: only this one can script two calls that share a subcommand, which §7.1's enumeration now issues |
| `_ghRun` | `fakeGhRun(script)` — **not** `passingGh` | same. `matchKey` (`mergeDoubles.js:45-60`) keys both new surfaces cleanly (`gh pr list --json url,state,body`; `gh pr create`), so `fakeGhRun` needs no change. `passingGh`'s defaults (`:93+`) answer only the six shipped Phase MERGE surfaces, so the consolidation suites build their **own** script map rather than widening it, and `GH_SURFACE_NAMES` (`:181` — `Object.keys(SURFACE_KEY_BY_NAME)`) does **not** grow: it is the set `passingGh` is obliged to answer, and this feature adds no obligation to that helper |
| `_readFile` / `_writeFile` / `_appendFile` / `_checkFile` | `fakeFs(initialContents, opts)` | `__tests__/helpers/seams.js` |
| `_listFiles` | `fakeListFiles(spec)` | same — wired for protocol completeness only. **No consolidation test drives it**: the corpus is enumerated through `_git` (§7.1), precisely because the double is more capable than the seam it doubles. A test that reached for it would be re-introducing the DC-07 hazard §7.1 removes |
| clock, sleep | `fakeNow`, `FIXED_NOW_MS`, `fakeSleep` | `mergeDoubles.js` |
| PRNG | `seeded`, `resolveSeed` | `driftGenerators.js` — the repo's one seeded-PRNG library |

**Which `fakeGit`, decided — the repo ships two and only one can express this feature's enumeration.**
Since §7.1 issues **two** `_git` reads whose argv both begin `ls-files` (the `--cached --others`
enumeration and the `--deleted` subtraction), a double keyed by the git *subcommand* returns the same
value to both. `mergeDoubles.js`'s `fakeGit` is exactly that: it computes `key = argv[i]` after
skipping `-C`/`-c` pairs and looks up `script[key]` (`mergeDoubles.js:200-207`), so both calls hit the
one `ls-files` entry and an unscripted key returns `{ok:true, stdout:"", stderr:""}` (`:209`). Either way the
`--deleted` set equals the enumeration set and **the corpus is always empty** — which reds AT-P1's
conjuncts 2 and 3 on a *correct* implementation, and silently greens any absence-shaped assertion in
every L2 fixture that scripts a listing (the AC-1.2 volume count, the consumed pair, the report body's
unreadable-basename case, §12.2's whole-pass lifecycle rows). That is a double defeating the oracles,
not an oracle defect, and the cheapest wrong repair is to weaken the assertion.

`seams.js`'s `fakeGit` (`:389`) already has the capability and needs no edit, which is why this row is
re-pointed rather than a third factory added or `mergeDoubles.js` widened: its `script` may be a
**function** `(argv, callIndex) => result` (`:405-406`, the `typeof script === "function"` branch) or
an **array** indexed per call with the last entry repeating (`:407-408`, the `Array.isArray(script)`
branch, `script[Math.min(index, script.length - 1)]`), alongside the same subcommand-map form for
tests that want it
(`:409-413`); and it records `.calls` / `.invocations` / `.commands` / `.callCount` (`:421-426`),
which is precisely what AT-P1's two-argv pin and the subtraction conjunct read. Corpus fixtures use
the **function or array form**, never the map form, and the reason is a rule rather than a preference:
the map form cannot distinguish two calls sharing a subcommand, so a corpus suite that reaches for it
re-introduces the always-empty corpus above. Clone-domain tests (§9.2) must also use the function
form, because `seams.js` keys its map on a raw `args[0]` and does **not** skip the `-C`/`-c` pairs
those calls lead with — the one respect in which `mergeDoubles.js`'s version is the more convenient of
the two, and it is not the respect this feature needs. This choice is consistent with a commitment the
document already made elsewhere: T-13 drives `asAsync(fakeGit)`, and `asAsync` wraps the **sync**
doubles `seams.js` ships — `mergeDoubles.js`'s factory is `async` and returns a `{calls, _git}` pair
rather than a callable (`:193-211`), so it could not have been the subject there either.

**Two new factories only**, both in `__tests__/helpers/consolidationDoubles.js`, because the seams
they double do not exist yet: `fakeEnvPresent(presentNames: Set<string>)` and
`fakeMakeTempDir(path | null)`. That module also holds this feature's fixture builders (a log
builder, a corpus builder, an `ESCALATIONS.md` builder) so no test file constructs a log by string
concatenation — the same single-canonical-double rule `seams.js` and `advisoryDoubles.js` state in
their own headers.

**One wrapper, not a third factory: `asAsync(double)`.** `seams.js`'s doubles are **sync** — that is
stated in its own header as the central hazard, and it is what makes an un-awaited seam call
invisible to every L2 suite (§10.1). `asAsync` takes any of them and returns a function that
**defers both the recording and the resolution onto a macrotask** and returns the promise:

```js
const asAsync = (fn) => (...args) =>
  new Promise((resolve) => setTimeout(() => resolve(fn(...args)), 0));
```

**The deferral must be a macrotask, and specifying it as a microtask would have shipped a test that
can only pass.** A microtask deferral (`Promise.resolve().then(…)`, an `await` inside the wrapper)
cannot survive a caller that awaits at all, because awaiting is itself microtask-scheduled: on the
broken implementation the wrapper's continuation is queued *before* the test's `await main()`
continuation, so it runs first, the write lands, and the assertion is green. Timer callbacks run in
a later phase of the event loop than the whole microtask queue, so the discrimination becomes exact:

| Implementation | What the test's `await main()` continuation sees |
|---|---|
| correct (`await appendTerminalRow(state)`) | `finishPass` suspends until the timer fires and the double records; `main()` resolves **after** the write ⇒ terminal row **present** |
| broken (`appendTerminalRow(state)` un-awaited) | the pending promise is dropped, `main()` resolves on a microtask, the assertion runs **before** the timer fires ⇒ terminal row **absent** ⇒ RED |

Recording is deferred with resolution, not performed eagerly, for the same reason: `appendTerminalRow`
is a void write whose only observable *is* the double's accumulated text, so a wrapper that recorded
synchronously and deferred only its result would leave the missing `await` invisible by construction.

**Two hygiene constraints the wrapper's timers impose, since they change whether the suite is quiet
rather than whether it discriminates.** On the *broken* implementation the assertions run while a
`setTimeout` is still pending, so (i) every double instance is constructed **per case**, inside the
case body, never at module scope — a late timer must never be able to write into a double a later
case reads; and (ii) the case drains the loop before it returns — and the drain is in a **`finally`**,
not after the assertions:

```js
try { /* …assertions… */ } finally { await new Promise((r) => setTimeout(r, 0)); }
```

An earlier draft specified it as "after its assertions", which put it on the one path where it
cannot run. A timer is still pending only on the **broken** implementation, which is exactly the world
the mandated mutation check below puts the suite in — and there the first assertion throws, so a
trailing drain never executes: present in every run that did not need it, absent from every run that
did. The `finally` form runs in both. (jest's fake timers with `runAllTimers()` in an `afterEach` are
an equivalent answer; the `try/finally` is chosen because it keeps the case self-contained and does
not change the macrotask semantics the table above depends on.) Neither constraint changes the
discrimination in that table; both are required of the PLAN task that writes the row.

**The row owes its own mutation check.** `consolidationLifecycle.test.js` is the only oracle for an
invariant §10.1 states nothing else guards, so the PLAN task that writes it must demonstrate it
fails: delete one `await` inside `finishPass`, expect RED, restore. A test whose falsifier has never
been observed is a claim.

Scope: it exists for exactly one row — §12.2's T-13 await-discipline test, which drives
`asAsync(fakeAppendFile)` / `asAsync(fakeWriteFile)` / `asAsync(fakeGit)` and asserts **after**
`main()`'s promise resolves. No other suite uses it: the rest deliberately keep the sync doubles,
because their subject is the pass's logic, not its await discipline. (Only the *intra*-`finishPass`
`await`s are behaviourally observable this way — §10.2's two `return await finishPass(…)` call sites
are a stack/`try`-semantics improvement, since an `async` function's `return p` already adopts `p`.
T-13 is scoped to the observable defect and does not claim the other two.)

### 11.3 The oracles that need a mechanism, not just an assertion

Six assertions the FSPEC states cannot be written as a plain `expect` and are specified here.

**(a) The seam-verb spy (AT-Q7, AT-Q7b, AT-Q7c).** A recording wrapper around `_git` and `_ghRun`
that classifies each call with **both** of the module's own classifiers (§9.3) — `resolveSeamDomain`
for the bin and `resolveSeamVerb` for the verb — passing the clone directory the test's
`fakeMakeTempDir` returned as `cloneDir`. The spy computes neither half itself; that is the point of
exporting the domain function, and it is what puts the `clone` call (which carries no `-C` prefix)
in the clone domain by the contract's own rule rather than by a special case in test code.

The oracle is then **four** set assertions: **partition** — every observed call is classified into
exactly one domain, and the union of the three observed sets equals the set of all observed calls
(without this, a call that falls out of the partition is exempt from containment); **containment**
`observed ⊆ permitted` per domain, universally; **obligation** `obliged ⊆ observed` per domain, on
the Given that obliges it; and the two `∅` equalities of AT-Q7c. Comparison is over a `Set`, never a
multiset — AT-Q2's three commits are three occurrences of one verb. AT-Q7b's supplementary source
check greps the module's own source for a merge verb and is never the sole evidence.

**(b) The vocabulary set-equality (AT-L5).** The harness collects the enumerated-class values a
fixture set produced and compares them against a transcription of vocabularies §1 at `Version` 1.4
held in `consolidationDoubles.js` as a literal table. Both directions are asserted. The free-form
class is excluded **by name**, so narrowing the domain cannot silently drop a direction. Because
§6.4's frozen catalogues are the module's own source of those values, a third assertion is cheap and
included: catalogue array ⊆ §1 transcription and vice versa, which fails at build time rather than
after a fixture happens to exercise a branch.

**A fourth leg reads the authority file itself**, and without it the first three are two copies
compared with each other. The module's frozen arrays and the doubles' literal table are **both**
transcriptions; a future edit that widens the catalogue and updates the doubles' table in the same
commit — the natural thing to do when a test goes red — passes every assertion above while
`pdlc-consolidation-vocabularies.md`, which is the authority and is version-pinned and
change-controlled, is never consulted. §6's premise is "transcribed, never widened", and a test that
cannot observe the thing transcribed *from* cannot falsify it.

The harness therefore parses the authority file's §1 table — a markdown table with a stable grammar
— and asserts **three-way** set equality per catalogue: module catalogue ≡ doubles' transcription ≡
authority file, in both directions, plus a pin that the file's `Version` cell still reads `1.4`
(if it does not, the pinned transcription is stale by definition and the test must be re-read, not
re-greened). Per DC-04 the parser is a pure function of an injected `root`, so it can probe two
roots in one process. This shape is reusable: every feature that transcribes a project-level shared
reference has the same two-copies problem, which is why the finding behind it is `Cross-Feature`.

**(c) The `await` audit.** `seams.js`'s header names the sync-double/async-adapter asymmetry as the
central hazard: a missing `await` passes L1 and L2 and fails only in production. The compensating
control is the shipped one — the L3 suite's source scan, extended to
`consolidate-learnings.js`: every call to an injected seam identifier must be syntactically
`await`ed. This is a static check over the module's own text, not a runtime assertion, because a
sync double makes the runtime one unfalsifiable.

**The audit is a set over three axes, and all three must grow.** Extending only the source set leaves the
scan green on exactly the seams this feature invents: what it scans *for* is a frozen name list,
`AT19_SEAM_NAMES` (`__tests__/runtimeBundle.test.js:215-223`), whose members are `_agent`,
`_readFile`, `_writeFile`, `_appendFile`, `_checkFile`, `_listFiles`, `_git`, `_checkCi`,
`_mergeWorktree`, `_recordQueueRow`, `_rebaseOntoDefault`, `_dodVerifyLoop`, `_raisePrAndVerifyCi`,
`_ghRun`, `_runCommand` — and neither `_envPresent` nor `_makeTempDir` is on it. So §5.1's "every
seam call is `await`ed without exception" would be enforced for every seam **except** the new ones,
and `RLH-SCAN-01` (`:626`) would report green over them. This feature therefore adds
`"consolidate-learnings.js"` to `AWAIT_SCAN_SOURCES` (`:1040`) **and** `_envPresent` /
`_makeTempDir` to `AT19_SEAM_NAMES`, in the same commit. `_now` is deliberately not added: it is
sync by contract (§5.6(b)) and awaiting a number is noise, not discipline.

**The third axis is the bundle set, and missing it exempts the new artifact from every L3 suite.**
`AWAIT_SCAN_SOURCES` and `AT19_SEAM_NAMES` govern the *source* scan; the *artifact* suites are driven
by a separate two-member constant, `BUNDLES = ["orchestrate-queue.bundle.js",
"orchestrate-dev.bundle.js"]` (`__tests__/runtimeBundle.test.js:26`). It is the `describe.each` /
`it.each` key for the launcher-constraint suite (`:503`), the structural suite (`:509`), the
sole-output-directory check (`:549`), the `RLH-AT-19` no-`process`/no-`fetch` scan (`:1044`) and the
drift-perturbation suite (`:1290`), and it is spread into the artifact list at `:1584`
(`ARTIFACTS = [...BUNDLES, "pdlc-cli.mjs"]`). A `consolidate-learnings.bundle.js` that is built,
manifest-stamped and shipped but never added to `BUNDLES` is therefore exempt from **all six** — it
could carry an `import(`, a non-first `meta`, a `process` reference or a stale sha and every one of
those suites would stay green, because none of them ever names it. This feature adds
`"consolidate-learnings.bundle.js"` to `BUNDLES` in the same commit as the other two axes. The
falsifier for the omission is `consolidationBuild.test.js`'s manifest↔suite check (§12.2): the
`BUNDLES` constant, read from `runtimeBundle.test.js`'s own source text, asserted **set-equal** to
the `.bundle.js` artifact ids in `distribution-manifest.json` — set equality rather than containment,
because a surplus member is as much a drift signal as a missing one, and the `pdlc-cli.mjs` row is
excluded by extension (`.mjs`, not `.bundle.js`) exactly as `:555`'s shipped comment already records.

**(d) The `parseAdvisoryConfig` parity test.** §7.8's duplication is pinned by a table-driven test
that runs both parsers over the same five observed states and asserts the same classification, so a
future change to one is a red test rather than a silent divergence.

**(e) The adapter-prompt assertion for the widened path contract (§5.6(a)).** `rtWriteFile` is an
agent prompt, so its behaviour cannot be executed in a unit test — but its **text** can be read, and
the repo already reads `runtime-adapter.js`'s source in a test (`runtimeBundle.test.js:1573-1580`
lists it in the C0-control-byte scan's `SOURCES`; that precedent establishes *reading the file*, not
matching prompt text, so the prompt-text match is a new shape — stated plainly rather than
borrowed). The assertion is scoped to **`rtWriteFile`'s prompt only**, and has two conjuncts:

1. the widened absolute-path clause of §5.6(a) appears verbatim inside `rtWriteFile`, so a future
   edit that reverts it to the bare "relative to the repository root" reds rather than silently
   breaking every clone write;
2. the string `"relative to the repository root"` occurs in `runtime-adapter.js` **exactly once** —
   the count is the falsifier for the opposite mistake, someone "harmonising" `rtReadFile` by adding
   the clause there (§5.6(a) records why that would be gratuitous).

There is deliberately **no** assertion over `rtReadFile`'s prompt text: it carries no
path-resolution clause today and gains none, so an assertion there could only pin text that does not
exist — which reds on a correct tree and gets "fixed" by deletion. This is the L3 counterpart of the `_envPresent` prompt review
in §11.6: a capability the feature *invents* is not in the same class as "the real `gh` accepts
these flags", so it does not get that section's exemption.

**(f) AT-P7, the differential predicate harness (T-08).** The harness writes one fixture corpus into
a temp directory, points both implementations at it (the hook through `CLAUDE_PROJECT_DIR`, read into
`proj`;
the JS through `classifyCorpus` over the same enumerated basenames and log text), and compares the
**sets**. The hook's set is read from the `PDLC_PENDING:` stderr line §7.1 adds — the shipped hook
emits only a count, and only above `THRESHOLD = 5` (the `THRESHOLD` binding and the `n >= THRESHOLD`
test), which is blind on every
discriminating fixture. Three conjuncts per fixture row, so the oracle is positive rather than
invariance-only: the JS set equals the hook set in both directions, **and** each equals the expected
set transcribed literally in the fixture table — without the third, two implementations that both
return `∅` agree perfectly. The table covers the truncated block (E-04), the stray closer (E-05),
the basename collision (E-09), the legacy/block boundary, one row above the threshold so the
shipped `additionalContext` count is also compared, and a **zero-corpus** row that asserts
`PDLC_PENDING:` is emitted with an empty value (§7.1's relocated early exit) — so `∅` is read
positively rather than inferred from silence. L4 degrades exactly as the hook does when no
usable Python interpreter is found (the `PY_BIN` probe loop and its guard); §11.1 states the recorded
notice.

**What this harness does not falsify, stated rather than implied.** Feeding both sides the same
basename list holds the **predicate** equal and holds the **enumeration** equal by construction —
so the enumeration pair (`git ls-files --cached --others` minus `--deleted` on the JS side,
`glob.glob` over `CORPUS_GLOBS` on the hook's) is outside AT-P7's reach entirely. That is deliberate, and it is
the reason the fixtures are fed rather than enumerated: the fixture temp directory is not a git
repository, so `enumerateCorpus` could not run there without a `git init` and a staged index, and
even with one the two enumerations are **not** equal in general — §10.4 records the two divergence
classes that make an equality assertion red on correct code. §12.2's T-08 row is narrowed to the
predicate to match, and §13.1 row 6 names which half is held. The residual exposure is an operator
nudge that disagrees with what a pass will consolidate; it is a reporting divergence, never a
correctness one, because the pass consumes only what its own enumeration returned.

**Out of *this harness's* reach is not out of every test's reach.** The enumeration half is held by
the two literal pins §7.1 specifies, and they are deliberately **not** both this file's: pin (a) is
AT-P1's **L1** argv conjunct on the JS side, and it lives with AT-P1 in
`consolidationPredicate.test.js`, because the thing asserted is the array `enumerateCorpus` hands
`_git` at runtime, which a source-text read could not see. Pin (b) is the **L3** source-text read of
the hook's `CORPUS_GLOBS` declaration, and that one is this file's, because its subject is the two
implementations' relationship. (An earlier draft of this paragraph claimed both — the correction is
argued in §7.1 and reflected in §11.1, §12.2's T-08 row and §12.3.) They
do not assert the two sets are equal (they are not, in general); they assert the two *questions* are
the ones §10.4 computed its divergence classes from, so a later edit to either side cannot introduce
a third class silently. "Held by inspection" would have been the wrong answer and is not the one
given: an equality this harness cannot run is replaced by two pins it can.

One consequence for the fixture table: `classifyCorpus` is driven directly, not through
`enumerateCorpus`, so **no fixture may be written that depends on git visibility** (an ignored file, a
staged-but-deleted file, a nested repository). Such a fixture would assert a divergence the harness
cannot observe and would read as coverage of the enumeration half. Note that the first two are no
longer *divergences* since §7.1 absorbed REQ §3.1 step 1 — they are decided corpus rules — but the
rule stands unchanged and for the same reason: this harness drives `classifyCorpus` directly, so it
cannot observe any git-visibility fact whatever. Their oracles live in §11.1's L4 git case, which
can.

**That rule lives in the code, not only here.** It is written into the header of
`consolidationDoubles.js`'s fixture builder — the same place `seams.js` and `advisoryDoubles.js`
state their own single-canonical-double rules — because a constraint a later contributor must not
violate is one they must be able to read where they are working. The TSPEC states the reason; the
header states the rule.

### 11.4 Property strategies (T-09)

One strategy per parameterisable component, all drawn from `driftGenerators.js`'s `seeded`/`resolveSeed`
— **no property-testing dependency is added**, matching the shipped decision recorded in that file's
header.

| Component | Generator | Invariant |
|---|---|---|
| §7.1 two-region predicate | random interleavings of openers, closers, stray basenames and prose, over a random enumerated corpus | every basename inside any block is consolidated; the predicate is total (never throws) and every enumerated file lands in **exactly one** of the two sets |
| §7.2 `passId` | a random multiset of rows, a random subset made unparseable | the minted id is strictly greater than every parseable `{today}` id; unparseable rows change nothing; the result is invariant under row permutation |
| §7.8 config parse | a random subset of keys corrupted by type | every uncorrupted key keeps its configured value; every corrupted key takes its documented default; `invalidKeys` is set-equal to the corrupted subset |
| §7.7 escalation count | a random entry sequence with a random subset missing `Feature` or `Seam` | the total attributed count equals the number of entries carrying both rows; no count is attributed to a key absent from the input |
| §7.3 `parseMarker` | random text: a random mix of (i) well-formed lines built from a drawn verb ∈ {`IN-PROGRESS:`, `RELEASED:`}, a drawn `passId` and a drawn ISO-8601 instant, (ii) near-misses — right verb wrong arity, wrong verb, a well-formed line plus a second line, leading/trailing **non-whitespace** junk, interior padding within the line — and (iii) arbitrary strings, plus the two edge inputs `""` and `null`. **Surrounding whitespace is drawn deliberately into the *well-formed* arm (i), not the near-miss arm**, per §7.3: a well-formed line wrapped in leading/trailing newlines or spaces must still parse, which is what stops the property reding on a conforming trimming implementation | the parser is **total** (never throws, on any input including `null`); it returns non-`null` **iff** the text, once trimmed, is exactly one line matching one of the two accepted forms — so the property carries both directions and cannot be satisfied by a parser that returns `null` always or one that accepts everything; and on a well-formed line the returned `state`, `passId` and `at` **round-trip the generated triple**, which is what stops the two verbs being conflated |

The fifth row is `parseMarker`, added at v2.2 on the te-review round-10 finding: v2.0 widened its
grammar from one accepted line to two plus a `state` discriminant (§7.3), which made "anything else
yields `null`" a materially wider claim than it was when this table was first approved, and a
two-form parser is a parameterisable component under T-09 on its face. It is stated as an **iff**
for the reason the two rows below are: a one-directional totality claim is satisfied by a parser
that returns `null` on everything.

Two further properties are added beyond T-09's five because they are the FSPEC's determinism claims
and an example cannot range over them. **Order-invariance alone is not an oracle** — a function
returning a constant, `[]` or `null` satisfies it — so each pairs the invariance with a positive
conjunct on the same path, the shape the five rows above already have:

| Component | Generator | Invariant **and** positive conjunct |
|---|---|---|
| §7.4 `mergeProposals` | a group of ≥2 proposals sharing `(failureModeId, action)`, in a random permutation. The shared id is **derived**, never assigned: the generator draws one random `(phase, artifact)` pair and computes `failureModeId(phase, artifact)` from it, so the property ranges over inputs a pass can actually construct. Assigning the id independently would admit `(id, phase, artifact)` triples no pass produces, and a counterexample there is not a defect | the fold is invariant under permutation, **and** for at least one ordering the folded proposal's `kind`, `artifact`, `target`, `elidedKinds` and `elidedArtifacts` equal values transcribed literally from §7.4's fold table |
| §7.5 `effectivenessTable` | two passes' records appended in a random order, dates unchanged | the table is invariant under that order, **and** the row count equals the number of distinct ids, **and** each row's `verdict` equals the arm §7.5 assigns it |

The subject of the first is `mergeProposals`, not `failureModeId`: §7.4's own invariance argument
("byte order is total over distinct strings, and a group's members are distinct by construction")
is about the **fold**, and `failureModeId(phase, artifact)` takes no proposals at all, so order
cannot be a variable of it. An earlier draft named the wrong function.

### 11.5 Where the FSPEC's deferrals land

FSPEC §14.5's register (LD-1 … LD-5) is PROPERTIES-owned per `DEC-LAYER-01` and passes through this
layer unchanged. This TSPEC states only **where** each will be written, so the PLAN can name a task:
LD-1 (three `artifact` arms), LD-4 (`passId` arm) and LD-5 (the four remaining short-record arms) all
range over `parseLogRecords`'s output and its readers, so they belong in
`consolidationParse.test.js` beside AT-F21; LD-2 (the `target`-follows clause) and LD-3
(two-action-one-subject) range over `mergeProposals` and belong in `consolidationIdentity.test.js`
beside AT-R6b. Nothing about their fixtures is decided here.

One standing caution passes through with them: no AT-A fixture may be written against the REQ's
AC-6.3 "across the consumed window" wording. FSPEC §9.5 / BR-37a is the settled contract —
`seamCandidates` ranges over **every** entry in `ESCALATIONS.md` (§7.7) — and a fixture taken from
the REQ text would red a conforming implementation.

### 11.6 What is not tested, and why

- **The producing side of the `failure-mode-id` convention** (a harvest agent copying an id). Its
  output is an LLM invocation with no reproducible result; the receive side is AT-F15/AT-F16 and the
  gap is FSPEC O-C6.
- **The real `gh` and the real network.** Every PR-route test drives `fakeGhRun`. The one thing that
  cannot be asserted this way — that a real `gh pr create` accepts the flags §9.2 builds — is
  covered the way the repo already covers `mergeCommandFor`: by an exact-string test over the
  builder's output, reviewed against the CLI's documented interface.
- **`_envPresent`'s adapter transport.** It is an agent prompt; the module-side contract (a boolean,
  fail-closed on anything unparseable) is tested with a double, and the prompt itself is reviewed,
  not executed — the same posture every other `runtime-adapter.js` transport takes.
- **`_checkFile`'s garbled-reply arm, and it is disclosed as fail-open rather than left implied.**
  §7.3 decision 2 makes `file_missing` *verdict-deciding*: it is the sole absent state, and absence
  means the marker is free. In production that reason has **two producers**, not one. `rtCheckFile`
  (`pdlc/workflows/runtime-adapter.js:817-831`) maps the agent's reply `OK` ⇒ `{ok:true}`,
  `EMPTY` ⇒ `file_empty`, and **everything else** — including a garbled, truncated or failed reply —
  to `file_missing` by fall-through (`:830`). The double does not: `fakeFs.checkFile`
  (`pdlc/workflows/__tests__/helpers/seams.js:292-306`) returns `file_missing` only when the key is
  genuinely absent. So a probe that *fails* reads at this layer as *no marker*, the pass takes the
  lock, and AC-1.3's mutual exclusion is **fail-open on that one path**. No L2 fixture can construct
  it — §5.1's `CheckReply` is a three-value union with no failure member, by design — so this is
  named here rather than tested. Two things bound the exposure and are why it is disclosed rather
  than repaired: the conflation is **pre-existing** (it is the shipped adapter's behaviour, which
  this feature drives and does not change), and it is the same posture §11.6 already takes for
  `_envPresent` — an agent-transported reply is reviewed, not executed. **What §5.1's comment does
  and does not claim:** the two implementations agree exactly on the three *file states* this layer
  reads, which is what decision 2 rests on; they do **not** agree on the provenance of the
  `file_missing` reason, and the comment is not to be read as claiming they do.

**No longer on this list: the clone's writes.** An earlier draft exempted the whole PR route on the
"real `gh` and the real network" ground, which also swept up `_writeFile`'s behaviour on an absolute
path — a capability this feature *invents* (§5.6(a)), not a shipped one it merely drives. That is a
different class, and it left an AC-3.1/NFR-2 chain with no production-path evidence anywhere. The
prompt text is now pinned by §11.3(e), and the module-side path handling is exercised by the
`fakeMakeTempDir` route tests. The exemption that remains is narrow and stated: nothing here
executes a real agent, so the *transport* is still reviewed rather than run.

## 12. Traceability

### 12.1 FSPEC unit → TSPEC mechanism

Every `FSPEC-CONS-0N` unit appears exactly once; no row names a unit the FSPEC does not carry.

| FSPEC unit | § | Mechanism | § |
|---|---|---|---|
| CONS-01 Tick evaluation and pass lifecycle | §2 | `triggerFor`, `mintPassId`, the single-exit `finishPass` | §7.2, §10.1 |
| CONS-02 Consumed predicate and corpus | §3 | `enumerateCorpus`, `classifyCorpus`, `renderConsumedPair`; hook parity by differential test | §7.1 |
| CONS-03 The in-progress marker | §4 | `parseMarker`, `markerVerdict`, `takeMarker`, `releaseMarker`; `.gitignore` text | §7.3, §3.3 |
| CONS-04 Routing and consuming-repo writes | §5 | `routeOf` over the imported `MERGE_GUARD_DEFAULTS`; `commitConsumingRepoPaths` | §7.6, §9.4 |
| CONS-05 The pull-request route | §6 | `openClone`, `mergeCommandFor`'s two new surfaces, `resolveSeamVerb` | §9.1 – §9.3 |
| CONS-06 Credential handling | §7 | `_envPresent` (boolean-only seam), shell-expansion of the value, resolution order | §5.3, §9.2 |
| CONS-07 Falsifiability | §8 | `failureModeId`, `mergeProposals`, `effectivenessTable`, `openPromotionList`, `remediationChoice` | §7.4, §7.5 |
| CONS-08 Advisory-corpus input | §9 | `parseEscalations` (table rows, never the heading), `seamCandidates` | §7.7 |
| CONS-09 Reporting and the log grammar | §10 | four one-record appends, `renderTerminalRow`'s dropped-code return, `renderReportBody` | §7.9 |
| Configuration parse | §11 | `parseConsolidationConfig`, parity-tested against `parseAdvisoryConfig` | §7.8 |

### 12.2 FSPEC obligation → discharge → falsifying test

| # | Obligation | Discharged | Falsified by |
|---|---|---|---|
| T-01 | names, signatures, placement | §3.1, §4, §5.1 | the suites compile against the named exports; L3 asserts the module's shape |
| T-02 | build entry, manifest row, resolver reach | §8.2, §8.3 | L3: `build-runtime.mjs --check` clean, four rows stamped, no `import(` in the bundle |
| T-03 | the temporary clone | §9.1 | AT-Q1 (clone under a temp dir, invoking tree untouched) |
| T-04 | seams + `_log` capture | §5.1, §8.4 | AT-M7 (the `ADVISORY_MODEL_FALLBACK:` line verbatim), AT-M6/AT-M9 (the error message verbatim) |
| T-05 | the resolver widening | §8.1 | AT-M10 (default unchanged on every path) |
| T-06 | `ESCALATIONS.md` parse | §7.7 | AT-A7 (missing `Feature` row), the §11.4 count property |
| T-07 | the `.gitignore` text | §3.3 | `consolidationBuild.test.js` — a jest case reading the tracked `.gitignore` and asserting the comment line and the pattern line verbatim and adjacent. **Not** a maintainer check: a human step goes nothing-red when the pattern is later rewritten slash-free or `**/`-prefixed, which is the exact drift §3.3 argues against |
| T-08 | shared code vs. two implementations (FSPEC §14.1). **Decided**: two implementations (§13.1 row 6). The evidence is split by kind, not weakened by default: the two predicates are held **equal** by a differential; the two enumerations are held **pinned** (each side's question fixed literally) rather than equal, because they are not equal in general — §10.4's one remaining divergence class (a LEARNINGS inside a nested git repository) is the accepted residue. REQ §3.1 step 1 has since **withdrawn** the "one enumeration" half and decided the two classes this row previously carried as open; §13.3 records that erratum as closed, and §7.1 absorbs both decisions | §7.1, §10.4, §13.1 row 6 | **Predicate half — AT-P7** (differential, L4): `classifyCorpus`'s two-region predicate against the hook's `pending` comprehension over `region_split` (located by
symbol, never by line index — §12.3), both fed the same basename list. **Enumeration half — two literal pins** (§7.1), not inspection: (a) **AT-P1**'s first conjunct asserts both argvs handed `_git` element-by-element, both `:(glob)` prefixes included in each, so the `docs/discarded/` exclusion is decided by the pathspec and not by a fixture, and a re-introduced `--exclude-standard` or a dropped `--deleted` call — each a one-token reversal of a decided REQ rule — reds on it (its second conjunct is the positive membership case and its third observes the `--deleted` subtraction; §7.1 states why "a discarded line is filtered out" is deliberately *not* asserted); (b) an L3 source-text read in `consolidationHookParity.test.js` pins the hook's `CORPUS_GLOBS` declaration (located by name, never by line index — §7.1) to exactly two glob-pattern literals and no third, with the conjunct that `glob.glob(` occurs once and inside the comprehension over it. **The two pins sit at different levels and in different files deliberately** — (a) is L1 over the `_git` double because its subject is the array handed at runtime, (b) is L3 source text because the hook is a Python heredoc no JS test can call; §7.1 argues why the uniform-L3 reading an earlier draft carried was the weaker one. Together they make §10.4's divergence set derivable and closed: a widening on either side reds. AT-P7 itself does **not** falsify the enumeration pair, and this row says so rather than implying coverage it has not got |
| T-09 | a property per component | §11.4 | the properties themselves — **five** T-09 rows (the two-region predicate, `passId`, config parse, escalation count, `parseMarker`) plus the two determinism rows; the PLAN carries them as tasks, not as prose, and the count is stated here rather than left implicit so a dropped strategy is visible from this table |
| T-10 | the unavailable spellings | §6.5 | AT-Q10's literal-text conjunct; LD-1/LD-4's PROPERTIES fixtures |
| T-11 | **the PR body** — AC-3.2's three citations, AC-3.7(c)/REQ-CONS-03's three vocabularies §4 trailers, `PDLC-CONSOLIDATION-PROMOTIONS` set-equal to the proposals the PR enacts (the NFR-4 duplicate key) | §7.9 `renderPrBody`, `renderPromotionCommitMessage` | `consolidationRoute.test.js`, re-bound to the register's actual text (FSPEC §13.5, *The PR route and idempotence*): **AT-Q2** — three promotions in one pass, one PR ⇒ three commits each carrying a distinct `PDLC-PROMOTION-ID: {id}:{action}` **and** `PDLC-CONSOLIDATION-PROMOTIONS` **set-equal** to the three pairs. AT-Q2 carries *both* trailer obligations; an earlier draft split them across AT-Q5, which is about a merged `promote` not suppressing a `revise`/`retire`. **AT-Q3** and **AT-Q9** — the writer↔reader round-trip: each supplies a prior PR carrying the trailer `renderPrBody` writes and asserts `enactedByPr` reads it back (AT-Q3 on an open PR ⇒ `duplicate-suppressed`, `suppressed-by:` naming the pair, `pr:` empty; AT-Q9 on a PR whose branch was deleted unmerged ⇒ the trailer survives and still suppresses). **AC-3.2's three body citations are now `AT-Q13`, and the gap this row recorded is closed.** The gap was real when this row was written: the FSPEC's own AC→AT map bound AC-3.2 to AT-Q2, which asserts only the trailers. It was recorded here rather than papered over by naming a nearby id, and raised upstream as an erratum; FSPEC v11.3 answered it by minting **AT-Q13** (FSPEC §13.5 register, traced to AC-3.2 in FSPEC §15's AC→AT map), which asserts exactly the three citations over two fixtures. **The case below is that id, not a duplicate of it** — as this row anticipated, the erratum landing turns the interim case into an id-bearing row, so it is written once and labelled `AT-Q13` in §12.3: `consolidationRoute.test.js` carries it as **AT-Q13** — one pass over two source LEARNINGS, asserting that `renderPrBody`'s output contains, for each promotion, the source feature name, the failure mode's name, and the AC-2.3 evidence string. **Where those three expected values come from is the whole oracle, so it is stated without ambiguity: they are transcribed from the fixture LEARNINGS corpus the pass was handed, never from `state.promotions[i]` or any other field of the produced record.** The case runs at L2, where the record is produced by the pass under test; reading the expected strings off the record would green it even when the pass and the renderer drop the same field together — which is exactly the AC-3.2 failure an operator sees (a PR body citing nothing). Reading them from the input corpus makes it a relational oracle between input and output. It now claims **AT-Q13**, the erratum having landed, so §12.3's set equality counts it on both sides |
| T-12 | **the proposal file** — AC-3.5's full inline diff plus the failure class recorded by name; AC-3.4's second clause | §7.9 `renderProposalFile` | `consolidationRoute.test.js`, re-bound: the two degradation classes in the register are **AT-Q6** (`branch-exists` — "fallback proposal file carries the full diff, the existing branch and any PR for it are named") and **AT-Q8** (`api-failure` — "the API's status text recorded verbatim; fallback proposal file carries the full diff; the pass does not halt"). AT-Q9 is **not** a degradation class (it is the deleted-branch trailer-survival case) and AT-Q11 is **not** about the file's existence condition (it is the two-run byte-identity of `DOMAIN-CONSTRAINTS.md`); both were mis-bound in an earlier draft. **FSPEC §5.3's "when, and only when" is now `AT-R7`, and the gap this row recorded is closed.** The register carried the positive direction through AT-Q6/AT-Q8 and asserted the *negative* nowhere — that a pass which enacts everything writes no proposal file. It was recorded as a gap and raised upstream rather than bound to an id that asserts something else; FSPEC v11.3 answered with **AT-R7** (FSPEC §13.4 register, traced to AC-1.4 in FSPEC §15's AC→AT map), whose three fixtures list `docs/_decisions/CONSOLIDATION-PROPOSAL-*.md` before and after the pass. **The case below is that id, not a duplicate**: `consolidationRoute.test.js` carries it as **AT-R7** — a pass whose every promotion is enacted (the PR merged, or every target written) writes **no** `CONSOLIDATION-PROPOSAL-{passId}.md`, and so does an all-suppressed `no-op` pass (AT-R7's fixture (b), which reaches "no cause" by the other route), asserted through the write double's recorded path set, with the positive control in the same case that a one-degraded-promotion fixture *does* write exactly one named for that `passId` — so the negative cannot pass on a fixture that wrote nothing at all. It claims **AT-R7**, so §12.3's set equality counts it on both sides. **AC-3.4 answered explicitly:** the file carries `state.prUrl` when a PR was also opened; when the pass enacts everything there is no proposal file (FSPEC §5.3's "when, and only when") and AC-3.4's second clause is **vacuous** — the URL lives in the terminal row's `pr:` field alone |
| — | `renderTerminalRow`'s **dropped**-code arm (§6.4, §7.9) | §7.9 | `consolidationReport.test.js`, under **AT-L5** — its "no enumerated value without a §1 row" direction is exactly what the illegal fixture discharges, so this mints no new id and §12.3's set equality is undisturbed. The report-body **notice** naming the dropped code is a TSPEC-added observable with no register id, in the same class as T-13's row. Two fixtures over one code: one whose `(status, code)` pair is legal at `Version` 1.4 and appears in the row, one whose pair is illegal and is dropped — the drop is then *observed* against a control rather than assumed. The AT asserts the row's field set **and** the report body's notice naming the dropped code. `no-cadence-datum` is deliberately not that code: vocabularies §1 permits it with `refused`, and REQ-CONS-01 decides it at step 3/4 before the marker check, so the drop must never fire for it — which the same test asserts as its control |
| T-13 | **await discipline across `finishPass`** (§10.1) — the three terminal steps are seam writes reached through module functions, so neither §11.3(c)'s identifier scan nor any sync-double suite can see a missing `await` | §10.1 | `consolidationLifecycle.test.js`: one case driving `asAsync(fakeAppendFile)` / `asAsync(fakeWriteFile)` / `asAsync(fakeGit)` (§11.2) and asserting, **after `main()`'s promise resolves**, that (i) the terminal row is present in the log double's accumulated text and (ii) the marker is **released** — the write double's **last** recorded contents for `docs/_decisions/.consolidation-lock` **match `RELEASED: {passId} {ISO-8601}`** (the sentinel §7.3 decides on FSPEC BR-14a, carrying this pass's own `passId`), having been the `IN-PROGRESS: {passId} …` line **earlier in the same double's recorded write history**. **Both halves of that expected string are transcribed from the fixture, never read off the record under test, and the clock is pinned rather than shape-matched**: `passId` is derived deterministically from the fixture log by §7.2, so the case computes it from its own input; and the case supplies `_now: () => {fixed}` in the injections — `_now` is a destructured parameter default (§5.6(b)), which is exactly how the shipped suites pin it (`pdlc/workflows/__tests__/advisoryDodSeams.test.js:129`, `:1116`; `advisoryDisabled.test.js:276`) — so `{ISO-8601}` is a **literal expected value**, not a regex over "any well-formed timestamp". A shape match was the available alternative and is rejected here for one reason: the only thing it can check about the instant is that it *looks* like a timestamp, so an implementation that stamped the release with the take's instant, or with a constant, would pass it — and a wrong instant in the marker is precisely what makes a later pass's staleness arithmetic wrong. Conjunct (ii) is stated against that observable and not against "gone", because §7.3's release is an in-place `_writeFile` and no seam in this protocol removes a file. Its take-side precondition is load-bearing: a bare absence is equally true of a `refused` / `skipped-cadence` fixture or a take that never landed, so without it the AC-1.3 half passes vacuously. `asAsync` defers on a **macrotask** (§11.2): a microtask deferral is drained by the test's own `await main()` and would green both conjuncts on the broken implementation. Both conjuncts fail on a missing `await` inside `finishPass` and pass on an awaited one; this is the only row that distinguishes *written* from *scheduled*, so the PLAN task that writes it owes the mutation check §11.2 states (delete one `await`, expect RED) |
| — | **an enumerated file, present in the working tree, whose body cannot be read** (§7.1) — reachable on file permissions, a mid-pass unlink, or an IO error between the enumeration and the read; **not** the staged-but-deleted entry, which since §7.1's `--deleted` subtraction is never enumerated and so never reaches this branch. The decision mints three observables (it counts toward `\|un-consolidated\|`, it is **omitted** from the consumed pair per REQ §4b, its basename is named in the report body) and no register AT reaches any of them: AT-P8 is the unreadable **log** file, not an unreadable LEARNINGS body. A fourth observable follows when the class covers the **whole** corpus: the pass terminates `no-op` with an empty consumed pair (§10.3 row 1b). That one **is** now a register obligation: **FSPEC v11.7 mints AT-K3b** (FSPEC §13.6 register, AT-K3b) for the all-unreadable corpus, and §13.7's AC-1.4 row binds it as that criterion's **third** cause — the gap this row previously recorded against AT-K3, AT-L2, AT-F13 and AT-R7, whose `no-op` fixtures are the all-suppressed pass (AT-R7 fixture (b)) and the empty-corpus pass (AT-P6/E-08), i.e. AC-1.4's second and first causes. Absorbed, not re-raised: the second fixture below is AT-K3b's, and §12.3 assigns the id | §7.1, §10.3 rows 1a/1b, §10.4 | `consolidationPass.test.js` — **(no FSPEC AT)** for the mixed fixture, **AT-K3b** for the all-unreadable one. **One fixture carrying both an unreadable and a readable corpus member**, so every conjunct has its control in the same case: the corpus enumerates two basenames, `_readFile` returns `null` for one and a body for the other, and the case asserts (1) `\|un-consolidated\|` counts **both** (the volume trigger fires on the same count it would with two readable members — a count that silently drops the unreadable one makes the trigger fire late and nothing else reds); (2) the basename list rendered by `renderConsumedPair` is **set-equal to `{readable}`** — the readable basename present, the unreadable one absent, **and no third name** (set equality, not containment plus one absence: NFR-5 requires a block naming *exactly* the consumed set, which a containment oracle satisfied by an implementation that also names a basename the enumeration never returned) (REQ §4b: the unreadable entry is not consumed, so it stays un-consolidated and the next pass retries it — an implementation that puts it in the pair marks a file consumed that contributed no evidence, which biases REQ-CONS-05's loop toward `prevented`/`insufficient-evidence` and never toward `recurred`); (3) the report body **names the unreadable basename** as an entry the pass could not read, and does **not** name the readable one in that list. Stated as a pair rather than as an absence throughout — the readable member is the control that keeps (1) and (3) from passing on a fixture where nothing was readable, and in (2) it is the positive half that keeps the conjunct from passing on an implementation that renders an empty pair. **A second fixture in the same case carries the all-unreadable corpus** (§10.3 row 1b) and **discharges AT-K3b**: the corpus enumerates **two** basenames and `_readFile` returns `null` for **both**, and the case asserts positively that the terminal status is exactly `no-op` — not `failed` (row 1a's outcome, the adjacent branch an implementer is most likely to reach for) and not `refused` — that the rendered consumed pair's basename list is **empty**, and that `\|un-consolidated\|` is **2** with both basenames named in the report body as unread. AT-K3b's remaining conjuncts are asserted in the same fixture: **no** `CONSOLIDATION-PROPOSAL-{passId}.md` is written and **no** reason code is minted for the condition, so the register's discriminator — an empty consumed-basename list *while* the un-consolidated set is non-empty — is what separates AC-1.4's third cause from its first, where both sets are empty. The mixed fixture above is this fixture's control in both directions: it keeps "pair empty" from passing on a pass that enumerated nothing at all, and this fixture keeps the mixed one's status assertion from passing on an implementation that terminates every unreadable-touching pass `failed`. Both fixtures pin the status against the terminal-status catalogue §6.4 freezes, not against a retyped literal |
| — | **the ER-6 interim's discriminator** (§7.6, §12.4) — a *routed* propose-only promotion and a *degraded* PR attempt both write `route: "degraded"`, so the report body is the only thing that tells them apart until ER-6 lands | §7.6, §7.9 item 4 | `consolidationReport.test.js`, **(no FSPEC AT)** — the two-fixture control: a `revise` on a `DOMAIN-CONSTRAINTS.md` target (routed propose-only, §7.6 table row 2) and a `branch-exists` degradation. Asserts the *sameness* that is the ER-6 loss (`route: "degraded"` in both records, asserted rather than hidden) **and** the *difference* that stands in for it (the degraded body names a vocabularies §1 reason code, the routed body names none), in both directions. It claims no register id, in the same class as T-13's row and the dropped-code notice, so §12.3's set equality is undisturbed. Recorded here because §12.4 leans on it as a mechanism, and a mechanism that lives only in §7.6's prose is one a PLAN task will not know it owes |
| — | **three marker observations, three outcomes** (§7.3 decision 2, §10.3 row 4) — the decision that `present` reads `file_missing` **alone** as absent, so an **empty** marker is a *truncated* one and reclaims (**E-11**) while a **`RELEASED:`** marker is *free* and records nothing at any age (**E-11b**). This row was written when §7.3 decided the empty released form, and it then asserted the opposite of what it asserts now — an empty marker resolving `free` — as a local `(no FSPEC AT)` case, because under that form the zero-byte marker was the steady state of every consuming repo and no register id reached it. **FSPEC v11.3's BR-14a settled the release form as the `RELEASED:` sentinel and the register now covers both arms itself**, so the local case is retired into the ids rather than written twice; the decision it guarded is unchanged in substance — the presence probe, not the read, decides the absent arm | §7.3 decision 2, §10.3 row 4, §12.1 CONS-03 | `consolidationPass.test.js` — **one case holding the discriminating fixtures together**, because the pairing *is* the oracle: `""` ⇒ a normal terminal status (**not** `refused`) **and** `reclaimed-stale-lock` recorded with the abandoned id `unknown` (**AT-M3** fixture (a)); a line that is neither `IN-PROGRESS:` nor `RELEASED:` ⇒ the same (**AT-M3** fixture (b)); `RELEASED: {passId} {ISO-8601}` at **both** ages ⇒ taken, a normal terminal status, and **no** `reclaimed-stale-lock` and **no** `consolidation-in-progress` (**AT-M11**). So neither the positive nor the negative is an absence-only assertion and neither can pass on a fixture where no marker logic ran at all: an implementation that reclaims on every take fails AT-M11, one that never reclaims fails AT-M3. `fakeFs` supports every input unchanged — an own property whose value trims to `""` returns `{ok:false, reason:"file_empty"}` (`__tests__/helpers/seams.js:296-299`) and `_readFile` returns `""` for it, which is exactly the present-but-unparseable state decision 2 routes to `reclaim`. It claims **AT-M3** and **AT-M11**, both already assigned to this file by §12.3, so that table's set equality is undisturbed. This subsumes the call-order oracle §7.3 declines to mint: it falsifies a wrong verdict by **behaviour** rather than by call shape, which is the stronger form — §7.3's `["check", "read", "write", "read"]` prefix survives as authoring guidance only, and no §12 row obliges it |
| — | **release across the whole terminal-status set** (§7.3, FSPEC §4.3). `releaseMarker` became a named function with a decided observable in this document, and no register AT walks the set: FSPEC §4.3's table is a **six-member closed enumeration** (FSPEC §4.3, *Release, and what each terminal status does*) stating, per status, whether the marker was taken and whether this pass releases it — `promoted`, `promoted-degraded`, `no-op`, `failed` ⇒ taken **and** released at step 16; `refused` and `skipped-cadence` ⇒ **neither** (**BR-15**, FSPEC §18, restates the positive half). **Which `refused` this table keys on is stated, because there are two arms and they disagree**: the modelled one is the observed-fresh-marker refusal (§10.3 row 5, AT-M1), which takes nothing and releases nothing; §10.3 row 5a's **failed-take** `refused` wrote its `IN-PROGRESS` line and correctly releases nothing, so its observed pair is `{taken: true, released: false}` and it is row 5a's own obligation, not this table's. Keying on the status alone without that clause makes the row red on correct code for an implementer who reaches for the row-5a fixture. AT-M4 and AT-M6 each assert release on **one** `failed` fixture, which is containment, not the set | §7.3, §10.1, §12.1 CONS-03 | `consolidationLifecycle.test.js`, **(no FSPEC AT)** — one case per terminal status over a table **keyed on the module's own frozen catalogue** — §6.4's `TERMINAL_STATUSES` (`Object.freeze([...])`, a runtime value), **not a literal list retyped in the test** and not §6.1's `TerminalStatus`, which is a `ts`-fence type with no runtime existence in these plain ES modules. Ranging over a constant of the module under test would ordinarily be an implementation echo; it is legitimate here **only because §11.3(b) independently pins that catalogue** — its fourth leg asserts three-way set equality (module catalogue ≡ the doubles' literal transcription ≡ `docs/_constraints/pdlc-consolidation-vocabularies.md` §1's table, both directions, plus the `Version` 1.4 pin), so a maintainer who deletes a status from the catalogue reds there before this table can shrink with it. Cite that chain when writing the case. It asserts for each the pair `{taken?, released?}` against the write double's recorded write history for `docs/_decisions/.consolidation-lock`: `taken` iff the `IN-PROGRESS: {passId} …` line was written at some point, `released` iff the **last** recorded contents match `RELEASED: {passId} {ISO-8601}`, the sentinel §7.3 decides — **the same pinned-clock oracle T-13 states**, not a shape match: this case supplies `_now: () => {fixed}` in its injections (§5.6(b)) and transcribes the `passId` from its own fixture log, so the expected string is a literal on every arm of the table and no arm can green by reading the produced record back to itself. The oracle is **set equality over the catalogue**, not containment: the table's key set is asserted set-equal to `TERMINAL_STATUSES`, so deleting a status arm reds rather than passing on the survivors — which is the whole point, since the arm most likely to be dropped is `failed`, the only one reached from step 8 rather than step 14. The operator-visible failure this row exists to catch is AC-1.3's: a marker left behind blocks every later pass until `staleLockMinutes` elapses. It claims **no** register id (§12.3's set equality is undisturbed), and its two negative rows are stated against a positive control in the same table — `refused` and `skipped-cadence` must show **neither** write, which cannot pass vacuously because the four positive rows in the same table show both |
| — | **the composition root actually hands over §5.1's protocol** (§5.1, §5.3, §5.5, §8.2). `rtConsInjections()` is named in §3's file-touch table, §5.1, §8.2 and §13.2's PLAN list, and until this row nothing asserted its **contents**. The failure it guards is not hypothetical: this repo shipped an adapter function that existed and was never wired, and `runtime-adapter.js:1098-1100` says so in its own words. `_checkFile` is the member whose omission is silent — §5.5 argues why an unwired presence probe can read as "no marker present" and turn AC-1.3's mutual exclusion off in production while every L2 fixture stays green, because the `refused` path is exercised only through `fakeFs` | §5.1, §5.5, §8.2 | `consolidationBuild.test.js`, **(no FSPEC AT)** — L3: the **key set of `rtConsInjections()` asserted set-equal to §5.1's declared seam names**, minus the members §5.6 excludes by name (`_now`, which is a destructured parameter default and not a seam — §5.6(b)). **Set equality, not containment**: containment is exactly the assertion that would still pass with `_checkFile` missing, which is the failure. `adapterProbe.test.js:253-258` ("wires all three into `rtDevInjections`") is the shape; it is widened from per-name identity to an equality here because §5.1 is an enumerated contract and a *surplus* key is as much a drift signal as a missing one. It claims no register id |
| — | **the two `SKILL.md` production edits** (§3.2 rows 6 and 7). `pdlc/skills/consolidate-learnings/SKILL.md` and `pdlc/skills/harvest-learnings/SKILL.md` are shipped prompt files this feature edits — the block/legacy predicate and the `{topic} = failure-mode-id` route on one, the `Phases exercised` metadata row and the `failure-mode-id` Open-Items line on the other — and until this row **no test named either file**. The shipped `__tests__/skillFiles.test.js` covers only `se-review`, `te-review` and `pm-review` (`:13-17`, a three-member `reviewSkills` literal), so both edits would ship with no oracle: a later prompt rewrite could drop the `failure-mode-id` route and every suite in the repo would stay green while §5.2's derivation silently lost the topic it keys on | §3.2, FSPEC §3.2, §5.2, §8.3, §8.4 | `consolidationBuild.test.js`, **(no FSPEC AT)** — L3 source text, in the shape §11.3(e) establishes for `rtWriteFile`'s prompt: four verbatim conjuncts, two per file, each **located by the surrounding named heading and never by line index** (these files are edited by hand and line numbers drift). The conjuncts are the strings the FSPEC obliges, not paraphrases of them, and each is asserted to occur **exactly once** so a "harmonising" second copy reds too. It lives in this feature's own suite rather than as a fourth member of `skillFiles.test.js`'s `reviewSkills` list because these are **authoring** skills, not review skills, and that list's every existing assertion is about `VERDICT` trailers these two files do not and must not carry — widening it would force a per-member conditional, which is the shape §11.1 keeps out of shipped suites. It claims no register id, so §12.3's set equality is undisturbed |
| — | **`CLAUDE.md`'s tracked-artifact enumeration** (§3.2's `CLAUDE.md` row, §8.3). The repo's own onboarding document enumerates the generated runtime artifacts and then counts them in prose; the count was already wrong at the pre-feature baseline (three bullets, four tracked paths, `pdlc-cli.mjs` missing) and this feature adds a fifth artifact. A prose count no test reads is a document that drifts once per artifact, forever | §3.2, §8.3 | `consolidationBuild.test.js`, **(no FSPEC AT)** — L3: the artifact paths `CLAUDE.md` enumerates under the build-runtime paragraph, parsed from its own source text, **minus `pdlc/workflows/dist/distribution-manifest.json` itself**, asserted **set-equal** to the manifest's own `rows[]`, each row's `pluginPath` read as the repo-relative path (`pdlc/` + `workflows/dist/…`). **The exclusion is named rather than absorbed, in the shape the `BUNDLES` half of this same case already uses for its own** (`.mjs`, not `.bundle.js`): the manifest is the *authority* this oracle reads and carries **no row for itself** — verified at HEAD, where `rows[].id` is exactly `consolidate-learnings`, `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`, four rows and none of them the manifest itself (three at the pre-feature baseline, before this feature's bundle row landed) — while the enumeration must keep advertising it as a shipped artifact. Without the exclusion the two sets are structurally unequal and the case is red on correct code. It stays **set equality, never containment**, in both directions — a manifest row with no bullet is the drift that already happened (`pdlc-cli.mjs`, tracked and stamped and unadvertised, which containment would pass), a bullet with no manifest row is a deleted artifact left advertised. Both are read at run time from the tracked files, so nothing here is a transcription that can itself go stale. The same case carries §11.3(c)'s third-axis falsifier — `runtimeBundle.test.js`'s `BUNDLES` constant, read from that file's source text, set-equal to the manifest's `.bundle.js` ids — because both are the same question (does the repo's own bookkeeping still name every shipped artifact?) held against the same authority, and splitting them across two files would duplicate the manifest parser. The prose count itself is **not** asserted: §3.2's edit replaced it with a count-free sentence, precisely so there is no number left for a test to pin. It claims no register id |

**Why the Falsified-by column quotes rather than paraphrases.** Every AT named above is described in
the register's own words, taken from the register rows of FSPEC §13 (§§13.1–13.9), because §12.3's
`consolidationTraceability.test.js` asserts set equality over **ids** and is therefore structurally
blind to a row that binds a real id to the wrong subject — the one class of error in this table that
has no mechanical guard. Quoting is not a mechanism, and is not claimed as one; it is what makes the
mis-binding visible to the next reader in the row itself rather than only in the register. Where an
obligation has no AT the cell says so: an empty-but-named gap reads as a gap, where a nearby id reads
as coverage. **Both gaps this table named have since been answered** — T-11's AC-3.2 citations by
`AT-Q13` and T-12's "when, and only when" by `AT-R7`, both minted by FSPEC v11.3 — and the rows record
the landing rather than being quietly deleted, because the round trip (gap named here → erratum raised
→ id minted upstream → interim case re-labelled) is the evidence that naming a gap is a working
channel and not a shipping licence.

**A named gap was not a licence to ship uncovered, and this table did not treat it as one.** Both
register gaps above describe things an operator reads directly — the PR body an approver reviews, and
the absence of a proposal file when nothing needed proposing — so while the erratum was outstanding
each **was** covered by a **(no FSPEC AT)** case in the file that owns its subject, in exactly the
shape T-13 and the dropped-code notice established. Both errata have since landed — `AT-Q13` and
`AT-R7` — and those two cases now carry their ids rather than being written twice, so no
`(no FSPEC AT)` case remains for either. The erratum and the local case were complementary, not
alternatives: the erratum asked the FSPEC to decide whether the register should carry an id, and the
local case made the obligation falsifiable in the meantime. Rows carrying no id contribute to neither
side of §12.3's set equality, so adding them could not perturb it — which is why the interim was
affordable.

### 12.3 Acceptance test → level and file

**Enumerated, never ranged.** An earlier draft assigned ATs to files by range (`AT-C1 … AT-C8`,
`AT-M1 … AT-M6b`, …). Range notation cannot express the suffixed ids the FSPEC actually carries, and
it silently dropped three of them — **AT-C1b, AT-Q7b and AT-Q7c** — even though §11.3(a) names the
last two by hand. That is not a bookkeeping slip in the `DEC-SEV-02` sense: this table is a
**downstream observable**, since §13.3 hands the PLAN a manifest keyed on these files and this table
is what tells a PLAN task which ATs it owes. An AT with no file is an AT the PLAN will not name and
the implementation will not write, and nothing goes red.

The FSPEC's AT register carries **100** ids, obtained by enumerating `AT-…` tokens over **FSPEC §13,
"Acceptance tests"** (§§13.1–13.9) and de-duplicating; re-derived at FSPEC **v11.7**, where it is
**100** — v11.7 minted **AT-K3b**, the all-unreadable-corpus `no-op` that §12.2 had recorded as a
register gap and raised upstream, and it is assigned below to `consolidationPass.test.js`. The count
is set-equal to this table in both directions with an empty diff each way. The earlier "96, at v11.1"
was stale: FSPEC v11.2/v11.3 added **AT-M11**, **AT-Q13** and **AT-R7** — the three ids that close
the register gaps T-11, T-12 and §12.2's empty-marker row had recorded and raised upstream. All
three are assigned below.

**Two things about that number, both deliberate.** First, it is a reader's summary and not the
mechanism: `consolidationTraceability.test.js` re-derives *both* sides at run time, so a fourth
drift of this count must go **red in the suite** rather than need a fourth erratum round — which is
why the version qualifier is now a re-derivation date rather than a pin anything depends on.
Second, the register is cited **by section name and id, never by line range**: three consecutive
review rounds each spent a finding on a hand-copied `FSPEC-…:NNNN` coordinate that a later FSPEC
revision had already shifted (v11.4 alone moved every register locator +34, and v11.6 moved them
again), and no oracle in this document may locate anything by line index anyway — §11.3(e) and
§12.2 already require source-text assertions to be anchored "by the surrounding named heading and
never by line index". **That rule governs this document's own citations of *every* upstream document**: an
FSPEC anchor is named as *§-number + heading + id* (`FSPEC §13.5 register, AT-Q13`), and a REQ anchor
as *§-number + quoted phrase* (`REQ §3.1 step 1, "an index entry with no working-tree file"`), which
survives the drift a line number cannot. **Scoping the rule to one upstream document was itself a
defect**, found at v12: stated for the FSPEC alone, it left the REQ's line pointers looking
sanctioned, and all four of them had gone stale across REQ v2.1–v2.5 while the FSPEC sweep was being
celebrated. A citation rule is about the *form* of a pointer, so it can have no per-document scope. **The rule has a corollary for erratum changelog entries, learned
the expensive way:** an entry cites what a pointer *should* name and never narrates what the stale
one currently hits, because the insertion that carries the narration moves the content it describes
and so invalidates itself in the same commit — which is exactly what the 2.1 entry's "a blank line
at HEAD" did, and why it is struck at 2.2. Every register id has exactly one file below:

| File | Level | ATs owned (exhaustive) |
|---|---|---|
| `consolidationPass.test.js` | L2 | AT-C1, **AT-C1b**, AT-C2, AT-C3, AT-C4, AT-C5, AT-C6, AT-C7, AT-C8, AT-M1, AT-M2, AT-M3, AT-M4, AT-M5, AT-M6, AT-M6b, AT-M9, **AT-M11**, **AT-K3b**. Plus **(no FSPEC AT)** the unreadable-corpus-entry case §12.2 records — §7.1's three observables (counted, **omitted from** the consumed pair, named in the report body) against a readable control, **in two fixtures**: the mixed corpus (one readable member, one unreadable) and the all-unreadable corpus, the latter additionally asserting §10.3 row 1b's terminal status `no-op` with an empty consumed pair, each fixture the other's control. Both fixtures live in the one case; the mixed one claims **no** register id, and the all-unreadable one claims **AT-K3b**, minted by FSPEC v11.7 for exactly that fixture's subject (AC-1.4's third cause) — so this row's assignment set gains that single id and the set equality below holds with it, the **K-lettered acceptance family** spanning two files (AT-K1…AT-K7 stay in `consolidationCredential.test.js`, whose subject is credential resolution rather than corpus handling). It lives here because its subject is the pass's own corpus handling end-to-end, which is this file's. **AT-M3 is owned here and is fully satisfiable at this layer**: its two fixtures — (a) the marker that is present but **empty**, and (b) the marker carrying a line that is neither `IN-PROGRESS:` nor `RELEASED:` — both reclaim, and both record `reclaimed-stale-lock` with the abandoned id `unknown` (§10.3 row 4). Fixture (a) is reachable precisely because FSPEC §4.1's **BR-14a** releases by writing a `RELEASED:` sentinel rather than by truncating, which §7.3 adopts, and **E-11** says so in the register's own terms. An earlier revision of this document decided the empty released form, which made that arm unreachable, and disclosed the partial coverage here rather than implying coverage it did not have; **that disclosure is withdrawn**, the FSPEC having decided the release form at v11.3. **The AT-M3 case is written together with AT-M11** (§12.2's marker row), because the pairing is the oracle: fixture (a) must be compared inside one case against a `RELEASED:` fixture that does *not* reclaim, or an implementation that reclaims on every take passes it. It mints no id and no new file, so this row's assignment set is unchanged. **AT-M11 is owned here because it is AT-M3's paired negative** — a marker in the *released* state, in two fixtures (written seconds ago, and older than `staleLockMinutes`), must be taken with **no** `reclaimed-stale-lock` and **no** `consolidation-in-progress`, at either age. It is the sole register oracle for AC-1.3's negative half: without it an implementation that records `reclaimed-stale-lock` on every take passes AT-M1 through AT-M6b. It belongs beside AT-M3 rather than in a file of its own precisely because the pairing is the oracle, which is the same argument fixture (a) above makes. **No divergence remains to record here**: AT-M11's fixtures spell the released state as the `RELEASED: {passId} {ISO-8601}` sentinel FSPEC §4.1 decides, and §7.3 now decides **the same form** (BR-14a; E-11b gives it its outcome — free at any age, no reason code), so both fixtures pass against this layer's own mechanism rather than against a spelling it does not use. The erratum an earlier revision raised from this cell is **withdrawn**: the FSPEC answered the question at v11.3, and the correct action on a settled upstream question is to absorb the decision, not to route it again |
| `consolidationRung.test.js` | L2 | AT-M7, AT-M8, AT-M10 (AT-M10 is a regression over the shipped call site and lives beside the existing `advisoryRung.test.js` assertions) |
| `consolidationPredicate.test.js` | L1 | **AT-P1** — whose first conjunct *is* §7.1's pin (a), the literal-argv assertion over the `_git` double — AT-P2, AT-P3, AT-P4, AT-P5, AT-P6, AT-P8, AT-P9, AT-P10, AT-P11 |
| `consolidationHookParity.test.js` | L4 (+ L3) | AT-P7. Plus two **(no FSPEC AT)** cases: (1) §7.1's **pin (b)** — an L3 source-text read asserting the hook's `CORPUS_GLOBS` declaration carries exactly the two glob-pattern literals and no third (located by name, not by line index); (2) an L4 pathspec-semantics case running pin (a)'s exact argv through a real `git` in a temp repository the case builds (§11.1). Both live here because their subject is the two implementations' relationship, which is this file's. §7.1's **pin (a)** does **not** live here — it is AT-P1's L1 argv conjunct in `consolidationPredicate.test.js`, one row above |
| `consolidationIdentity.test.js` | L1 | AT-R6, AT-R6b, AT-F1, AT-F2, AT-F3, AT-F4, AT-F5 |
| `consolidationRoute.test.js` | L2 | AT-R1, AT-R2, AT-R3, AT-R4, AT-R5, AT-Q1, AT-Q2, AT-Q3, AT-Q4, AT-Q5, AT-Q6, AT-Q7, **AT-Q7b**, **AT-Q7c**, AT-Q8, AT-Q9, AT-Q10, AT-Q11, AT-Q12, **AT-Q13**, **AT-R7**. The last two are the ids FSPEC v11.3 minted for the two register gaps §12.2 had recorded and raised upstream, and they land in this file because it already owns their subjects: **AT-Q13** is AC-3.2's three PR-body citations (T-11) — source LEARNINGS named by feature name, the failure mode's `symptom` line verbatim, and the AC-2.3 pattern evidence — over two fixtures, a recurrence-across-two-features promotion and a single-occurrence one cleared on the standing-invariant argument, so an implementation that emits a recurrence list unconditionally reds on the second. **AT-R7** is FSPEC §5.3's "when, **and only when**" negative (T-12) — three fixtures whose `docs/_decisions/CONSOLIDATION-PROPOSAL-*.md` set is listed before and after the pass: a fully-`promoted` pass and an all-suppressed `no-op` pass must leave it **unchanged** (in particular no file named for that pass's `passId`), against a positive control whose one degraded promotion does write exactly one. **The two TSPEC-added cases this row used to carry are these ids, not duplicates of them**: the erratum landing is what §12.2's T-11 and T-12 rows anticipated — "the erratum landing turns it into an id-bearing row rather than a duplicate" — so the cases are re-labelled with their ids and are **not** written twice. This row's `(no FSPEC AT)` clause is therefore gone, which is the intended end state and not a coverage loss |
| `consolidationCredential.test.js` | L2 | AT-K1, AT-K2, AT-K3, AT-K4, AT-K5, AT-K6, AT-K7. **AT-K3b is deliberately not here**: the split is by subject, and its subject is the pass's corpus handling, which `consolidationPass.test.js` owns — so the K-lettered acceptance family spans two files, which the id→file equality permits (it obliges exactly one file per id, not one file per id prefix) |
| `consolidationEffectiveness.test.js` | L1 | AT-F6, AT-F7, AT-F8, AT-F9, AT-F10, AT-F11, AT-F12, AT-F13, AT-F14, AT-F15, AT-F16, AT-F17, AT-F18 |
| `consolidationParse.test.js` | L1 | AT-F19, AT-F20, AT-F21 |
| `consolidationAdvisory.test.js` | L1 | AT-A1, AT-A2, AT-A3, AT-A4, AT-A5, AT-A6, AT-A7 |
| `consolidationReport.test.js` | L1 + L2 | AT-L1, AT-L2, AT-L3, AT-L4, AT-L5, AT-N1, AT-N2, AT-N3, AT-N4. Plus **(no FSPEC AT)** the ER-6 two-fixture discriminator control (§7.6, §12.2, §12.4) and the dropped-code report-body notice carried under AT-L5 |
| `consolidationBuild.test.js` | L3 | (no FSPEC AT) T-02's build assertions, §3.3's `.gitignore` text, §11.3(e)'s adapter-prompt text, and the **`rtConsInjections()` ↔ §5.1 set-equality** case §12.2 records. The last one lives here because its subject is the adapter artifact rather than the pass's behaviour, which is this file's. Plus two further **(no FSPEC AT)** source-text cases §12.2 records: the **two `SKILL.md` production edits** (four verbatim conjuncts, located by heading and never by line index) and the **`CLAUDE.md` ↔ manifest ↔ `BUNDLES` set-equality** case, which also carries §11.3(c)'s third-axis falsifier. All of them share this file's subject — the shipped artifacts and text this feature edits, rather than the pass's runtime behaviour — and none claims a register id, so §12.3's set equality is undisturbed |
| `consolidationLifecycle.test.js` | L2 | (no FSPEC AT) T-13's await-discipline case (§10.1, §11.2's `asAsync`), and the **release-across-the-six-terminal-statuses** set-equality case §12.2 records (§7.3, FSPEC §4.3). Both claim **no** register id, so `consolidationTraceability.test.js`'s set equality is unaffected: the equality is asserted over the ids this table's rows *carry*, and a row carrying none contributes nothing to either side. The release case lives beside T-13 because both hold the same observable — the write double's recorded history for the marker path — so one file owns that oracle and the single-writer-per-file rule stays satisfiable |

**The enumeration is asserted, not maintained by hand.** `consolidationTraceability.test.js` (L3)
parses the FSPEC's AT register and this table's own rows and asserts **set equality in both
directions** — every register id has exactly one file, and no file claims an id the register does
not carry. Adding or deleting an AT upstream therefore reds this table rather than passing it,
which is what the range notation could never do. The parser takes an injected `root` (DC-04).

**How the parser reads a cell that also carries prose.** Several cells now append a `(no FSPEC AT)`
clause naming a TSPEC-added case beside their id list. The parser extracts ids by matching the
`AT-…` token grammar over the whole cell and de-duplicating, so prose contributes nothing unless it
names an id, and naming an id the row already owns (AT-L5, in the report row) is idempotent. The
invariant the equality asserts is unchanged: **every register id maps to exactly one file, and no
file names an id the register does not carry**. A TSPEC-added case is deliberately outside both
sides — it has no id to contribute, which is precisely why minting one would have been the wrong
repair.

**Nothing asserts the converse, and that is a decision rather than an oversight.** The question is
whether a cell *intending* to claim no id could accidentally name one in its prose — the report row
already does exactly that, on purpose, when it cites AT-L5. Because the parser de-duplicates, that
citation is idempotent and the equality is unperturbed either way, so an assertion here would have to
read intent, which no parser can: the only implementable form ("a `(no FSPEC AT)` clause may not
contain an `AT-` token") would red the report row that is deliberately correct. The exposure is
therefore bounded to one class — a TSPEC-added case silently *inheriting* coverage credit for an id
its owning row already claims — and the mitigation is the one §12.2 already applies: every such cell
states which id it claims and which it does not, in the row itself.

The split is by **subject, not by AT id range**: a file owns one group of §7 functions, which is
what keeps the single-writer-per-file rule satisfiable when the PLAN parallelises authoring.

### 12.4 Vocabulary conformance

Every value used in this document is a `pdlc-consolidation-vocabularies.md` §1 row at `Version` 1.4
**except the four recorded below**, each of which is an upstream gap, none of which is patched here.

**ER-6 (new, raised by this layer).** §7.6's routing functions have an outcome — `"proposal-file"`,
a member of `RouteDecision` — that the `Route` union cannot express: FSPEC §5.1 row 4 routes "any other consuming-repo path" to the proposal file, and AC-5.4
diverts every `revise`/`retire` of a consuming-repo promotion there too — but `Route` is
`"constraints" | "decisions" | "PR" | "degraded"` (`docs/_constraints/pdlc-consolidation-vocabularies.md:57`, inside §1's `:38-65` table, transcribed exactly),
so `FailureModeRecord.route` (§6.2, a closed eight-field record required on every kind) has no
value for it. An earlier draft of this section claimed full conformance while §7.6's own prose used
the value, and raised nothing — the claim, not the gap, was this layer's defect.

Until ER-6 lands the pass writes **`route: "degraded"`** for a proposal-file promotion. It is the
one legal value whose meaning already covers the case — FSPEC AT-Q12 glosses `degraded` as "the
promotion reached nothing but `CONSOLIDATION-PROPOSAL-{passId}.md`" — and it fails in the safe
direction: §7.6's `enactedByLog` does not enact on a `degraded` record, so the item is re-proposed
next pass, which is what an item awaiting operator approval should do. The residual loss is that a
*routed* propose-only item and a *degraded* PR attempt read alike in the record; the report body
(§7.9 item 4) names the route in full and is the discriminator meanwhile — and the discrimination is
**asserted**, by the two-fixture control §7.6 specifies in `consolidationReport.test.js` (routed
propose-only vs. `branch-exists`-degraded: identical `route: "degraded"` in the record, a reason code
present in one report body and absent in the other, both directions). That control carries a **§12.2
row of its own** — an unnumbered `(no FSPEC AT)` row, in the same class as T-13 — so the obligation
reaches a PLAN task through the traceability table rather than through §7.6's prose alone. So the
interim is falsifiable rather than merely argued, and ER-6 landing simplifies a passing test.

The other three gaps are the FSPEC's errata and are likewise **not** patched here: `rung:` has no §1 row
(ER-1) and stays free-form; FSPEC §2.6 row 4 has no reason code (ER-2) and `failNoReason` records
none; `suppressed-by:`'s value grammar is wider here than §1's (ER-5) and §7.9 writes the wider
grammar the REQ's own NFR-4 obliges. §6.4's legality check is what keeps ER-4's narrower
`May accompany status` column from producing an illegal row in the meantime.

## 13. Risks and open items handed downstream

### 13.1 Decisions recorded here, with alternatives rejected

| # | Decision | Rejected alternative | Why |
|---|---|---|---|
| 1 | The credential seam returns a **boolean**; the value reaches `gh` by shell expansion in the transported command and `git` through a **credential helper** `git` expands one process lower (§9.2 — `rtShellQuote` single-quotes every `_git` argv element, `runtime-adapter.js:668-670`, so transport-time expansion is impossible there) | a `_readEnv(name) => string` seam; or a second, unquoted command-string git transport | the value would enter the JS process **and** the agent transcript that transported it — a surface NFR-2 cannot redact. The boolean form makes non-disclosure structural **outbound** (inbound residual: §7.9's NFR-2 row, `TSPEC:1418`, DEC-CONS-01). The second transport is rejected in §9.2: it moves the push out of §9.3's `_git`-argv domain classifier for a capability the helper form already gives |
| 2 | Reuse `resolveAdvisoryRung` by adding an optional `skill` parameter | restate the two rungs behind a drift observable (which corpus baseline §3 sanctions) | it would create the second copy of the ladder the resolver's own doc comment forbids (`:1800`) |
| 3 | Inline the dev module into a fourth bundle | a shared artifact holding the resolver | the runtime forbids `import` entirely; there is no third option |
| 4 | The clone is cut from `origin`'s URL, not from the working-tree path | `git clone {repoRoot} {dir}` | the working tree may be mid-pipeline on a `feat-*` branch; FSPEC §6.1 requires the **fetched default branch** |
| 5 | Take the marker observe-then-write (§7.3's three seam calls: `_checkFile`, `_readFile`, `_writeFile`; the earlier "read-then-write" spelling is withdrawn — it prices a two-call take and reads as sanctioning the `_readFile(...) !== null` derivation decision 2 forbids) | an exclusive-create seam | no adapter transport offers `O_EXCL`, and an agent's report of prior existence is exactly as racy as the read |
| 6 | Two predicate implementations, whose **predicate** half is held **equal** by AT-P7 and whose **enumeration** half is held **pinned** — each side's question fixed literally — rather than equal | (a) one shared implementation; (b) an enumeration *equality* assertion; (c) leaving the enumeration half to inspection | (a) the hook is a Python heredoc inside bash; sharing needs a third artifact and a language boundary neither side has. (b) the two enumerations are **not** equal in general — §10.4's surviving nested-repository class makes an equality red on correct code — and AT-P7 feeds both sides one basename list, so it cannot see the enumeration at all. (c) was an earlier draft's answer and is **withdrawn**: §7.1 now pins the JS argv (AT-P1's first conjunct at **L1**, both `:(glob)` prefixes literal, in `consolidationPredicate.test.js`) and the hook's two glob patterns (an **L3** source-text read of the `CORPUS_GLOBS` declaration, in `consolidationHookParity.test.js`) — two levels and two files, for the reasons §7.1 gives — which makes §10.4's divergence set derivable and closed — a third class cannot arise silently. Row 12's stderr channel is what makes even the predicate half observable. **The round trip on this is closed, and this row records a settled shape, not a contingent one**: REQ §3.1 step 1, *"One predicate, two enumerations (erratum, v2.1)"*, **withdrew** the "one enumeration as well as one predicate" half; FSPEC v11.6 re-scoped AT-P7 to the predicate alone; §7.1 absorbed both decisions; and §13.3 records the erratum as closed rather than raising one. What this row describes is what ships |
| 7 | `parseConsolidationConfig` duplicates `parseAdvisoryConfig`'s shape | generalise the shipped parser | generalising edits a guard-set file for a second reason and risks a shipped advisory path for a cosmetic gain |
| 8 | Extend `mergeCommandFor` rather than add a second `gh` builder | a consolidation-local builder | two builders in one bundle falsify the audit property the shipped comment claims |
| 9 | Widen four §6.5 permitted sets — `read-auth` on the PR seam, and `read-object` / `read-remote` / `read-index` in the invoking tree — **one verb per read**, rather than mis-classify any of them into an existing verb | fold `gh auth status` into `read-pr`; fold `git cat-file -e` into `read-status`; fold `git remote get-url` into `read-object` (an earlier draft of §9.3 did the last of these, on transcription cost — withdrawn) | §6.5 forbids reading a further verb into a closed set silently; a mis-classified call is invisible to AT-Q7 at exactly the boundary it guards, and folding `remote` into `read-object` would have let a later `git remote add` pass containment (§9.3) |
| 10 | Enumerate the corpus with **two** `_git(["ls-files", …])` reads over one identical `:(glob)`-anchored pathspec pair — a `--cached --others` enumeration, minus a `--deleted` subtraction (REQ §3.1 step 1's second bullet: an index entry with no working-tree file is not corpus) | two `_listFiles` directory walks over `docs/*` and `docs/completed/*` | the seam structurally cannot return a subdirectory name (`runtime-adapter.js:915`, `:929-931`), so the walk finds an empty corpus in production while `fakeListFiles` hides it in every test — DC-07's "production path ≠ unit path". `ls-files` also returns the repo-root-relative paths `CorpusFile.path` needs (§7.1) |
| 11 | Widen **`rtWriteFile` alone** to accept an absolute path, and leave `rtReadFile` untouched | (a) route the clone's writes through `_git`; (b) widen both prompts "for symmetry", as an earlier draft of §5.6(a) proposed | (a) git has no write-a-working-tree-file verb short of `hash-object -w` plus `update-index` — three mutating calls in the clone domain to replace one path argument. (b) was withdrawn on measurement, not taste: `rtReadFile` carries **no** path-resolution clause to widen — the string "relative to the repository root" occurs exactly once in `runtime-adapter.js`, at `:805` inside `rtWriteFile` — and its shell-command transport already resolves an absolute path verbatim (§5.6(a)). Widening it would have been a prompt edit to a shipped seam every pipeline phase reads through, with no behavioural motive, purely so §11.3(e) had a second thing to match |
| 12 | Add an env-gated `PDLC_PENDING:` stderr line to the hook | keep the count-above-threshold message as AT-P7's oracle | the shipped hook emits a count and only above `THRESHOLD = 5`, which is blind on every fixture that discriminates the two-region predicate — so T-08's "held equal by a differential test" would not be true (§7.1). **Still worth the shipped-hook edit after row 6's narrowing**, and the question was asked directly: a predicate differential is not a consolation prize for the enumeration equality — the two-region predicate is where every edge case the FSPEC enumerates lives (E-04, E-05, E-09, the region boundary), and it is the half a maintainer will actually change. Extracting the predicate into a third shared artifact (row 6's rejected alternative (a)) remains more expensive than one env-gated stderr line in a script CI already `bash -n`s, and it would still leave the enumeration pair exactly where it is |
| 13 | **Release is an in-place `_writeFile` of `RELEASED: {passId} {ISO-8601}`, and `present` reads `file_missing` *alone* as absent, so an empty marker is a truncated one** (§7.3, FSPEC **BR-14a**) | (a) release by truncating to `""`, with `file_empty ≡ absent`; (b) derive `present` from `_readFile(...) !== null`; (c) add a removal seam so release deletes the file | (a) was this document's own decision through v1.8 and is **withdrawn on the FSPEC's answer, not on taste**: under it a released marker and one truncated mid-take are the same observed state, so E-11's empty arm is unreachable and the choice is between a log that loses every pass which died inside its own take and one that records `reclaimed-stale-lock` on every steady-state pass. FSPEC v11.3 decided that trade — BR-14a fixes the sentinel, E-11b makes a `RELEASED:` marker free at any age, E-11 makes the empty arm mean *truncated* — and the sentinel needs **no unlink**, so §7.3's load-bearing premise ("no seam can remove a file") is satisfied unchanged rather than contradicted. (b) cannot name the one probe reason that decides the absent arm (`file_missing`) and conflates a missing file with an unreadable one. (c) is a new agent-transported mutation verb (no adapter ships an unlink — `rtWriteFile` `:802`, `rtAppendFile` `:863`, `rtListFiles` `:905`, `rtGit` `:945`) whose failure mode is deleting a lock another pass holds; AC-1.3 also settles the shape upstream as "in-place rewrites of a whole small file" (REQ AC-1.3). **No cost is carried upstream**: FSPEC §4.2's **fifth** data row (*"Present but **empty**, or a line that is neither form"*), E-11 and AT-M3 are satisfiable in full at this layer (§10.3 row 4), and AT-M11 passes against this document's own mechanism |

Rows 1, 2, 4, 5, 6, 11 and 13 are load-bearing and reversible only at cost; §13.3 records that
DECISIONS is warranted for them. Row 6's decision is now **conditional on row 12**: without the hook's
observation channel there is no differential oracle, and two-implementations would have to be
re-argued on what a count-above-threshold comparison can supply.

### 13.2 Risks

| Risk | Exposure | Mitigation held here |
|---|---|---|
| The widened resolver's bytes live in **four** tracked artifacts | a commit that rebuilds three fails CI's sync job, and a partial rebuild is easy to make by hand | §8.3 states the count; the PLAN carries the rebuild as an explicit task with `pdlc/workflows/dist/` in its pathspec, per `implementation.postWavePathspecs` |
| `mktemp -d -t` behaviour differs subtly between macOS and GNU coreutils | a clone that lands somewhere unexpected | the seam returns the path the tool reported and the pass uses it verbatim; nothing constructs the path itself. The CI matrix already runs both platforms |
| The pass calls the resolver **bare**, so a hung dispatch is bounded only by the runtime watchdog | a wedged pass holds the marker | §7.3's stale-lock reclaim is the recovery, and `staleLockMinutes` is configurable |
| An agent-transported `gh pr list --search` may return a truncated page | a duplicate PR opened despite a matching open one | `--limit 100` and the trailer key are the FSPEC's mechanism; a miss re-opens a proposal, which is the safe direction (a second PR the operator can close), never a lost one |

### 13.3 Handed to the next layers

- **DECISIONS** — warranted. §13.1 rows 1 (credential seam shape), 2 (resolver reuse vs. restate),
  4 (clone source), 5 (non-atomic marker take), 6 (two predicate implementations, with the
  predicate/enumeration split named), 11 (widening **`rtWriteFile` alone**, rather than routing
  clone writes through git or widening both prompts for symmetry) and 13 (release as an in-place
  write of FSPEC BR-14a's `RELEASED:` sentinel, with `file_missing` alone read as absent, over
  truncating to `""` or minting a removal seam) each weighed a real
  alternative with a different reversibility profile, and each will otherwise be reconsidered
  confidently by a future agent. Each needs a `Testability:` line per DC-10.
- **PLAN** — the file-ownership manifest must serialise the three writers of
  `pdlc/workflows/orchestrate-dev.js` (the resolver widening, the `gitWithLockRetry` export, the
  `mergeCommandFor` surfaces) into **one** task: they are one file, and FSPEC §5.2 rule 2 forbids two
  same-batch tasks appending to it. The four `dist/` artifacts are a per-wave chore commit, not a
  task's owned files.
- **PROPERTIES** — §11.4's six properties and FSPEC §14.5's LD-1 … LD-5, in the files §11.5 names.
  The two determinism properties carry a **positive conjunct each** (§11.4's second table); a
  fixture written against invariance alone would be satisfied by a constant function.
- **PLAN, additionally** — three obligations this revision creates. (i) The `runtime-adapter.js`
  writers are **one** task for the same reason `orchestrate-dev.js`'s three are: `rtEnvPresent`,
  `rtMakeTempDir`, `rtConsInjections` and §5.6(a)'s **one** prompt widening (`rtWriteFile`; `rtReadFile`
  is not edited) are one file. (ii) The
  `__tests__/runtimeBundle.test.js` edits — `AWAIT_SCAN_SOURCES` **and** `AT19_SEAM_NAMES`
  (§11.3(c)) — are one task in that one file. (iii) The release note and
  `pdlc/RELEASE-CHECKLIST.md` must state that the first queue invocation after this feature lands
  is blocked by the drift gate until `sync-workflows.sh` runs (§8.3). (iv) `consolidationLifecycle.test.js`
  (§12.2 T-13) and `consolidationDoubles.js`'s `asAsync` wrapper (§11.2) are two more owned files in
  the manifest; the wrapper is created by the doubles task and depended on by the lifecycle task, per
  batch-safety rule 4. (v) `consolidationLifecycle.test.js` now owes **two** cases — T-13's await
  discipline and §12.2's release-across-the-six-terminal-statuses set equality — and
  `consolidationBuild.test.js` owes a fourth, §12.2's `rtConsInjections()` ↔ §5.1 set equality. Each
  file stays a **single** task per batch-safety rule 2; the build file's new case is an edge from the
  `runtime-adapter.js` task of (i), since it reads the object that task creates. (vi) `consolidationPass.test.js`'s
  marker case carries **AT-M3's two fixtures and AT-M11's two in one case** (§12.2's marker row): the
  `""` and the neither-verb fixtures reclaim, the two `RELEASED:` fixtures do not, at either age. It
  adds **no** file and **no** task — it is one case that file's single owning task already writes —
  so the ownership manifest is unchanged; it is recorded here only so the task's Definition of Done
  names the pairing and a PLAN reader does not read §10.3 row 4 as covered by half a case.
- **Upstream (FSPEC) — the marker's removal verb and the empty-marker arm: decided upstream,
  absorbed here, nothing handed on.** This bullet previously handed the PLAN an open question. It is
  **closed**, and the closure is the FSPEC's: **BR-14a** decides that the marker is released by an
  in-place write of `RELEASED: {passId} {ISO-8601}` and never by removing the file, which no seam can
  do; **E-11b** decides that a `RELEASED:` marker is taken like an absent one at any age, recording no
  reason code; and **E-11** decides the empty marker — reachable exactly *because* release writes a
  sentinel rather than truncating — as reclaimed, recording `reclaimed-stale-lock` with the abandoned
  id `unknown`, which is the FSPEC's answer to the product question this bullet used to carry (*must
  the durable log witness a pass that died inside its own take?* — **yes**). §7.3 adopts all three:
  release writes the sentinel, `present` reads `file_missing` alone as absent, §10.3 row 4 states the
  single reclaim arm the register describes, and §12.3 assigns AT-M3 and AT-M11 with no divergence and
  no partial-coverage disclosure. **No erratum is raised against FSPEC §4.1/§4.2 from this document**,
  and none should be re-raised downstream: the question is settled, and a PLAN task written against
  the empty release form would be written against the losing side. Residue, stated once and small: one
  permanent `docs/_decisions/.consolidation-lock` per consuming repo carrying the last pass's
  `RELEASED:` line — `.gitignore`d by §3.3, so invisible to every git-mediated surface — and a
  zero-byte file at that path is now a *signal* (a pass died mid-write) rather than the steady state.
- **Upstream (REQ and FSPEC) — the enumeration relaxation, absorbed and closed.** This bullet raised
  an erratum against both documents; **both halves came back answered, and §7.1 and §10.4 now carry
  the answers.** It is kept in the past tense as the record of a closed round trip, not as a live
  dependency — a PLAN reader owes nothing here.

  - **"One enumeration as well as one predicate" was withdrawn, not granted.** REQ §3.1 step 1
    previously closed with that clause; REQ v2.1 struck it and says so in place — *"The second half
    is not deliverable and is **withdrawn**"* — on this document's own reasoning: the `_listFiles`
    seam structurally cannot walk directories (§13.1 row 10), so the pass must enumerate through git
    while the hook keeps `glob.glob`. REQ now states the settled shape directly: *"**One predicate
    remains guaranteed by construction** … while the two enumerations are separate mechanisms whose
    agreement is a stated, testable property rather than a shared code path."* That is exactly what
    this layer ships — predicates held equal by AT-P7, enumerations held by literal pins over a
    derivable divergence set.
  - **FSPEC re-scoped AT-P7 to match.** Its *When* no longer reads "both the pass's enumeration and
    `nudge-consolidation.sh` are run over each case"; FSPEC v11.6's row (FSPEC §13.2 register, *The
    consumed predicate and the corpus*, AT-P7; **BR-09** binds it in FSPEC §18) reads that *"the two
    **predicates** are evaluated over each case"* and scopes itself to "the predicate, and only the
    predicate". The set-equality assertion that would have been red on correct code is gone from the
    register, so §12.2's T-08 row and §11.1's harness no longer compensate for a claim upstream still
    makes.
  - **The `.gitignore`d-corpus sub-question was decided against this document's provisional choice.**
    REQ §3.1 step 1 decided that an ignored LEARNINGS *is* corpus and that the pass therefore does
    **not** apply `--exclude-standard`; it decided in the same paragraph that an index entry with no
    working-tree file is *not* corpus. §7.1 absorbs both, §10.4 records the argument that lost and
    the one reasoning error the old bullet contained. The divergence set is now one class (a nested
    git repository), not two.

  One question from that batch was **answered upstream, and is absorbed here — not answered here**:
  the `unread:` field. This document raised it because an earlier revision of §7.1 put an unreadable
  corpus entry **in** the consumed pair, so a LEARNINGS file could be permanently marked consumed
  while contributing no evidence to any promotion, the only trace being one pass's transient report
  body. **REQ §4b (erratum, REQ v2.1) decided it, and decided it by removing the premise rather than
  by declining a field**: an enumerated basename whose body cannot be read *"is instead **not
  consumed** — it is omitted from the `<!-- pdlc:consumed {passId} -->` pair, so it stays
  un-consolidated and the next pass retries it"*, and *"Omission needs no new field, no new reason
  code and no vocabulary row, and it is not silent: the basename remains in the un-consolidated set
  that both the hook and the next tick compute"*. REQ's reason for refusing inclusion is the
  falsifiability loop, not economy: a consumed-but-unread entry can only push a verdict toward
  `prevented` or `insufficient-evidence` and never toward `recurred`, corrupting REQ-CONS-05 in one
  direction. §7.1 now carries that decision, including the convergence argument this layer had used
  to justify the opposite arm — the retry is bounded by its population, since the `--deleted`
  subtraction removed the staged-but-deleted case and what remains is a permissions error or a
  mid-pass unlink, each an operator-visible fault with a fix at the source. **Nothing is handed up,
  and nothing is decided here.** **Re-evaluation trigger**, so the premise this absorption rests on
  stays checkable rather than final: if a pass is ever observed reporting the same unreadable
  basename on two consecutive passes, the fault is not transient, the bounded-retry argument fails,
  and the question should be re-raised upstream with that observation as its evidence. Accepted
  residue meanwhile, set-equal with §10.4's list: one operator-visible nudge that no pass can clear
  (the nested-repository class) and one retryable unreadable corpus entry, re-offered and re-reported
  each pass until the operator clears it — never a correctness divergence, since the pass consumes
  only what its own enumeration returned and could read.
- **Upstream (FSPEC) — two register gaps: raised, answered, closed. Nothing is handed on.** §12.2's
  re-binding surfaced two obligations that carried no acceptance test — AC-3.2's requirement that the
  PR body cite each source LEARNINGS by feature name, the failure mode and the AC-2.3 evidence (the
  AC→AT map bound AC-3.2 to AT-Q2, which asserts only the trailers), and FSPEC §5.3's "when, **and
  only when**" negative direction for the proposal file. Both **were** raised as errata against the
  FSPEC rather than bound to a nearby id, and both **were covered locally in the meantime** by a
  `(no FSPEC AT)` case in `consolidationRoute.test.js`, which is why the gap was never a shipping
  licence. FSPEC v11.3 answered both: **AT-Q13** (FSPEC §13.5 register, AC-3.2) and
  **AT-R7** (FSPEC §13.4 register, AC-1.4). The two interim cases are **re-labelled
  with those ids in place**, not duplicated (§12.2 T-11/T-12, §12.3's route row), so no
  `(no FSPEC AT)` case remains for either and both ids count on both sides of §12.3's set equality.
  **The PLAN owes nothing here**: it should write the two cases as `AT-Q13` and `AT-R7`, and it must
  not re-raise either erratum. This bullet is kept in the past tense rather than deleted because the
  round trip — gap named → erratum raised → id minted upstream → interim case re-labelled — is the
  evidence that naming a gap is a working channel.

- **Upstream (vocabularies) — ER-6**, the `Route` union's missing proposal-file member, is
  recorded in full at §12.4 with its `route: "degraded"` interim and the two-fixture
  discriminator §12.2 obliges. Listed here so the hand-off carries it; nothing about it is
  decided anew.


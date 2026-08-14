---
feature: pdlc-engine-distribution
---

# FSPEC — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10, re-grounded 2026-08-13 erratum round); `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-05); `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-10…M-ENG-13) |
| Downstream | TSPEC, PLAN, PROPERTIES for this feature; `pdlc-plugin-retirement` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.6 | 2026-08-14 |

*0.6 (2026-08-14, erratum round): the missing-plugin literal now matches the shipped value
everywhere it is quoted. AT-1.6 read `"none"` and AT-1.1 read "states none is installed", but the
shipped renderer and `checkCompat` report the exact string `not found`
(`pdlc/engine/lib/handshake.mjs`, pinned at `pdlc/engine/__tests__/handshake.test.js:113`), which is
what PROP-LAUNCH-5 and PROP-LAUNCH-9 already transcribe. AT-1.1, AT-1.6 and Q-1's triple-member
obligation now name `not found`; AT-1.4's discriminator, which cited the old "none installed"
message by name, points at AT-1.1's `not found` message instead so the reference does not dangle
(pm-review, se-review erratum). Literal alignment only: no criterion changed, no scope moved.*

*0.5 (2026-08-14, round-4): §5.2's workflow row and AT-3.8b drop `[blocked on O-10]` for
`PK-20`…`PK-22`, O-10 kept only on BR-8.2 (SE `F-01`, TE `F-02`); §5.2/§1 own **per-class** counts
(TE `F-01`); AT-3.8a authoritative, AT-3.8b a sub-assertion (SE `F-02`); count conjunct pinned to
the transcribed `PK-*` list (TE `F-03`). Routed upstream: REQ AC-1.3 wording, PLAN's discharged
erratum, TSPEC's co-change sentence.*

*0.4 (2026-08-14, POSTMORTEM-P follow-up, direction (a)): the packed-content set's ownership
split is now consistent in both directions. §5.2 gains class rows for the package README (PK-2),
the licence (PK-3, expected only once N-2's record lands) and the install script (PK-23), so every
member of TSPEC §5.4's `PK-*` table has a class here (SE `F-01`); §5.2 and AT-3.8a now carry the
**member count** — 23 before N-2, 24 after — as the FSPEC-side change-control point, which keeps
REQ AC-1.3's *expected set stated in the FSPEC* true without a REQ erratum (TE `F-01`, `Q-02`);
the exclusion list no longer reads "no repo-level documentation" against the now-packed README;
BR-8.1 names TSPEC §5.4's `PK-*` table as the literal expected side while keeping the
anti-directory-listing rule (SE `F-02`); §1 restates the ownership split (TE `F-02`). Noted, not
fixed, for the next round: REQ v0.10's changelog attributes the run-side pin read to "FSPEC F-3
step 5" where the flow lives in F-4 (SE `F-03`, prose only, no behavioural consequence); §5.2's
workflow-module row is still marked `[blocked on O-10]` though `TSPEC:421-429` unblocks
PK-20…PK-22 (SE `Q-01`).*

*0.3 (2026-08-13, erratum round): re-grounded on REQ v0.10 — NG-6/O-2's run-reads-`engine.*`-pin
scope was already carried (§3 F-4, BR-2.2, BR-4.7, I-4, E-11), and AC-3.5's two positives are now
absorbed into AT-3.5. Two errata fixed: the dangling `AT-7.x` citation in §3 F-7 now reads
**AT-6.2** (§8 enumerates no AT-7 group), and the packed-member enumeration (§5.2 CLI-entry and engine-module rows, AT-3.8a)
no longer restates a member list of its own — the members are named downstream in TSPEC §5.4's
`PK-*` table, which is the single source the verifier transcribes. No other change.*

**FSPEC ID:** `FSPEC-EDIST-01`

## 1. Purpose and scope

This FSPEC specifies the **observable behaviour** of the four things REQ-EDIST-01…06 ask for:
the compat handshake a run performs before it dispatches, the install/upgrade lifecycle on an
operator machine, the tag-driven publish pipeline, and the provenance a run leaves behind in a
consumer repo. It also carries the three **expected sets** the REQ deliberately parked here rather
than in a measurement file (§5): the required-check set (T-7), the packed-content set (AC-1.3) and
the dev-mode artifact-kind set (AC-5.3).

**Ownership of the packed-content set.** This document owns that set's *classes* and its *member
counts, per class and in total* (§5.2); the member *names* live downstream in TSPEC §5.4's `PK-*`
table, because decomposition is the TSPEC's decision. A change to any class's cardinality moves
both sides together; a rename at constant cardinality is downstream-only (TE round-4 F-01).

**Altitude.** Behaviour, decision points, business rules, expected sets, error text obligations.
Not here, and owned by the TSPEC: package layout, manifest schema beyond the fields the REQ
already fixed, flag and field names, module boundaries, workflow YAML, and every carrier decision
parked at O-9 and O-10. Where a rule below says "the run states X", it fixes *that X is stated and
is machine-checkable*, not the string.

**Two sources of behaviour, one product.** The engine executes the canonical workflow modules;
the prompts it dispatches are read from the **installed plugin** at dispatch time. Every flow here
treats the plugin as an external, versioned input that may be absent, present-and-compatible, or
present-and-incompatible — three states, never two.

**Grounded at HEAD.** Every claim below about shipped behaviour is either cited to a measured fact
(`M-ENG-*`) or to a symbol in the tree. Where this FSPEC describes behaviour that does **not**
exist yet, it says so in the flow that needs it and names the obligation that owns it.

## 2. Linked requirements

| Flow | Requirement | Criteria covered | User stories |
|---|---|---|---|
| **F-1** Compat handshake and version query | REQ-EDIST-01 | AC-1.1, AC-1.2, AC-1.4 | US-01, US-02 |
| **F-2** Install on a clean machine | REQ-EDIST-02 | AC-2.1, AC-2.3 (install leg), AC-2.4 | US-01 |
| **F-3** Upgrade, and the zero-per-project promise | REQ-EDIST-02 | AC-2.2, AC-2.3 (upgrade leg), AC-2.5 | US-02 |
| **F-4** Version resolution: pin, latest, dev-mode | REQ-EDIST-05 | AC-5.1…AC-5.6 | US-05, US-06 |
| **F-5** Tag-driven publish | REQ-EDIST-03 | AC-3.1…AC-3.7, AC-1.5 | US-03 |
| **F-6** Provenance emission into consumer artifacts | REQ-EDIST-04 | AC-4.1…AC-4.5 | US-04 |
| **F-7** Coexistence and non-regression of the bundle path | REQ-EDIST-06 | AC-6.1, AC-6.2 | US-02 |
| §5.1 Expected required-check set | REQ-EDIST-03 | AC-3.4, T-7, C-5 | US-03 |
| §5.2 Expected packed-content set | REQ-EDIST-01 | AC-1.3 | US-01 |

Every acceptance criterion of the REQ appears in exactly one row above; a criterion added to the
REQ without a row here is a defect in this table, not a gap for a reader to resolve.

**Values read, never re-declared.** T-1a, T-1b, T-2…T-7 are the REQ's; this document cites them
by id. Where a flow needs a value the REQ did not declare, it is raised in §9, not invented here.

## 3. Behavioral Flow

Each flow is stated as steps with explicit decision points. A step that describes behaviour not
present at HEAD is marked **[new]**; one that describes shipped behaviour is marked **[shipped]**
with its symbol, so a reviewer can check the claim in one pass. **Every flow carries the marks**
(SE round-1 F-10): F-2, F-3, F-5 and F-6 are wholly new and marked once at the heading, with only
their **[shipped]** steps marked individually; F-1, F-4 and F-7 are mixed and marked step by step.

### F-1 — Compat handshake and version query *(AC-1.1, AC-1.2, AC-1.4)*

Every pipeline command performs the handshake **before** any dispatch, and never partially: no
prompt is read, no agent is started, nothing is written until the handshake resolves.

1. Resolve the **engine version** (T-1a) from the running package. Always succeeds; if it cannot,
   that is a corrupt install and the run refuses under BR-1.6.
2. Resolve the **declared compatible-plugin range** (T-3, `pdlcPluginCompat`) from the running
   package's own manifest. **[shipped]** `pdlc/engine/bin/pdlc.mjs:143` reads `pkg.pdlcPluginCompat`
   and passes it as `engineCompat` into `startup.mjs:302`; `handshake.mjs` — `satisfiesRange` — is
   the *comparison* performed at step 4, not the resolution (SE round-1 F-05).
3. Resolve the **plugin root** in the precedence order of F-4, then read the installed plugin's
   version (T-1b). **[shipped]** `skills.mjs` — `resolvePluginRoot`; `handshake.mjs` —
   `readPluginVersion`, which distinguishes *absent* from *unreadable* (BR-1.3).
4. **Decision point — three outcomes, never two:**
   - **No plugin found** → refuse, naming the declared range and stating that none is installed.
   - **Plugin found, version outside the range** → refuse, naming the declared range *and* the
     version found.
   - **Plugin found, version inside the range** → proceed; prompts are read from that plugin's
     `skills/` tree **at dispatch time**, never from bytes inside the engine package (AC-1.2), and
     §5.2 makes that structurally true by containing no skills files to read.
5. On either refusal the run exits non-zero, dispatches nothing, and writes nothing into the
   consumer project. **[shipped]** `handshake.mjs` — `checkCompat` and its `REMEDY` text.
6. **The diagnostic command `pdlc doctor` sits outside the gate** (AC-1.1). **[shipped]** — the
   command ships (`pdlc/engine/bin/pdlc.mjs:489`) and dispatches nothing (`startup.mjs`; SE
   round-1 F-04). It still runs when the handshake fails and reports the same triple as step 7.
   Every other pipeline command is gated: exactly one command is exempt, and it is this one.
7. **The version triple.** The version query reports, in one output: engine version (T-1a), the
   declared range (T-3), and the installed plugin's version *or* the explicit statement that none
   is installed. The same triple appears in the startup banner and in every run report (F-6), from
   one resolution per run — not three independent resolutions that can disagree (BR-1.5).

### F-2 — Install on a clean machine *(AC-2.1, AC-2.3 install leg, AC-2.4)* **[new]**

1. The operator reads the install command from **one place**: `pdlc/README.md`'s
   `## Install in another repo` section (`pdlc/README.md:132`), which today documents the *plugin*
   install (`:139`, with a local-marketplace variant at `:145`) and gains the **engine** install
   command under it. **[new]** — no engine install command exists at HEAD. The uniqueness rule is
   keyed on the **engine's own** install/upgrade invocation, distinguishable by its program name;
   `claude plugin install`'s existing occurrences (`README.md:115`, `pdlc/README.md:139,145`) are
   outside the set. No other file is a transcription source (AC-2.1).
2. They run it once, on a machine with Node ≥ T-2 and nothing pdlc-related installed.
3. **Decision point — Node floor.** If Node is below T-2 the attempt fails with a message naming
   the required floor and the version found: no stack trace, no partial install, nothing left
   half-written (AC-2.4).
4. On success **all three** of AC-2.1's conjuncts hold, and all three are asserted: the CLI
   resolves on `PATH`, from an install location that exists, at the version the command asked for;
   **it reports the version triple (AC-1.4)**; and step 5's handshake is reached.
5. The operator invokes a pipeline command. With no plugin installed, F-1 step 4 refuses naming
   the declared range. **That refusal is the pass condition** on a plugin-free machine: install is
   proven by *reaching the handshake*, not by dispatching (AC-2.1).
6. No second command, manual step, repo clone, or per-project action is required at any point.

### F-3 — Upgrade, and the zero-per-project promise *(AC-2.2, AC-2.3 upgrade leg, AC-2.5)* **[new]**

1. Record, before the upgrade: the resolved CLI version and the install location.
2. Run the upgrade command once, **on the machine** — never inside a consumer project. Its
   documented home is the same single section as the install command's (F-2 step 1): the
   uniqueness rule of BR-2.3 governs **both** engine commands, not the install one alone.
3. Invoke the pipeline in each of two consumer repos that had previously completed a run at the
   old version. Each run executes the new version, observable **both** in the run's own output and
   in the artifacts it writes (F-6).
4. **No command is executed inside either repo** other than the pipeline invocation itself: no
   sync, no copy, no drift check, no config edit.
5. **Non-interference, checked on the same run** (C-2, AC-2.3): the consumer repo's working tree
   and index are unchanged by install and by upgrade — no file created, modified or deleted
   anywhere under the project, in particular nothing under `.claude/`. **Install and upgrade
   neither read nor write consumer config**; the *run* reads the `engine.*` namespace (F-4 step 2)
   and writes nothing. The reconciliation with NG-6 is by **scope**, not by verb (SE round-1
   F-11); NG-6's own wording is an erratum against the REQ, not fixed here.
6. **Positive halves differ by leg, deliberately.** A clean-machine install has no before-value to
   differ from, so its positive is "resolves on `PATH`, at the expected version, from an install
   location that exists". The upgrade's positive is a *change*: resolved version and install
   location differ from the values recorded at step 1 — the observation that proves the upgrade
   was not a silent no-op.
7. **Coexistence** (AC-2.5): with the plugin also installed and in use interactively, both paths
   work positively on the same run — the engine reaches dispatch, an interactive plugin session
   invokes a skill — and neither install path modifies the other's files.

### F-4 — Version resolution: pin, latest, dev-mode *(AC-5.1…AC-5.6)*

Resolution is a **total, ordered** decision: exactly one branch is taken per run, and the branch
taken is announced in the run's own output. Silence is never a permitted outcome.

1. **Dev-mode declaration present** (explicit, per-invocation, T-6) → the checkout's engine and
   the checkout's prompts execute. Dev-mode is the **conjunction** of running the checkout's
   engine *and* pointing the plugin-root selector at the checkout's `pdlc/` (O-5); one without the
   other is not dev-mode and must not be reported as such. The run's dev-mode mark is written to
   exactly the artifact kinds enumerated at §5.3. **[new]** — nothing marks such a run today
   (M-ENG-13).
2. **No dev-mode declaration, project pin present** → the pinned version executes. The pin is read
   from the `engine.*` namespace of the consumer-owned `.claude/pdlc.config.json` (O-2, grounded
   in DEC-HE-02) and never written by the engine. The run announces the pin, naming the version.
   - **Pinned version not installed** → refuse, naming the pinned version and what is installed.
     Never a silent fallback to latest (AC-5.5).
3. **No dev-mode declaration, no pin** → the latest installed version executes and the run says
   so. **The absence of a pin is announced as loudly as its presence** (AC-5.2): "no pin; latest
   installed" is an emitted statement, not the absence of one.
4. **A checkout merely existing on the machine changes nothing** (AC-5.4): with no dev-mode
   declaration, the installed released version executes. Dev-mode is never inferred from cwd, from
   an environment variable's presence, or from a checkout being nearby (T-6).
5. **The shipped environment override is a conflict, and is resolved loudly** (AC-5.6). Today
   `PDLC_PLUGIN_ROOT` is honoured on presence alone. **[shipped]** `skills.mjs` — `PLUGIN_ROOT_ENV`
   and `resolvePluginRoot`. With the variable exported and no per-invocation dev-mode declaration,
   the run takes exactly one of two branches — refuse naming the exported variable, or execute the
   released version and state that the variable was ignored. **[new]** Which branch is the TSPEC's
   to fix; that one of them happens, loudly, and that neither is a silent switch of skill source,
   is fixed here.
6. **The "newer version exists" notice is a probe behind an injectable seam** (AC-5.1), never an
   unconditional network call. When the probe is unavailable — offline, CI, registry down — the
   run states that it could not check and proceeds. It never fails, never blocks, and never
   fetches or applies a version (NG-3). The seam exists so the pin assertion is testable without a
   network and so NG-3's boundary is testable by stubbing.

### F-5 — Tag-driven publish *(AC-3.1…AC-3.7, AC-1.5)* **[new]**

The publish pipeline is **additive**: its own workflow file with its own trigger. It may reuse the
PR gate's jobs but may not weaken, rename, make conditional, or re-render any member of §5.1
(C-5), because Phase PUB polls those names literally. Nothing of this kind exists at HEAD:
`.github/workflows/` holds exactly one file (`pr-tests.yml`), so every step below is new work.

1. **Trigger** (T-4): a pushed git tag naming an **engine** version. No other trigger publishes.
2. **Gate check.** Every member of §5.1's expected set must be green on the tagged commit. If any
   member fails, or is absent, or did not run: **nothing is published and the publish workflow run
   is failed** (AC-3.2). A skipped run and a green-but-inert run are both defects, because neither
   is distinguishable from success by a reader of the runs list.
3. **Tag/engine-version agreement** (AC-3.6): the tag's version is compared against the **engine**
   version of record (T-1a) at that commit, and never against the plugin's number. On disagreement
   the workflow fails naming both values rather than publishing under either.
4. **Range/plugin agreement** (AC-3.7, C-1): the engine's declared compatible-plugin range (T-3)
   at that commit must include the plugin version of record (T-1b) at that commit. If not, the
   workflow fails naming the declared range and the plugin version found, and publishes nothing —
   a release is never cut already excluding the plugin it is paired with.
5. **Build**, producing an artifact whose contents equal §5.2 member-for-member.
6. **Pairing record** (AC-1.5, O-6): the job that already computed both numbers for step 4 writes
   the triple `{engine version, compat range, plugin version at the tag}` **once**, inside the
   published artifact. Any release-notes rendering is *derived from* that record by the same job,
   never independently authored: two writers are two drift surfaces.
7. **Manifest publish-preconditions, checked offline before the channel is called** (BR-3.8).
   At HEAD all three of O-8's blockers stand — `"private": true` (`pdlc/engine/package.json:4`,
   the one npm refuses), unscoped `pdlc-engine` (`:2`) against DEC-DIST-05, `"UNLICENSED"` (`:11`)
   — so AC-3.1 is refused by the tool, not merely unimplemented. Clearing them is the operator's
   (§9 Q-8); the workflow fails offline naming the offending field.
8. **Publish** to the channel decided at DEC-DIST-05 (public npm, scoped), **through an injectable
   channel seam** (BR-3.9) — the same discipline F-4 step 6 already sets for the update probe.
9. **Immutability and re-run** (C-7, AC-3.3): re-running the workflow for an already-published
   version takes one of two permitted branches — an explicit no-op statement, or a loud failure
   naming the collision. On **either** branch two positives are asserted: the published bytes for
   that version are byte-identical before and after the re-run, and the run's own output names the
   version. A branch that satisfies neither is a defect. Both branches, and the byte-identity
   assertion, are decided **over the seam's stub** (BR-3.9): the real channel refuses re-publish
   by design (`docs/_decisions/DECISIONS-plugin-distribution.md:125`), so rehearsing this against
   it would burn a version number irreversibly and the no-op branch could never be observed.
10. **Secrets** (C-8, AC-3.5): the channel credential exists only as a repository secret consumed
    by this workflow. It appears in neither the published contents nor any log the publish
    produced, and no distribution-channel credential is ever required to *run* the engine. The
    scan is performed over the built artifact and the captured log of a **stub-channel** run;
    the real channel adds no observation this assertion needs.

### F-6 — Provenance emission into consumer artifacts *(AC-4.1…AC-4.5)* **[new]**

M-ENG-13 locates the gap precisely: the engine/plugin pair already exists in the CLI's returned
report and is absent from every artifact a run **commits**. This flow is about the committed
artifacts, and it is **[new]** work whose carrier is owned at **O-9**.

1. One resolution per run (F-1 step 7) produces the pair; every emission below reads that one
   resolution.
2. **Run report** (AC-4.1): states both versions, on the success path and the halt path alike.
3. **Halt artifacts** (AC-4.2): the pair is present in the committed bytes of at least the
   POSTMORTEM the halt writes, so a reader with only the repo's history can name both versions.
   The layer that writes those artifacts structurally cannot see a version today (M-ENG-13), so
   this requires a deliberate layering decision — **O-9**, not an assumption.
4. **Distinguishability** (AC-4.3): two runs of the same feature on different engine versions are
   distinguishable from the artifacts alone. This is the regime-ledger scenario and passing it is
   the point of the requirement.
5. **Agreement, and the anti-echo half** (AC-4.4): reported values agree with the installed
   engine's and installed plugin's own reported versions for every run. The anti-echo half is a
   **change check**: with a different plugin version made current, the reported pair changes
   correspondingly on the next run, and reverting restores the original pair — so a hardcoded
   constant that happens to match once fails the second observation.
6. **No back-fill, no collateral writes** (AC-4.5, NG-5): prior artifacts are neither back-filled
   with provenance nor invalidated; provenance appears from that run forward. Every file under
   `docs/{feature}/` that existed before the run hashes identically after it, **except** files the
   run's own final report enumerates as authored by it — the report's enumeration *is* the
   comparison set, so exception membership is decidable from the run's output rather than from
   judgement. Files belonging to any other feature hash identically with no exception at all. The
   report does not enumerate authored files today; supplying that enumeration is **O-9**'s, with
   the same carrier question as step 3.

### F-7 — Coexistence and non-regression of the bundle path *(AC-6.1, AC-6.2)*

1. **The bundle path is untouched** (C-4, G-6). Nothing this feature ships modifies, shadows, or
   depends on the plugin, the artifacts under `pdlc/workflows/dist/`, or the sync/drift scripts.
2. **Bootstrap still works, transcribed literally** (AC-6.1): `node pdlc/workflows/build-runtime.mjs`
   then the **bare-path** invocation of `pdlc/hooks/scripts/sync-workflows.sh`, in that order, both
   exit 0; `pdlc/hooks/scripts/sync-workflows.sh --check` then exits 0 with every manifest row in
   sync. The order is not interchangeable and the bare-path form is load-bearing: a `bash`/`sh`
   prefix would mask a lost execute bit (exit 126). **[shipped]** both scripts exist and CI
   discharges this on a **fresh clone** (`.github/workflows/pr-tests.yml:138,152`) — a precondition
   that is part of the claim (SE round-1 F-06): plain sync skips `local-edit`/`unverified` rows and
   exits non-zero (`pdlc/hooks/scripts/sync-workflows.sh:703-722`), and every pre-existing consumer
   copy is `unverified` on first run. The claim therefore holds where **no consumer copy exists and
   the sync manifest is clean**; `--force` is out of scope.
3. **Channel identification** (AC-6.2, C-9). An engine run identifies itself by emitting its
   provenance block (F-6). The bundle channel executes inside the Claude Code workflow runtime and
   cannot emit one, and C-4 forbids teaching that path to self-report, so its identification is a
   **conjunction bound to one run**: (1) the run completed and emitted its own named output
   artifacts, and (2) that output carries no engine provenance block. A run that crashed before
   emitting anything fails (1); an engine run fails (2).
4. **The honest residue.** The fact that actually separates the channels is the **load root** — the
   tree the executing modules were loaded from: the plugin's `.claude/workflows/` versus the
   engine's own install location, two disjoint enumerated paths. It is a *load* root, not a write
   root: no run writes `.claude/workflows/`; `sync-workflows.sh` and the SessionStart drift hook
   do, and the runtime's own contact with that tree is a read. **No run-bound observation of the
   load root exists on the bundle side today**, and installing only one channel is the precondition
   of an experiment, not an observation the run makes — so it cannot discharge this oracle.
   Supplying one is **O-9**'s third carrier. Until it lands, (1)+(2) distinguish the channels only
   on a machine whose installed channels are known independently, and §8's AT-6.2 is written to
   assert exactly that much and no more (see §9 Q-2).

## 4. Business rules

Rules are numbered by the flow they govern. Each is stated so a failing test can be derived from
it without a further question.

**BR-1 — Handshake**

- **BR-1.1** The handshake runs before any dispatch, and is all-or-nothing: on refusal, no prompt
  is read, no agent starts, no file in the consumer project is written, and the exit is non-zero.
- **BR-1.2** The plugin has **three** states — absent, present-and-outside-range,
  present-and-inside-range. Refusal messages for the first two differ: the first states that none
  is installed, the second names the version found. Collapsing them is a defect.
- **BR-1.3** *Present but unreadable* (manifest missing, unparseable, or version field absent) is
  **not** treated as absent: it refuses naming the root that was inspected and what was wrong with
  it. A run must never silently degrade a broken plugin into a missing one.
- **BR-1.4** Every refusal message names the declared range (T-3). A refusal that does not let the
  operator compute their own remedy is a defect.
- **BR-1.5** The version triple is resolved **once per run** and all emitters read that resolution.
  Two emitters that resolve independently can disagree, and a disagreement is unfalsifiable from
  the artifacts.
- **BR-1.6** If the engine cannot resolve its own version (T-1a), it refuses with a message naming
  the corrupt install; it never reports "unknown" and proceeds.
- **BR-1.7** The diagnostic command — `pdlc doctor`, shipped at `pdlc/engine/bin/pdlc.mjs:489` — is
  the **only** exemption from BR-1.1, and it reports the same triple as the version query.

**BR-2 — Install and upgrade**

- **BR-2.1** Install and upgrade write **nothing** into any consumer project (C-2, NG-6): no file
  created, modified or deleted under the project, in particular nothing under `.claude/`.
- **BR-2.2** Install and upgrade touch consumer config not at all. Reading it is a *run*-time
  behaviour (BR-4.7), stated there rather than here.
- **BR-2.3** The engine's install command **and** its upgrade command each have exactly one
  documented source, and it is the same section (F-2 step 1, F-3 step 2). The rule is scoped to
  the engine's own invocations; the plugin's `claude plugin install` occurrences are outside it.
  A second copy of an engine command in another file is a defect the moment it exists.
- **BR-2.4** Below the Node floor (T-2), install and every pipeline invocation fail with a message
  naming the floor and the version found — never a stack trace, never a partial run.
- **BR-2.5** Upgrade is a machine-level action with a project-level effect: after it, every
  consumer project runs the new version with zero per-project action.
- **BR-2.6** Neither install path (plugin, engine) modifies the other's files (C-4).

**BR-3 — Publish**

- **BR-3.1** Publishing is gated on the same evidence a PR is: every member of §5.1 green on the
  tagged commit (C-6).
- **BR-3.2** A failed precondition produces a **failed workflow run**. Silent no-op, skip, and
  green-but-inert are all defects (AC-3.2).
- **BR-3.3** A version number identifies exactly one set of bytes, forever (C-7). Re-publishing an
  existing version never overwrites it.
- **BR-3.4** The tag is compared against T-1a only; the plugin's number enters only through the
  compat range check (AC-3.6, AC-3.7, O-7).
- **BR-3.5** The publish workflow is additive and may not weaken, rename, re-render or make
  conditional any member of §5.1 (C-5).
- **BR-3.6** No credential value appears in the published contents or in any publish log (C-8);
  no distribution-channel credential is required to run the engine.
- **BR-3.7** The per-release pairing record has exactly **one** writer (F-5 step 6); every other
  rendering is derived from it.
- **BR-3.8** The package manifest's own publish-preconditions are a **gated, offline** check, not
  a discovery at first tag push: the manifest must be publishable (not private), scoped per
  DEC-DIST-05, and its name must match the pairing record's. A failure names the offending field
  and fails the run (BR-3.2). The three blockers standing at HEAD are O-8's (F-5 step 7).
- **BR-3.9** The publish action sits behind an **injectable channel seam**. Tag/version and
  range/plugin agreement, manifest preconditions, the pairing record and BR-3.3's collision
  branches are all decided offline over a stub — repo-local computations, no network, no version
  number consumed (SE round-1 Q-01). The one leg a stub cannot cover — that the real channel
  accepted the bytes — is a **named, dated, one-time** observation recorded in this rule at first
  publish, the shape BR-7.4 uses for rendered check names; never a gate, never re-run per release.
  *Observation record: pending first publish; owner operator.*

**BR-4 — Version resolution**

- **BR-4.1** Resolution is total and ordered: dev-mode ≻ pin ≻ latest installed. Exactly one
  branch is taken and it is always announced.
- **BR-4.2** Dev-mode is explicit and per-invocation. It is never inferred from cwd, from the
  presence of an environment variable, or from a checkout existing on the machine (T-6).
- **BR-4.3** A pin naming an uninstalled version refuses; it never falls back to latest (AC-5.5).
- **BR-4.4** Absence of a pin is stated as explicitly as a pin (AC-5.2).
- **BR-4.5** The update probe sits behind an injectable seam, never blocks, never fails a run, and
  never fetches or applies a version (NG-3, AC-5.1).
- **BR-4.6** `PDLC_PLUGIN_ROOT` present without a dev-mode declaration resolves loudly — refuse
  naming the variable, or run released and state the variable was ignored (AC-5.6). Silence is not
  a permitted third branch.
- **BR-4.7** A **run** reads consumer-owned config — only the `engine.*` namespace of
  `.claude/pdlc.config.json` — and never writes it; the rest of that file is not its business.

**BR-5 — Provenance**

- **BR-5.1** Both halves of the pair travel together. An artifact carrying one version and not the
  other does not satisfy F-6; "which semantics ran?" is a two-axis question (G-4).
- **BR-5.2** Provenance appears from the emitting run forward. No prior artifact is back-filled or
  invalidated (NG-5).
- **BR-5.3** The comparison set for "what did this run touch?" is the run report's own enumeration
  of authored files. Judgement about "normal phase work" is not a permitted oracle (AC-4.5).
- **BR-5.4** Reported provenance tracks reality: change the current plugin version and the next
  run's pair changes; revert and it reverts (AC-4.4). A constant that matches once is a defect.

**BR-6 — Coexistence**

- **BR-6.1** The bundle path stays green and untouched throughout the transition (C-4, AC-6.1).
- **BR-6.2** Every run makes plain which channel and which version executed it, to the limit
  stated at F-7 step 4 — and that limit is documented in the run's own terms, not implied.
- **BR-6.3** This feature moves bytes, not behaviour: phase graph, review bars, completeness
  criteria, queue lifecycle and report shape are unchanged beyond *adding* provenance (NG-5).

## 5. Expected sets owned by this FSPEC

These three sets are the change-control points the REQ parked here (T-7, AC-1.3, AC-5.3). Each is
**seeded** from a measurement and is thereafter authoritative in its own right: changing the world
without changing the set here is the failure these sets exist to catch, and changing the set here
is a spec change that goes through review.

### 5.1 Expected required-check set *(T-7, AC-3.4, C-5)*

Seeded from M-ENG-10's measurement (2026-08-13 at `89babe8e`, re-measured review round 2). Two
alphabets, and **they are not the same set**: rows 1–2 differ between the columns, rows 3–5 are
identical in both. The rendered column is what Phase PUB polls and what a branch protection rule
names.

| # | Authored `name:` | Rendered check name |
|---|---|---|
| 1 | `Unit tests (${{ matrix.os }}, node ${{ matrix.node }})` | `Unit tests (ubuntu-latest, node 20)` |
| 2 | `Engine tests (${{ matrix.os }})` | `Engine tests (ubuntu-latest)` |
| 3 | `Generated artifacts are in sync` | `Generated artifacts are in sync` |
| 4 | `Fresh-clone bootstrap works` | `Fresh-clone bootstrap works` |
| 5 | `Shell scripts parse` | `Shell scripts parse` |

Rules governing this set. **They are numbered `BR-7.x` / `BR-8.x` / `BR-9.x`, in a namespace
disjoint from §4's `BR-5` (Provenance)** — the former `BR-5.1.x` / `BR-5.2.x` numbering read as
sub-rules of provenance's BR-5.1 and would have mis-traced in PROPERTIES (SE round-1 F-03).

- **BR-7.1 — Two set-equalities, one per alphabet, over job-level names of the PR-gate file.**
  The oracle reads the **job-level `name:` keys** of the **PR-gate workflow file(s)** — at HEAD
  exactly `.github/workflows/pr-tests.yml` — and nothing else. **Step-level `name:` strings are
  not members** (that file carries ~16, e.g. `:46,53,66,70,92`, so an oracle over "the authored
  `name:` strings" would be red before anyone edited anything), and **F-5's publish workflow is
  outside the set**: its jobs are not PR checks (BR-7.5). The job-level authored keys equal the
  authored column and their local expansions equal the rendered column. A deletion, a rename, a
  matrix edit changing only the rendered set, and **any addition** to the PR-gate file all fail:
  a PR check this feature adds lands in this table first.
- **BR-7.2 — Decidable offline.** The carrier reads the named workflow file(s) and expands the
  declared matrix axes locally: no PR, no network, no credentials. Observing what GitHub reported
  on a live run is explicitly **not** the carrier — that check cannot run inside the gate it
  asserts on.
- **BR-7.3 — Interpolation is bounded to matrix axes** (SE round-4 F-25). A job `name:` may
  contain interpolations of **declared matrix axes only**. Any other expression in a `name:` —
  context expressions such as `github.*` or `inputs.*`, or a name axis introduced by a matrix
  `include` entry — makes the local expander a partial evaluator that can silently under-render,
  passing this set-equality while Phase PUB's poll breaks. Such a `name:` is therefore itself a
  failure of this gate, reported as "unexpandable name expression", not skipped.
- **BR-7.4 — The expansion rule carries a dated provenance seed, not a second gate** (TE round-4
  F-03). The rendered column is derived by re-implementing GitHub's expansion rule locally, so the
  rule is otherwise only ever compared against itself. The expected rendered names above were
  cross-checked once against names GitHub reported on a real PR run, and that cross-check is
  recorded with its date here — a **one-time, non-gating** observation. Re-seeding it is warranted
  when the matrix shape changes; it never gates a build.
  *Seed record: rendered names per M-ENG-10's measurement of GitHub-reported check names,
  2026-08-13. Re-confirm on the first PR run after any matrix edit.*
- **BR-7.5 — Every member still runs on pull requests and still gates them.** The publish workflow
  is a separate, additively-added trigger (C-5) whose own jobs are **not** members of this set:
  they gate no pull request, and Phase PUB does not poll them.
- **BR-7.6 — Mutation evidence runs over fixture copies, and this set owns the matrix.**
  BR-7.1's mutations cannot be applied to the live `pr-tests.yml`, so they run against fixture
  copies. `pdlc/engine/__tests__/ci-arrangement.test.js:44-60` already regex-asserts that file's
  matrix and job set; on landing, **§5.1's carrier owns those assertions** and the older test's
  overlapping ones are removed — one failure, one remedy (TE round-1 F-08).

### 5.2 Expected packed-content set *(AC-1.3)*

The oracle is **the contents of the packed tarball** — what a consumer actually receives — not a
declared intent: `pdlc/engine/package.json` has no `files` field today (M-ENG-11), so a
"declared list" oracle would pass vacuously. The check is decidable offline, without publishing.

Members are **enumerated literally** (downstream, in TSPEC §5.4's `PK-*` table; the classes and count are §5.2's), the way §5.1 transcribes check names, so the expectation
never derives from a directory listing of the code under test (TE round-1 F-01).

| Class | Expected members | Note |
|---|---|---|
| Package manifest | `package.json` | carries the compat range (T-3) and the pairing record (F-5 step 6) |
| Package README | named in TSPEC §5.4 (`PK-2`) | the package-level `README.md` this feature authors; the *repo-level* readme is still excluded (below) |
| Licence | named in TSPEC §5.4 (`PK-3`) | expected **only once N-2's operator licence decision is recorded** in `DECISIONS-plugin-distribution.md`; the expectation is sourced from that record, never from whether `pdlc/engine/LICENSE` happens to exist in the tree (TSPEC §5.4) |
| CLI entry | named in TSPEC §5.4 | the executable(s) the `bin` mapping resolves to; how many files carry that entry is a decomposition question TSPEC §5.4 decides, not this document |
| Engine modules | named in TSPEC §5.4 | the class is *every* `lib/*.mjs` module of the engine package; the member names live in TSPEC §5.4's `PK-*` table, and a decomposition change updates that table **in the same change**, since decomposition itself is the TSPEC's (SE round-1 F-12) |
| Install script | named in TSPEC §5.4 (`PK-23`) | the postinstall script the packaged install runs (§9.2 of the TSPEC); unconditional, and a member like any other |
| Workflow modules | named in TSPEC §5.4 (`PK-20`…`PK-22`) | TSPEC §5.4 names the three vendored members under `vendor/workflows/` "and nothing else", unblocking this row and AT-3.8b (SE/TE round-4); O-10 owns *how* they get there (BR-8.2), not *which* they are. At HEAD the engine reaches them outside the package root (`pdlc/engine/lib/run.mjs:53`) |

**The member *count* is owned here, per class and in total** (SE F-01; TE `F-01`, `Q-02`):
manifest 1, package README 1, CLI entry 2, engine modules 15, workflow modules 3, install script
1, licence 0 before N-2's decision is recorded and 1 after — **23 members before N-2 and 24
after** (`TSPEC:386-389` carries the same arithmetic). The split is deliberate: this document says
which classes exist and how many members each holds, TSPEC §5.4's `PK-*` table says which files —
so REQ AC-1.3's *expected set stated in the FSPEC* is stated here, and a decomposition change that
moves any class's count updates both sides **in the same change**. Per-class is load-bearing: a
total alone is invariant under a swap merging one `lib/*.mjs` while splitting a `bin/` entry. A
**rename** at constant cardinality stays downstream-only; AT-3.8a catches renames as
spec-vs-package drift (TE round-4 F-01).

**Excluded, by set-equality rather than by absence-checking:**

- no `skills/` directory and no `SKILL*.md` file — the plugin is the sole delivery vehicle for
  every prompt (G-1), and the engine reads them from the installed plugin at dispatch time (AC-1.2);
- no test corpus — `pdlc/engine/__tests__/` sits inside the package root and `files` is absent
  today (M-ENG-11), so **excluding it takes a deliberate packaging decision, not an omission**
  (TE round-4 Q-02); which mechanism achieves it is the TSPEC's;
- no `node_modules/`, no lockfile-adjacent build residue, and no *repo-level* documentation — the package `README.md` (PK-2) is a member, the repository's own readme is not.

There is **no separate "engine adapter" row**: the adapter is `lib/adapter.mjs`, already an
engine-modules member, and a second row would double-count it (TE round-1 Q-01).
`pdlc/workflows/runtime-adapter.js` is *not* a member (`lib/adapter.mjs:8-13`: deliberately not
ported).

**BR-8.1** The equality is member-for-member in **both** directions: an **added** file fails and
a **removed** module fails. A subset check is not acceptable — a vendored-skills copy is exactly
the failure this AC exists to catch, and a subset check would pass it. The expected side is the
literal member list of **TSPEC §5.4's `PK-*` table**, read together with the classes and count
above — never a listing of the shipped tree: an oracle that reads `pdlc/engine/lib/` for its
expectation passes a deleted module, which is the defect this rule exists to catch.

**BR-8.2** R-5/O-10's choice of how the workflow modules get inside the package may not leave
the anti-fork property (M-ENG-12) unstated. Whatever the TSPEC chooses, the anti-fork oracle is
either preserved or deliberately restated to distinguish "vendored in the repo" from "vendored in
a build artefact" — never silently dropped.

### 5.3 Expected dev-mode artifact-kind set *(AC-5.3)*

A dev-mode run marks **exactly** these artifact kinds:

1. the run report;
2. every POSTMORTEM the run writes;
3. the `QUEUE.md` row the run rewrites;
4. the commit message of every commit the run makes.

- **BR-9.1 — The carrier is the run's own authored-file enumeration** (Q-6/BR-5.3), partitioned
  into the four kinds, plus the run's commit list for kind 4. Kinds are read off what the run says
  it wrote, never off a disk listing — which also makes "a kind produced but not named here"
  mechanically detectable.
- **BR-9.2 — Equality is over the kinds the run actually produced.** A green single-feature run
  writes no POSTMORTEM and rewrites no `QUEUE.md` row, so literal equality against all four would
  fail every such run: the check is that every kind produced is marked and no kind outside this
  table is produced. Because satisfied-by-absence is the failure §5.2 rejects, **each kind is
  paired with a positive** — a run that produces it, and a run producing it unmarked that fails.
- **BR-9.3 — Deliberately out of the set:** cross-review and `CODE_REVIEW-*` files, authored by
  dispatched agents rather than by the run harness. A mark on one fails. A dev-mode run is never
  mistakable for a released one in the consumer's history.

## 6. Input / output

Stated as observable content obligations. Field names, output shape and message wording are the
TSPEC's; **that** each item below is present and machine-checkable is fixed here.

| # | Input | Read by | Written by the engine? |
|---|---|---|---|
| I-1 | Engine package version (T-1a) | F-1, F-5, F-6 | no — set by the release |
| I-2 | Declared compat range (T-3) | F-1, F-5 | no |
| I-3 | Installed plugin manifest version (T-1b) | F-1, F-5, F-6 | no |
| I-4 | Consumer `.claude/pdlc.config.json`, `engine.*` namespace (pin, T-5) | F-4 | **never** (BR-2.2) |
| I-5 | Per-invocation dev-mode declaration (T-6) | F-4 | no |
| I-6 | `PDLC_PLUGIN_ROOT` in the environment | F-4 step 5 | no |
| I-7 | Node version of the host | F-2, BR-2.4 | no |
| I-8 | Git tag naming an engine version (T-4) | F-5 | no |
| I-9 | Required-check results on the tagged commit (§5.1) | F-5 step 2 | no |

| # | Output | Emitted by | Content obligation |
|---|---|---|---|
| Q-1 | Version triple | version query, startup banner, run report | engine version; declared range; installed plugin version **or**, when none is installed, the literal `not found` |
| Q-2 | Refusal message | F-1 steps 4–5 | declared range + what was found; distinguishes absent / out-of-range / unreadable |
| Q-3 | Resolution announcement | every run (F-4) | which branch was taken: dev-mode, pin (naming the version), or "no pin; latest installed" |
| Q-4 | Update-probe notice | every run (AC-5.1) | newer version available, **or** "could not check"; never a failure, never a fetch |
| Q-5 | Run report provenance block | every run, success and halt (AC-4.1) | the pair from I-1 and I-3, from one resolution (BR-1.5) |
| Q-6 | Authored-file enumeration | run report (AC-4.5) | the files this run authored — the comparison set for BR-5.3 |
| Q-7 | Halt-artifact provenance | POSTMORTEM, at minimum (AC-4.2) | the pair, in committed bytes |
| Q-8 | Dev-mode mark | the four kinds of §5.3 | present in each; absent from every other kind |
| Q-9 | Publish failure output | F-5 steps 2–4 | the failing precondition and both compared values; a **failed** run, never a skip |
| Q-10 | Per-release pairing record | F-5 step 6 | `{engine version, compat range, plugin version at tag}`, single writer |

## 7. Edge cases and error scenarios

| # | Scenario | Required behaviour | Rule |
|---|---|---|---|
| E-01 | No plugin installed | refuse before dispatch, naming the declared range and stating none is installed; diagnostic still runs | BR-1.2, BR-1.7 |
| E-02 | Plugin installed, version outside the range | refuse, naming the range **and** the version found | BR-1.2 |
| E-03 | Plugin present, manifest missing / unparseable / version field absent | refuse naming the root inspected and what was wrong — never degraded to "absent" | BR-1.3 |
| E-04 | Two plugin roots resolvable (installed plugin + checkout) | one is selected by F-4's ordered rule and the selection is announced; ambiguity is never silent | BR-4.1 |
| E-05 | Engine's own version unresolvable | refuse naming the corrupt install; never "unknown" and proceed | BR-1.6 |
| E-06 | Node below the floor (T-2) | fail naming floor and found version; no partial install, no stack trace | BR-2.4 |
| E-07 | Install/upgrade run from inside a consumer repo | still writes nothing into that repo; working tree and index unchanged | BR-2.1 |
| E-08 | Pin names an uninstalled version | refuse, naming the pin and what is installed; never fall back | BR-4.3 |
| E-09 | Pin present **and** dev-mode declared | dev-mode wins (BR-4.1) and the run announces that the pin was overridden — never silently ignored | BR-4.1, BR-4.4 |
| E-10 | Pin value malformed (not a version the resolver understands) | refuse naming the offending value; malformed is not "no pin" | BR-4.3 |
| E-11 | `.claude/pdlc.config.json` absent or has no `engine.*` section | treated as "no pin", announced as such; the file is not created | BR-2.2, BR-4.4 |
| E-12 | Update probe fails (offline, CI, registry down) | run states it could not check and proceeds; never fails, never blocks | BR-4.5 |
| E-13 | `PDLC_PLUGIN_ROOT` exported, no dev-mode declaration | refuse naming the variable, **or** run released and state the variable was ignored | BR-4.6 |
| E-14 | Tag pushed at a commit with a red or missing required check | nothing published; workflow run **failed**, not skipped | BR-3.1, BR-3.2 |
| E-15 | Tag version ≠ engine version of record at that commit | fail naming both values; never publish under either | BR-3.4 |
| E-16 | Declared range excludes the plugin version of record at that commit | fail naming range and plugin version; publish nothing | BR-3.4 |
| E-17 | Publish re-run for an already-published version | explicit no-op **or** loud failure naming the collision; bytes byte-identical before/after; output names the version | BR-3.3 |
| E-18 | Publish credential missing or expired | workflow run fails visibly; no partial publish; no credential value in any log | BR-3.2, BR-3.6 |
| E-19 | A job `name:` interpolates something other than a declared matrix axis | §5.1's gate fails as "unexpandable name expression" — never skipped, never assumed literal | BR-7.3 |
| E-20 | A required check is renamed, deleted, added, or re-rendered by a matrix edit | §5.1's set-equality fails on the affected alphabet | BR-7.1 |
| E-21 | Packed tarball contains a `skills/` tree, a `SKILL*.md`, or the test corpus | AC-1.3's equality fails on the addition, not merely on a missing member | BR-8.1 |
| E-22 | Workflow modules absent from the packed tarball | equality fails at build time, offline — never first observed at a consumer's first dispatch | BR-8.1 |
| E-23 | Run halts before emitting a report | the halt artifacts still carry the pair (F-6 step 3); a run that emitted nothing at all fails F-7's conjunct (1) | BR-5.1, BR-6.2 |
| E-24 | Consumer repo predates this feature | prior artifacts unchanged and un-back-filled; only files enumerated by the run report may differ | BR-5.2, BR-5.3 |
| E-25 | Plugin version changes between two runs on one machine | the reported pair changes correspondingly; reverting restores it | BR-5.4 |
| E-26 | Both channels installed, one run started through the bundle path | identified by F-7 step 3's conjunction, with the residue of step 4 stated in the run's own terms | BR-6.2 |
| E-27 | A `SKILL.md` edit lands without a plugin version bump | out of scope for detection (R-3, a known residual risk); no AC claims to catch it, and no test may be written that pretends to | R-3 |
| E-28 | Package manifest not publishable at the tagged commit — private, unscoped, or a name disagreeing with the pairing record (all three stand at HEAD, O-8) | publish fails **offline, before the channel is called**, naming the offending field; nothing published | BR-3.8, BR-3.2 |
| E-29 | A step-level `name:`, or a publish-workflow job `name:`, is added or edited | §5.1's set-equality is **unaffected**: neither is a member | BR-7.1, BR-7.5 |
| E-30 | A dev-mode run produces a kind §5.3 does not name | the enumeration fails and must be revisited; a kind the run did *not* produce is not asserted vacuously | BR-9.1, BR-9.2 |

## 8. Acceptance tests

Who / Given / When / Then. Each names the criterion it discharges. Tests marked **[blocked]**
cannot be written until an obligation lands, and say which.

**Every test names its execution environment** (TE round-1 F-05), so the cheapest reading cannot
win by default: **[auto]** unattended in the PR gate; **[fixture]** unattended against a
constructed machine or repo fixture (container, `npm pack` into a temp prefix, stub seam);
**[manual]** an operator observation with dated, recorded evidence. The label sits on the family
heading and is overridden per test where it differs; an unlabelled family is a defect.

### AT-1 — Handshake and version query **[fixture]**

- **AT-1.1** *(AC-1.1)* **Who:** operator. **Given:** engine installed, no plugin installed.
  **When:** any pipeline command runs. **Then:** it exits non-zero before dispatch, the message
  names the declared range and reports the plugin version as the literal `not found`, and no file
  in the consumer project changed.
- **AT-1.2** *(AC-1.1)* **Given:** plugin installed at a version outside the range. **When:** any
  pipeline command runs. **Then:** refusal names both the range and the version found — text
  distinguishable from AT-1.1's.
- **AT-1.3** *(AC-1.1)* **Given:** either refusal state. **When:** the diagnostic command runs.
  **Then:** it completes and reports the version triple.
- **AT-1.4** *(BR-1.3)* **Given:** a plugin root whose manifest is unparseable. **When:** a
  pipeline command runs. **Then:** refusal names the root and the parse failure; it is **not**
  AT-1.1's `not found` message.
- **AT-1.5** *(AC-1.2)* **Given:** plugin at an in-range version whose `SKILL.md` for a dispatched
  role carries a distinguishing marker. **When:** a run dispatches that role. **Then:** the
  composed prompt carries the marker — proving the prompt came from the installed plugin at
  dispatch time, not from engine-resident bytes.
- **AT-1.6** *(AC-1.4)* **Given:** an installed package. **When:** the version query runs. **Then:**
  output carries all three of engine version, declared range, installed plugin version (the literal
  `not found` when none is installed),
  and equals the triple in the same run's banner and report (BR-1.5).

### AT-2 — Install and upgrade **[fixture]** — AT-2.1, AT-2.3, AT-2.4, AT-2.5 and AT-2.6 each run against a constructed machine fixture (clean container image, or `npm pack` into a temp prefix with `PATH` scoped to it), never the maintainer's own machine; AT-2.2 is **[auto]**

- **AT-2.1** *(AC-2.1)* **Who:** operator on a clean machine, Node ≥ T-2. **Given:** the command
  transcribed from `pdlc/README.md`'s `## Install in another repo` section. **When:** run once.
  **Then:** all three of AC-2.1's conjuncts hold — the CLI resolves on `PATH` at the expected
  version from an existing install location; **the version query reports the triple (AC-1.4)**;
  and a pipeline command reaches the handshake and emits AT-1.1's refusal.
- **AT-2.2** *(BR-2.3)* **[auto]** **Who:** verifier. **Given:** the repo. **When:** the tree is
  searched for the **engine's own** install invocation, and separately its upgrade invocation,
  keyed on the engine program name — not on `claude plugin install`, whose three occurrences
  (`README.md:115`, `pdlc/README.md:139,145`) are outside the set (TE round-1 Q-02). **Then:**
  each occurs exactly once, in that README section; a documented fallback variant lands in this
  table first or fails.
- **AT-2.3** *(AC-2.2)* **Given:** version N installed, two consumer repos each having completed a
  run at N. **When:** the upgrade command runs once on the machine, then the pipeline runs in each
  repo. **Then:** both runs execute N+1 — visible in each run's output **and** in the artifacts —
  and no command other than the pipeline invocation ran inside either repo.
- **AT-2.4** *(AC-2.3)* **Given:** a consumer repo with clean tree and index; the pre-values of
  resolved version and install location recorded. **When:** install then upgrade run. **Then:**
  install leg — CLI resolves at the expected version from an existing location; upgrade leg —
  resolved version *and* install location differ from the recorded pre-values; **and** the repo's
  tree and index are byte-identical, nothing created under `.claude/`.
- **AT-2.5** *(AC-2.4)* **Given:** Node below T-2. **When:** install, then a pipeline invocation.
  **Then:** each fails naming floor and found version; no stack trace; no partially installed tree.
- **AT-2.6** *(AC-2.5)* **Given:** engine and plugin both installed. **When:** an engine run and an
  interactive plugin skill invocation both occur. **Then:** both succeed on that run, and each
  install location's files hash identically before and after the other's use.

### AT-3 — Publish **[fixture]** — the channel is the stub of BR-3.9 throughout; the single real-channel leg is BR-3.9's one-time **[manual]** observation

- **AT-3.1** *(AC-3.1)* **Given:** a default-branch commit with all §5.1 members green and a
  manifest satisfying BR-3.8, the channel seam stubbed. **When:** a version tag is pushed.
  **Then:** the artifact is built, the manifest and range/plugin checks pass, and the stub records
  a publish of exactly those bytes — with no human step. Against the **real** channel this is
  blocked until O-8's three manifest blockers are cleared (F-5 step 7, §9 Q-8); the real-channel
  leg is BR-3.9's one-time observation, not this test.
- **AT-3.2** *(AC-3.2)* **Given:** a commit with one §5.1 member red. **When:** a tag is pushed.
  **Then:** nothing is published and the publish run's conclusion is **failure** — asserted on the
  conclusion, not on the absence of a package.
- **AT-3.3** *(AC-3.3)* **Given:** the channel stub holding version N with its bytes hashed —
  **not** the real registry, which refuses re-publish by design and would burn a version number
  per rehearsal while leaving the no-op branch unobservable (TE round-1 F-03). **When:** the
  workflow is re-run for N. **Then:** the run is either an explicit no-op or a loud failure naming
  the collision; and on either branch the hash of N's stored bytes is unchanged and the run's
  output names N. Both branches are exercised, one per stub configuration.
- **AT-3.4** *(AC-3.4, §5.1)* **Who:** verifier, offline. **Given:** the repo's workflow files.
  **When:** authored `name:` strings are read and declared matrix axes expanded locally. **Then:**
  authored set equals §5.1's authored column and expanded set equals its rendered column;
  mutations — rename, delete, add, matrix-axis edit — each fail **when applied to fixture copies
  of the workflow file**, never to the live one (BR-7.6); a `name:` interpolating a non-matrix
  expression fails as "unexpandable" (E-19); a step-level `name:` edit and a publish-workflow job
  name change both leave the check green (E-29).
- **AT-3.5** *(AC-3.5)* **Given:** the built artifact and the captured log of a stub-channel
  publish run, with a known sentinel credential value. **When:** both are scanned for it.
  **Then:** no occurrence in either. Absence alone would hold vacuously if the credential were
  never consumed, so it is paired with two positives (REQ v0.10's AC-3.5): (a) **Given** the
  repository secret is present, **then** the publish step authenticates to the channel and the
  release is cut; (b) **Given** it is absent or empty, **then** the run fails with a message
  naming the missing credential and nothing is published.
- **AT-3.6** *(AC-3.6)* **Given:** a tag disagreeing with T-1a at that commit. **When:** the
  workflow runs. **Then:** it fails naming both values; nothing published.
- **AT-3.7** *(AC-3.7)* **Given:** a commit whose declared range excludes T-1b at that commit.
  **When:** the workflow runs. **Then:** it fails naming range and plugin version; nothing
  published.
- **AT-3.8a** *(AC-1.5, AC-1.3)* **Who:** verifier. **Given:** the built package, offline.
  **When:** the packed tarball's contents are enumerated. **Then:** the enumerated members equal
  the expected set member-for-member — so an added `SKILL.md`, an added test file and a
  **removed member** each fail; the member count equals §5.2's (**23 before N-2's licence
  decision is recorded, 24 after**, and §5.2's per-class counts); and the pairing record of F-5
  step 6 is present inside it. The count conjunct is asserted against the **transcribed** `PK-*`
  list, never the tarball's own length — a tautology once the first conjunct passes, and a
  self-derived expectation BR-8.1 forbids; against the transcription it fails when the
  transcription has drifted from §5.2 (TE round-4 F-03).
  The expected list is a literal one, never a listing of `pdlc/engine/lib/`; its **classes and
  count are §5.2's**, and its **member names are downstream, in TSPEC §5.4's `PK-*` table**,
  which is the single source the verifier transcribes. This document does not restate the member
  list (an FSPEC-local copy is what diverged); it does state the count, so a decomposition change
  cannot move the expected set without an FSPEC-side edit. **AT-3.8a is the authoritative
  whole-set assertion**; AT-3.8b a sub-assertion over one class, not a competing expected side
  (SE round-4 F-02).
- **AT-3.8b** *(AC-1.3)* **Given:** the same package. **When:** its workflow modules are
  enumerated. **Then:** they equal §5.2's workflow-module class member-for-member — TSPEC §5.4's
  `PK-20`…`PK-22` — and a removed module fails. Writable: §5.4 names those three "and nothing
  else", so O-10 now blocks only BR-8.2 (SE/TE round-4).

### AT-4 — Provenance **[fixture]**, **[blocked on O-9 for AT-4.2 and AT-4.5]** — AT-4.4 is *not* blocked: it needs two plugin versions and a revert, no new carrier (TE round-1 F-04)

- **AT-4.1** *(AC-4.1)* **Given:** a completed run, success path and halt path. **When:** the final
  report is read. **Then:** it states both engine and plugin versions, equal to AT-1.6's triple.
- **AT-4.2** *(AC-4.2)* **[blocked]** **Given:** a halted run. **When:** the committed POSTMORTEM
  is read from history alone. **Then:** both versions are nameable from its bytes.
- **AT-4.3** *(AC-4.3)* **Given:** two runs of one feature on different engine versions. **When:**
  their artifacts are compared. **Then:** the engine versions differ in the artifacts.
- **AT-4.4** *(AC-4.4)* **Writable today** — no carrier is missing. **Given:** a run's reported pair. **When:** a different plugin version is
  made current and a second run occurs, then the change is reverted and a third run occurs.
  **Then:** the pair changes and then reverts — a constant matching once fails the second
  observation.
- **AT-4.5** *(AC-4.5)* **[blocked]** **Given:** a consumer repo whose `docs/` predates the feature;
  all files hashed. **When:** a run completes. **Then:** every pre-existing file under
  `docs/{feature}/` hashes identically except those the run report enumerates as authored, and
  every file of any other feature hashes identically with no exception.

### AT-5 — Pinning and dev-mode **[fixture]**

- **AT-5.1** *(AC-5.1)* **Given:** project pinned to X, Y latest installed, probe seam stubbed
  unavailable. **When:** the pipeline runs. **Then:** X executes, the run announces the pin, and
  states it could not check for a newer version — no failure, no network call (asserted through
  the stub).
- **AT-5.2** *(AC-5.2)* **Given:** no pin. **When:** the pipeline runs. **Then:** latest installed
  executes and the run states "no pin".
- **AT-5.3** *(AC-5.3, §5.3)* **Given:** an explicit dev-mode declaration and a checkout, and —
  named, because it is not the ordinary case — a **halted, queue-driven** run fixture, the only
  shape that produces all four kinds at once (report, POSTMORTEM, `QUEUE.md` rewrite, commits).
  **When:** it runs. **Then:** every kind it produced carries the mark and none is unmarked
  (BR-9.2), the mark's carrier is the run's own authored-file enumeration (BR-9.1), and a mark on
  a cross-review file fails (BR-9.3).
- **AT-5.3b** *(AC-5.3, §5.3)* **Given:** a green single-feature dev-mode run (no POSTMORTEM, no
  `QUEUE.md` rewrite). **Then:** the kinds it produced are marked and the two absent kinds are not
  asserted vacuously; and for each of the four kinds a fixture producing it **unmarked** fails —
  BR-9.2's positive pairing.
- **AT-5.4** *(AC-5.4)* **Given:** a checkout present, no declaration. **When:** the pipeline runs.
  **Then:** the installed released version executes.
- **AT-5.5** *(AC-5.5)* **Given:** a pin naming an uninstalled version. **When:** the pipeline runs.
  **Then:** it refuses naming the pin and what is installed.
- **AT-5.6** *(AC-5.6)* **Given:** `PDLC_PLUGIN_ROOT` exported, no declaration. **When:** the
  pipeline runs. **Then:** it refuses naming the variable **or** runs released while stating the
  variable was ignored; a run that silently switches skill source fails.

### AT-6 — Non-regression and coexistence **[auto]** for AT-6.1 (it is the CI job at `.github/workflows/pr-tests.yml:138`); **[manual]** for AT-6.2 (TE round-1 Q-04: its install state is known out of band, so it is an operator observation with recorded evidence, not an automated channel test)

- **AT-6.1** *(AC-6.1)* **Who:** verifier. **Given:** the repo after this feature lands. **When:**
  `node pdlc/workflows/build-runtime.mjs` then the bare-path `pdlc/hooks/scripts/sync-workflows.sh`
  run in that order, then `--check`, **on a tree with no consumer copy under `.claude/workflows/`
  and a clean sync manifest** — the fresh-clone precondition the CI job already establishes
  (`.github/workflows/pr-tests.yml:138,152`). **Then:** all three exit 0, every manifest row in
  sync; a 126 exit from the bare-path invocation is a failure, not a retry-with-`bash`. Outside
  that precondition plain sync deliberately skips `local-edit`/`unverified` rows and exits
  non-zero (SE round-1 F-06); `--force` is out of this test's scope.
- **AT-6.2** *(AC-6.2)* **[manual]**, with the install state recorded out of band as its evidence
  (TE round-1 Q-04). **Given:** a machine with both channels installed and **independently known
  install state**. **When:** a run is started through each. **Then:** the engine run emits its
  provenance block; the bundle run completes, emits its named output artifacts, and carries no
  provenance block. The test asserts exactly this conjunction and **claims no more**: with no
  run-bound load-root observation available on the bundle side (F-7 step 4), a fixture that
  distinguishes nothing must not be written as though it did — see §9 Q-2.

## 9. Open questions

Carried from the REQ's obligations, plus what authoring this document surfaced. Nothing here is
resolved by silence: each names an owner and what it blocks.

- **Q-1 — O-9's three carriers: one decision or three?** (SE Q-08, TE Q-01.) The version pair
  (AC-4.2) and the authored-file enumeration (AC-4.5) are values the engine already holds and must
  push *across* the engine↔module seam; the load root (AC-6.2) is a fact only the module loader
  knows and the engine cannot supply from outside. If the TSPEC can settle the first two on one
  carrier but not the third, saying so keeps Phase 1 scoped instead of waiting for one answer to
  close all three. *Owner:* TSPEC. *Blocks:* AT-4.2, AT-4.5, and the load-root half of AT-6.2.
- **Q-2 — AC-6.2's interim test is a precondition, not an oracle.** (TE round-4 F-02.) Until Q-1
  lands, AT-6.2 rests on independently known install state, and its only discriminating conjunct
  is absence-shaped. The FSPEC's position: write it as stated and **document the limit in the test
  itself**, rather than dress a non-discriminating fixture as a channel test. *Owner:* TSPEC/te-author.
- **Q-3 — Range-widening cadence.** (SE Q-05, carried unanswered from round 3.) A prompt-only
  plugin minor can put an installed engine outside `pdlcPluginCompat` and trip AC-1.1's refusal
  until an engine republish lands. Is "the engine republishes on a plugin minor" the accepted
  operating cost, or does O-6's per-release record need a range-widening path that is not a
  republish? *Owner:* operator. *Blocks:* nothing in Phase 1; shapes R-2's mitigation.
- **Q-4 — Which dev-mode branch for `PDLC_PLUGIN_ROOT`?** (SE Q-06.) AC-5.6 permits refusal or
  ignore-with-notice, and the shipped `REMEDY` text (`pdlc/engine/lib/handshake.mjs`) currently
  *recommends* the variable as the remedy for a compat refusal — so "refuse on its presence" would
  contradict advice the engine itself prints. Whichever branch the TSPEC picks, the remedy text is
  part of the change. *Owner:* TSPEC.
- **Q-5 — Excluding the test corpus from the packed set.** (TE Q-02.) `pdlc/engine/__tests__/`
  sits inside the package root and `files` is absent (M-ENG-11), so §5.2's exclusion needs a
  deliberate packaging mechanism. Confirm it is the TSPEC's/O-10's call and not an omission here.
  *Owner:* TSPEC.
- **Q-6 — BL-03 is not discharged.** O-7 decided the two-records position, but the REQ's own gating
  form is *transcription into* `docs/_decisions/DECISIONS-plugin-distribution.md` before FSPEC
  authoring, and no such entry exists in that file at HEAD (DEC-DIST-01…05 only). Raised as an
  erratum against DECISIONS; this FSPEC is written on O-7's decided position, which the
  transcription must match rather than re-open. *Owner:* operator. *Blocks:* nothing already
  written here, but leaves the version-of-record decision unrecorded at project level.
- **Q-7 — M-ENG-10's change-control tail.** (SE F-26, TE F-01, both Medium, both deferred to this
  pass.) With §5.1 authoritative, the baseline's closing sentence — "a change to either is a change
  to this fact first" — names a second change-control point for one set. The fix is one sentence in
  the constraints file ("a change to either means the fact is re-measured"), leaving the *gate* to
  §5.1. Not fixed here because a measured-facts file is not this FSPEC's to edit mid-phase.
  *Owner:* operator/se-author, in the same pass that implements §5.1's carrier.
  Bounded, not open-ended: the deferral expires **when §5.1's carrier lands**, in that same pass
  (TE round-1 Q-03). Until then two sentences claim change-control over one set, and the FSPEC's
  is the gate.
- **Q-8 — O-8's three publish blockers are live and unowned in this document until now.** (SE
  round-1 F-01.) At HEAD the manifest is `"private": true` (`pdlc/engine/package.json:4`, the one
  npm itself refuses), unscoped `pdlc-engine` (`:2`) against DEC-DIST-05's scoped-public decision,
  and `"license": "UNLICENSED"` (`:11`) — the latter two decision-enforced, caught by nobody but
  the operator. Until all three are cleared AC-3.1 cannot be discharged against the real channel,
  which is why F-5 step 7 marks it and BR-3.8 makes the first two an offline gate rather than a
  first-tag-push surprise. *Owner:* operator. *Blocks:* AC-3.1's real-channel leg and BR-3.9's
  one-time observation; nothing that runs over the stub.

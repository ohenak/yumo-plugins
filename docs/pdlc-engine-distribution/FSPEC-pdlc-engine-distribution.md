---
feature: pdlc-engine-distribution
---

# FSPEC — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.9, approved round 4); `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-05); `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-10…M-ENG-13) |
| Downstream | TSPEC, PLAN, PROPERTIES for this feature; `pdlc-plugin-retirement` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-13 |

**FSPEC ID:** `FSPEC-EDIST-01`

## 1. Purpose and scope

This FSPEC specifies the **observable behaviour** of the four things REQ-EDIST-01…06 ask for:
the compat handshake a run performs before it dispatches, the install/upgrade lifecycle on an
operator machine, the tag-driven publish pipeline, and the provenance a run leaves behind in a
consumer repo. It also carries the two **expected sets** the REQ deliberately parked here rather
than in a measurement file (§5): the required-check set (T-7) and the packed-content set (AC-1.3).

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

## 3. Behavioral flows

Each flow is stated as steps with explicit decision points. A step that describes behaviour not
present at HEAD is marked **[new]**; one that describes shipped behaviour is marked **[shipped]**
with its symbol, so a reviewer can check the claim in one pass.

### F-1 — Compat handshake and version query *(AC-1.1, AC-1.2, AC-1.4)*

Every pipeline command performs the handshake **before** any dispatch, and never partially: no
prompt is read, no agent is started, nothing is written until the handshake resolves.

1. Resolve the **engine version** (T-1a) from the running package. Always succeeds; if it cannot,
   that is a corrupt install and the run refuses under BR-1.6.
2. Resolve the **declared compatible-plugin range** (T-3, `pdlcPluginCompat`). **[shipped]**
   `pdlc/engine/lib/handshake.mjs` — `satisfiesRange`.
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
6. **The diagnostic command sits outside the gate** (AC-1.1). The command whose job is to explain
   a refusal still runs when the handshake fails, and reports the same triple as step 7. Any other
   pipeline command is gated. Which command is the diagnostic is fixed by the TSPEC; that exactly
   one class of command is exempt, and that it is the diagnostic, is fixed here.
7. **The version triple.** The version query reports, in one output: engine version (T-1a), the
   declared range (T-3), and the installed plugin's version *or* the explicit statement that none
   is installed. The same triple appears in the startup banner and in every run report (F-6), from
   one resolution per run — not three independent resolutions that can disagree (BR-1.5).

### F-2 — Install on a clean machine *(AC-2.1, AC-2.3 install leg, AC-2.4)*

1. The operator reads the install command from **one place**: `pdlc/README.md`'s
   `## Install in another repo` section, which today documents the plugin install and gains the
   engine install command under it. No other file is a transcription source (AC-2.1). Any second
   copy of the command anywhere in the repo is a defect, not a convenience.
2. They run it once, on a machine with Node ≥ T-2 and nothing pdlc-related installed.
3. **Decision point — Node floor.** If Node is below T-2 the attempt fails with a message naming
   the required floor and the version found: no stack trace, no partial install, nothing left
   half-written (AC-2.4).
4. On success the CLI resolves on `PATH`, from an install location that exists, at the version the
   command asked for.
5. The operator invokes a pipeline command. With no plugin installed, F-1 step 4 refuses naming
   the declared range. **That refusal is the pass condition** on a plugin-free machine: install is
   proven by *reaching the handshake*, not by dispatching (AC-2.1).
6. No second command, manual step, repo clone, or per-project action is required at any point.

### F-3 — Upgrade, and the zero-per-project promise *(AC-2.2, AC-2.3 upgrade leg, AC-2.5)*

1. Record, before the upgrade: the resolved CLI version and the install location.
2. Run the documented upgrade command once, **on the machine** — never inside a consumer project.
3. Invoke the pipeline in each of two consumer repos that had previously completed a run at the
   old version. Each run executes the new version, observable **both** in the run's own output and
   in the artifacts it writes (F-6).
4. **No command is executed inside either repo** other than the pipeline invocation itself: no
   sync, no copy, no drift check, no config edit.
5. **Non-interference, checked on the same run** (C-2, AC-2.3): the consumer repo's working tree
   and index are unchanged by install and by upgrade — no file created, modified or deleted
   anywhere under the project, in particular nothing under `.claude/`. Consumer-owned config is
   *read* (F-4 step 2) and never written; reading is not writing (NG-6 forbids only the latter).
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

### F-5 — Tag-driven publish *(AC-3.1…AC-3.7, AC-1.5)*

The publish pipeline is **additive**: its own workflow file with its own trigger. It may reuse the
PR gate's jobs but may not weaken, rename, make conditional, or re-render any member of §5.1
(C-5), because Phase PUB polls those names literally.

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
7. **Publish** to the channel decided at DEC-DIST-05 (public npm, scoped).
8. **Immutability and re-run** (C-7, AC-3.3): re-running the workflow for an already-published
   version takes one of two permitted branches — an explicit no-op statement, or a loud failure
   naming the collision. On **either** branch two positives are asserted: the published bytes for
   that version are byte-identical before and after the re-run, and the run's own output names the
   version. A branch that satisfies neither is a defect.
9. **Secrets** (C-8, AC-3.5): the channel credential exists only as a repository secret consumed
   by this workflow. It appears in neither the published contents nor any log the publish produced.
   No distribution-channel credential is ever required to *run* the engine.

### F-6 — Provenance emission into consumer artifacts *(AC-4.1…AC-4.5)*

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
   prefix would mask a lost execute bit (exit 126).
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
   on a machine whose installed channels are known independently, and §8's AT-7.2 is written to
   assert exactly that much and no more (see §9 Q-2).

## 4. Business rules

## 5. Expected sets owned by this FSPEC

## 6. Input / output

## 7. Edge cases and error scenarios

## 8. Acceptance tests

## 9. Open questions

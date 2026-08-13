# DECISIONS — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10), `FSPEC-pdlc-engine-distribution.md` (v0.2), `TSPEC-pdlc-engine-distribution.md` (v0.9), `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-01…05) |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft (Phase T) | Claude | 0.3 | 2026-08-13 |

**Changelog**

| Version | Change |
|---|---|
| 0.1 | Initial draft — DEC-EDIST-01…10 recorded from TSPEC v0.9 §4, §6.2, §6.4, §8.2, §9.3 |
| 0.2 | §1 retitled to expose the context concept; §13 decision register added. No entry's substance changed — both edits are navigational. |
| 0.3 | Round-1 cross-review revisions (PM F-01…F-06, TE F-01…F-08). DEC-EDIST-01's relocation cost re-enumerated against HEAD: the merge-guard constant and its pinned test are the fourth and fifth consumers, and the two `build-runtime.mjs` citations repointed from comment lines to path-addressing code (§2); AF-2's `prepack` precondition stated and Reversibility corrected — AF-2 is *deleted* with the vendor step, not kept (§2); the `vendor/`-is-git-ignored × `files`-allow-list interaction named as a second, independent reason PF-4 packs for real, with the inclusion mechanism decided rather than left to npm's default resolution (§2, §6). DEC-EDIST-04's "the catalogue equality covers it for free" claim replaced by the two assertions the branch actually needs (§5) — raised as an erratum against TSPEC §6.5. DEC-EDIST-06 decides the signalled-child case (`128 + signum`) instead of naming signal handling and paying for exit code and stdio only (§7) — raised as an erratum against TSPEC §6.2. DEC-EDIST-07 gains a third asserted state, the corrupt-config-under-`doctor` composition with DEC-EDIST-08, cross-referenced from §9's carve-out table (§8, §9). Citation corrections: AC-5.2 named alongside AC-5.1 and AC-5.5 (§4), `N-3` → `N-1` (§3), six static imports → nine (§10), O-8's blocker 1 recorded as closed (§12). §13's rows for DEC-EDIST-01 and DEC-EDIST-04 updated to match. |

## 1. Scope and Context

This document records the load-bearing decisions the TSPEC takes, with the alternatives that
were rejected and why. It is the *record*, not a second authority: where a mechanism is
specified, the TSPEC section named in each entry is normative and this file states only what
was chosen, what was rejected, and what would make the choice worth revisiting.

Ten entries. Five (DEC-EDIST-01…05) close the obligations the FSPEC parked — O-10, O-9, O-2's
execution half, Q-4 and Q-5 — and are the five listed in TSPEC §4. Five more
(DEC-EDIST-06…10) are decisions taken inside the TSPEC's body that a later reader would
otherwise have to reconstruct from prose: they each rejected a plausible alternative, each
have a reversal cost worth stating, and each are cited by more than one downstream artifact.

Project-level decisions in `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-01…05)
are **not** re-litigated here. Two of them are load-bearing inputs: DEC-DIST-02's three-tier
source/artifact/consumer-copy discipline is what DEC-EDIST-01 reuses, and DEC-DIST-05's
"scoped public npm package" is the channel every entry below assumes.

Nothing here decides the operator-owned items — the npm scope (N-6), the licence (N-2) or
BL-03's transcription (N-3). §12 lists them with their owners.

## 2. DEC-EDIST-01: Vendor the workflow modules at build time, into the tarball only

*Closes FSPEC O-10 / REQ R-5. Mechanism: TSPEC §5.2, §5.3.*

**Context.** The engine reaches the workflow modules by a path relative to the repo checkout —
`new URL("../../workflows/orchestrate-dev.js", import.meta.url)`
(`pdlc/engine/lib/run.mjs:52-55`). A tarball rooted at `pdlc/engine/` contains nothing at that
path, so an installed engine cannot load a workflow module at all. Something had to change, and
the constraint C-4 puts on it is that `pdlc/workflows/` — the tree the plugin channel,
`build-runtime.mjs` and `sync-workflows.sh` all read — must not move.

**Decision.** A `prepack` script copies the two modules byte-for-byte into
`pdlc/engine/vendor/workflows/` with a SHA-256 `VENDOR-MANIFEST.json`; `vendor/` is git-ignored
(`pdlc/engine/.gitignore` carries only `node_modules/` at HEAD, so the rule is new) and exists
only inside the packed artifact. `WORKFLOW_MODULE_URLS` becomes a two-root resolution —
`../vendor/workflows/` first, then the checkout's `../../workflows/` — and the anti-fork oracle
is **restated, not deleted**: AF-1 reads git-tracked-ness rather than walking the directory,
AF-2 asserts the vendored bytes hash-equal the canonical sources, AF-3 keeps `PROP-FORK-1`'s
exact-path equality.

**Alternatives considered.**

- **Publish from the workspace root** — rejected. It needs no test changes, but the published
  package's internal shape becomes the repo's directory shape: both `pdlc/workflows/` and
  `pdlc/engine/` land inside the tarball, and any future repo reorganisation becomes a
  consumer-visible breaking change. It also drags the plugin's own tree across the package
  boundary that C-4 exists to hold.
- **Relocate the modules under the package root** — rejected *for now*, and it is the cleanest
  end state. Today it moves the files that `pdlc/workflows/build-runtime.mjs` and
  `pdlc/hooks/scripts/sync-workflows.sh` read, i.e. it breaks the plugin channel to fix the
  engine channel. **Verified cost at HEAD — five consumers, not three, and one of them is
  merge-safety rather than build plumbing:**

  | # | Consumer | Site | What breaks |
  |---|---|---|---|
  | 1 | `build-runtime.mjs` reads the sources by path | `pdlc/workflows/build-runtime.mjs:94-97` (`readFileSync(resolve(HERE, "orchestrate-dev.js"))` and its three siblings) and the source-name arrays at `:531-533` | the build stops finding its inputs |
  | 2 | `sync-workflows.sh` copies from the built tree | `pdlc/hooks/scripts/sync-workflows.sh` | the consumer copy stops being produced |
  | 3 | `run.test.js` pins the canonical path literally | `pdlc/engine/__tests__/run.test.js:45-46` (`path.join(repoRoot,"pdlc","workflows","orchestrate-{dev,queue}.js")`) | red |
  | 4 | **Phase MERGE's self-modification guard** | `MERGE_GUARD_DEFAULTS` carries the literal `"pdlc/workflows/"` (`pdlc/workflows/orchestrate-dev.js:48-53`, the literal at `:49`) | **a PR touching the workflow modules at their new path no longer trips the guard** — the pipeline may auto-merge a PR that edits its own semantics |
  | 5 | the guard set is pinned by a test | `pdlc/workflows/__tests__/consolidationRoute.test.js:108-110` asserts the four-member set literally | widening or re-pointing the guard is a second edit, not a one-line change |

  Consumer 4 is the reason this stays deferred rather than merely costed: the other four go red,
  and a red build is a stop. A guard that silently stops covering a path is the failure this
  record's own closing principle names — an oracle that cannot detect the failure it is
  nominated against. Two earlier citations are corrected here: `build-runtime.mjs:19` is the
  file's usage **comment** and `:48-49` is *generated banner* text (itself pinned by
  `pdlc/workflows/__tests__/runtimeBundle.test.js:593-595`), so neither is code that addresses
  the tree. The move is a five-consumer edit, not a `git mv`. It belongs to
  `pdlc-plugin-retirement`, which removes the second channel and shrinks the build-plumbing
  half — the merge-guard edit survives that feature and must be made deliberately.
- **Fetch the modules at runtime** — rejected without much weighing: NG-3 forbids the engine
  fetching anything.

**Constraints that forced the shape.** C-4 (`pdlc/workflows/` does not move); NG-3 (no
fetching); R-5 (the package as arranged cannot contain the modules); BR-8.2 (the no-fork
property must survive in a checkable form). DEC-DIST-02's existing tier discipline —
tracked source, built artifact, untracked consumer copy — is reused rather than a new
convention invented: `vendor/` is the same tier as `pdlc/workflows/dist/`'s relationship to
`.claude/workflows/`.

**Making `vendor/` git-ignored interacts with DEC-EDIST-05's allow-list, and the interaction is
decided here rather than left to npm.** `pdlc/engine/.gitignore` is one line at HEAD
(`node_modules/`), this entry adds `vendor/`, and `pdlc/engine/` ships no `.npmignore` (§6's
Context, verified at HEAD). npm's precedence between a `files` entry and an ignore-file fallback
*for paths inside a listed directory* is the ambiguous corner of packing and has varied across
npm majors. If the fallback wins, `prepack` runs, the manifest is written, and the tarball ships
**without** the vendored modules — an installed engine that cannot load a workflow module at
all, which is R-5 restored by the very change that closes it. **Decision: the inclusion is made
explicit rather than inferred** — `pdlc/engine/.npmignore` is shipped for this one purpose,
carrying a negation for `vendor/workflows/`, so packing never depends on which precedence rule
the installed npm implements. This does not reopen §6's allow-list-over-deny-list choice: the
`.npmignore` exists to *negate* an ignore, and the packed set is still governed by `files` and
still asserted by PF-4's both-directions equality against TSPEC §5.4's literal table, which
would catch the omission if the mechanism ever failed.

**Reversibility.** Easy in the direction that matters, and the oracle cost is asymmetric.
Deleting the vendor step and the second root restores HEAD behaviour. **AF-1 remains a correct
assertion about a repo that vendors nothing; AF-2 is deleted along with the vendor step,
because the vendoring *is* its precondition.** AF-2 as TSPEC §5.3 specifies it
(`TSPEC:256`) runs `prepack` into a temp directory **first**, then asserts the manifest's
`modules` array enumerates exactly the two modules by set-equality, each recorded SHA-256
equalling both the vendored bytes and the canonical source, with a one-byte mutation as the
falsifier. Without the prepack step there is no `VENDOR-MANIFEST.json` to read, so AF-2 does
not "remain correct" — it errors or goes red. TSPEC §12.3 item 4 (`TSPEC:1782`) states the
same thing from the other side: the equality is "true over the empty set in any ordinary
checkout", which is why the precondition is load-bearing rather than housekeeping. The
residual-risk paragraph below leans on AF-2 covering the case that matters, and that claim
holds only while the prepack precondition is stated — so it is stated here and not only in the
TSPEC.

**Re-evaluation triggers.** `pdlc-plugin-retirement` landing (the relocation alternative
becomes correct and cheap); **any new literal `pdlc/workflows/` path appearing outside the
tree itself** — stated this way rather than as "a third consumer" because it is a condition an
oracle could actually check, and because the five above show the count was already wrong once;
the vendored set growing past two files, which fires **in CI rather than in someone's memory**:
AF-2's set-equality is over exactly two members, so a third vendored file turns AF-2 red at the
moment it lands (the same mechanical-trigger shape DEC-EDIST-09's parser clause uses).

**Residual risk (TSPEC R-A).** AF-1's tracked-ness reading no longer catches an *untracked*
fork under `pdlc/engine/` — which is precisely what vendoring produces, so the weakening is
deliberate. The uncovered residual is a hand-placed untracked copy that is also byte-identical
to the source, which is harmless by definition.

## 3. DEC-EDIST-02: One optional, default-inert `_provenance` seam

*Closes FSPEC O-9 (Q-1's "one decision or three?"). Mechanism: TSPEC §7.1, §7.2, §7.4.*

**Context.** Three acceptance criteria want provenance to travel: the version pair in committed
halt artifacts (AC-4.2), the authored-file enumeration in the run report (AC-4.5), and the load
root (AC-6.2). The version pair already exists engine-side — `buildEngineBlock` /`stampReport`
(`pdlc/engine/lib/report.mjs:54`, `:110`), wired at `pdlc/engine/bin/pdlc.mjs:323-325` — but the
module that writes the artifacts cannot see it. Q-1 offered "one carrier or three"; the
measured answer is that the three criteria are in three different states.

**Decision.** One carrier, and it serves only the criterion that needs one.

- **AC-4.2 — new work.** `main()` in both workflow modules gains one keyword parameter,
  `_provenance = NO_PROVENANCE`, following the shipped default-inert idiom exactly
  (`NO_PROBE`/`NO_RUN_COMMAND`, `pdlc/workflows/orchestrate-dev.js:7342`, `:7354`, consumed at
  `:6211-6212`, `:10655`). The value is a frozen plain-data `Provenance` (TSPEC §7.1) whose
  `line` and `block` are **pre-rendered by the engine**: the module places strings and never
  formats or branches on `mode`, so one renderer feeds four placements and the banner, report
  and commit rows cannot drift apart. The engine side pays for it with a key on each of the two
  injection objects (`devInjection` an 8th, `queueInjection` a 6th, `pdlc/engine/lib/run.mjs:80-91`,
  `:114-123`) and the matching edit to `PROP-PARITY-12`'s pinned seam lists
  (`pdlc/engine/__tests__/seam-contract.test.js:47-63`, seven and five members at HEAD).
- **AC-4.5 — no carrier at all.** The report already returns `artifactPaths`
  (`orchestrate-dev.js:13088`). What it needs is *more members*, not a new channel: the only
  push site is `:11507`, reachable only from `converge()`, so LEARNINGS, `CODE_REVIEW-*`,
  POSTMORTEMs, `ADVISORY-*` and anchor-appended cross-reviews are all absent today. That is
  enumeration work in the module, and the FSPEC's `[blocked on O-9]` marking of AT-4.5 is
  therefore wrong — raised as an erratum, not fixed here.
- **AC-6.2 — engine half only.** `Provenance.loadRoot` is real, run-bound evidence
  (`workflowModulePath`, `pdlc/engine/lib/run.mjs:57-62`). The bundle half stays open because
  C-4 forbids teaching `.claude/workflows/`'s runtime to self-report; recorded as **N-1** in §12
  (TSPEC §14 numbers it the same way, `TSPEC:1948`; N-3 is BL-03's transcription, an unrelated
  operator item, and an earlier draft of this bullet pointed there).

**Alternatives considered.**

- **A required parameter, or a module-level import of an engine module** — rejected. It makes
  the workflow modules depend on the engine, which breaks the plugin channel outright: the same
  file must keep loading in the Claude Code workflow runtime, where `import` does not exist
  (DEC-DIST-01).
- **Three separate carriers, one per criterion** — rejected as Q-1's expensive branch, and
  measurement showed two of the three need no carrier at all.
- **Have the module render the provenance text from the raw values** — rejected. Three call
  sites formatting independently is exactly how a banner and a commit row start disagreeing;
  pre-rendering makes BR-5.1's "both halves travel together" a property of one function.
- **A global or env-var channel** (`PDLC_PROVENANCE` read inside the module) — rejected: it is
  invisible to the seam-contract test, cannot be frozen per run, and leaks into subprocesses the
  pipeline spawns.

**Constraints that forced the shape.** DEC-DIST-01 (the modules must stay loadable in a
constrained runtime with no `import`, no `process`, no `fs`); NG-5 and C-4 (a run with no engine
must produce byte-identical artifacts — the same guarantee the advisory tier ships with,
`pdlc/workflows/__tests__/advisoryDisabled.test.js`); BR-1.5 (one frozen value per run).

**Reversibility.** Easy per placement, moderate as a whole. The parameter is additive and inert
by default, so removing the engine's injection reverts behaviour with one edit; removing the
parameter itself also touches the pinned seam lists and the commit helpers that compose `line`.

**Re-evaluation triggers.** The bundle channel retiring (the seam could become a plain import);
a second consumer wanting a different rendering (`line`/`block` pre-rendering stops being an
asset and the raw fields become the contract); `artifactPaths` growing a second writer outside
`main()` (AC-4.5's enumeration route in TSPEC §7.4 would need re-deciding).

## 4. DEC-EDIST-03: A version store plus a resolving launcher

*Closes FSPEC O-2's execution half — "how does the pin actually execute?". Mechanism: TSPEC
§6.1, §6.2, §6.3.*

**Context.** The REQ asks for three things at once, and it is worth naming which criterion says
which, because an earlier draft of this entry attributed the default-to-latest half to the wrong
one:

- **AC-5.1** (`REQ:397-403`) is the *pinned* criterion — a project pinned to X while Y is the
  latest installed runs X, and the run announces the pin, with the "a newer version exists"
  half behind an injectable probe that never fails or blocks.
- **AC-5.2** (`REQ:404-406`) is the *unpinned* criterion — with no pin the latest installed
  version executes and the run says so, so the absence of a pin is as visible as its presence.
- **AC-5.5** (`REQ:419`) refuses a pin naming a version that is not installed, rather than
  silently upgrading or downgrading.

AC-5.1's own wording already forces the shape: "version X executes while version Y is the
latest installed" is a statement about two versions resident at once. AC-5.2 and AC-5.5 then
say what happens at the two ends of that residency — latest when unpinned, a refusal when the
pin names something absent. AC-5.5's "refuse when the pinned version is not installed, run it
when it is" presumes the same plural "what is installed".

**Decision.** Installed engine versions live side by side under one store root
(`$PDLC_HOME/versions/{version}/`, defaulting to `~/.pdlc/versions/`), populated by a
`postinstall` script. The `PATH` entry is a thin launcher that parses just enough argv to know
the consumer cwd and the resolution-affecting flags, runs a **pure, total** resolution ladder
(TSPEC §6.3: `dev ≻ pin ≻ latest`, with named refusal branches for a corrupt config, an
incomplete `--dev`, a missing pin, a malformed pin and an empty store), and hands off to the
resolved version's own `bin/pdlc.mjs` with an env marker so the child never re-resolves.
Resolution happens exactly once per invocation, which is BR-1.5's structural precondition.

**Alternatives considered.**

- **A single global install** (`npm i -g` one version, upgrade in place) — rejected. It cannot
  answer "what is installed" in the plural, so AC-5.1, AC-5.2 and AC-5.5 are jointly
  unsatisfiable: with one resident version the engine can only run that one, so AC-5.1's "X
  executes while Y is the latest installed" has no state that satisfies it, and a pin naming
  any other version must either fetch or lie.
- **A global install plus `npx @{scope}/pdlc-engine@{pin}` per pinned repo** — rejected on
  NG-3. `npx` **fetches on a miss**, which is precisely the "never fetches, never
  auto-upgrades" prohibition; the failure would also be a network error rather than AC-5.5's
  named refusal.
- **Per-repo local installs** (`node_modules/.bin/pdlc` in each consumer) — rejected. It
  satisfies side-by-side residency, but every consumer repo pays install cost and gains a
  dependency entry, which contradicts C-2/BR-2.1's "the engine is machine-level state outside
  every consumer repo" and would put the engine into the diff of repos it is meant to observe.
- **Resolve by dynamic `import` of the target version inside one process** — rejected, and
  recorded separately as DEC-EDIST-06 because the reasoning is about process semantics rather
  than about the store.

**Two operator-facing halves that follow from putting resolution in the launcher** (PM Q-01,
Q-02). AC-5.1 asks the run to *announce* the pin and AC-5.2 asks the absence of a pin to be as
visible as its presence; the mechanism is TSPEC §6.4 and §7.1, but the choice of surface is a
decision, so it is recorded: the announcement rides the **`Provenance` value** built once per
run (DEC-EDIST-02), so it reaches the banner, the run report and the commit rows through one
renderer rather than being a banner-only string — an unpinned run carries the same field with
`mode: "latest"`, which is what makes absence as visible as presence rather than merely
inferable from silence. AC-5.1's "a newer version exists" probe is observed by the **resolved
child**, not the launcher: the child is what prints the report, the probe's output belongs
beside the version it is commenting on, and keeping the launcher free of it keeps the launcher's
ladder pure and total (§6.3) rather than giving it an injectable seam it would otherwise not
need.

**Constraints that forced the shape.** AC-5.1 + AC-5.2 + AC-5.5 jointly (side-by-side residency);
NG-3 (no fetching); C-2/BR-2.1 (machine-level, not repo-level); AC-2.5/BR-2.6 (the engine
install must not touch the plugin's tree under `~/.claude/`, which a store under `$PDLC_HOME`
satisfies by construction rather than by discipline).

**Reversibility.** Hard. The store root is on-disk state an operator's machine accumulates, and
the launcher hop is observable in exit codes and stdio. Retreating to a single global install
means re-opening AC-5.5. The store's *shape* is contained — only `lib/store.mjs` knows it — so
the layout can change behind that module cheaply; the decision to have a store cannot.

**Re-evaluation triggers.** `postinstall` being unavailable in enough environments to make
population unreliable (TSPEC R-B — the mitigation today is that the refusal is loud and
`doctor` still runs, per DEC-EDIST-07); the two-process startup cost (R-C) becoming measurable
against the dispatch path; a package manager the store cannot be populated from.

## 5. DEC-EDIST-04: Ignore a bare `PDLC_PLUGIN_ROOT`, with a notice

*Closes FSPEC Q-4 (which branch AC-5.6 takes). Mechanism: TSPEC §6.5.*

**Context.** T-6 says dev-mode must be declared **per invocation**, explicitly. At HEAD the env
var `PDLC_PLUGIN_ROOT` is an equal-ranking explicit override alongside the `--plugin-root` flag
(`pdlc/engine/lib/skills.mjs:212-217`) — an ambient variable exported once in a shell can
therefore steer every subsequent run at a checkout, which is what T-6 objects to. AC-5.6 leaves
open which of two branches to take: refuse when the variable is set without a per-invocation
dev declaration, or ignore it.

**Decision.** Ignore, with a notice. `resolvePluginRoot` gains a `devDeclared: boolean` input;
when it is false and `PDLC_PLUGIN_ROOT` is set, discovery proceeds as if the variable were
unset and the run emits `PDLC_PLUGIN_ROOT was set (<value>) and ignored — dev-mode was not
declared; pass --dev to honour it`. The `--plugin-root` **flag** keeps its current precedence in
all four rows: it is explicit and per-invocation, which is exactly what T-6 asks for. The notice
is a catalogue entry (TSPEC §10.3). In the same change, the compat-refusal `REMEDY`
text (`pdlc/engine/lib/handshake.mjs:131-134`) is updated to recommend
`--dev PDLC_PLUGIN_ROOT=…` rather than the bare variable.

**What the catalogue equality does and does not cover.** An earlier draft of this entry said
the notice's catalogue membership meant `lib/catalogue.mjs`'s shipped registered-message
set-equality "covers it without a bespoke test". That was checked against HEAD and it is
wrong in two ways, so the corrected accounting is recorded here rather than left to the
implementer to discover:

- The set-equality inside `pdlc/engine/__tests__/catalogue.test.js:71-74` compares
  `messageIds()` against `Object.keys(MESSAGES)` — a module against itself, true for **any**
  catalogue content. That file's own header (`:4-6`) explicitly disclaims the emitted-ids
  equality as "a separate, cross-process concern… out of scope here".
- The equality that does bite is a different one in a different file:
  `checkMessageCatalogue` (`pdlc/engine/__tests__/_assert-suite-wide.mjs:196-210`), driven by
  `assert-suite-wide.test.js:165` (forward) and `:183` (reverse). Its reverse direction —
  "a registered id never emitted fails the step" — means registering the notice **creates an
  obligation to emit it somewhere in the suite**. It is emitter work, not covered work. And it
  is **path-blind**: it proves `env.plugin-root-ignored` is emitted *somewhere*, not that it is
  emitted on the `PDLC_PLUGIN_ROOT`-set-without-`--dev` path — which is this entry's entire
  difference from the rejected "honour it silently" branch.

**So the branch carries two assertions of its own**, and they are what make it falsifiable in
both directions rather than only registered:

1. `resolvePluginRoot({devDeclared: false, env: {PDLC_PLUGIN_ROOT: X}})` resolves to the
   **discovered** root (not `X`) **and** returns a notice list containing the
   `env.plugin-root-ignored` id — a positive assertion on the id, not "no override was
   applied", which would also pass if the variable had never been set.
2. The §6.5 row where `devDeclared` is `true` and the variable is set asserts it **is**
   honoured, so a regression that ignores it unconditionally is caught too.

Both assert the **rendered text** as well as the id, because the rendered string is the whole
operator-visible deliverable of AC-5.6 and an id equality says nothing about it. This is TSPEC
v0.2's own scheduled shape — "catalogue registration emitters paired with rendered-text
assertions (§10.3, §12.4)" — applied to this entry. Raised as an erratum against TSPEC §6.5,
whose "covers it for free" sentence this entry transcribed.

**Alternatives considered.**

- **Refuse on a bare `PDLC_PLUGIN_ROOT`** — the stricter branch, seriously considered because it
  reads T-6 unconditionally. Rejected because the variable is *shipped and documented in the
  product's own refusal text today* (`handshake.mjs:131-134`): it is currently an operator's
  remedy for a compat refusal. Turning the documented remedy into a second refusal punishes
  operators for following the product's own instruction, and does so at the worst moment — while
  they are already blocked by the first refusal.
- **Honour it silently, as today** — rejected: it is the status quo AC-5.6 exists to change,
  and it makes dev-mode ambient rather than per-invocation.
- **Honour it but warn** — rejected as the worst of both. The warning admits the input is
  suspect while still letting it steer the run, so nothing about T-6's ambient-state problem
  changes and the warning becomes noise operators learn to skip.

**Constraints that forced the shape.** T-6 (per-invocation declaration); the variable's
existing role in shipped refusal text; the principle that a product must not ignore an operator
input *silently* — hence the notice, which is the whole difference between this branch and the
status quo.

**Reversibility.** Easy — one branch in one function. Not a one-way door in either direction:
flipping to refusal later costs the same single branch, plus the message.

**Re-evaluation triggers.** **An operator report** that the notice is being hit repeatedly and
not acted on — stated in that honest form, because the engine emits no telemetry and NG-3
forbids it fetching anything, so there is no mechanical observation that could produce this
evidence (TE Q-01). The trigger is a judgement call and says so, unlike DEC-EDIST-09's parser
trigger, which names the oracle that goes red; if the ignore branch is still in place after
enough field exposure to have generated such a report, its provisionality is nominal;
`REMEDY` losing its `PDLC_PLUGIN_ROOT` recommendation entirely, which removes the reason this
branch was chosen over refusal.

## 6. DEC-EDIST-05: A `files` allow-list, not an `.npmignore` deny-list

*Closes FSPEC Q-5 (how `__tests__/` and friends stay out of the tarball). Mechanism: TSPEC
§5.4.*

**Context.** `pdlc/engine/package.json` declares no `files` and there is no `.npmignore`
(verified at HEAD), so the packed set is npm's default: everything not ignored. That currently
includes `__tests__/` — a corpus that copies skill and workflow text — and `package-lock.json`.
AC-1.3 asks that an added file which *should not* ship fails the gate.

**Decision.** An explicit `files` allow-list:
`["bin/", "lib/", "vendor/workflows/", "scripts/postinstall.mjs"]`. It excludes `__tests__/`,
`package-lock.json`, `.gitignore` and `scripts/prepack.mjs` without naming any of them.
Q-5 is answered as: the exclusion is a deliberate packaging mechanism, not an omission. The
allow-list is paired with PF-4's **member-for-member equality in both directions** against
TSPEC §5.4's literal expected set, run against a real `npm pack` into a temp directory.

**Alternatives considered.**

- **`.npmignore` deny-list** — rejected because the failure modes are asymmetric. A deny-list
  that forgets an entry **ships something that should not ship** — silently, to consumers,
  exactly AC-1.3's scenario and exactly how the `__tests__/` corpus would leak. An allow-list
  that forgets an entry **ships too little** and fails AT-3.8a loudly at build time. We prefer
  the failure caught offline over the one caught by a consumer.
- **Allow-list with a glob for `lib/*.mjs` in the expected set** — rejected, and this is the
  subtle one. Globbing at test time makes the *expectation* read the tree under test, so the
  equality can only ever be vacuously true. New `lib/` modules are added to §5.4's table by
  hand, as a visible edit; PF-4's failure message names the table as the expected set's source
  so an operator meeting a red PF-4 is told the table is stale rather than left reading "the
  package is wrong".
- **Leave the default packed set and assert it** — rejected: it makes the assertion the only
  control, so every new repo-local file is a potential leak until someone updates a test.

**Constraints that forced the shape.** AC-1.3 (an added file that should not ship fails);
BR-8.1 (both-directions equality); the `vendor/workflows/` rows from DEC-EDIST-01, which exist
only after `prepack`.

**PF-4 packs for real for two independent reasons, and a future reader must not retire one
while satisfying the other.** The first is the one above: the vendor rows do not exist before
`prepack`, so a `--dry-run` against the checkout is auditing a set that has not been built yet.
The second is DEC-EDIST-01's interaction with this entry. `vendor/` is git-ignored (a rule that
entry adds) and this package ships no `.npmignore` at HEAD, and npm's precedence between a
`files` entry and an ignore-file fallback *for paths inside a listed directory* has varied
across npm majors. DEC-EDIST-01 decides the inclusion explicitly — a shipped `.npmignore`
negating `vendor/workflows/` — precisely so the packed set does not depend on which rule the
installed npm implements; PF-4's real pack is what would catch that mechanism failing, and
AF-3's vendor-root path equality would too. The hazard being closed is a *cheaper* way to
satisfy the first reason (staging vendor rows without running `prepack`) silently removing the
only cover for the second, so both reasons are recorded here rather than one.

**Reversibility.** Easy — deleting the `files` key restores default behaviour. What is not
cheap to reverse is the expected-set discipline: relaxing PF-4 from equality to a subset check
would remove exactly the direction AC-1.3 needs.

**Re-evaluation triggers.** The packed set growing to where hand-maintaining §5.4's table is a
recurring stale-row cost (the answer then is a generated-and-committed expectation, not a glob);
npm changing how `files` interacts with `README*`/`LICENSE*`, which the expected set encodes as
always-packed regardless of the list.

## 7. DEC-EDIST-06: The launcher hop is a child process, not a dynamic import

*Refines DEC-EDIST-03. Mechanism: TSPEC §6.2.*

**Context.** Once the launcher has resolved a version, it must run that version's CLI. Two
mechanisms were available: `import()` the resolved `bin/cli.mjs` in the launcher's own process,
or spawn it.

**Decision.** Spawn: `child_process.spawnSync` with `stdio: "inherit"`, re-raising the child's
exit code as the launcher's own — **and, when the child was terminated by a signal rather than
by exiting, the launcher exits `128 + signum`.** Two engine versions may declare different
`@anthropic-ai/claude-agent-sdk` ranges (`pdlc/engine/package.json` pins `^0.3.226` today) and
must not share one module registry, which in-process loading would force.

**Alternatives considered.**

- **Dynamic `import()` of the resolved version in-process** — rejected. One process means one
  ESM registry and one resolved dependency tree; version N's engine would run against whatever
  SDK the launcher's own tree resolved, which defeats the point of having versions resident side
  by side.
- **Process replacement (`execve`)** — unavailable. Node has no `execve`, and an earlier draft's
  phrase "process replacement via `spawnSync`" was corrected: `spawnSync` is a *child*, and the
  difference is observable in signal handling, exit-code propagation and stdio buffering.
  Calling it "replacement" would hide exactly the behaviours that need asserting.

**The signalled child is decided, not merely named.** This entry rejects the word "replacement"
because signal handling, exit-code propagation and stdio buffering are observably different for
a child — and having named signal handling as a behaviour that needs asserting, it has to
decide it. `spawnSync` returns `{status: null, signal: "SIGINT"}` when the child is terminated
by a signal, so "re-raise the child's exit code" is **undefined** in that case, and the obvious
implementation, `process.exit(result.status)`, exits **0** on a Ctrl-C'd pipeline. Under
`stdio: "inherit"` the terminal delivers SIGINT to the whole foreground process group, so this
is the *common* interruption path rather than an exotic one, and a CI or `/loop` caller reading
exit 0 concludes the run succeeded — which collides directly with AC-1.4's exit-code contract
(crash 1, halt 2) that this entry cites as a constraint. **Decision: `status === null` means the
launcher exits `128 + signum`**, the conventional shell encoding, which is non-zero for every
signal, does not collide with 1 or 2, and lets a caller recover the signal number. It is a
launcher-side mapping only; nothing about the child's own exit codes changes.

**How the choice is paid for in tests.** Because the hop is a real process, the pass-through
claim gets a real oracle, and it covers all three named behaviours rather than two:

1. **Exit code and stdio** — one test spawns through the launcher at a trivial fake target and
   asserts a non-zero exit code propagates verbatim and that stdout and stderr each arrive
   unchanged rather than interleaved.
2. **Signals** — a second test spawns through the launcher at a fake target that kills itself
   with a known signal, and asserts the launcher's own exit status **equals the decided value**
   (`128 + signum`, a positive assertion on the exact number, not merely `!== 0`, since a
   passing `!== 0` would not distinguish the decided mapping from an accidental crash).

S-3's descriptor recorder (path, argv, env) stays for the *resolution* assertions and is not
asked to falsify pass-through — a double cannot. The shipped end-to-end CLI oracle already
spawns for real (`pdlc/engine/__tests__/cli.test.js:13,22`,
`spawnSync(process.execPath, [BIN, ...args])`), so both stay inside a shipped precedent. Raised
as an erratum against TSPEC §6.2, which carries the same three-behaviour sentence and pays for
two.

**Constraints that forced the shape.** Independent SDK ranges per resident version; AC-1.4's
exit-code contract (an engine crash is exit 1, a pipeline halt exit 2 — both must survive the
hop); the absence of `execve` in Node.

**Reversibility.** Easy in code, and the cost is TSPEC R-C: two Node process startups per run.
Measured concern only — the dispatch path dominates.

**Re-evaluation triggers.** Startup cost becoming measurable against dispatch (R-C); the engine
dropping to a single dependency-free tree, which would remove the registry-sharing objection;
a platform where signal and stdio pass-through through `spawnSync` proves unreliable.

## 8. DEC-EDIST-07: `--version` and `doctor` resolve but never refuse

*Mechanism: TSPEC §6.2, §11.*

**Context.** AC-1.1 puts `pdlc doctor` outside the compat gate — the diagnostic that explains a
refusal must itself still run. At HEAD that holds: `cmdDoctor` checks and dispatches nothing
(`pdlc/engine/bin/pdlc.mjs:208`, invoked at `:489-491`). DEC-EDIST-03 adds a *new* gate,
resolution, which runs in the launcher **structurally earlier** than the compat gate — so
without an explicit exemption the diagnostic becomes unreachable in exactly the state that most
needs it (TSPEC R-B: `--ignore-scripts` leaves the store empty, ladder branch 7 refuses, and the
operator cannot run the one command that would explain why).

**Decision.** `--version` and `doctor` **resolve, but never refuse**. They run the same ladder,
for reporting only: they never hand off to a resolved child, and a refusing branch is downgraded
to a notice rather than an exit.

- **Resolution succeeds** — report the **resolved** engine's triple, read from the resolved
  store entry's own `package.json`, with `mode` reported.
- **Resolution fails** — fall back to the launcher's **own** version, `mode: "unresolved"`, the
  refusing branch's text carried as a notice; `doctor` additionally prints the store root and
  the installed versions ("versions installed: none" is what turns R-B from a mystery into an
  instruction).
- **Exit code is 0 in both states.** A diagnostic that exits non-zero because the thing it
  diagnoses is broken is not a diagnostic.

**Why report the resolved triple rather than the launcher's own.** AC-1.4 requires that the
triple `--version` prints is the same triple the startup banner and the run report carry
(`runStartupChecks` already returns `versions: {engine, plugin}`,
`pdlc/engine/lib/startup.mjs:319`, `:453`). In a pinned repo the resolved version differs from
the launcher's, so reporting the launcher's own would put exactly AC-1.4's forbidden divergence
in front of the one operator debugging a pin.

**Alternatives considered.**

- **Exempt them from resolution entirely** (always report the launcher's own version) —
  rejected: simplest, but it breaks AC-1.4 in precisely the pinned case, per the paragraph
  above. AC-1.1 asks that these commands never *refuse*, not that they never *resolve*.
- **Let them refuse like every other command** — rejected: it makes R-B unrecoverable and
  contradicts AC-1.1.
- **Exit non-zero on the unresolved path** while still printing — rejected: callers and CI treat
  non-zero as "the command failed", and the command did not fail.

**Constraints that forced the shape.** AC-1.1 (diagnostic outside the gate); AC-1.4 (one
triple, everywhere); R-B's `--ignore-scripts` reality.

**Reversibility.** Easy — it is a branch in the launcher. **Three** states are asserted, so a
regression is caught:

| # | State | Asserted behaviour |
|---|---|---|
| a | pinned repo, the pin is in the store | `--version`'s triple **equals the run report's triple** and equals the pinned version, `mode: "pin"` |
| b | empty store (R-B's `--ignore-scripts`) | the launcher's own version, `mode: "unresolved"`, the refusing branch's text as a notice, exit 0 |
| c | **unreadable `.claude/pdlc.config.json`, no pin ever declared** | `pdlc doctor` prints ladder **branch 0**'s parse-error text as a notice, naming the file, plus the store root and the installed versions; exit 0 |

Row (c) is the composition with DEC-EDIST-08 and it is the recovery path that matters most, so
it is enumerated rather than left to the generic clause above. DEC-EDIST-08 makes an unreadable
config refuse at branch 0 **even when no pin was declared** — the one operator-visible
regression this feature ships — and once every command refuses, `doctor` is the *only* way to
learn why. The generic "a refusing branch is downgraded to a notice" does specify the
behaviour, but branch 0 is a **new** refusal introduced in a different entry, and an
unenumerated composition is how a product becomes unrecoverable in exactly the state its
diagnostic exists for. Cross-referenced from §9's carve-out table.

Row (a)'s equality is between the **two observed outputs** — the launcher's `--version` stdout
and the run report's engine block — not between each and the pinned literal (TE Q-03). Under a
pin these are two different reads of two different files: `--version` reads the resolved store
entry's own `package.json`, while the report's engine block is built from `pkg.version` inside
the running child (`pdlc/engine/bin/pdlc.mjs:323-325`). Only comparing the outputs to each
other falsifies a drift between the two read paths; comparing each to the literal passes even
when the two paths have diverged in a way AC-1.4 forbids.

**Re-evaluation triggers.** A third exempt command appearing (the exemption list stops being two
special cases and wants a declared property); `doctor` growing an action that mutates state, at
which point "never refuses" becomes unsafe.

## 9. DEC-EDIST-08: An unreadable consumer config refuses, even when no pin was declared

*Mechanism: TSPEC §6.3 branch 0, §6.4.*

**Context.** The pin lives in the consumer-owned `.claude/pdlc.config.json` under an `engine.*`
namespace — the file the engine already reads (`ENGINE_CONFIG_PATH`,
`pdlc/engine/lib/run.mjs:160`). But `readEngineConfig` **degrades totally** today: unparseable
JSON returns `{config: {}, notices: [...]}` (`run.mjs:185-192`), and so does a non-object
`dispatch` section (`:196-203`). Composed naively with a resolution ladder, "no
`engine.version`" and "the file did not parse" collapse into the same answer — "no pin" — so a
**corrupt config in a pinned repo would silently run latest**. That is AC-5.5's failure mode
one layer up, with no ladder row covering it. Worse, `resolveVersion()` is pure over its
inputs, so the defect sits *outside* the ladder's own tests: they could be complete and total
and still never reach it.

**Decision.** Two parts.

1. `readEngineConfig`'s `engine`-section read returns a **discriminated result** —
   `{state: "absent"}` / `{state: "no-pin", config}` / `{state: "unreadable", path, error}` —
   so the ladder can tell "no pin" from "cannot tell". The existing `notices` channel is
   **kept, not replaced**: `dispatch` tunables keep their degrade-with-notice behaviour whenever
   the file parses, because a wrong tunable is not a wrong engine. Only the `engine` section
   gains the new read.
2. The ladder's **branch 0** refuses on `unreadable`, and the trigger is **file-level**:
   a file that does not parse refuses **even when no pin was ever declared**. A repo with a
   corrupt `.claude/pdlc.config.json` and no `engine` section runs today with a notice and
   **refuses** after this change.

**Alternatives considered.**

- **"Unparseable, therefore assume no pin"** — rejected. It is the benign-looking reading, and
  it is indistinguishable *by construction* from the case AC-5.5 exists to prevent: the file
  that cannot be parsed is exactly the file that might carry a pin. We trade one loud refusal —
  naming the file and the parse error, remediable by fixing or deleting the file — for never
  silently running the wrong engine.
- **Refuse only when the file parses but the `engine` section is malformed** — rejected as
  undecidable: if the file does not parse there is no section to inspect, so this branch cannot
  cover the case that matters.
- **A second config file for the pin**, left readable when the main one is corrupt — rejected.
  DEC-HE-02 and `ENGINE_CONFIG_PATH` already fix one consumer config file
  (`pdlc/engine/lib/run.mjs:160`); a second file to work around the first being corrupt adds a
  convention to dodge a failure mode rather than deciding it.

**Constraints that forced the shape.** AC-5.5 (a pin never silently downgrades); BR-2.2/BR-4.7
(the engine reads the consumer config, never writes it); the shipped absent-versus-unreadable
discipline in `handshake.mjs` (`:45`, `:144`, `:164`), which this mirrors rather than inventing
a second convention for the same distinction.

**Reversibility.** Easy in code, **operator-visible in behaviour**. This is the one entry that
makes a previously-running repo refuse, so the change carries a test that states the carve-out
explicitly rather than letting a reader assume "this one degrades":

| Case | Ladder | Note |
|---|---|---|
| file unparseable, `engine.version` **was** declared | 0 → refuse | the case the branch exists for |
| file unparseable, **no pin ever declared** | 0 → refuse | newly-refusing; asserted explicitly |
| file parses, `dispatch` tunable malformed | not branch 0 | degrades with a notice, exactly as at HEAD |
| file unparseable, under `pdlc doctor` | 0 → **notice, not refusal** | DEC-EDIST-07 downgrades it: `doctor` prints branch 0's parse-error text, names the file, and exits 0 — asserted as row (c) of §8's state table. This is the only way out of the row above |

**Re-evaluation triggers.** Field reports of the newly-refusing row firing on repos that never
pinned anything (the refusal would then be costing more than the silent-wrong-engine risk it
buys); the pin moving out of the shared config file, which dissolves the coupling entirely.

## 10. DEC-EDIST-09: A dependency-free guard entry point; the CLI body moves to `bin/cli.mjs`

*Mechanism: TSPEC §9.3, §12.1.*

**Context.** AC-2.4 wants an operator on an unsupported Node to see a **named floor**, not a
stack trace. A guard "at the top of `bin/pdlc.mjs`" does not achieve that: ESM static imports
are resolved and evaluated **before** the importing module's body runs, and the shipped launcher
carries **nine** static imports (`pdlc/engine/bin/pdlc.mjs:22-31`) — three `node:` builtins at
`:22-24` and six local modules at `:26-31`, the latter being the graph that actually reaches
this feature's own code. A modern-syntax construct anywhere in that graph throws a parse error
before the guard's first statement.

**Decision.** The `bin` entry **keeps the name `bin/pdlc.mjs`** and becomes a dependency-free
guard whose only top-level statements are the version comparison, the refusal, and — on success
— a **promise-chained** `import("./cli.mjs").then(…)`. Everything currently in the file moves to
the new `bin/cli.mjs` behind that dynamic import. Keeping the name is what leaves the manifest's
`bin` field (`pdlc/engine/package.json:6-8`), AC-2.1's `PATH` entry and `cli.test.js`'s
invocation target untouched. The manifest additionally declares `engines.node: ">=20"` so npm
carries the floor at install time.

Two consequences are named rather than left to be discovered:

- **No top-level `await`.** Top-level `await` is a Node **14.8+ parse-level** feature, so
  `await import("./cli.mjs")` would make the guard a `SyntaxError` on Node 12 — the exact AC-2.4
  failure this redesign removes, merely relocated. The promise-chain form has no such
  requirement. The honest floor for the guard's own syntax is **Node 12.17+**, where dynamic
  `import()` first parses in ESM: it parses there so that it can refuse there.
- **The move is not byte-identical.** `cli.mjs` exports `main(argv = process.argv, deps = …)`
  and self-invokes only behind an entry guard, replacing HEAD's bare `main().catch(…)`
  (`pdlc/engine/bin/pdlc.mjs:505`) which makes *importing* the module run the CLI against the
  importer's argv. `argv` keeps HEAD's convention — the body's `const [, , cmd, ...rest]`
  (`:479`) is unchanged, so callers pass a process-argv-shaped array. `deps` defaults to the
  module's own bindings, so production behaviour is unchanged.

**Alternatives considered.**

- **Guard at the top of the existing file** — rejected: evaluation order defeats it, as above.
- **`await import("./cli.mjs")` in the guard** — rejected: parse-level failure below Node 14.8.
- **A CommonJS `bin/pdlc.cjs` shim** — rejected. It would parse on much older Node, but it
  changes the entry's extension and therefore the manifest `bin` target, AC-2.1's `PATH` entry
  and the shipped `cli.test.js` invocation, i.e. it buys a few Node minor versions at the cost
  of the untouched-surface property that made keeping the name worthwhile. The package is ESM
  throughout (`pdlc/engine/package.json` declares `"type": "module"`).
- **Rely on `engines.node` alone** — rejected: `npm` warns rather than refuses in common
  configurations, and it says nothing at all when the CLI is invoked in an already-installed
  tree on a downgraded Node.
- **Add a parser (`acorn`) to assert the guard's syntax subset mechanically** — rejected for
  now, and recorded as an accepted risk (TSPEC R-E): it would add a dependency to the one
  manifest this feature's packed-set equality is auditing, to check a three-statement file.
  **The reversal has a mechanical trigger, not a judgement call:** if `bin/pdlc.mjs` ever needs
  a top-level statement beyond the three the structural oracle admits, the parser stops being
  optional and this sub-decision is re-decided rather than re-accepted. The structural clause
  goes red at exactly that moment, so the trigger fires in CI.

**Constraints that forced the shape.** ESM evaluation order; AC-2.4 (named floor, no stack
trace); AC-2.1 (`PATH` entry unchanged); C-3/T-2 (Node ≥ 20 floor); `node:test`'s `mock.module`
being experimental and absent from the pinned runner, which is why the runner seam is a
default-valued `deps` object rather than module mocking.

**Reversibility.** Easy to reverse mechanically (concatenate the two files back), but the split
is load-bearing for AC-2.4 and for §12.1's process-entry leg, so reversal means giving up both.

**Re-evaluation triggers.** The guard growing past three top-level statements (see the parser
trigger above); Node's minimum-supported floor rising past 14.8 everywhere the engine could
plausibly be invoked, which makes top-level `await` safe and the promise chain unnecessary;
`mock.module` stabilising, which would remove the need for the exported `deps` seam.

## 11. DEC-EDIST-10: `publish.yml` duplicates the gate jobs rather than extracting a reusable workflow

*Mechanism: TSPEC §8.1, §8.2, §8.5.*

**Context.** C-6 requires publishing to be gated on the same evidence a PR is. The repo has one
workflow file (`.github/workflows/pr-tests.yml`) carrying the five gate jobs whose **rendered**
check names Phase PUB polls literally. The tag-triggered `publish.yml` must re-run those five
job bodies at the tagged commit. The obvious DRY move is to extract them into a reusable
workflow both files `uses:`.

**Decision.** `publish.yml` carries its **own copy** of the five gate jobs' bodies.
`pr-tests.yml` is not touched at all, so its five rendered names cannot change because nothing
edits them.

**Alternatives considered.**

- **Extract the five bodies into a reusable `gate.yml`** — rejected, and the reason is
  mechanical rather than taste. GitHub renders a job that `uses:` a reusable workflow as
  `{caller job name} / {called job name}`. Extraction therefore changes all five **rendered**
  check names — the names a consumer's Phase PUB polls literally — while leaving the caller's
  authored `name:` keys byte-identical. That is the worst combination available: the break is
  invisible to the very oracle offered against it. §8.5's expander reads job-level `name:` keys
  and expands declared matrix axes only; it models no `uses:` nesting, and BR-7.3's
  "unexpandable name expression" guard does not fire because there is no expression in the name.
  The oracle would stay green while the live checks were renamed. An oracle that cannot detect
  the failure it is nominated against is not a mitigation. Secondarily, C-5 says the publish
  workflow is **additive** — "a new workflow file with its own trigger" — and rewriting
  `pr-tests.yml`'s five job bodies into `uses:` calls is not additive by any reading.
- **Add publish jobs to `pr-tests.yml` under a tag condition** — rejected on C-5/BR-7.5 for the
  same reason: it edits the file whose rendered names are a consumer contract.
- **Trust the tag to point at an already-green commit and skip the re-run** — rejected: a tag
  can be moved or created on any commit, so "was green once on a PR" is not evidence about the
  tagged tree.

**How the duplication's cost is paid.** By an oracle, not by discipline. §8.5's
`ci-arrangement.test.js` asserts a **set-equality between `publish.yml`'s gate job run commands
and `pr-tests.yml`'s five**, so a command that drifts in one file and not the other fails the
gate. Duplication with an equality check is safer than extraction with a blind one. The rejected
path is additionally made *mechanically unavailable*: **a job carrying `uses:` fails the
arrangement gate as unexpandable**, symmetric with BR-7.3/E-19 — so a future attempt at
extraction goes red in CI instead of silently renaming a consumer's checks.

**Constraints that forced the shape.** C-5 (additive publish workflow); C-6 (same evidence);
BR-7.5 (`pr-tests.yml`'s rendered set is the contract); the fact that Phase PUB polls check
names as literals. Note `pr-tests.yml` already contains `uses:` at step level (action
invocations, nine at HEAD) — the gate's prohibition is on **job-level** `uses:`, and §8.5's
reader is job-level throughout.

**Reversibility.** Hard in practice, though easy in YAML. Reversal renames live check names that
consumers poll, which is a coordinated change across repos rather than a refactor — which is
precisely why the arrangement gate refuses it rather than merely discouraging it.

**Re-evaluation triggers.** Phase PUB stopping polling literal check names (e.g. moving to a
required-status API keyed on job ids), which removes the renaming hazard entirely and makes
extraction cheap; the gate growing past five jobs, where the duplication cost starts to exceed
what the command set-equality comfortably covers.

## 12. Decisions deliberately not taken here

These are open by choice, with an owner. They are listed so a reader does not mistake silence
for a decision, and so the PLAN schedules them as gates rather than as code tasks.

**Two of O-8's three publish blockers are here; the third is closed by design.** O-8's blocker
1 is `"private": true` (`pdlc/engine/package.json:4`), the one npm itself refuses — TSPEC §5.1
removes the field and PF-3 asserts `private` is absent (`TSPEC:1126`), so it is engineering
work scheduled in this feature, not an operator item. Blockers 2 (the npm scope, N-6) and 3
(the licence, N-2) are the operator-owned rows below. A reader consulting this table alone
would otherwise see two rows against a "three blockers stand" statement elsewhere and be left
with one unaccounted for.

| # | Item | Why it is not decided here | Owner | Blocks |
|---|---|---|---|---|
| N-1 | AC-6.2's load-root half on the **bundle** side | C-4 forbids teaching `.claude/workflows/`'s runtime to self-report. DEC-EDIST-02 closes the engine half only; the interim limit is documented in AT-6.2's recorded evidence rather than dressed as a channel oracle | Re-opens against `pdlc-plugin-retirement`, which removes the second channel and dissolves the question | Nothing in Phase 1 |
| N-2 | `license` (O-8 blocker 3) — replacing `"UNLICENSED"` (`pdlc/engine/package.json:11`) | An operator decision with a dependency's terms to check, not an engineering choice | Operator; recorded in `docs/_decisions/DECISIONS-plugin-distribution.md` | The **first real publish**. PF-3 asserts the manifest against the recorded value, and TSPEC §5.4's `PK-3` (`LICENSE`) enters the expected packed set **when the record lands**, never by probing the tree |
| N-3 | BL-03's transcription into `DECISIONS-plugin-distribution.md` | Still undone at HEAD — that file carries DEC-DIST-01…05 and no version-of-record entry. This feature is designed on O-7's decided position; if the transcription lands saying something else, the affected entries above re-open | Operator | Nothing mechanically; a correctness dependency |
| N-4 | Q-3, the range-widening cadence for `pdlcPluginCompat` | Shapes R-2's mitigation, decides nothing this feature builds | Operator | Nothing |
| N-5 | Q-7, M-ENG-10's change-control tail | One sentence in `docs/_constraints/pdlc-engine-baseline.md`, owned by the same pass that lands §8.5's expected-check-set carrier. The deferral expires when that carrier lands | Same author as §8.5's carrier | Nothing |
| N-6 | The npm **scope** in the published package name (O-8 blocker 2) | DEC-DIST-05 chose "scoped public npm" and named no scope; `pdlc/engine/package.json:2` is the unscoped `pdlc-engine` at HEAD. A scope the operator does not own on npm blocks the first publish exactly as N-2 does, and the package name is the most consumer-visible string this feature ships — so it is a product/operator decision recorded in `DECISIONS-plugin-distribution.md`, not a literal invented in a spec | Operator | The **first publish** and nothing before it. PF-3 asserts the manifest against the recorded value; the README ships the resolved literal |

**Why N-2 and N-6 are asserted against a decision record rather than against the tree.** An
expected set that reads the artifact under test is not an expectation. If `PK-3` meant "expected
iff `pdlc/engine/LICENSE` exists", then losing the `LICENSE` file to a bad merge would shrink
*both* sides of the equality together, PF-4 would stay green, and the package would publish
unlicensed. Sourcing both from the recorded decision makes the flip a visible edit to one file —
the same file PF-3 already reads.

**Risks carried, not decided away.** TSPEC §14.2 owns the full list; the three that bear on
entries above are R-A (DEC-EDIST-01's tracked-ness weakening, §2), R-B (`postinstall` fragility,
mitigated structurally by DEC-EDIST-07) and R-E (the Node-12.17 syntax-subset claim is
documented, not tested, with the mechanical reversal trigger in DEC-EDIST-09).

## 13. Decision register: options considered, decision, consequences

An index, not a second authority. Each row compresses the entry named in its first column; where
this table and the entry disagree, the entry governs, and where the entry and the TSPEC section it
cites disagree, the TSPEC governs. It exists so a reader arriving at a 600-line record can find
the entry that bears on the change in front of them without reading all ten.

| ID | § | Decision | Principal option rejected | Consequence carried | Reversal |
|---|---|---|---|---|---|
| DEC-EDIST-01 | §2 | `prepack` vendors the two workflow modules into `pdlc/engine/vendor/workflows/`, tarball-only, hash-manifested; two-root resolution | Relocating the modules under the package root — a **five**-consumer edit today (`build-runtime.mjs:94-97,531-533`, `sync-workflows.sh`, `run.test.js:45-46`, `MERGE_GUARD_DEFAULTS` at `orchestrate-dev.js:48-53`, `consolidationRoute.test.js:108-110`), not a `git mv`; four go red, the merge guard silently stops covering the path | AF-1 weakens to tracked-ness, so an untracked byte-identical copy is uncovered (R-A); AF-2 exists only behind a `prepack`-into-temp precondition | Easy — delete the step and the second root, and **delete AF-2 with them** |
| DEC-EDIST-02 | §3 | One optional `_provenance = NO_PROVENANCE` parameter carrying engine-rendered `line`/`block`; AC-4.5 needs no carrier, AC-6.2 gets the engine half only | Three separate carriers, one per criterion — two of the three turned out to need none | Two injection objects and `PROP-PARITY-12`'s pinned seam lists grow a member each | Easy per placement; moderate whole |
| DEC-EDIST-03 | §4 | Side-by-side version store under `$PDLC_HOME/versions/`, populated by `postinstall`, fronted by a resolving launcher (`dev ≻ pin ≻ latest`) | A single global install — cannot answer "what is installed" in the plural, so AC-5.1 and AC-5.5 are jointly unsatisfiable | On-disk machine state; a two-process hop (R-C); `postinstall` fragility (R-B) | **Hard** — retreat re-opens AC-5.5 |
| DEC-EDIST-04 | §5 | A bare `PDLC_PLUGIN_ROOT` is ignored with a catalogue notice; the `--plugin-root` flag keeps precedence | Refusing on it — but the variable is the product's own shipped remedy text (`handshake.mjs:131-134`), so refusal punishes operators mid-refusal | One branch, one message, the `REMEDY` text update, **and two assertions of its own** — the catalogue equality covers *registration* (and in reverse obliges an emitter); the ignore-branch trigger and the notice's rendered text are not covered by it | Easy — same single branch either way |
| DEC-EDIST-05 | §6 | An explicit `files` allow-list, checked by member-for-member equality against §5.4's literal table via a real `npm pack` | An `.npmignore` deny-list — a forgotten entry **ships** what should not, silently, to consumers | §5.4's table is hand-maintained; a glob would make PF-4 vacuous | Easy in code; the equality discipline is not |
| DEC-EDIST-06 | §7 | The launcher hop is `spawnSync` with `stdio: "inherit"`, re-raising the child's exit code | In-process `import()` — one ESM registry would force resident versions to share one SDK tree | Two Node startups per run (R-C); pass-through needs a real spawning oracle, not a double; a signalled child maps to `128 + signum` rather than to `spawnSync`'s `status: null` | Easy |
| DEC-EDIST-07 | §8 | `--version` and `doctor` **resolve but never refuse**; refusing branches degrade to notices, exit 0 in both states | Exempting them from resolution entirely — breaks AC-1.4's one-triple rule in exactly the pinned case | An exemption list of two, asserted in **three** states — including `doctor` over a corrupt config, the composition with DEC-EDIST-08 that is the only route out of branch 0 | Easy — a branch in the launcher |
| DEC-EDIST-08 | §9 | `readEngineConfig`'s `engine` read returns `absent`/`no-pin`/`unreadable`; ladder branch 0 refuses on `unreadable` **even with no pin declared** | "Unparseable, therefore assume no pin" — indistinguishable by construction from the case AC-5.5 exists to prevent | The one **operator-visible** change: a previously-running corrupt-config repo now refuses | Easy in code, visible in behaviour |
| DEC-EDIST-09 | §10 | `bin/pdlc.mjs` becomes a dependency-free guard (promise-chained `import("./cli.mjs")`); the CLI body moves to `bin/cli.mjs` | A guard atop the existing file — ESM static imports evaluate first, so six imports throw before its first statement | No top-level `await` (parse-level, Node 14.8+); the move is not byte-identical; syntax subset is documented, not parsed (R-E) | Mechanically easy; load-bearing for AC-2.4 |
| DEC-EDIST-10 | §11 | `publish.yml` carries its **own copy** of the five gate job bodies; `pr-tests.yml` is not touched | A reusable `gate.yml` — renders as `{caller} / {called}`, renaming all five checks a consumer polls while the arrangement oracle stays green | Duplication, paid for by a run-command set-equality; job-level `uses:` is made to fail the gate | **Hard in practice** — reversal renames live consumer-polled checks |

Two shapes recur across the table and are worth naming, because they are the reasoning this
feature reuses rather than ten independent judgements:

- **Prefer the failure caught offline to the one caught by a consumer.** DEC-EDIST-05's
  allow-list, DEC-EDIST-08's branch-0 refusal and DEC-EDIST-10's job-level `uses:` prohibition
  are the same trade: accept a loud, local, remediable stop in exchange for never shipping the
  silent wrong thing.
- **An oracle that cannot detect the failure it is nominated against is not a mitigation.** It
  is why DEC-EDIST-10 rejects extraction, why DEC-EDIST-05 rejects a globbed expected set, why
  DEC-EDIST-06 will not let a descriptor double falsify pass-through, and why §12's N-2/N-6 are
  asserted against this record rather than against the tree.

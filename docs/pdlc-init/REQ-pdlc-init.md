---
feature: pdlc-init
ready: true
depends-on:
---

# REQ pdlc-init

| Field | Value |
|---|---|
| Upstream | **REQ** (root) — design source: `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` §2 (portability rationale), §4 (CLI surface: `pdlc init` listed as one of two mechanical, non-pipeline additions alongside `pdlc stats`) |
| Downstream | FSPEC, TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | `docs/pdlc-init/LEARNINGS-pdlc-init.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | pm-author | 1.0 | 2026-08-30 |

## 1. Problem / Context

The pipeline's artifact convention — `docs/_queue/QUEUE.md`, `docs/_queue/ESCALATIONS.md`,
`docs/_constraints/`, `docs/_decisions/`, an operator-local `.claude/pdlc.config.json` — is
documented (`pdlc/OPERATIONS.md` §Artifact convention, §Operator surface) but has no scaffolding
command: onboarding a new repo today means an operator hand-copies `pdlc/templates/QUEUE.md` and
manually creates the remaining paths, a step `pdlc/README.md`'s own one-time-setup list already
names as separate, easy-to-skip actions rather than one command. `DESIGN-pdlc-minimal-loop-
2026-08-30.md` §2 establishes the load-bearing reason this convention is files in a git repo and
not a hosted tracker — atomicity with spec/decision/code changes, unattended `/loop`-driven
operation with no external auth or network surface, and portability requiring nothing beyond the
files themselves and standard git operations. §4's CLI surface table lists `pdlc init` as one of
exactly two mechanical additions to the shipped `pdlc dev` / `pdlc queue` / `pdlc decide` /
`pdlc doctor` command set (the other, `pdlc stats`, is out of scope here — §7 item 8 sequences
`pdlc init` independently of every other design move). This REQ is that command: a portable,
non-destructive scaffold step that produces a convention-conforming repo, and a `--check` mode
that reports how an existing repo's layout compares to the convention without writing anything.

## 2. Goals

**G-1 (scaffold on first run).** Given a target directory that is a git repository and has none
of the convention paths yet, `pdlc init` creates every missing one: `docs/_queue/QUEUE.md`,
`docs/_queue/ESCALATIONS.md`, `docs/_constraints/` and `docs/_decisions/` each with a one-
paragraph `README.md` explaining the directory's purpose, and `.claude/pdlc.config.json` seeded
from the shipped `.claude/pdlc.config.example.json` shape with every experimental key at its
documented default (off/false) — never a copy that turns an experiment on.

**G-2 (idempotent and non-destructive).** Re-running `pdlc init` in a repo that already has some
or all of these paths never overwrites an existing file's content. Each run reports, per path,
whether it was created or already existed, and exits 0 as long as the target is a valid git
repository — a fully-conforming repo is a success outcome, not a no-op error.

**G-3 (refuses cleanly outside a git repo).** `pdlc init` refuses, with a non-zero exit code and a
message that names the problem, only when the target is not a git repository. This is the only
refusal condition this command has.

**G-4 (`--check` mode reports, never writes).** `pdlc init --check` compares the target directory
against the convention and reports conformance — which paths exist, which are missing, and which
existing queue/escalations files are structurally malformed per the convention's own parsing
contract (`pdlc/OPERATIONS.md` §Artifact convention: `QUEUE.md`'s `Order | Status | Feature |
REQ Path | Depends-On` header, case-insensitive column matching) — without creating, modifying, or
deleting anything on disk.

## 3. Non-Goals

**NG-1** No GitHub Issues, or any hosted issue tracker, integration. `docs/design/DESIGN-pdlc-
minimal-loop-2026-08-30.md` §2 rejects a tracker as the artifact store on atomicity, unattended-
operation and portability grounds; `pdlc init` scaffolds the in-repo convention only.

**NG-2** No CI wiring. `pdlc init` does not create or modify `.github/workflows/*` or any other
repo's CI configuration.

**NG-3** No migration of a non-conforming repo's existing, differently-shaped artifacts (a
`docs/{feature}/` tree using a different layout, a hand-rolled queue file with a different
schema) into the convention. `pdlc init --check` reports non-conformance; it does not rewrite or
move an operator's existing files, conforming or not.

**NG-4** No plugin or engine installation. `pdlc init` scaffolds convention paths inside an
already-checked-out repo; installing `pdlc/engine` or the plugin itself remains the one-time setup
step `pdlc/README.md` already documents, unchanged by this REQ.

**NG-5** No `depends-on:` frontmatter parsing, queue-pickup, or dispatch behavior changes. This
REQ adds one CLI command whose output is scaffolded files; it does not touch `pdlc dev`,
`pdlc queue`, or `pdlc decide`'s existing behavior.

**NG-6** No new config keys beyond the existing seeded set. `pdlc init` writes the *existing*
documented keys (`learningsInjection`, `cascade.pinCheck`, `review.derivativeStop`, `advisory`,
`merge`, `implementation`, `loop`) at their already-declared defaults; it does not invent new
threshold values or new experimental gates.

**NG-7** No changes to `pdlc/engine/`'s existing commands (`dev`, `queue`, `doctor`, `decide`) or
to the vendoring/publish channel described in `pdlc/OPERATIONS.md` §The engine channel; `init` is
an additional command alongside them, per DESIGN §4.

## 4. Constraints

**C-1** Follows the repo convention this REQ scaffolds: consuming-repo artifacts live under
`docs/{feature-name}/`, project-level context under `docs/_constraints/` and `docs/_decisions/`,
the serial queue at `docs/_queue/QUEUE.md`, escalations at `docs/_queue/ESCALATIONS.md`
(`pdlc/OPERATIONS.md` §Artifact convention). `pdlc init` does not invent an alternate layout.

**C-2** The seeded `QUEUE.md` carries the shipped starter template's shape: the header row
`Order | Status | Feature | REQ Path | Depends-On` and a driver preamble explaining the status
lifecycle and eligibility rule, matching `pdlc/templates/QUEUE.md` — the same file an operator
copies by hand today (`pdlc/README.md` §one-time setup). `pdlc init` is the mechanized form of
that copy step, not a new template.

**C-3** The seeded `.claude/pdlc.config.json` carries every key already documented in
`pdlc/OPERATIONS.md` at its documented default value — `learningsInjection.enabled: true` (the
one key documented as shipping on by default), every other experimental gate (`advisory.enabled`,
`cascade.pinCheck.enabled`, `review.derivativeStop.enabled`, `merge.mergeMode: "off"`) at its
documented off/false default. `pdlc init` never seeds a config that silently turns an experiment
on relative to what an absent config file would already default to.

**C-4** `.claude/pdlc.config.json` is gitignored (`.gitignore`'s `/.claude/pdlc.config.json`
entry) and documented as operator-local (`pdlc/OPERATIONS.md` §Merge guard-path extras). Seeding
it is a plain file write; `pdlc init` neither modifies `.gitignore` nor assumes the seeded file
will be committed.

**C-5** No numeric threshold is introduced by this REQ (per the threshold-declaration
obligation): every config value `pdlc init` seeds is a value already declared and owned
elsewhere (`.claude/pdlc.config.example.json` and the config sections of `pdlc/OPERATIONS.md`);
this REQ only specifies that seeding reproduces those existing defaults faithfully.

**C-6** Size budget: this REQ targets ≤250 lines against the pdlc REQ size budget's hard ceiling
of 700 lines / 61,440 bytes (`pdlc/hooks/scripts/check-req-size.sh`).

## 5. Acceptance Criteria

### REQ-INIT-01 Scaffolds every missing convention path (P0)

**Who:** An operator onboarding a new repo to pdlc.
**Given:** The target directory is a git repository and none of the convention paths exist yet.
**When:** the operator runs `pdlc init`.
**Then:** every one of these paths is created: `docs/_queue/QUEUE.md` (header row and driver
preamble per C-2), `docs/_queue/ESCALATIONS.md`, `docs/_constraints/README.md`,
`docs/_decisions/README.md` (each a one-paragraph explanation of the directory's purpose), and
`.claude/pdlc.config.json` (seeded per C-3); the command reports each path as created and exits 0.

### REQ-INIT-02 Never overwrites an existing file (P0)

**Who:** An operator running `pdlc init` a second time, or in a repo that already has some
convention paths (e.g. an operator who hand-copied `QUEUE.md` before this command existed).
**Given:** one or more of the five paths in REQ-INIT-01 already exists, with arbitrary content.
**When:** the operator runs `pdlc init`.
**Then:** every already-existing path's on-disk content is byte-for-byte unchanged; the command
creates only the paths that were absent; the report marks each pre-existing path as `exists` (not
`created`) regardless of whether its content matches the convention's expected shape; exit code is
0.

### REQ-INIT-03 Refuses outside a git repository, and only there (P0)

**Who:** An operator running `pdlc init` in a directory that is not a git repository.
**Given:** the target directory has no `.git` and is not inside a git working tree.
**When:** the operator runs `pdlc init` (with or without `--check`).
**Then:** the command makes no filesystem changes, exits with a non-zero code, and prints a
message naming the problem (that the target is not a git repository). This is the command's only
refusal condition — a fully-conforming repo, a partially-scaffolded repo, and an empty-but-valid
git repo all exit 0 per REQ-INIT-01/02.

### REQ-INIT-04 `--check` reports conformance without writing (P0)

**Who:** An operator auditing an existing repo's pdlc layout.
**Given:** the target directory is a git repository, in any state of conformance (fully scaffolded,
partially scaffolded, or untouched).
**When:** the operator runs `pdlc init --check`.
**Then:** the command reports, per convention path, whether it exists and — for `QUEUE.md` and
`ESCALATIONS.md` specifically — whether its structure conforms (for `QUEUE.md`: the header row is
present and matches the case-insensitive column set `Order | Status | Feature | REQ Path |
Depends-On` per `pdlc/OPERATIONS.md`'s documented matching rule); the command creates, modifies,
or deletes no file on disk, on any conformance outcome, and exits 0 (a non-conforming repo is a
reported finding, not a command failure — only REQ-INIT-03's git-repo check can produce a
non-zero exit from `--check`).

### REQ-INIT-05 Config seeded at documented defaults only (P0)

**Who:** An operator scaffolding `.claude/pdlc.config.json` for the first time via `pdlc init`.
**Given:** `.claude/pdlc.config.json` does not yet exist.
**When:** `pdlc init` creates it.
**Then:** every key it writes matches the default value documented for that key in
`pdlc/OPERATIONS.md` / `.claude/pdlc.config.example.json` at the time of the run — no
experimental gate (`advisory.enabled`, `cascade.pinCheck.enabled`, `review.derivativeStop.enabled`,
`merge.mergeMode`) is seeded as anything other than its documented off/false/`"off"` default.

### REQ-INIT-06 Re-run after partial or full scaffolding is idempotent and additive only (P1)

**Who:** An operator who ran `pdlc init` once, then added a feature and re-runs it later.
**Given:** the repo already has some but not all convention paths (e.g. `QUEUE.md` exists,
`docs/_decisions/README.md` does not), and no path's absence is due to the git-repo check failing.
**When:** the operator runs `pdlc init` again.
**Then:** only the still-missing paths are created; the report distinguishes `created` from
`exists` per path exactly as in REQ-INIT-01/02; the command exits 0; running it a third time with
nothing missing creates nothing and still exits 0.

## 6. Risks

**R-1** A seeded config that drifts from the documented defaults (a stale copy of
`pdlc.config.example.json` baked into the command instead of read fresh) would silently turn an
experiment on for every newly-onboarded repo. Mitigated by C-3/REQ-INIT-05's requirement that
seeding track the documented defaults, and by treating any drift as a defect in this feature
rather than an acceptable staleness.

**R-2** `--check`'s structural-conformance report (REQ-INIT-04) could diverge from the actual
parsing rules `pdlc queue` uses for `QUEUE.md`, producing a false "conforms" or false "malformed"
reading. Mitigated by citing the same documented matching rule (`pdlc/OPERATIONS.md` §Artifact
convention) rather than defining a second, independent conformance rule for this REQ.

**R-3** Because `.claude/pdlc.config.json` is gitignored (C-4), two operators of the same repo
could each run `pdlc init` and get differently-timestamped but identically-valued config files
with no shared history — this is expected (config is documented as operator-local) and not a
defect this REQ needs to close.

## 7. Obligations / Open Questions

**O-1** The exact non-zero exit code REQ-INIT-03 uses, and whether it aligns with the existing
`pdlc dev`/`pdlc queue` exit-code convention (0 success, 1 refused/crashed, 2 halted) documented
in `pdlc/engine/bin/cli.mjs`, is TSPEC-level design material — not specified here.

**O-2** The exact wording of each `README.md` this command seeds for `docs/_constraints/` and
`docs/_decisions/` is FSPEC/TSPEC material; this REQ requires only that each be a one-paragraph,
purpose-explaining file, not that it match any specific text.

**O-3** Whether `pdlc init` is implemented as a new file under `pdlc/engine/bin/` or `lib/`
alongside the existing `dev`/`queue`/`doctor`/`decide` commands, and how it shares scaffolding
logic with the `--check` path, is TSPEC/PLAN material — this REQ states only the command's
observable behavior.

**Assumptions.** Authored in an orchestrated (non-interactive) dispatch:
- **A-1** "Refuses ... only when the target is not a repository" (task scope) is read as git
  repository specifically, per DESIGN §2's git-repo-as-artifact-store framing and the existing
  `pdlc dev`/`pdlc queue` precedent of refusing a non-git `cwd` (`pdlc/engine/lib/transport.mjs`,
  `pdlc/engine/lib/startup.mjs`). An operator may revise this if a different repository type was
  intended.
- **A-2** `pdlc init` targets the current working directory (matching `pdlc dev`/`pdlc queue`'s
  existing `--cwd` convention) rather than requiring a path argument; TSPEC may adjust this.

## 8. Traceability

| User Story | Requirements |
|---|---|
| US-01 As an operator onboarding a new repo, I need one command that scaffolds the pdlc convention so I don't hand-copy files | REQ-INIT-01, REQ-INIT-05, REQ-INIT-06 |
| US-02 As an operator, I need re-running the scaffold to be safe and never destroy existing work | REQ-INIT-02 |
| US-03 As an operator, I need the command to fail loudly and only outside a git repo, never silently miss-scaffold elsewhere | REQ-INIT-03 |
| US-04 As an operator auditing an existing repo, I need a read-only conformance report | REQ-INIT-04 |

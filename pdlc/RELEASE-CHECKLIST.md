# pdlc — maintainer's release checklist

Three commitments name "the maintainer's release checklist" as the surface that discharges them.
This is that surface. Work the rows in order and tick each box; rows 1 and 2 are **gates** (a
failure blocks the release), row 3 is an **observation** (it is written down, and nothing depends
on the number).

Definitions used below:

- **`$PLUGIN_ROOT`** — the installed plugin directory, i.e. the value Claude Code exposes to hooks
  as `${CLAUDE_PLUGIN_ROOT}`. Its last path segment must be `pdlc`; the packaging oracle looks for
  `<parent>/pdlc/workflows/dist/`, so point it at the parent and let it find `pdlc/` itself.
- **`$LAST_PUBLISHED`** — the git ref (tag or commit) of the previously published release.

---

## 1. AC-6.2a — the published package really carries `workflows/dist/`

**When:** after publishing a release **and installing it** from the marketplace, against the
*installed* copy — never against this working tree.

**What must hold:** `$PLUGIN_ROOT/workflows/dist/` contains **both** runtime bundles —
`orchestrate-dev.bundle.js` and `orchestrate-queue.bundle.js` — **and** `distribution-manifest.json`
beside them, and the shipped packaging oracle reports no violation over that tree.

**Runnable form.** The oracle ships inside the plugin, at
`pdlc/workflows/lib/document-oracles.mjs`, so it can be run straight out of the installed package.
`packagingViolations(root)` takes the **parent** of the plugin directory and returns an array of
`{ clause, path, detail }`; an empty array is the pass.

**Exactly one input returns an empty array without having verified anything: a manifest that is
absent altogether.** That is why the three presence checks below are **not** redundant with the
oracle — both halves are required for this row to pass. A manifest that is *present but
unreadable* is **not** in that hole: it is reported as a `6.2(a)` violation on
`pdlc/workflows/dist/distribution-manifest.json` whose `detail` names the specific failure. So a
corrupt manifest fails this row on the oracle's own output rather than printing `present` three
times and `packagingViolations -> []`.

**`packagingViolations` is total: it never throws, for any bytes at the manifest path, and it never
skips.** A manifest that is unreadable, is not valid JSON, is not a JSON object at all (`null`, an
array, a bare scalar), carries neither the production `rows` array nor the simplified `entries`
array, or whose rows/entries are not objects or are missing `pluginPath` / `path` / `pluginSha1`,
all report `6.2(a)` — because a malformed manifest **is itself** a defect in the packaged set, which
is the very thing this row asks about. Note the deliberate contrast with row 2's oracle
(`advertisedVersionViolation`), which answers a question that can be genuinely *inapplicable* and so
returns `{ skipped: … }` instead: that divergence is intended, and the reasoning is recorded in
`pdlc/workflows/lib/document-oracles.mjs` between §10.2 and §10.3. Neither oracle throws, so a
malformed input in this row can never abort the run before row 2 is reached.

```sh
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:?point this at the installed pdlc plugin directory}"

node -e '
const { existsSync } = require("fs");
const { basename, dirname, join } = require("path");
const { pathToFileURL } = require("url");
const pluginRoot = process.argv[1];
const parentRoot = dirname(pluginRoot);
let missing = 0;
for (const f of ["orchestrate-dev.bundle.js", "orchestrate-queue.bundle.js", "distribution-manifest.json"]) {
  const p = join(pluginRoot, "workflows", "dist", f);
  const ok = existsSync(p);
  if (!ok) missing++;
  console.log((ok ? "present  " : "MISSING  ") + p);
}
if (basename(pluginRoot) !== "pdlc") console.log("NOTE: the oracle resolves <parent>/pdlc/ — this directory is not named pdlc");
import(pathToFileURL(join(pluginRoot, "workflows", "lib", "document-oracles.mjs")).href).then((m) => {
  const v = m.packagingViolations(parentRoot);
  console.log("packagingViolations -> " + JSON.stringify(v));
  process.exit(missing === 0 && v.length === 0 ? 0 : 1);
});
' "$PLUGIN_ROOT"
```

- [ ] All three files print `present`.
- [ ] `packagingViolations -> []`.
- [ ] The command exits `0`.

Any non-empty array names the violated clause and the offending path; fix the packaging step and
re-publish. Hosted automation of this row is deferred to D-DIST-06.

---

## 2. AC-6.6's accepted residual — the advertised version moved

**When:** **before** publishing.

**Why this row exists.** The automated advertised-version oracle compares the working tree against
`HEAD`, so its scope is strictly the commit about to be authored. A version omission that already
landed in an earlier commit is outside that scope — an accepted residual, and this row is its
agreed fallback. Only the release process knows what was previously published, so only this row can
make the comparison.

**What must hold:** whenever `git log` shows **any** change under `pdlc/workflows/dist/` since the
previously published release, the `version` field in `pdlc/.claude-plugin/plugin.json` must
**differ** from the version that release advertised.

```sh
LAST_PUBLISHED="<tag-or-commit of the previously published release>"

# (a) Did the packaged artifacts change since that release?
git log --oneline "$LAST_PUBLISHED"..HEAD -- pdlc/workflows/dist/

# (b) What does the release about to go out advertise, and what did the last one advertise?
git show HEAD:pdlc/.claude-plugin/plugin.json               | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log("about to publish:", JSON.parse(s).version))'
git show "$LAST_PUBLISHED":pdlc/.claude-plugin/plugin.json  | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log("last published: ", JSON.parse(s).version))'
```

- [ ] Command (a) printed **nothing** — no packaged artifact changed, so no bump is owed; **or**
- [ ] Command (a) printed at least one commit **and** the two versions from (b) are different.

Only a *difference* is required. There is deliberately no ordering check here: no semver comparator
exists anywhere in this feature, and version comparison is equality-only by design. Do, however,
confirm by eye that the new value has not been used by an earlier published release — a collision
is the one failure this row is meant to catch and a difference check alone will not.

---

## 3. NFR-2 — the one-off latency observation

**This row records a number. It never asserts one.** No test in this repository asserts wall-clock
time, and none should be added: a timing assertion on a SessionStart hook is flaky by construction.
The p95 budget is discharged *structurally* — no unbounded filesystem enumeration, a bounded number
of process spawns per row, no network — and those three claims are checkable by reading the spec.
The measurement below exists so the structural argument has one empirical data point beside it.

**A miss here does not block the release and does not fail a build.** It opens a bug. Write the
number down either way.

**Budget for reference:** p95 ≤ 500 ms, against ≤ 8 artifacts / ≤ 512 KB, warm cache, on a
reference machine.

**How to observe.** Run the entrypoint under a repeated timing harness (10 runs is enough for a
rough p95; take the 9th-fastest) and record all four fields below.

```sh
# Example: the SessionStart drift check, 10 warm runs.
for i in $(seq 1 10); do
  /usr/bin/time -p pdlc/hooks/scripts/check-workflow-drift.sh >/dev/null
done 2>&1 | awk '/^real/ { print $2 }' | sort -n
```

Record, in this document, at the next release:

| Field | Value |
|---|---|
| Date observed | _(unrecorded)_ |
| Entrypoint measured | _(unrecorded — e.g. `check-workflow-drift.sh` or `sync-workflows.sh`)_ |
| Artifact count / total size | _(unrecorded)_ |
| Wall clock, p95 over 10 warm runs | _(unrecorded)_ |
| Reference machine | _(unrecorded)_ |
| Within the 500 ms budget? | _(unrecorded — advisory only; a miss opens a bug)_ |

- [ ] The table above has been filled in for this release.

---

## 4. Advisory tier — the two commitments CI cannot check (PLAN A-35)

**4a. The D-6 baseline fixture's `scenario` header is still accurate.** The disabled-tier
equivalence proof (`advisoryDisabled.test.js`, PROP-DIS-03) compares a disabled run's
created-file set against the hand-reviewed literal in
`pdlc/workflows/__tests__/fixtures/created-files-26c3f1c.json`. The fixture's `scenario`
header (baselineCommit, reqPath, forcePhases, agentDoubles, config, phasesReached,
seamsInstrumented, command, date) is a **claim about how the baseline was captured**, and no
test can verify a historical capture procedure. At each release, re-read the header and
confirm the scenario it describes is still the scenario the comparison needs — in particular
that `baselineCommit` still names the intended pre-advisory tree. If the pipeline's phase
graph has since changed shape (a phase added, removed, or reordered), the fixture may need
recapturing by the same detached-worktree procedure the header records.

- [ ] The `scenario` header was re-read at this release and is still accurate.

**4b. The guard-message coupling regression still passes.** A-28 extended the
`guard-harvest-before-delete` hook's refusal message to name the `ADVISORY-*` class while
keeping the exact `CROSS-REVIEW` prefix and directory-extraction shape orchestrate-dev's
recovery path parses (`advisoryHarvest.test.js` §13.4(5): the literal `.includes` check and
the extraction regex both still fire on a refusal). This is a coupling between a shipped bash
script and a JS parser — easy to break by an innocent-looking rewording of either side.

- [ ] `cd pdlc/workflows && npm test -- __tests__/advisoryHarvest.test.js` is green on the
      release tree (bash present, so the guard-integration cases actually ran — 0 skipped).

**4c. BL-01 — the `"fable"` rung dispatch is still unverified until recorded.** PLAN A-34's
manual verification (`docs/pdlc-advisory-tier/MANUAL-VERIFICATION-pdlc-advisory-tier.md`)
shipped in its admissible form (ii): `RESULT: unverified — no runtime available`. The
obligation carries forward here so it is re-asked at every release rather than forgotten:
in a fresh session with a synced `.claude/workflows/` copy and `advisory.enabled: true`,
drive one advisory seam to a dispatch on `"fable"` and paste the runtime's own output into
that file under `RESULT: verified`, naming the §3.4 ladder branch that fired. Once recorded,
delete this row.

- [ ] Either MANUAL-VERIFICATION now records `RESULT: verified` with pasted runtime output,
      or this release consciously ships with BL-01 still open (note it in the release notes).

---

## A note for anyone editing this file

This document lives under `pdlc/`, which none of the document-drift scan's exemptions covers, so
its own text is scanned. If a phrase here ever trips one of the scan's five literal patterns, fix
it by **rephrasing this document** — never by narrowing a pattern or relaxing the scan.

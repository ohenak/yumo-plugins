---
feature: pdlc-help
status: reviewed-for-implementation
---

# TSPEC: pdlc help

The gatekeeper reviewed this specification for implementation. The operator's sign-off applies to the REQ, not to a separate approval of this specification.

## Real seams and scope

The installed command maps through `pdlc/engine/package.json` to `pdlc/engine/bin/pdlc.mjs`. That file checks the Node floor, imports `./cli.mjs`, and calls `launch()`. Keep it unchanged so the Node guard remains first. The change belongs in `pdlc/engine/bin/cli.mjs`: `launch(argv, io)` routes `dev` and `queue` through version resolution; `main(argv, deps)` dispatches commands; `validateFlags(argv, command)` rejects unlisted command flags. The existing `USAGE` constant holds general usage, and `FLAGS_BY_COMMAND` holds the allowed flags for `dev`, `queue`, `doctor`, `decide`, and `stats`. `version`, `hello`, and `spike:sdk` have separate dispatch branches. See the [seam map](_evidence/seam-map.md), [approved REQ](REQ-pdlc-help.md), and [FSPEC](FSPEC-pdlc-help.md).

## Help routing

Add one pure classifier in `cli.mjs` for these exact argument shapes after the executable and script path:

| Arguments | Classification |
|---|---|
| `--help` or `help` | General help |
| One of `dev`, `queue`, `decide`, `stats`, `doctor`, `hello`, `spike:sdk`, `version` followed by `--help` | Help for that command |
| Every other argument list, including `dev --dry-run --help` | No help classification; use the existing path and its validation |

Call the classifier at the start of `main()` and emit help before its switch and `checkFlags()`. This avoids startup, authentication, workflow dispatch, and flag validation for recognized help. In `launch()`, test the same classifier before the `dev`/`queue` version-resolution branch. For recognized help, call its injected `runMain(argv)` and return its result. Keep the Node-floor guard in `pdlc.mjs` active. Unknown commands, extra arguments, `-h`, and mixed forms such as `dev --dry-run --help` do not bypass the existing launcher or command flag validation. They retain their current usage-error or command behavior. `--version` and `-v` remain version aliases, not new help commands.

## Output contract

General help writes `USAGE` to stdout with a trailing newline and exits 0. Include all eight named commands in its command list; no unknown-command text appears. Command help writes a bounded usage block to stdout, identifies `pdlc <command>`, shows that command's invocation syntax, and lists every flag that command accepts. Use `FLAGS_BY_COMMAND` as the flag source for the five commands it covers, so help cannot silently invent unsupported flags. Show the flags used by the existing `version` path (`--cwd`, `--plugin-root`, `--dev`) and show `hello` and `spike:sdk` as commands with no command flags. Format and explanatory wording may be chosen in implementation; the named syntax and flags must be present. Do not call a command handler to produce help.

Set `process.exitCode = 0` on the recognized help path so help succeeds even when `main()` is called after another operation in the same process. Do not change the non-help branches' exit behavior. Help must not write a project file or depend on a repository, plugin root, provider credential, REQ path, or version store.

## Tests and properties

Add subprocess tests in `pdlc/engine/__tests__/cli.test.js` against the package entry point `bin/pdlc.mjs`. Cover both general forms and all eight command forms, exit 0, command-specific syntax and accepted flags, clean temporary working directory, and absence of provider/project configuration. Verify no unknown-command or unknown-flag error appears for help. Preserve existing unknown-command and invalid non-help flag tests. Add a direct `launch()` test in `pdlc/engine/__tests__/launch-wiring.test.js`: `dev --help` and `queue --help` must reach injected `runMain` without reading the version store or calling injected `exec`. A mixed form such as `dev --dry-run --help` must not take the help bypass.

The `PROPERTIES` file must state and test deterministic output for identical argv and environment, and that help does not dispatch or write project state. A dated point-in-time property, boundary edge-count property, and disabled-config byte-identity property do not apply because this feature adds no dated output, cross-product edge, or config gate. Run the feature's scoped CLI and launcher tests, `tests/boundary/` if present, and the full engine suite for the delivery gate. The full `pdlc dev` workflow is a separate operator decision because its automatic PR phase conflicts with this milestone's operator-created PR boundary.

## Traceability

| Requirement | Design proof |
|---|---|
| REQ-HELP-01, REQ-HELP-02 | General classifier branch, `USAGE` output, package-entry subprocess tests |
| REQ-HELP-03 | Eight command classifier branches, command syntax and flag output, package-entry subprocess tests |
| REQ-HELP-04 | Early launcher and main routing; clean-directory subprocess and injected-launch tests |
| REQ-HELP-05 | No command handler on help path; injected-launch and no-write tests |
| Existing error preservation | Exact-shape classifier and regression tests for unknown or mixed forms |

Issue decisions: [three operator comments](https://github.com/ohenak/yumo-plugins/issues/86) are transcribed individually in [DECISIONS](DECISIONS-pdlc-help.md).

# DECISIONS: pdlc help

| ID | Decision | Source and reason |
|---|---|---|
| DEC-HELP-01 | Support `pdlc --help`, `pdlc help`, and `pdlc <command> --help`; print matching usage, exit successfully, and work without provider credentials or project setup. | [Operator comment 6163384317](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163384317); governs REQ-HELP-01 through REQ-HELP-04. |
| DEC-HELP-02 | Command-specific help shows that command's syntax and flags. General usage alone does not satisfy it. | [Operator comment 6163650686](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163650686); governs REQ-HELP-03. |
| DEC-HELP-03 | The operator approved the M1 REQ and build, placed the REQ and proposal under the `yumo-plugins` repository docs tree, and moved the conversation to that workspace from M2. | [Operator sign-off comment 6163694833](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163694833); REQ has `ready: true`, queue row 35 is `in-progress`. |
| DEC-HELP-04 | Recognize only exact top-level `--help` or `help`, and exact `<known command> --help`. Mixed arguments and unknown commands keep existing routing. | Implementation choice. Keeps the help bypass narrow and preserves non-help usage errors required by the REQ. |
| DEC-HELP-05 | Handle help in `cli.mjs` before `launch()` version resolution and before `main()` command flag validation. Keep `pdlc.mjs` unchanged. | Implementation choice based on [seam map](_evidence/seam-map.md); the launcher resolves `dev`/`queue` before `main()`, while the package entry point owns the Node guard. |
| DEC-HELP-06 | Derive displayed flags for the five validated commands from `FLAGS_BY_COMMAND`; document the existing `version` flags separately; give `hello` and `spike:sdk` syntax without flags. | Implementation choice based on `pdlc/engine/bin/cli.mjs` command dispatch and the closed flag table. Avoids presenting flags the command rejects. |
| DEC-HELP-07 | Use `deliver-feature-chain` for M1. Treat the `pdlc dev ... --dry-run --plugin-root pdlc` preview as compatibility evidence, with no dispatch. Decide separately whether to run the full engine workflow because it has an automatic PR phase. | M1 delivery boundary in the [proposal](../proposal/m01-readiness.html) and operator-created PR requirement; no full-engine delivery claim. |

No operator decision remains open for the CLI help behavior. The full-engine trial is outside this feature's delivery path and requires a separate decision.

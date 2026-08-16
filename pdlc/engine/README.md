# @kaneho/pdlc-engine

Headless engine for `pdlc` — runs the same REQ → FSPEC → TSPEC → PLAN → PROPERTIES → IMPL
pipeline as the `pdlc` Claude Code plugin, driven from the CLI instead of an interactive
session. It shares the plugin's skill files and workflow modules; there is one set of
prompts, not two drifting copies.

This package is npm-facing, not operator-facing: it exists so the pipeline has a listing on
npm and so this file, not an accident of packaging, is what documents that fact.

## Install, upgrade, and the plugin pairing

Documented once, in the plugin repo — see `pdlc/README.md`'s **Install in another repo →
Headless engine (npm)** section for the install command, the upgrade command, and how to
read the `{engine, compat range, plugin}` pairing a given build was published against.

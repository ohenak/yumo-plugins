#!/usr/bin/env node
// Trivial fixture target for launcher.test.js's real-spawn pass-through leg
// (PLAN T14, PROP-LAUNCH-6). Writes distinguishable text to stdout and to
// stderr, then exits with a fixed non-zero status, so "re-raised verbatim,
// unmixed" has something falsifiable to check against — a defect that
// swallowed the child's status (`!== 0` collapsing to a bare truthy check)
// or interleaved the two streams would show up as a mismatch here.

process.stdout.write("EXIT-CODE-TARGET-STDOUT\n");
process.stderr.write("EXIT-CODE-TARGET-STDERR\n");
process.exitCode = 7;

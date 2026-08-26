<!--
  PDLC loop prompt template — operator convenience only.

  This file carries NO behaviour that REQ-LOOP-01…07 require. Every one of those
  outcomes is already reachable by typing the invocation below directly:

      /loop run /pdlc:orchestrate-queue

  Installing this file is entirely optional (FSPEC BR-26). It exists so an
  operator who wants `/loop` (no arguments) to default to driving the PDLC
  queue does not have to retype the invocation every session. See the setup
  list in `pdlc/README.md` for where to install this file (the consuming
  repo's `.claude/commands/`, or the equivalent slash-command location), and `pdlc/skills/orchestrate-queue/SKILL.md` → "Driving /loop"
  for what each iteration does.
-->

run /pdlc:orchestrate-queue

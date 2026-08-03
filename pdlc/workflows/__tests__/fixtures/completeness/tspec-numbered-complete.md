# TSPEC — advisory-tier

Modeled on the real `pdlc-advisory-tier` TSPEC that HALTED Phase T while
structurally complete: 16 concern-organized, numbered, descriptive `##` sections,
no canonical `## Overview` / `## Interfaces` / … headings anywhere. Every required
concept is present; the document must score `complete: true`, `missing: []`.

## 1. Scope, baseline pin, and what this TSPEC decides

This section pins the baseline commit and states the boundary of the change: what
the advisory tier does, what it deliberately does not, and which downstream
artifacts it touches. (Overview.)

## 2. Architecture — where the code lives, and the bundle constraint

The advisory tier lands as a new module inlined into the runtime bundle; this
section describes the module boundary, the call graph, and the one bundling
constraint that shapes it. (Architecture.)

## 3. The seam catalogue this feature reuses

A short inventory of the existing seams the feature leans on, with the reasons each
is a seam rather than a hard dependency.

## 4. The advisory core — types, SeamOps protocol, invocation lifecycle

The heart of the change: the concrete record types the tier passes, the `SeamOps`
protocol every adapter satisfies, and the lifecycle from invocation to result.
(Interfaces AND Data Model, in one concern-organized section.)

## 13. Test strategy and test doubles

How the tier is tested: the unit boundaries, the doubles that stand in for the
seams, and the property that pins the invocation lifecycle. (Test Strategy.)

## 15. Feasibility, cost, and risks

The measured cost of the change, the feasibility argument, and the risks carried
forward with their mitigations. (Open Questions.)

## 16. Decisions warranting a DECISIONS record

The two choices whose rationale outlives this TSPEC and therefore belong in a
DECISIONS record rather than inline here.

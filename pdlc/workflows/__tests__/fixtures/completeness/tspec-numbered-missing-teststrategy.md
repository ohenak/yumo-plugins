# TSPEC — numbered, genuinely missing a test strategy

The falsifier for the other direction: a numbered/descriptive TSPEC that covers
Overview, Architecture, Interfaces, Data Model and Open Questions but names NO
test-strategy / testing / test-plan / verification section anywhere. Containment
must NOT invent one — `Test Strategy` stays in `missing`, and the document is
`complete: false`.

## 1. Scope and what this decides

The boundary of the change and the artifacts it touches. (Overview.)

## 2. Architecture and code layout

Where the code lives and how the pieces call one another. (Architecture.)

## 3. Interfaces and the SeamOps protocol

The protocol every adapter satisfies and the entry points callers use.
(Interfaces.)

## 4. Data model — types and state

The record types the feature passes and the state each adapter holds. (Data
Model.)

## 5. Risks, feasibility, and open decisions

The risks carried forward and the decisions still open. (Open Questions.)

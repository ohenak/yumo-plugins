// consolidationIdentity.test.js — PLAN T15 (RED, describe.skip).
//
// One block, un-skipped by its owning task — never rewritten by it, per PLAN §13.3's batch-safety
// rule 2:
//
//   T26 — identity and merge: AT-R6, AT-R6b, AT-F1, AT-F2, AT-F3, AT-F4, AT-F5 over
//     `failureModeId`, `targetFor` and `mergeProposals` (TSPEC §7.4). Reserves the seats FSPEC
//     §14.5's LD-2 (the `target`-follows clause of BR-33b's subject tie-break) and LD-3 (two
//     actions, one subject) land in — both are PROPERTIES-owned per DEC-LAYER-01, so their fixtures
//     are authored there, but TSPEC §11.5 decides this file is their *home*: `test.todo` entries
//     below hold the seats without asserting content that belongs upstream.
//
// `failureModeId`, `targetFor` and `mergeProposals` do not exist as behaviour yet (PLAN T02
// skeleton — all three throw `notImplemented`); T26 is the row that gives them one. Every fixture
// below is built as a plain `Proposal`-shaped object (TSPEC §6.2's interface, transcribed by hand —
// this module owns no `Proposal` builder in `consolidationDoubles.js` because the shape is small and
// every field the assertions below read is set explicitly per fixture, never defaulted).
//
// ─── Scope boundary (read before extending this file) ──────────────────────
//
// This file drives exactly three pure functions: `failureModeId(phase, artifact)`,
// `targetFor(kind, artifact, id)` and `mergeProposals(proposals)`. It does NOT drive
// `deriveProposals` (TSPEC §7.4's pipeline diagram, `:227`) — that function threads the §5.2
// authored/generated distinction (FSPEC §8.2) and is not part of PLAN T26's exported surface, so it
// is not importable here without inventing production shape T26 does not commit to. Where an AT's
// *Then* column reads past what these three functions alone can observe (AT-F3's "no generated path
// mints an id", AT-F4's "it is authored and does mint an id"), the fixture below is scoped to the
// slice `failureModeId`/`mergeProposals` actually decide — that a proposal already reduced to the
// authored subject is what these functions see, and that `failureModeId` carries no path-glob
// special case for `dist/` — and the upstream authored/generated filtering itself is covered at L2
// (`consolidationPass.test.js` / `consolidationRoute.test.js`, both `main()`-level), never claimed
// twice.

import { failureModeId, targetFor, mergeProposals } from "../consolidate-learnings.js";

// The two derived literals TSPEC §7.4 and FSPEC §2152-2153 pin for the AT-R6 fixture — transcribed,
// not recomputed by an independent slug implementation in this file, because the whole point of
// AT-R6 is that `failureModeId`'s own derivation is the oracle.
const AT_R6_PHASE = "P";
const AT_R6_ARTIFACT = "pdlc/skills/se-author/SKILL.md";
const AT_R6_ID = "p-pdlc-skills-se-author-skill-md";
const AT_R6_TARGET = "docs/_decisions/DECISIONS-p-pdlc-skills-se-author-skill-md.md";

describe("T15 — identity and merge (L1)", () => {
  describe("T26 — identity, targetFor and merge", () => {
    // ─── AT-R6 — pure, total, keyed on phase + artifact only ──────────────

    test("AT-R6: failureModeId is a pure function of (phase, artifact) alone — two calls with the same keying fields agree", () => {
      expect(failureModeId(AT_R6_PHASE, AT_R6_ARTIFACT)).toBe(AT_R6_ID);
      expect(failureModeId(AT_R6_PHASE, AT_R6_ARTIFACT)).toBe(failureModeId(AT_R6_PHASE, AT_R6_ARTIFACT));
    });

    test("AT-R6: targetFor(2, ...) derives docs/_decisions/DECISIONS-{id}.md from the id passed in, never a re-slugged artifact", () => {
      expect(targetFor(2, AT_R6_ARTIFACT, AT_R6_ID)).toBe(AT_R6_TARGET);

      // Kind 2's target is a function of the id argument alone — passing a DIFFERENT artifact
      // string alongside the SAME id must not perturb the target, because §7.4 states the target
      // is "recomputed [from the id], never a differently-normalised path than the one that keyed
      // it". An implementation that re-derives the target by re-slugging `artifact` internally
      // would diverge here.
      expect(targetFor(2, "pdlc/skills/unrelated/OTHER.md", AT_R6_ID)).toBe(AT_R6_TARGET);
    });

    // ─── AT-R6b — five fixtures, five separate passes, one per §8.2 shape ──
    //
    // Each fixture below is one pass's proposal list, built by hand (FSPEC §2153's own words: "five
    // fixtures — five separate passes over five separate logs"). `phase` is always `"P"`; only the
    // fields §8.2's fold table reads are populated, everything else the interface carries
    // (`diff`, `elidedKinds`, `elidedArtifacts`) is seeded to its pre-merge default (`null`, `[]`,
    // `[]`) so a fixture never smuggles an assertion in through an input the merge is supposed to
    // compute.

    test("AT-R6b fixture 1 — siblings, both AC-2.2: two distinct subjects write two distinct promotions, never one", () => {
      const idA = failureModeId("P", "pdlc/skills/se-author/SKILL.md");
      const idB = failureModeId("P", "pdlc/skills/te-review/SKILL.md");
      const proposals = [
        { failureModeId: idA, phase: "P", symptom: "sibling A", artifact: "pdlc/skills/se-author/SKILL.md", kind: 2, target: targetFor(2, "pdlc/skills/se-author/SKILL.md", idA), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
        { failureModeId: idB, phase: "P", symptom: "sibling B", artifact: "pdlc/skills/te-review/SKILL.md", kind: 2, target: targetFor(2, "pdlc/skills/te-review/SKILL.md", idB), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
      ];

      const merged = mergeProposals(proposals);

      expect(merged).toHaveLength(2);
      expect(merged.map((p) => p.artifact).sort()).toEqual(["pdlc/skills/se-author/SKILL.md", "pdlc/skills/te-review/SKILL.md"]);
      expect(new Set(merged.map((p) => p.failureModeId)).size).toBe(2);
    });

    test("AT-R6b fixture 2 — colliding subjects, both AC-2.2 (kind 2): one record, lexicographically-first artifact, elided path compensated", () => {
      // "pdlc/skills/a-b.md" and "pdlc/skills/a/b.md" slug to one id under §8.1 (`-` and `/` both
      // collapse to `-`) — the collision this fixture exists to fold, never two coincidental ids.
      const subjectA = "pdlc/skills/a-b.md";
      const subjectB = "pdlc/skills/a/b.md";
      const id = failureModeId("P", subjectA);
      expect(failureModeId("P", subjectB)).toBe(id); // the collision itself, asserted before the merge

      const proposals = [
        { failureModeId: id, phase: "P", symptom: "collision A", artifact: subjectA, kind: 2, target: targetFor(2, subjectA, id), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
        { failureModeId: id, phase: "P", symptom: "collision B", artifact: subjectB, kind: 2, target: targetFor(2, subjectB, id), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
      ];

      const merged = mergeProposals(proposals);

      expect(merged).toHaveLength(1);
      // `-` (0x2D) precedes `/` (0x2F) in byte order, so the surviving canonical path is subjectA.
      expect(merged[0].artifact).toBe(subjectA);
      expect(merged[0].elidedArtifacts).toEqual([subjectB]);
      expect(merged[0].kind).toBe(2);
      expect(merged[0].target).toBe(targetFor(2, subjectA, id));
      expect(merged[0].symptom).toBe("collision A; collision B");
      // Both sides are kind 2, so no kind is elided — this fixture's `elidedKinds` conjunct is
      // vacuous by construction (§8.2's own note); the artifact-axis conjuncts above are the ones
      // this fixture is written for.
      expect(merged[0].elidedKinds).toEqual([]);
      // Nothing withheld: the merge is silent by construction (§8.2), so the merged Proposal never
      // grows a reason-code or suppression field this interface does not declare.
      expect(Object.keys(merged[0]).sort()).toEqual(
        ["action", "artifact", "diff", "elidedArtifacts", "elidedKinds", "failureModeId", "kind", "phase", "symptom", "target"].sort()
      );
    });

    // Fixtures 3, 4 and 5 each merge one promotion out of two §5.2 kinds over ONE shared subject
    // (kind identity is the merge trigger here, not slug collision — no tie-break in play), ranging
    // over the three ordered pairs the precedence rule admits: (1,3), (2,3), (1,2).

    test("AT-R6b fixture 3 — kinds 1 + 3 over one shared subject: kind 1 wins, target is DOMAIN-CONSTRAINTS.md, kind 3 elided", () => {
      const subject = "pdlc/workflows/orchestrate-dev.js";
      const id = failureModeId("P", subject);
      const proposals = [
        { failureModeId: id, phase: "P", symptom: "domain invariant", artifact: subject, kind: 1, target: targetFor(1, subject, id), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
        { failureModeId: id, phase: "P", symptom: "process learning", artifact: subject, kind: 3, target: targetFor(3, subject, id), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
      ];

      const merged = mergeProposals(proposals);

      expect(merged).toHaveLength(1);
      expect(merged[0].kind).toBe(1);
      expect(merged[0].target).toBe("docs/_constraints/DOMAIN-CONSTRAINTS.md");
      expect(merged[0].artifact).toBe(subject);
      expect(merged[0].elidedKinds).toEqual([3]);
      expect(merged[0].elidedArtifacts).toEqual([]); // one subject, not two — nothing on the artifact axis
    });

    test("AT-R6b fixture 4 — kinds 2 + 3 over the same shared subject: kind 2 wins, target is DECISIONS-{id}.md, kind 3 elided", () => {
      const subject = "pdlc/workflows/orchestrate-dev.js";
      const id = failureModeId("P", subject);
      const proposals = [
        { failureModeId: id, phase: "P", symptom: "architectural decision", artifact: subject, kind: 2, target: targetFor(2, subject, id), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
        { failureModeId: id, phase: "P", symptom: "process learning", artifact: subject, kind: 3, target: targetFor(3, subject, id), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
      ];

      const merged = mergeProposals(proposals);

      expect(merged).toHaveLength(1);
      expect(merged[0].kind).toBe(2);
      expect(merged[0].target).toBe(targetFor(2, subject, id));
      expect(merged[0].elidedKinds).toEqual([3]);
    });

    test("AT-R6b fixture 5 — kinds 1 + 2 over the same shared subject: kind 1 wins, no DECISIONS-*.md target is ever chosen", () => {
      const subject = "pdlc/workflows/orchestrate-dev.js";
      const id = failureModeId("P", subject);
      const proposals = [
        { failureModeId: id, phase: "P", symptom: "domain invariant", artifact: subject, kind: 1, target: targetFor(1, subject, id), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
        { failureModeId: id, phase: "P", symptom: "architectural decision", artifact: subject, kind: 2, target: targetFor(2, subject, id), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
      ];

      const merged = mergeProposals(proposals);

      expect(merged).toHaveLength(1);
      expect(merged[0].kind).toBe(1);
      expect(merged[0].target).toBe("docs/_constraints/DOMAIN-CONSTRAINTS.md");
      expect(merged[0].elidedKinds).toEqual([2]);
    });

    // ─── AT-F1 through AT-F5 ────────────────────────────────────────────────

    test("AT-F1: two passes deriving one id from different consumed sets and different symptom wording still agree — symptom and the consumed set are not inputs", () => {
      // `failureModeId`'s signature is `(phase, artifact)` — it cannot read `symptom` or a consumed
      // set even if a caller wanted it to. The two "passes" below are represented as the two
      // `failureModeId` call sites a real pass would make, each embedded in a fixture that ALSO
      // carries a different symptom and diff, so the assertion is that comparing the two ids is
      // what a pass does, and that comparison never has to look past them.
      const passOne = { symptom: "timeout observed under load", consumed: ["LEARNINGS-feat-x.md"] };
      const passTwo = { symptom: "flaky retry loop, unrelated wording", consumed: ["LEARNINGS-feat-y.md", "LEARNINGS-feat-z.md"] };

      const idFromPassOne = failureModeId("P", "pdlc/workflows/orchestrate-dev.js");
      const idFromPassTwo = failureModeId("P", "pdlc/workflows/orchestrate-dev.js");

      expect(idFromPassOne).toBe(idFromPassTwo);
      // The symptom/consumed fixtures above are read nowhere above this line — recorded so a future
      // edit cannot silently thread them into the derivation without this comment going stale.
      expect(passOne.symptom).not.toBe(passTwo.symptom);
    });

    test("AT-F2: a remedy spanning two authored files derives two ids, and mergeProposals never folds them into one", () => {
      const artifactA = "pdlc/skills/se-author/SKILL.md";
      const artifactB = "pdlc/workflows/consolidate-learnings.js";
      const idA = failureModeId("P", artifactA);
      const idB = failureModeId("P", artifactB);

      expect(idA).not.toBe(idB);

      const proposals = [
        { failureModeId: idA, phase: "P", symptom: "one remedy, half A", artifact: artifactA, kind: 2, target: targetFor(2, artifactA, idA), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
        { failureModeId: idB, phase: "P", symptom: "one remedy, half B", artifact: artifactB, kind: 3, target: targetFor(3, artifactB, idB), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
      ];

      const merged = mergeProposals(proposals);

      // Two ids, two proposals — they "may share one PR" (§8.2), which is a §6.2/§9.2 routing
      // concern this file does not reach; the identity-layer claim is that mergeProposals leaves
      // them exactly as distinct as `failureModeId` made them.
      expect(merged).toHaveLength(2);
      expect(new Set(merged.map((p) => p.failureModeId))).toEqual(new Set([idA, idB]));
    });

    test("AT-F3: an authored source file plus its rebuilt dist/ bundle — this layer sees one proposal, the source file's, once the generated candidate is already excluded", () => {
      // Scope boundary (file header): the exclusion of `pdlc/workflows/dist/orchestrate-dev.bundle.js`
      // itself is `deriveProposals`'s job (TSPEC §7.4 pipeline, not exported at this layer) and is
      // covered end to end at L2. What `mergeProposals`/`failureModeId` can be shown to do, given
      // only the authored candidate they would actually receive, is exactly AT-F3's positive half:
      // one proposal, `artifact` being the source file.
      const source = "pdlc/workflows/orchestrate-dev.js";
      const id = failureModeId("P", source);
      const proposals = [
        { failureModeId: id, phase: "P", symptom: "guard-set edit", artifact: source, kind: 3, target: targetFor(3, source, id), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [] },
      ];

      const merged = mergeProposals(proposals);

      expect(merged).toHaveLength(1);
      expect(merged[0].artifact).toBe(source);
    });

    test("AT-F4: a fixtures/ path whose text merely contains \"dist/\" is authored, and failureModeId mints it an ordinary id — no path-glob special case", () => {
      // FSPEC §8.2: "Generated is a predicate keyed on the producer, never on a path glob." This
      // test's claim is the half `failureModeId` alone can carry: it does not itself special-case
      // any path containing the substring `dist/` — the fixtures-tree path below mints an id
      // exactly the way any other authored path does, distinct from an unrelated control path,
      // never `null`, never empty.
      const fixturePath = "pdlc/workflows/__tests__/fixtures/dist/sample-consumed.md";
      const controlPath = "pdlc/workflows/__tests__/fixtures/sample-consumed.md";

      const fixtureId = failureModeId("P", fixturePath);
      const controlId = failureModeId("P", controlPath);

      expect(typeof fixtureId).toBe("string");
      expect(fixtureId.length).toBeGreaterThan(0);
      expect(fixtureId).not.toBe(controlId);
    });

    test("AT-F5: N distinct failure-mode-ids, two of them sharing an id via §8.1's collision — merging yields exactly one entry per distinct id, none missing, none invented", () => {
      const artifactA = "pdlc/skills/se-author/SKILL.md";
      const artifactB = "pdlc/workflows/consolidate-learnings.js";
      const collisionA = "pdlc/skills/a-b.md";
      const collisionB = "pdlc/skills/a/b.md"; // collides with collisionA under §8.1

      const idA = failureModeId("P", artifactA);
      const idB = failureModeId("P", artifactB);
      const idCollision = failureModeId("P", collisionA);
      expect(failureModeId("P", collisionB)).toBe(idCollision);

      const distinctIds = new Set([idA, idB, idCollision]);
      expect(distinctIds.size).toBe(3); // three distinct ids behind four proposals

      const buildKind2 = (id, artifact, symptom) => ({
        failureModeId: id, phase: "P", symptom, artifact, kind: 2, target: targetFor(2, artifact, id), action: "promote", diff: null, elidedKinds: [], elidedArtifacts: [],
      });
      const proposals = [
        buildKind2(idA, artifactA, "A"),
        buildKind2(idB, artifactB, "B"),
        buildKind2(idCollision, collisionA, "collision, half 1"),
        buildKind2(idCollision, collisionB, "collision, half 2"),
      ];

      const merged = mergeProposals(proposals);

      expect(merged).toHaveLength(3);
      expect(new Set(merged.map((p) => p.failureModeId))).toEqual(distinctIds);
    });

    // ─── Reserved seats — TSPEC §11.5 ───────────────────────────────────────
    //
    // LD-2 and LD-3 are PROPERTIES-owned per DEC-LAYER-01 (FSPEC §14.5): their fixtures are authored
    // in `PROPERTIES-pdlc-consolidation-agent.md`'s property-testing register, not here. TSPEC §11.5
    // decides only that this file is their *home* once authored. These seats are reserved, not
    // filled, by this row — filling them is the PROPERTIES-authoring task's job, not T15's.
    test.todo("LD-2: a colliding-subject merge of two process learnings (kind 3) — precedence keeps kind 3, and the surviving target follows the surviving artifact (§8.2's third note; PROPERTIES-owned fixture)");
    test.todo("LD-3: two actions over one subject (PROPERTIES-owned fixture)");
  });
});

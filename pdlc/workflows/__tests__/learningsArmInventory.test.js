// learningsArmInventory.test.js — PLAN LI-23 (RED fail-open arm inventory, TE F-07).
//
// TSPEC §T.7's twelve fail-open arms, driven in one file, accumulating what was actually
// observed: every NON-`null` `corpusOutcome` value, every `rejected[].reason` value and
// every `notices` id. Each accumulated set is asserted **set-equal** — never containment —
// to the frozen catalogue LI-15 defines: `LEARNINGS_CORPUS_OUTCOMES`, `LEARNINGS_REJECT_REASONS`,
// `LEARNINGS_NOTICES` (TSPEC §D.1). That is the mechanical form of §T.7's coverage obligation,
// which `--per-file --branches 85` cannot see inside a ~15k-line file (DoD 3).
//
// The `corpusOutcome` equality is scoped to non-`null` observations, and the scoping is
// load-bearing (TE F-01): the healthy value of that field is `null` (TSPEC §D.2), and three
// of the twelve arms — RSN-COUNT, RSN-BYTES, RSN-SELF — fire on a corpus that IS listable and
// non-empty, so driving them necessarily observes `null`. Expecting
// `LEARNINGS_CORPUS_OUTCOMES ∪ {null}` would stop being a literal transcription of the frozen
// catalogue, which is the point of the assertion; the healthy `null` is asserted instead by
// `learningsRecord.test.js`'s BR-9 rows over `DIVERGENT-CORPUS` dispatches 1, 2 and 4 (LI-10 /
// LI-19).
//
// The `RSN-NO-MATERIAL` arm is entered here only through its structural disjunct (no BR-6
// section present, E-33) — the zero-bound disjunct (`maxBytesPerDocument: 0`, E-36) is driven
// by LI-12's `LI-AT-30` third case, not by this inventory; the reason-code set equality is
// unaffected either way, since both disjuncts yield the same `RSN-NO-MATERIAL` code.
//
// Accumulation is in-file, over this file's own fixtures — a ledger shared across suites is
// unreadable across jest workers. Its three tests are named `LI-T-ARMS-1…3`, carrying no
// FSPEC AT id, so §T.5's 35-member partition and `LI-T-SUITEMAP`'s disjointness are unchanged.
//
// None of `gatherLearningsCorpus`, `selectLearnings`, `parseLearningsConfig`,
// `LEARNINGS_CORPUS_OUTCOMES`, `LEARNINGS_REJECT_REASONS` or `LEARNINGS_NOTICES` exist in
// `orchestrate-dev.js` until LI-21 ("GREEN the run wiring and the report key") — the task
// after which all twelve arms are reachable — so every import is a dynamic `await import`
// inside `beforeAll`, and the whole describe block is committed `.skip`ped, titled with
// LI-21's id. LI-21's first action on this file is to remove exactly that wrapper, observe
// the suite fail, then implement until it passes — never delete the block or add a new one
// beside it.
//
// Fixtures come from `helpers/learningsFixtures.js` (LI-02) only — no ad-hoc corpus builder
// is defined here (PLAN LI-02, P-A-4). `entriesFromCorpus` below is a plain shape adapter
// from that helper's `{paths, contents}` corpus shape to `selectLearnings`'s `CorpusEntry[]`
// input shape (TSPEC §I.3), on the precedent `learningsSelect.test.js` already uses — it
// builds no fixture data of its own.

import {
  buildLearningsCorpus,
  buildCountBindingCorpus,
  buildBytesBindingCorpus,
  LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
  COUNT_BINDING_THRESHOLDS,
} from "./helpers/learningsFixtures.js";
import { fakeGit, fakeFs } from "./helpers/seams.js";

/**
 * Adapt a `buildLearningsCorpus`-shaped `{paths, contents}` corpus into `selectLearnings`'s
 * `CorpusEntry[]` input (TSPEC §I.3's typedef: `{path, feature, text, readOk, excluded}`).
 * `selfPath`, when given, is marked `excluded: "RSN-SELF"` with `text: null, readOk: false` —
 * the shape the shell (never this adapter) is contracted to produce (TSPEC §D.6).
 */
function entriesFromCorpus(corpus, opts = {}) {
  const feature = opts.feature ?? "arm-inventory-dispatcher";
  return corpus.paths.map((path) => {
    if (opts.selfPath && path === opts.selfPath) {
      return { path, feature, text: null, readOk: false, excluded: "RSN-SELF" };
    }
    return { path, feature, text: corpus.contents[path], readOk: true, excluded: null };
  });
}

/**
 * Mirror production's fail-open mapping from `gatherLearningsCorpus`'s return to a
 * corpus-outcome value (TSPEC §D.2): `{unlistable:true}` -> `RSN-UNLISTABLE`,
 * `{unlistable:false, entries: []}` -> `RSN-EMPTY`, otherwise `null` (documents were known).
 */
function corpusOutcomeFor(gathered) {
  if (gathered.unlistable) return "RSN-UNLISTABLE";
  if (gathered.entries.length === 0) return "RSN-EMPTY";
  return null;
}

describe.skip("LI-21: learningsArmInventory — twelve fail-open arms set-equal to the frozen catalogues (TSPEC §T.7, §D.1)", () => {
  let observedCorpusOutcomes;
  let observedRejectReasons;
  let observedNotices;

  beforeAll(async () => {
    const { gatherLearningsCorpus, selectLearnings, parseLearningsConfig } = await import(
      "../orchestrate-dev.js"
    );

    observedCorpusOutcomes = [];
    observedRejectReasons = [];
    observedNotices = [];

    // Arm 1 — `!reply.ok` from `_git` ⇒ RSN-UNLISTABLE (AT-25).
    {
      const git = fakeGit({ ok: false, stderr: "fatal: not a git repository" });
      const fs = fakeFs({});
      const gathered = await gatherLearningsCorpus({
        feature: "arm-unlistable",
        _git: git,
        _readFile: fs.readFile,
      });
      const outcome = corpusOutcomeFor(gathered);
      if (outcome !== null) observedCorpusOutcomes.push(outcome);
    }

    // Arm 2 — outer `try`/`catch` ⇒ RSN-UNLISTABLE, BR-12's last row: `_git` itself throws,
    // not merely a graceful `!reply.ok` reply.
    {
      const throwingGit = () => {
        throw new Error("fatal: simulated _git fault");
      };
      const fs = fakeFs({});
      const gathered = await gatherLearningsCorpus({
        feature: "arm-unlistable-throw",
        _git: throwingGit,
        _readFile: fs.readFile,
      });
      const outcome = corpusOutcomeFor(gathered);
      if (outcome !== null) observedCorpusOutcomes.push(outcome);
    }

    // Arm 3 — empty enumeration ⇒ RSN-EMPTY (AT-24).
    {
      const git = fakeGit({ ok: true, stdout: "" });
      const fs = fakeFs({});
      const gathered = await gatherLearningsCorpus({
        feature: "arm-empty",
        _git: git,
        _readFile: fs.readFile,
      });
      const outcome = corpusOutcomeFor(gathered);
      if (outcome !== null) observedCorpusOutcomes.push(outcome);
    }

    // Arm 4 — `_readFile` returns `null` ⇒ RSN-UNREADABLE (AT-26 case 1).
    {
      const missingPath = "docs/arm-missing/LEARNINGS-arm-missing.md";
      const git = fakeGit({ ok: true, stdout: missingPath });
      const fs = fakeFs({});
      const gathered = await gatherLearningsCorpus({
        feature: "arm-unreadable-null",
        _git: git,
        _readFile: fs.readFile,
      });
      const { rejected } = selectLearnings({
        entries: gathered.entries,
        feature: "arm-unreadable-null",
        thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
      });
      for (const r of rejected) observedRejectReasons.push(r.reason);
    }

    // Arm 5 — `_readFile` throws ⇒ RSN-UNREADABLE (AT-26 case 2, P-8: `rtReadFile` throws
    // where `defaultReadFile` returns `null`). `fakeFs`'s own `_readFile` double is
    // contracted to never throw, so this one path's outcome is overridden inline, delegating
    // to `fakeFs`'s double for every other path (the one-off override precedent
    // `learningsCorpus.test.js` already uses).
    {
      const throwingPath = "docs/arm-throws/LEARNINGS-arm-throws.md";
      const git = fakeGit({ ok: true, stdout: throwingPath });
      const fs = fakeFs({});
      const _readFile = (path) => {
        if (path === throwingPath) throw new Error("EACCES: simulated permission fault");
        return fs.readFile(path);
      };
      const gathered = await gatherLearningsCorpus({
        feature: "arm-unreadable-throw",
        _git: git,
        _readFile,
      });
      const { rejected } = selectLearnings({
        entries: gathered.entries,
        feature: "arm-unreadable-throw",
        thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
      });
      for (const r of rejected) observedRejectReasons.push(r.reason);
    }

    // Arm 6 — a readable document that does not parse as a LEARNINGS document ⇒
    // RSN-UNPARSEABLE (AT-27).
    {
      const corpus = buildLearningsCorpus([
        {
          path: "docs/arm-unparseable/LEARNINGS-arm-unparseable.md",
          text: "# Not A Learnings Document\n\nJust plain prose, no BR-3 heading form.\n",
        },
      ]);
      const entries = entriesFromCorpus(corpus, { feature: "arm-unparseable" });
      const { rejected } = selectLearnings({
        entries,
        feature: "arm-unparseable",
        thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
      });
      for (const r of rejected) observedRejectReasons.push(r.reason);
    }

    // Arm 7 — a document carrying none of BR-6's priority sections ⇒ RSN-NO-MATERIAL,
    // structural disjunct (AT-28). The zero-bound disjunct (E-36) is driven by LI-12's
    // `LI-AT-30` third case, not here — see file header.
    {
      const corpus = buildLearningsCorpus([
        {
          path: "docs/arm-no-material/LEARNINGS-arm-no-material.md",
          doc: { feature: "arm-no-material", dateCompleted: "2026-01-01", sections: [] },
        },
      ]);
      const entries = entriesFromCorpus(corpus, { feature: "arm-no-material" });
      const { rejected } = selectLearnings({
        entries,
        feature: "arm-no-material",
        thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
      });
      for (const r of rejected) observedRejectReasons.push(r.reason);
    }

    // Arm 8 — count bound cuts ⇒ RSN-COUNT (AT-08, AT-13, `COUNT-BINDING`).
    {
      const corpus = buildCountBindingCorpus();
      const entries = entriesFromCorpus(corpus, { feature: "arm-count" });
      const { rejected } = selectLearnings({
        entries,
        feature: "arm-count",
        thresholds: COUNT_BINDING_THRESHOLDS,
      });
      for (const r of rejected) observedRejectReasons.push(r.reason);
    }

    // Arm 9 — byte bound cuts ⇒ RSN-BYTES (AT-07, `BYTES-BINDING`).
    {
      const corpus = buildBytesBindingCorpus();
      const entries = entriesFromCorpus(corpus, { feature: "arm-bytes" });
      const { rejected } = selectLearnings({
        entries,
        feature: "arm-bytes",
        thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
      });
      for (const r of rejected) observedRejectReasons.push(r.reason);
    }

    // Arm 10 — self path ⇒ RSN-SELF (AT-04).
    {
      const feature = "arm-self";
      const selfPath = `docs/${feature}/LEARNINGS-${feature}.md`;
      const corpus = buildLearningsCorpus([
        { path: selfPath, doc: { feature, dateCompleted: "2026-01-05" } },
      ]);
      const entries = entriesFromCorpus(corpus, { feature, selfPath });
      const { rejected } = selectLearnings({
        entries,
        feature,
        thresholds: LEARNINGS_CORPUS_DEFAULT_THRESHOLDS,
      });
      for (const r of rejected) observedRejectReasons.push(r.reason);
    }

    // Arm 11 — section malformed ⇒ NTC-MALFORMED, run stays enabled on §4.1's defaults,
    // fail-open (AT-32).
    {
      const { sectionMalformed } = parseLearningsConfig(
        JSON.stringify({ learningsInjection: "not-an-object" }),
      );
      if (sectionMalformed) observedNotices.push("NTC-MALFORMED");
    }

    // Arm 12 — declared key wrong-typed ⇒ NTC-KEYTYPE, proceeds on defaults (AT-32, second
    // case).
    {
      const { invalidKeys } = parseLearningsConfig(
        JSON.stringify({ learningsInjection: { maxDocuments: "five" } }),
      );
      if (invalidKeys.length > 0) observedNotices.push("NTC-KEYTYPE");
    }
  });

  test("LI-T-ARMS-1 — observed non-null corpusOutcome values are set-equal to LEARNINGS_CORPUS_OUTCOMES", async () => {
    const { LEARNINGS_CORPUS_OUTCOMES } = await import("../orchestrate-dev.js");
    expect(new Set(observedCorpusOutcomes)).toEqual(new Set(LEARNINGS_CORPUS_OUTCOMES));
  });

  test("LI-T-ARMS-2 — observed rejected[].reason values are set-equal to LEARNINGS_REJECT_REASONS", async () => {
    const { LEARNINGS_REJECT_REASONS } = await import("../orchestrate-dev.js");
    expect(new Set(observedRejectReasons)).toEqual(new Set(LEARNINGS_REJECT_REASONS));
  });

  test("LI-T-ARMS-3 — observed notices ids are set-equal to LEARNINGS_NOTICES", async () => {
    const { LEARNINGS_NOTICES } = await import("../orchestrate-dev.js");
    expect(new Set(observedNotices)).toEqual(new Set(LEARNINGS_NOTICES));
  });
});

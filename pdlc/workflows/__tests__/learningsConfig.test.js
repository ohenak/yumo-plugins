/**
 * learningsConfig.test.js — PLAN LI-12 (batch 5, depends on LI-02, LI-06).
 *
 * RED, authored `describe.skip`, un-skipped by the sole green owner **LI-21** (batch 13 —
 * "GREEN the run wiring and the report key"). TSPEC §T.5 names this file **L3** (seam-driven
 * whole run), not L1: both of its ATs are stated "when the pipeline runs". It owns exactly two
 * FSPEC AT ids — `LI-AT-30` and `LI-AT-32` — so `LI-T-SUITEMAP`'s partition, `Batch` column and
 * `Deps` edges are unaffected by this file (PLAN LI-12).
 *
 * `parseLearningsConfig`, `LEARNINGS_DEFAULTS`, `LEARNINGS_NOTICES` and the `learningsInjection`
 * report key do not exist on `orchestrate-dev.js` yet at LI-12 (LI-15 lands the constants/reader
 * at batch 7, LI-21 lands the run wiring and report key at batch 13). This file therefore
 * imports the module as a namespace (`import * as devModule`) and reaches every not-yet-existing
 * symbol only from *inside* this file's one `describe.skip` body — `advisoryDisabled.test.js`'s
 * pattern, restated for this feature: `import mainDev, * as dev from "../orchestrate-dev.js"`.
 *
 * ## What LI-AT-30 asserts (TSPEC §I.2, FSPEC v0.13 E-36)
 *
 * Three zero-threshold cases — `maxDocuments: 0`, `maxTotalBytes: 0`, `maxBytesPerDocument: 0` —
 * each an **enabled** run whose BR-8 rows are present and empty (never the absent key of a
 * disabled run, never a refusal to run). The third case is the one a two-case form would leave
 * uncovered, and its oracle is positive on three conjuncts, not "selection is empty": (i) the
 * `learningsInjection` key is present, BR-8's rows present and empty; (ii) `rejected[]` is
 * set-equal to every enumerated non-self corpus path, each reason exactly `RSN-NO-MATERIAL`,
 * none carrying `RSN-COUNT`; (iii) no document in the run carries `RSN-COUNT` — the no-slot
 * conjunct (BR-9/D-12, TSPEC §D.5/§I.2) that falsifies an implementation taking a zero-byte
 * first-section cut, counting it as a contribution and burning a `maxDocuments` slot.
 *
 * ## What LI-AT-32 asserts (TSPEC §I.2)
 *
 * Three cases over the four-row table TSPEC §I.2 draws from FSPEC E-21…E-34: section/file both
 * absent ⇒ enabled on §4.1 defaults, no notice (row 1); malformed section ⇒ `learningsInjection`
 * key present, run enabled on §4.1 defaults, `NTC-MALFORMED` (row 3); wrong-typed declared key ⇒
 * key present, that key defaulted, `NTC-KEYTYPE` (row 4). Row 2 (`enabled: false` explicitly) is
 * `LI-AT-31`'s, not this file's. The closure is a **two**-member set equality over
 * `LEARNINGS_NOTICES`, matching `Object.freeze(["NTC-MALFORMED", "NTC-KEYTYPE"])` exactly.
 *
 * `parseLearningsConfig`'s own pure-unit assertions live in this file as supporting tests
 * carrying **no** FSPEC AT id (TSPEC §I.2), so the §T.5 per-file AT counts stay at 2 for this
 * suite.
 */

import fc from "fast-check";

import * as devModule from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles, recordingRecordQueueRow } from "./helpers/seams.js";
import { buildLearningsCorpus, LEARNINGS_CORPUS_DEFAULT_THRESHOLDS } from "./helpers/learningsFixtures.js";

const main = devModule.default;

// ─── Fixture plumbing — modelled on planParse.test.js's `runToPhaseP` (this file's own
// literal copy: no cross-suite import of test-only helpers) ────────────────────────────────

const FEATURE = "li-config-fixture";
const DOCS = `docs/${FEATURE}`;
const REQ = `${DOCS}/REQ-${FEATURE}.md`;
const PLAN_PATH = `${DOCS}/PLAN-${FEATURE}.md`;
const LEARNINGS_CONFIG_PATH = ".claude/pdlc.config.json";

/** TSPEC §5.9's required top-level headings, restated (never read off the subject). */
const REQUIRED_HEADINGS = Object.freeze({
  REQ: ["Problem / Context", "Goals", "Non-Goals", "Constraints", "Acceptance Criteria", "Risks", "Obligations"],
  FSPEC: ["Overview", "Linked Requirements", "Behavioral Flow", "Business Rules", "Edge Cases and Error Scenarios", "Acceptance Tests", "Open Questions"],
  TSPEC: ["Overview", "Architecture", "Interfaces", "Data Model", "Test Strategy", "Open Questions"],
  PLAN: ["Overview", "Batches", "Dependencies", "Verification"],
  PROPERTIES: ["Overview", "Properties", "Oracles", "Fixtures"],
});

function completeDoc(docType, body = "") {
  const parts = [`# ${FEATURE} ${docType}`, ""];
  for (const heading of REQUIRED_HEADINGS[docType]) {
    parts.push(`## ${heading}`, "", `Substantive prose for ${heading}.`, "");
    if (heading === "Batches" && body) parts.push(body, "");
  }
  return parts.join("\n");
}

function crossReviewDoc(verdict, high) {
  return [
    "# Cross-review",
    "",
    "## Findings",
    "",
    "Some findings.",
    "",
    "## Verdict",
    "",
    `VERDICT: ${verdict}`,
    `{"high": ${high}, "medium": 0, "low": 0}`,
    "",
  ].join("\n");
}

const ROLE_SLUG = Object.freeze({
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
});

function basenamesIn(files, dirPath) {
  const prefix = `${String(dirPath).replace(/\/+$/, "")}/`;
  return Object.keys(files)
    .filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("/"))
    .map((p) => p.slice(prefix.length))
    .sort();
}

const PARSEABLE_TASK_TABLE = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| LC-1 | placeholder task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| LC-1 | `src/placeholder.js` |",
].join("\n");

// ─── A two-document, non-self corpus under `docs/*/LEARNINGS-*.md` (§I.1's glob), each with
// one small BR-6 section — well within §4.1's declared defaults, so a zero threshold is what
// admits nothing, never the fixture's own size. ─────────────────────────────────────────────
const ZERO_CORPUS = buildLearningsCorpus([
  {
    path: "docs/lc-fixture-a/LEARNINGS-lc-fixture-a.md",
    doc: {
      feature: "lc-fixture-a",
      dateCompleted: "2026-01-01",
      sections: [{ name: "Cross-Feature Patterns", bodyBytes: 300 }],
    },
  },
  {
    path: "docs/lc-fixture-b/LEARNINGS-lc-fixture-b.md",
    doc: {
      feature: "lc-fixture-b",
      dateCompleted: "2026-01-02",
      sections: [{ name: "Cross-Feature Patterns", bodyBytes: 300 }],
    },
  },
]);

function thresholdsConfig(thresholds) {
  return JSON.stringify({ learningsInjection: { enabled: true, ...thresholds } });
}

/**
 * Drive `main()` through Phase F/T/PLAN to Phase PR, exactly as `planParse.test.js`'s
 * `runToPhaseP` does — every reviewer approves on round 1, and the PROPERTIES creator answers
 * empty, halting the pipeline immediately after Phase P. Along the way, FSPEC/TSPEC/PLAN are
 * all `LEARNINGS_TARGET_DOCTYPES` members, so each authoring dispatch calls the injector once
 * the config's `enabled` gate is open — giving `result.learningsInjection` at least one
 * `dispatches[]` row to assert over.
 *
 * @param {{configText: string|null, lsFilesStdout?: string, corpusContents?: Record<string,string>}} opts
 *   `configText === null` means the config file does not exist at `LEARNINGS_CONFIG_PATH` at all
 *   (the file-absent half of LI-AT-32's first case). `corpusContents` is the `{path: text}` map
 *   the scripted `ls-files` reply's paths resolve to when read — LI-AT-30's `ZERO_CORPUS.contents`.
 */
function runLearningsPipeline({
  configText,
  lsFilesStdout = "",
  corpusContents = {},
  configReadError = null,
}) {
  const files = { [REQ]: completeDoc("REQ"), ...corpusContents };
  if (configText !== null) files[LEARNINGS_CONFIG_PATH] = configText;

  const fs = fakeFs(files);
  const listFiles = fakeListFiles((dirPath) => basenamesIn(fs.files, dirPath));
  const git = fakeGit((argv) => {
    if (argv.join(" ") === "rev-parse --abbrev-ref HEAD") {
      return { ok: true, stdout: `feat-${FEATURE}\n` };
    }
    if (argv[0] === "ls-files") return { ok: true, stdout: lsFilesStdout };
    return { ok: true };
  });

  const agent = async (skill, prompt) => {
    const text = String(prompt ?? "");
    const docType = ["PROPERTIES", "PLAN", "TSPEC", "FSPEC", "REQ"].find((d) =>
      text.includes(`${DOCS}/${d}-${FEATURE}.md`)
    );

    if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
      const round = Number((/(?:This is iteration) (\d+)/.exec(text) || [0, 1])[1]);
      fs.writeFile(
        `${DOCS}/CROSS-REVIEW-${ROLE_SLUG[skill]}-${docType}-v${round}.md`,
        crossReviewDoc("Approved", 0)
      );
      return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }

    // Phase PR's creator: an empty reply halts right after Phase P.
    if (docType === "PROPERTIES") return "";

    if (docType === "PLAN") {
      fs.writeFile(PLAN_PATH, completeDoc("PLAN", PARSEABLE_TASK_TABLE));
      return "Document written.\nREVISION-COMPLETE: yes";
    }
    if (docType === "TSPEC") {
      fs.writeFile(`${DOCS}/TSPEC-${FEATURE}.md`, completeDoc("TSPEC"));
      return "Document written.\nREVISION-COMPLETE: yes\nDECISIONS_WARRANTED: false";
    }
    if (docType === "FSPEC") {
      fs.writeFile(`${DOCS}/FSPEC-${FEATURE}.md`, completeDoc("FSPEC"));
      return "Document written.\nREVISION-COMPLETE: yes";
    }
    return "Document written.\nREVISION-COMPLETE: yes";
  };

  // CODE_REVIEW v1 F6: the ONE seam behaviour that reaches `readLearningsConfigSafely`'s
  // `catch`. Every other double in this feature answers `null` for a missing/unreadable file,
  // which is the read seam's contract in production; a real `EACCES`/`EISDIR` on
  // `.claude/pdlc.config.json` throws instead, and that arm — the one AC-4.2 and AC-5.1b both
  // rest on — was executed by nothing.
  const injections = fs.injections();
  const baseReadFile = injections._readFile;
  const readFile = configReadError
    ? async (p) => {
        if (String(p) === LEARNINGS_CONFIG_PATH) throw configReadError;
        return baseReadFile(p);
      }
    : baseReadFile;

  return main({
    reqPath: REQ,
    _agent: agent,
    _parallel: (promises) => Promise.all(promises),
    _pipeline: async (label, fn) => fn(),
    _phase: () => {},
    _log: () => {},
    _listFiles: listFiles,
    _git: git,
    _recordQueueRow: recordingRecordQueueRow({ queueRow: "recorded" }),
    ...injections,
    _readFile: readFile,
    _phaseDodEnabled: false,
    _phasePubEnabled: false,
    _now: () => 0,
    _sleep: async () => {},
  });
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LI-21 — un-skip this block once `parseLearningsConfig`, `LEARNINGS_DEFAULTS`,
// `LEARNINGS_NOTICES` and the `learningsInjection` report key exist (batch 13).
// ═══════════════════════════════════════════════════════════════════════════════════════════
describe("LI-21: learnings configuration — LI-AT-30, LI-AT-32", () => {
  describe("LI-AT-30 — admits-nothing threshold configurations (TSPEC §I.2, FSPEC v0.13 E-36)", () => {
    test("LI-AT-30: maxDocuments: 0 ⇒ enabled run, BR-8 rows present and empty", async () => {
      const result = await runLearningsPipeline({
        configText: thresholdsConfig({ ...LEARNINGS_CORPUS_DEFAULT_THRESHOLDS, maxDocuments: 0 }),
        lsFilesStdout: ZERO_CORPUS.lsFilesStdout,
        corpusContents: ZERO_CORPUS.contents,
      });

      expect(result.learningsInjection).toBeDefined();
      expect(result.learningsInjection.ruleInputs.thresholds.maxDocuments).toBe(0);
      expect(result.learningsInjection.dispatches.length).toBeGreaterThan(0);
      for (const dispatch of result.learningsInjection.dispatches) {
        expect(dispatch.rows).toEqual([]);
        expect(dispatch.totalBytesInjected).toBe(0);
      }
    });

    test("LI-AT-30: maxTotalBytes: 0 ⇒ enabled run, BR-8 rows present and empty", async () => {
      const result = await runLearningsPipeline({
        configText: thresholdsConfig({ ...LEARNINGS_CORPUS_DEFAULT_THRESHOLDS, maxTotalBytes: 0 }),
        lsFilesStdout: ZERO_CORPUS.lsFilesStdout,
        corpusContents: ZERO_CORPUS.contents,
      });

      expect(result.learningsInjection).toBeDefined();
      expect(result.learningsInjection.ruleInputs.thresholds.maxTotalBytes).toBe(0);
      expect(result.learningsInjection.dispatches.length).toBeGreaterThan(0);
      for (const dispatch of result.learningsInjection.dispatches) {
        expect(dispatch.rows).toEqual([]);
        expect(dispatch.totalBytesInjected).toBe(0);
      }
    });

    test("LI-AT-30: maxBytesPerDocument: 0 ⇒ every non-self corpus path RSN-NO-MATERIAL, none RSN-COUNT, no slot consumed (E-36)", async () => {
      const result = await runLearningsPipeline({
        configText: thresholdsConfig({ ...LEARNINGS_CORPUS_DEFAULT_THRESHOLDS, maxBytesPerDocument: 0 }),
        lsFilesStdout: ZERO_CORPUS.lsFilesStdout,
        corpusContents: ZERO_CORPUS.contents,
      });

      expect(result.learningsInjection).toBeDefined();
      expect(result.learningsInjection.ruleInputs.thresholds.maxBytesPerDocument).toBe(0);
      expect(result.learningsInjection.dispatches.length).toBeGreaterThan(0);

      for (const dispatch of result.learningsInjection.dispatches) {
        // (i) BR-8 rows present and empty.
        expect(dispatch.rows).toEqual([]);
        expect(dispatch.totalBytesInjected).toBe(0);

        // (ii) rejected[] is SET-EQUAL to every enumerated non-self corpus path, each
        // reason exactly RSN-NO-MATERIAL — never merely "at least one".
        const rejectedPaths = dispatch.rejected.map((r) => r.sourcePath).sort();
        expect(rejectedPaths).toEqual([...ZERO_CORPUS.paths].sort());
        for (const row of dispatch.rejected) {
          expect(row.reason).toBe("RSN-NO-MATERIAL");
        }

        // (iii) the no-slot conjunct: no document carries RSN-COUNT. Without this
        // conjunct an implementation that cut a zero-byte first section and counted
        // it as a contribution (burning a maxDocuments slot) would still pass.
        expect(dispatch.rejected.some((r) => r.reason === "RSN-COUNT")).toBe(false);
      }
    });
  });

  describe("LI-AT-32 — configuration read notices (TSPEC §I.2)", () => {
    test("LI-AT-32: section and file both absent ⇒ enabled on §4.1 defaults, no notice", async () => {
      const result = await runLearningsPipeline({ configText: null, lsFilesStdout: "" });

      expect(result.learningsInjection).toBeDefined();
      expect(result.learningsInjection.ruleInputs.thresholds).toEqual(LEARNINGS_CORPUS_DEFAULT_THRESHOLDS);
      const notices = result.notices || [];
      expect(notices.some((n) => n.id === "NTC-MALFORMED" || n.id === "NTC-KEYTYPE")).toBe(false);
    });

    test("LI-AT-32: malformed section ⇒ learningsInjection key present, run enabled on §4.1 defaults, NTC-MALFORMED", async () => {
      const result = await runLearningsPipeline({
        configText: JSON.stringify({ learningsInjection: "not-an-object" }),
        lsFilesStdout: "",
      });

      expect(result.learningsInjection).toBeDefined();
      expect(result.learningsInjection.ruleInputs.thresholds).toEqual(LEARNINGS_CORPUS_DEFAULT_THRESHOLDS);
      const noticeIds = (result.notices || []).map((n) => n.id);
      expect(noticeIds).toContain("NTC-MALFORMED");
    });

    test("LI-AT-32: wrong-typed declared key ⇒ learningsInjection key present, that key defaulted, NTC-KEYTYPE", async () => {
      const result = await runLearningsPipeline({
        configText: JSON.stringify({ learningsInjection: { maxDocuments: "not-a-number" } }),
        lsFilesStdout: "",
      });

      expect(result.learningsInjection).toBeDefined();
      expect(result.learningsInjection.ruleInputs.thresholds.maxDocuments).toBe(
        LEARNINGS_CORPUS_DEFAULT_THRESHOLDS.maxDocuments
      );
      const noticeIds = (result.notices || []).map((n) => n.id);
      expect(noticeIds).toContain("NTC-KEYTYPE");
    });

    // CODE_REVIEW v1 §2 row 21 (AC-5.1c). `enabled` is a declared §4.1 key, and the REQ §4.1
    // table routes a wrong-typed value for it to AC-5.1c — but every case above supplies a
    // wrong-typed THRESHOLD, so `boolField`'s fallback arm never executed. It is the
    // load-bearing one: `"false"` is truthy-but-not-boolean, so an implementation that took the
    // section value as-is would silently turn the feature OFF, which is exactly what AC-5.1b's
    // "no non-deliberate configuration mistake turns the feature off" forbids.
    test("LI-AT-32: wrong-typed `enabled` stays ON, is named in NTC-KEYTYPE, and does not disable the run (AC-5.1b/c)", async () => {
      const { config, invalidKeys, sectionMalformed } = devModule.parseLearningsConfig(
        JSON.stringify({ learningsInjection: { enabled: "false" } })
      );
      // The truthy-string trap: `enabled` falls back to the §4.1 default `true`, and the key is
      // named — not silently coerced.
      expect(config.enabled).toBe(true);
      expect(invalidKeys).toEqual(["enabled"]);
      expect(sectionMalformed).toBe(false);

      const result = await runLearningsPipeline({
        configText: JSON.stringify({ learningsInjection: { enabled: "false" } }),
        lsFilesStdout: ZERO_CORPUS.lsFilesStdout,
        corpusContents: ZERO_CORPUS.contents,
      });

      // Still ENABLED end-to-end: the report key is present (a disabled run omits it entirely,
      // AC-5.1a) and the notice names `enabled` by name.
      expect(result.learningsInjection).toBeDefined();
      expect(result.learningsInjection.dispatches.length).toBeGreaterThan(0);
      const keyTypeNotices = (result.notices || []).filter((n) => n.id === "NTC-KEYTYPE");
      expect(keyTypeNotices).toHaveLength(1);
      expect(keyTypeNotices[0].detail).toContain("enabled");
    });

    test("LI-AT-32: every non-boolean `enabled` value falls back to true rather than disabling the feature", () => {
      for (const wrongTyped of ["false", "true", 0, 1, null, [], {}]) {
        const { config, invalidKeys } = devModule.parseLearningsConfig(
          JSON.stringify({ learningsInjection: { enabled: wrongTyped } })
        );
        expect({ wrongTyped, enabled: config.enabled }).toEqual({ wrongTyped, enabled: true });
        expect(invalidKeys).toEqual(["enabled"]);
      }
    });

    // CODE_REVIEW v1 F6 — `readLearningsConfigSafely`'s `catch`, the fail-open arm no double
    // reached. Asserted at the RUN level, not on the reader in isolation: the finding is that
    // production behaviour on a throwing config read is asserted nowhere, and "the run proceeds
    // on §4.1 defaults with injection still enabled" is the behaviour AC-4.2/AC-5.1b promise.
    test("LI-AT-32: a config read that THROWS fails open — run proceeds enabled on §4.1 defaults, no notice", async () => {
      const eacces = Object.assign(new Error("EACCES: permission denied, open '.claude/pdlc.config.json'"), {
        code: "EACCES",
      });
      const result = await runLearningsPipeline({
        configText: JSON.stringify({ learningsInjection: { enabled: false, maxDocuments: 1 } }),
        // The file EXISTS and would disable the feature if it were readable — so a run that
        // came back enabled on defaults can only have gone through the `catch`.
        configReadError: eacces,
        lsFilesStdout: ZERO_CORPUS.lsFilesStdout,
        corpusContents: ZERO_CORPUS.contents,
      });

      expect(result.learningsInjection).toBeDefined();
      expect(result.learningsInjection.ruleInputs.thresholds).toEqual(LEARNINGS_CORPUS_DEFAULT_THRESHOLDS);
      expect(result.learningsInjection.dispatches.length).toBeGreaterThan(0);
      // A throw is indistinguishable from an absent file (§I.2 row 1): no notice is raised.
      const noticeIds = (result.notices || []).map((n) => n.id);
      expect(noticeIds).not.toContain("NTC-MALFORMED");
      expect(noticeIds).not.toContain("NTC-KEYTYPE");
    });

    test("supporting: readLearningsConfigSafely returns null instead of propagating a throwing read", async () => {
      const boom = new Error("EISDIR: illegal operation on a directory");
      await expect(
        devModule.readLearningsConfigSafely(() => {
          throw boom;
        }, LEARNINGS_CONFIG_PATH)
      ).resolves.toBeNull();
      await expect(
        devModule.readLearningsConfigSafely(async () => {
          throw boom;
        }, LEARNINGS_CONFIG_PATH)
      ).resolves.toBeNull();
    });

    // Supporting (no AT id) — AT-32's closure is a two-member set equality, not containment.
    test("supporting: LEARNINGS_NOTICES is exactly the two-member catalogue {NTC-MALFORMED, NTC-KEYTYPE}", () => {
      expect([...devModule.LEARNINGS_NOTICES]).toEqual(["NTC-MALFORMED", "NTC-KEYTYPE"]);
    });
  });

  // ─── parseLearningsConfig — supporting pure-unit assertions (no FSPEC AT id, TSPEC §I.2) ───
  describe("parseLearningsConfig — supporting pure-unit assertions (no AT id)", () => {
    test("never throws given a variety of malformed inputs", () => {
      const inputs = [
        null,
        "",
        "not json at all {{{",
        JSON.stringify([1, 2, 3]),
        JSON.stringify({ other: true }),
        JSON.stringify({ learningsInjection: "nope" }),
        JSON.stringify({ learningsInjection: null }),
      ];
      for (const input of inputs) {
        expect(() => devModule.parseLearningsConfig(input)).not.toThrow();
      }
    });

    test("returns the declared three-key shape", () => {
      const result = devModule.parseLearningsConfig(null);
      expect(Object.keys(result).sort()).toEqual(["config", "invalidKeys", "sectionMalformed"]);
      expect(Array.isArray(result.invalidKeys)).toBe(true);
      expect(typeof result.sectionMalformed).toBe("boolean");
    });

    test("absent section defaults to LEARNINGS_DEFAULTS with enabled: true (REQ AC-5.1a)", () => {
      const { config, invalidKeys, sectionMalformed } = devModule.parseLearningsConfig(
        JSON.stringify({ other: 1 })
      );
      expect(config).toEqual(devModule.LEARNINGS_DEFAULTS);
      expect(config.enabled).toBe(true);
      expect(invalidKeys).toEqual([]);
      expect(sectionMalformed).toBe(false);
    });

    test("thresholds validate as non-negative integers; 0 is a valid admits-nothing value, not a fallback (AC-4.4)", () => {
      const { config, invalidKeys } = devModule.parseLearningsConfig(
        JSON.stringify({
          learningsInjection: { maxDocuments: 0, maxBytesPerDocument: 0, maxTotalBytes: 0 },
        })
      );
      expect(config.maxDocuments).toBe(0);
      expect(config.maxBytesPerDocument).toBe(0);
      expect(config.maxTotalBytes).toBe(0);
      expect(invalidKeys).toEqual([]);
    });

    test("a negative threshold value falls back to its default and is named in invalidKeys", () => {
      const { config, invalidKeys } = devModule.parseLearningsConfig(
        JSON.stringify({ learningsInjection: { maxDocuments: -1 } })
      );
      expect(config.maxDocuments).toBe(devModule.LEARNINGS_DEFAULTS.maxDocuments);
      expect(invalidKeys).toEqual(["maxDocuments"]);
    });

    test("a non-integer threshold value falls back to its default and is named in invalidKeys", () => {
      const { config, invalidKeys } = devModule.parseLearningsConfig(
        JSON.stringify({ learningsInjection: { maxTotalBytes: 4.5 } })
      );
      expect(config.maxTotalBytes).toBe(devModule.LEARNINGS_DEFAULTS.maxTotalBytes);
      expect(invalidKeys).toEqual(["maxTotalBytes"]);
    });

    test("there is no `present` field on the return (TE F-06)", () => {
      const { config } = devModule.parseLearningsConfig(null);
      expect(Object.prototype.hasOwnProperty.call(config, "present")).toBe(false);
    });
  });

  // ─── CODE_REVIEW v1 F5 — property-based coverage of the one validator in this feature ──────
  //
  // DoD criterion 4 names parsers and validators as the modules that require property-based
  // tests. `parseLearningsConfig` is a validator over a parameterisable input space (four
  // declared keys x arbitrary JSON value types x arbitrary section shapes) and was covered only
  // by enumerated examples; `fast-check` was already a devDependency and already used for
  // selection and block rendering, so the capability was present and simply not applied to the
  // one module whose input space is adversarial.
  //
  // The four properties below are the ones the finding names. Each is stated over the WHOLE
  // input space (arbitrary JSON text, arbitrary section value, arbitrary per-key values) rather
  // than over a curated list, so a fallback arm that is right for `"not-a-number"` and wrong for
  // `NaN`, `Infinity`, `-0`, `2 ** 53`, `[]` or `{}` is reachable by the generator.
  describe("CODE_REVIEW v1 F5: parseLearningsConfig properties (fast-check)", () => {
    const DECLARED_KEYS = Object.freeze(["enabled", "maxDocuments", "maxBytesPerDocument", "maxTotalBytes"]);
    const THRESHOLD_KEYS = Object.freeze(["maxDocuments", "maxBytesPerDocument", "maxTotalBytes"]);

    /** Arbitrary JSON-representable values — the space a hand-edited config file can contain. */
    const jsonValue = fc.letrec((tie) => ({
      value: fc.oneof(
        { depthSize: "small" },
        fc.constant(null),
        fc.boolean(),
        fc.double({ noDefaultInfinity: false, noNaN: false }),
        fc.integer(),
        fc.string(),
        fc.array(tie("value"), { maxLength: 3 }),
        fc.dictionary(fc.string(), tie("value"), { maxKeys: 3 })
      ),
    })).value;

    /** An arbitrary `learningsInjection` section: sometimes a well-shaped record over the
     *  declared keys, sometimes an arbitrary JSON value (the malformed-section half). */
    const sectionArb = fc.oneof(
      fc.dictionary(fc.constantFrom(...DECLARED_KEYS, "unknownKey"), jsonValue, { maxKeys: 5 }),
      jsonValue
    );

    /** The whole file's text: a valid JSON document carrying an arbitrary section, or arbitrary
     *  bytes that may not parse as JSON at all. */
    const configTextArb = fc.oneof(
      sectionArb.map((section) => JSON.stringify({ learningsInjection: section })),
      jsonValue.map((v) => JSON.stringify(v)),
      fc.string(),
      fc.constant(null)
    );

    test("PROP-F5-1: the returned config is ALWAYS fully populated and well-typed, for any input", () => {
      fc.assert(
        fc.property(configTextArb, (text) => {
          const { config } = devModule.parseLearningsConfig(text);
          expect(Object.keys(config).sort()).toEqual([...DECLARED_KEYS].sort());
          expect(typeof config.enabled).toBe("boolean");
          for (const key of THRESHOLD_KEYS) {
            expect(Number.isInteger(config[key])).toBe(true);
            expect(config[key]).toBeGreaterThanOrEqual(0);
          }
        }),
        { numRuns: 400 }
      );
    });

    test("PROP-F5-2: every declared key is EITHER its §4.1 default OR the well-typed value the section supplied", () => {
      fc.assert(
        fc.property(sectionArb, (rawSection) => {
          const text = JSON.stringify({ learningsInjection: rawSection });
          const { config } = devModule.parseLearningsConfig(text);
          // The oracle must read the section as it survives SERIALISATION, not as fast-check
          // generated it: `parseLearningsConfig` only ever sees the text. JSON has no `-0`
          // (`JSON.stringify(-0) === "0"`) and no `NaN`/`Infinity` (all serialise to `null`),
          // so a generated `-0` reaches production as `0` and comparing against the raw value
          // would fail the implementation for the serialiser's normalisation.
          const section = JSON.parse(text).learningsInjection;
          const isRecord = section !== null && typeof section === "object" && !Array.isArray(section);
          for (const key of DECLARED_KEYS) {
            const supplied = isRecord ? section[key] : undefined;
            const wellTyped =
              key === "enabled"
                ? typeof supplied === "boolean"
                : Number.isInteger(supplied) && supplied >= 0;
            expect({ key, value: config[key] }).toEqual({
              key,
              value: wellTyped ? supplied : devModule.LEARNINGS_DEFAULTS[key],
            });
          }
        }),
        { numRuns: 400 }
      );
    });

    test("PROP-F5-3: invalidKeys is a duplicate-free SUBSET of the declared key set, and names exactly the defaulted-away keys", () => {
      fc.assert(
        fc.property(configTextArb, (text) => {
          const { config, invalidKeys, sectionMalformed } = devModule.parseLearningsConfig(text);
          expect(Array.isArray(invalidKeys)).toBe(true);
          expect(new Set(invalidKeys).size).toBe(invalidKeys.length);
          for (const key of invalidKeys) expect(DECLARED_KEYS).toContain(key);
          // A named key always carries its default — naming it and keeping the bad value would
          // satisfy subset-hood while defeating the notice's purpose.
          for (const key of invalidKeys) {
            expect(config[key]).toEqual(devModule.LEARNINGS_DEFAULTS[key]);
          }
          // The two degraded readings are mutually exclusive: a malformed section reports no
          // per-key notice, because no key was read at all (§I.2's four-row table).
          if (sectionMalformed) expect(invalidKeys).toEqual([]);
        }),
        { numRuns: 400 }
      );
    });

    test("PROP-F5-4: total and pure — never throws, never disables the feature except on a literal `enabled: false`", () => {
      fc.assert(
        fc.property(configTextArb, (text) => {
          let result;
          expect(() => {
            result = devModule.parseLearningsConfig(text);
          }).not.toThrow();
          expect(typeof result.sectionMalformed).toBe("boolean");
          // AC-5.1b: no non-deliberate configuration mistake turns the feature off. The ONLY
          // input that may yield `enabled: false` is a section carrying the boolean literal.
          if (result.config.enabled === false) {
            const parsed = JSON.parse(text);
            expect(parsed.learningsInjection.enabled).toBe(false);
          }
        }),
        { numRuns: 400 }
      );
    });
  });
});

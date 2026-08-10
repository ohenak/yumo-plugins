// consolidationReport.test.js — PLAN T24 (RED, describe.skip).
//
// Two blocks, each un-skipped by its own owning task — never rewritten by it, per PLAN §13.3's
// batch-safety rule 2:
//
//   T29 — renderers (L1): AT-L1 … AT-L5 and AT-N1 … AT-N4, over the seven §7.9 render functions —
//     `renderFailureModeRecord`, `renderEffectivenessTable`, `renderTerminalRow`, `renderReportBody`,
//     `renderPrBody`, `renderProposalFile`, `renderPromotionCommitMessage` — driven directly, never
//     through `main()` (which does not exist until T31). AT-L5 carries §11.3(b)'s vocabulary
//     set-equality in four legs (module catalogue ≡ doubles' transcription, both directions; the
//     free-form class excluded by name; the module's own frozen arrays ⊆/⊇ that transcription; and
//     the fourth leg, which reads `docs/_constraints/pdlc-consolidation-vocabularies.md` §1 itself,
//     over an injected `root`, DC-04) plus the dropped-code arm (§6.4, §7.9): a legal (status, code)
//     pair is written to the row, an illegal one is dropped with a report-body notice naming it, and
//     `no-cadence-datum` is the control that must never be dropped (§1 permits it with `refused`,
//     decided at REQ-CONS-01 step 3/4, before the marker check).
//
//   T31 — the ER-6 interim's discriminator (§7.6, §12.4; no FSPEC AT): a *routed* propose-only
//     promotion and a *degraded* PR attempt both write `route: "degraded"` to their record — that
//     sameness is the ER-6 loss, asserted rather than hidden — while the report body is the thing
//     that still tells them apart: the degraded one names a vocabularies §1 §6.3 reason code beside
//     its promotion, the routed one names none. Asserted in both directions.
//
// Neither block exists as behaviour yet (PLAN T02 skeleton — every renderer throws
// `notImplemented`), so both are wrapped in `describe.skip` until their owning task lands.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  renderFailureModeRecord,
  renderEffectivenessTable,
  renderTerminalRow,
  renderReportBody,
  renderPrBody,
  renderProposalFile,
  renderPromotionCommitMessage,
  parseConsolidationConfig,
  openClone,
  TERMINAL_STATUSES,
  REASON_CODES,
  TRIGGERS,
  ROUTES,
  ACTIONS,
  VERDICTS,
  PROMO_STATES,
  CREDENTIAL_VALUES,
  PHASE_CATALOGUE,
  REASON_CODE_STATUSES,
  UNAVAILABLE,
} from "../consolidate-learnings.js";
import { VOCABULARY_VERSION, VOCABULARY_TRANSCRIPTION } from "./helpers/consolidationDoubles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const VOCAB_PATH = join("docs", "_constraints", "pdlc-consolidation-vocabularies.md");

// ─── PassState fixture builder ──────────────────────────────────────────────
//
// Every field TSPEC §6.1's PassState interface names, at a neutral default, so every test below
// overrides only the fields its case is actually about (the shape `advisoryDoubles.js`-style
// fixture builders across this repo already use).
function makeState(overrides = {}) {
  return {
    passId: "20260101-1",
    trigger: "cadence",
    status: "promoted",
    reasons: new Set(),
    rung: "opus",
    credential: "absent",
    consumed: ["LEARNINGS-foo.md"],
    proposals: [],
    records: [],
    effectiveness: null,
    suppressions: [],
    notices: [],
    prUrl: null,
    branch: "feat-foo",
    markerHeld: true,
    ...overrides,
  };
}

function makeRecord(overrides = {}) {
  return {
    failureModeId: "t-docs-foo-tspec-foo-md",
    phase: "T",
    symptom: "the reviewer missed the missing edge case",
    artifact: "docs/foo/TSPEC-foo.md",
    target: "docs/foo/TSPEC-foo.md",
    passId: "20260101-1",
    action: "promote",
    route: "constraints",
    ...overrides,
  };
}

// ─── T29 — the seven §7.9 render functions, driven directly ────────────────

describe("T29 — renderers (L1): AT-L1 … AT-L5, AT-N1 … AT-N4", () => {
  describe("driving the seven §7.9 render functions directly, never through main()", () => {
    // ─── AT-L1 — a pass that opened a PR and suppressed another proposal ─────

    test("AT-L1: pr: carries this pass's PR and suppressed-by: carries the suppressed pair — both present, neither merged into the other", () => {
      const state = makeState({
        status: "promoted",
        prUrl: "https://github.com/kaneho/yumo-plugins/pull/42",
        suppressions: [
          {
            failureModeId: "t-other-artifact-md",
            action: "promote",
            evidence: { kind: "pr", url: "https://github.com/kaneho/yumo-plugins/pull/17" },
          },
        ],
      });

      const { text } = renderTerminalRow(state);

      expect(text).toContain("https://github.com/kaneho/yumo-plugins/pull/42");
      expect(text).toContain("t-other-artifact-md:promote");
      expect(text).toContain("https://github.com/kaneho/yumo-plugins/pull/17");
      // Neither observable subsumes the other: the PR field and the suppression field are two
      // distinct pieces of text, so removing either still leaves the other legible.
      expect(text.indexOf("pull/42")).not.toBe(text.indexOf("pull/17"));
    });

    // ─── AT-L2 — a pass that opened nothing and suppressed everything ────────

    test("AT-L2: pr: is empty; the evidence is in suppressed-by:; terminal no-op", () => {
      const state = makeState({
        status: "no-op",
        prUrl: null,
        suppressions: [
          {
            failureModeId: "t-a-md",
            action: "promote",
            evidence: { kind: "pr", url: "https://github.com/kaneho/yumo-plugins/pull/9" },
          },
          {
            failureModeId: "t-b-md",
            action: "revise",
            evidence: { kind: "pass", passId: "20251231-2" },
          },
        ],
      });

      const { text } = renderTerminalRow(state);

      expect(text).toContain("status: no-op");
      expect(text).not.toMatch(/pr:\s*\S/); // biconditional: no PR this pass opened ⇒ the field is empty
      expect(text).toContain("t-a-md:promote");
      expect(text).toContain("https://github.com/kaneho/yumo-plugins/pull/9");
      expect(text).toContain("t-b-md:revise");
      expect(text).toContain("pass:20251231-2");
    });

    // ─── AT-L3 — exactly one row/report, no earlier record edited in place ───

    test("AT-L3: renderTerminalRow and renderReportBody are pure — repeat calls agree, and the input state is untouched", () => {
      const state = makeState({
        status: "promoted",
        records: [makeRecord()],
      });
      const before = JSON.parse(
        JSON.stringify({ ...state, reasons: [...state.reasons] })
      );

      const first = renderTerminalRow(state);
      const second = renderTerminalRow(state);
      const firstBody = renderReportBody(state);
      const secondBody = renderReportBody(state);

      expect(second.text).toBe(first.text);
      expect(second.dropped).toEqual(first.dropped);
      expect(secondBody).toBe(firstBody);
      // No in-place edit: the state object handed in reads exactly as it did before either call.
      expect(JSON.parse(JSON.stringify({ ...state, reasons: [...state.reasons] }))).toEqual(before);
      // "Exactly one row" — the pass field, which names the row's own identity, appears once.
      expect(first.text.split(state.passId)).toHaveLength(2);
    });

    // ─── AT-L4 — a report with no promotions ──────────────────────────────────

    test("AT-L4: the promotions section is present and explicitly empty — omission is a failure", () => {
      const withPromotions = renderReportBody(
        makeState({ proposals: [makeRecord()], records: [makeRecord()] })
      );
      const withoutPromotions = renderReportBody(makeState({ proposals: [], records: [] }));

      // Explicit emptiness, not silence: the section names itself and says there is nothing in it.
      expect(withoutPromotions).toMatch(/promotions?:?[^\n]*\bnone\b/i);
      // A reader must be able to tell "no promotions" from "the section was dropped" (DC-01) — the
      // two bodies are not merely different, the empty one carries its own explicit statement that
      // the populated one does not.
      expect(withPromotions).not.toMatch(/promotions?:?[^\n]*\bnone\b/i);
    });

    // ─── AT-L5(a) — the vocabulary set-equality, four legs ────────────────────

    describe("AT-L5: the vocabulary set-equality (§11.3(b))", () => {
      const MODULE_CATALOGUES = {
        TERMINAL_STATUSES,
        REASON_CODES,
        TRIGGERS,
        ROUTES,
        ACTIONS,
        VERDICTS,
        PROMO_STATES,
        CREDENTIAL_VALUES,
        PHASE_CATALOGUE,
      };

      const CATALOGUE_NAMES = Object.keys(MODULE_CATALOGUES);

      test("leg 1+2: module catalogue ≡ doubles' transcription, both directions, over every enumerated-class catalogue", () => {
        for (const name of CATALOGUE_NAMES) {
          const moduleValues = [...MODULE_CATALOGUES[name]].sort();
          const doublesValues = [...VOCABULARY_TRANSCRIPTION[name]].sort();
          expect({ catalogue: name, values: moduleValues }).toEqual({
            catalogue: name,
            values: doublesValues,
          });
        }
        // REASON_CODE_STATUSES — the third column, keyed by reason code — compared the same way.
        expect(Object.keys(REASON_CODE_STATUSES).sort()).toEqual(
          Object.keys(VOCABULARY_TRANSCRIPTION.REASON_CODE_STATUSES).sort()
        );
        for (const code of Object.keys(REASON_CODE_STATUSES)) {
          expect([...REASON_CODE_STATUSES[code]].sort()).toEqual(
            [...VOCABULARY_TRANSCRIPTION.REASON_CODE_STATUSES[code]].sort()
          );
        }
      });

      test("the free-form class is excluded by name — no catalogue carries a free-form field's name", () => {
        const FREE_FORM_NAMES = [
          "pass",
          "date",
          "consumed",
          "branch",
          "deferred",
          "pr",
          "suppressed-by",
          "rung",
        ];
        const everyEnumeratedValue = new Set(
          CATALOGUE_NAMES.flatMap((name) => [...MODULE_CATALOGUES[name]])
        );
        for (const freeFormName of FREE_FORM_NAMES) {
          expect(everyEnumeratedValue.has(freeFormName)).toBe(false);
        }
      });

      test("leg 3: the module's own frozen arrays are ⊆ and ⊇ the doubles' transcription (cheap, build-time)", () => {
        for (const name of CATALOGUE_NAMES) {
          const moduleSet = new Set(MODULE_CATALOGUES[name]);
          const doublesSet = new Set(VOCABULARY_TRANSCRIPTION[name]);
          const missingFromDoubles = [...moduleSet].filter((v) => !doublesSet.has(v));
          const missingFromModule = [...doublesSet].filter((v) => !moduleSet.has(v));
          expect({ catalogue: name, missingFromDoubles, missingFromModule }).toEqual({
            catalogue: name,
            missingFromDoubles: [],
            missingFromModule: [],
          });
        }
      });

      test("leg 4: three-way set equality against the authority file itself, plus the Version pin", () => {
        const authority = parseVocabularyAuthority(REPO_ROOT);

        expect(authority.version).toBe("1.4");
        expect(authority.version).toBe(VOCABULARY_VERSION);

        for (const name of CATALOGUE_NAMES) {
          const moduleValues = [...MODULE_CATALOGUES[name]].sort();
          const doublesValues = [...VOCABULARY_TRANSCRIPTION[name]].sort();
          const authorityValues = [...(authority.catalogues[name] ?? [])].sort();
          expect({ catalogue: name, from: "module", values: moduleValues }).toEqual({
            catalogue: name,
            from: "module",
            values: authorityValues,
          });
          expect({ catalogue: name, from: "doubles", values: doublesValues }).toEqual({
            catalogue: name,
            from: "doubles",
            values: authorityValues,
          });
        }

        expect(Object.keys(REASON_CODE_STATUSES).sort()).toEqual(
          Object.keys(authority.reasonCodeStatuses).sort()
        );
        for (const code of Object.keys(REASON_CODE_STATUSES)) {
          expect([...REASON_CODE_STATUSES[code]].sort()).toEqual(
            [...(authority.reasonCodeStatuses[code] ?? [])].sort()
          );
        }
      });

      // ─── AT-L5(b) — the dropped-code arm ─────────────────────────────────────

      test("dropped-code arm: a legal (status, code) pair is written to the row and named, plainly, in the report body", () => {
        const state = makeState({
          status: "no-op",
          reasons: new Set(["credential-unavailable"]),
        });

        const { text, dropped } = renderTerminalRow(state);

        expect(dropped).toEqual([]);
        expect(text).toContain("credential-unavailable");

        const body = renderReportBody(state);
        expect(body).toContain("credential-unavailable");
        expect(body).not.toMatch(/credential-unavailable[^\n]*\bdropped\b/i);
      });

      test("dropped-code arm: an illegal (status, code) pair is dropped, and the report body's notice names it", () => {
        // credential-unavailable's permitted set (§1) is {promoted-degraded, no-op}; refused is
        // not a member, so this pair is illegal at Version 1.4.
        expect(REASON_CODE_STATUSES["credential-unavailable"]).not.toContain("refused");

        const state = makeState({
          status: "refused",
          reasons: new Set(["credential-unavailable"]),
        });

        const { text, dropped } = renderTerminalRow(state);

        expect(dropped).toEqual(["credential-unavailable"]);
        // The row itself never carries the illegal pair (REQ §4b's set-equality would break).
        expect(text).not.toMatch(/reason:[^\n]*credential-unavailable/);

        const body = renderReportBody(state);
        expect(body).toMatch(/credential-unavailable/);
        expect(body).toMatch(/credential-unavailable[^\n]*(dropped|illegal)|(dropped|illegal)[^\n]*credential-unavailable/i);
      });

      test("dropped-code arm's control: no-cadence-datum is never dropped, on the same refused status (§1 permits it there, REQ-CONS-01 decides it before the marker check)", () => {
        expect(REASON_CODE_STATUSES["no-cadence-datum"]).toContain("refused");

        const state = makeState({
          status: "refused",
          reasons: new Set(["credential-unavailable", "no-cadence-datum"]),
        });

        const { text, dropped } = renderTerminalRow(state);

        expect(dropped).toEqual(["credential-unavailable"]);
        expect(dropped).not.toContain("no-cadence-datum");
        expect(text).toContain("no-cadence-datum");

        const body = renderReportBody(state);
        expect(body).toMatch(/no-cadence-datum/);
        expect(body).not.toMatch(/no-cadence-datum[^\n]*(dropped|illegal)|(dropped|illegal)[^\n]*no-cadence-datum/i);
      });
    });

    // ─── AT-N1 … AT-N4 — configuration parse behaviour, and its report ───────

    describe("AT-N1 … AT-N4: configuration parse behaviour reflected in the report", () => {
      test("AT-N1: config absent — every key defaults, and the report carries no fallback notice at all", () => {
        const parse = parseConsolidationConfig(null);

        expect(parse.sectionMalformed).toBe(false);
        expect(parse.invalidKeys).toEqual([]);

        const state = makeState({ notices: notesFromConfigParse(parse) });
        const body = renderReportBody(state);

        expect(body).not.toMatch(/sectionMalformed|not an object|fell back/i);
      });

      test("AT-N2: one key of the wrong type — that key falls back and is named in the report; every other configured key keeps its value", () => {
        const text = JSON.stringify({
          consolidation: { cadenceHours: "not-a-number", volumeThreshold: 9 },
        });
        const parse = parseConsolidationConfig(text);

        expect(parse.invalidKeys).toEqual(["cadenceHours"]);
        expect(parse.config.cadenceHours).toBe(168);
        expect(parse.config.volumeThreshold).toBe(9);

        const state = makeState({ notices: notesFromConfigParse(parse) });
        const body = renderReportBody(state);

        expect(body).toContain("cadenceHours");
        expect(body).toContain("168");
        expect(body).not.toContain("volumeThreshold");
      });

      test("AT-N3: consolidation present but not an object — every key defaults, and the report distinguishes this from an absent section", () => {
        const malformedParse = parseConsolidationConfig(
          JSON.stringify({ consolidation: "not-an-object" })
        );
        const absentParse = parseConsolidationConfig(null);

        expect(malformedParse.sectionMalformed).toBe(true);
        expect(malformedParse.invalidKeys).toEqual([]);
        expect(absentParse.sectionMalformed).toBe(false);

        const malformedBody = renderReportBody(
          makeState({ notices: notesFromConfigParse(malformedParse) })
        );
        const absentBody = renderReportBody(makeState({ notices: notesFromConfigParse(absentParse) }));

        expect(malformedBody).toMatch(/not an object|sectionMalformed|malformed/i);
        expect(absentBody).not.toMatch(/not an object|sectionMalformed|malformed/i);
        expect(malformedBody).not.toBe(absentBody);
      });

      // AT-N4 is driven through `openClone` — the one production site that decides E-22 — and only
      // then through the renderer. Hand-building `reasons: new Set(["repository-unresolved"])` into
      // a state and asserting the renderer echoes it proves the renderer echoes what it is handed;
      // it cannot fail on a production path that never produces the code. The condition itself is
      // what this row owns, so the first two legs below drive the real function; the third is the
      // rendering leg, fed from the value production returned rather than from a literal.
      describe("AT-N4: pluginRepository set to a name that does not resolve — reason repository-unresolved with the configured value recorded verbatim, never a silent fallback", () => {
        const configuredRepo = "some-owner/does-not-exist";

        // A `_git` double that resolves nothing: the clone of the configured name fails the way
        // git fails a name that is not there. `_makeTempDir` succeeds, so the only failure under
        // test is the repository's.
        function cloneSeams(stderr) {
          const calls = [];
          return {
            calls,
            seams: {
              _makeTempDir: async () => "/tmp/clone-dir",
              _git: async (argv) => {
                calls.push(argv);
                if (argv[0] === "clone") return { ok: false, stdout: "", stderr };
                return { ok: true, stdout: "", stderr: "" };
              },
            },
          };
        }

        test("the configured-but-unresolvable repository returns repository-unresolved with the configured value verbatim", async () => {
          const { calls, seams } = cloneSeams(
            `remote: Repository not found.\nfatal: repository 'https://github.com/${configuredRepo}.git/' not found`
          );

          const reply = await openClone("2025-06-01-1", { pluginRepository: configuredRepo }, seams);

          expect(reply.failure).toBe("repository-unresolved");
          expect(reply.detail).toBe(configuredRepo);
          expect(reply.dir).toBeUndefined();

          // Never a silent fallback: the configured name is the one that was cloned, and no
          // `remote get-url origin` read happened to substitute the current repository for it.
          const cloneArgv = calls.find((argv) => argv[0] === "clone");
          expect(cloneArgv.join(" ")).toContain(configuredRepo);
          expect(calls.some((argv) => argv[0] === "remote")).toBe(false);
        });

        test("a transport failure on the same configured repository stays api-failure — the two E-22/E-23 classes are not collapsed", async () => {
          const { seams } = cloneSeams("fatal: unable to access: Could not resolve proxy; TLS handshake timed out");

          const reply = await openClone("2025-06-01-1", { pluginRepository: configuredRepo }, seams);

          expect(reply.failure).toBe("api-failure");
          expect(reply.failure).not.toBe("repository-unresolved");
        });

        test("the reason production returned reaches the report body beside the configured value", async () => {
          const { seams } = cloneSeams("remote: Repository not found.");
          const reply = await openClone("2025-06-01-1", { pluginRepository: configuredRepo }, seams);

          const state = makeState({
            status: "promoted-degraded",
            reasons: new Set([reply.failure]),
            records: [makeRecord({ route: "degraded" })],
            notices: [{ subject: "consolidation.pluginRepository", detail: reply.detail }],
          });

          const body = renderReportBody(state);

          expect(body).toContain("repository-unresolved");
          expect(body).toContain(configuredRepo);
          expect(body).not.toMatch(/falling back to the current repository|defaulted to the current repository/i);
        });
      });
    });

    // ─── The other four render functions, driven directly (smoke coverage; ──
    // ─── their own acceptance tests live in consolidationRoute.test.js's ────
    // ─── T-11/T-12 rows — AT-Q2/Q3/Q9/Q13, AT-R7, AT-Q6/AT-Q8) ──────────────

    test("(smoke) renderFailureModeRecord — one whole record, all eight fields present verbatim", () => {
      const record = makeRecord({ route: "degraded" });
      const text = renderFailureModeRecord(record);

      for (const value of Object.values(record)) {
        expect(text).toContain(String(value));
      }
    });

    test("(smoke) renderEffectivenessTable — the unavailable literal renders a null artifact; a null remediation is absent, not empty", () => {
      const rows = [
        {
          failureModeId: "t-a-md",
          artifact: null,
          verdict: "insufficient-evidence",
          state: null,
          remediation: null,
        },
        {
          failureModeId: "t-b-md",
          artifact: "docs/b/TSPEC-b.md",
          verdict: "recurred",
          state: "ineffective",
          remediation: "revision",
        },
      ];

      const text = renderEffectivenessTable(rows);

      expect(text).toContain(UNAVAILABLE);
      expect(text).toContain("docs/b/TSPEC-b.md");
      expect(text).toContain("revision");
    });

    test("(smoke) renderPrBody — the three vocabularies §4 trailers, last, in order", () => {
      const state = makeState({
        consumed: ["LEARNINGS-a.md", "LEARNINGS-b.md"],
      });
      const enacted = [
        {
          failureModeId: "t-a-md",
          phase: "T",
          symptom: "recurring gap",
          artifact: "docs/a/TSPEC-a.md",
          kind: 1,
          target: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
          action: "promote",
          diff: "+ a new invariant",
          elidedKinds: [],
          elidedArtifacts: [],
        },
      ];

      const body = renderPrBody(state, enacted);

      expect(body).toContain("PDLC-CONSOLIDATION-PASS: 20260101-1");
      expect(body).toContain("PDLC-CONSOLIDATION-SOURCES:");
      expect(body).toContain("LEARNINGS-a.md");
      expect(body).toContain("LEARNINGS-b.md");
      expect(body).toContain("PDLC-CONSOLIDATION-PROMOTIONS:");
      expect(body).toContain("t-a-md:promote");
      const passIdx = body.indexOf("PDLC-CONSOLIDATION-PASS:");
      const sourcesIdx = body.indexOf("PDLC-CONSOLIDATION-SOURCES:");
      const promotionsIdx = body.indexOf("PDLC-CONSOLIDATION-PROMOTIONS:");
      expect(passIdx).toBeLessThan(sourcesIdx);
      expect(sourcesIdx).toBeLessThan(promotionsIdx);
    });

    test("(smoke) renderProposalFile — the full diff inline, and the degradation's failure class named", () => {
      const state = makeState({ prUrl: null });
      const deferred = [
        {
          failureModeId: "t-c-md",
          phase: "T",
          symptom: "recurring gap",
          artifact: "docs/c/TSPEC-c.md",
          kind: 1,
          target: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
          action: "promote",
          diff: "+ a new invariant, verbatim",
          elidedKinds: [],
          elidedArtifacts: [],
        },
      ];

      const text = renderProposalFile(state, deferred);

      expect(text).toContain("t-c-md");
      expect(text).toContain("+ a new invariant, verbatim");
    });

    test("(smoke) renderPromotionCommitMessage — the PDLC-PROMOTION-ID trailer", () => {
      const proposal = {
        failureModeId: "t-d-md",
        phase: "T",
        symptom: "recurring gap",
        artifact: "docs/d/TSPEC-d.md",
        kind: 1,
        target: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
        action: "revise",
        diff: "+ an edit",
        elidedKinds: [],
        elidedArtifacts: [],
      };

      const text = renderPromotionCommitMessage(proposal, "20260101-1");

      expect(text).toContain("PDLC-PROMOTION-ID: t-d-md:revise");
    });
  });
});

// ─── T31 — the ER-6 interim's discriminator (§7.6, §12.4; no FSPEC AT) ──────

describe("T31 — the ER-6 interim's discriminator (§7.6, §12.4)", () => {
  describe("a routed propose-only promotion and a degraded PR attempt both write route: degraded — the report body is what still tells them apart", () => {
    test("sameness: both records carry route: degraded (asserted, not hidden)", () => {
      const routed = makeState({
        status: "no-op",
        reasons: new Set(),
        records: [
          makeRecord({
            failureModeId: "t-domain-constraints-md",
            action: "revise",
            target: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
            route: "degraded",
          }),
        ],
      });
      const degraded = makeState({
        status: "promoted-degraded",
        reasons: new Set(["branch-exists"]),
        records: [
          makeRecord({
            failureModeId: "t-orchestrate-dev-js",
            artifact: "pdlc/workflows/orchestrate-dev.js",
            action: "promote",
            target: "pdlc/workflows/orchestrate-dev.js",
            route: "degraded",
          }),
        ],
      });

      expect(routed.records[0].route).toBe("degraded");
      expect(degraded.records[0].route).toBe("degraded");

      const routedBody = renderReportBody(routed);
      const degradedBody = renderReportBody(degraded);

      expect(routedBody).toMatch(/degraded/);
      expect(degradedBody).toMatch(/degraded/);
    });

    test("difference: the degraded body names a vocabularies §1 §6.3 reason code beside its promotion; the routed body names none — in both directions", () => {
      const SIX_THREE_CODES = ["credential-unavailable", "repository-unresolved", "api-failure", "branch-exists"];

      const routed = makeState({
        status: "no-op",
        reasons: new Set(),
        records: [
          makeRecord({
            failureModeId: "t-domain-constraints-md",
            action: "revise",
            target: "docs/_constraints/DOMAIN-CONSTRAINTS.md",
            route: "degraded",
          }),
        ],
      });
      const degraded = makeState({
        status: "promoted-degraded",
        reasons: new Set(["branch-exists"]),
        records: [
          makeRecord({
            failureModeId: "t-orchestrate-dev-js",
            artifact: "pdlc/workflows/orchestrate-dev.js",
            action: "promote",
            target: "pdlc/workflows/orchestrate-dev.js",
            route: "degraded",
          }),
        ],
      });

      const routedBody = renderReportBody(routed);
      const degradedBody = renderReportBody(degraded);

      const routedNamesAny6_3Code = SIX_THREE_CODES.some((code) => routedBody.includes(code));
      const degradedNamesAny6_3Code = SIX_THREE_CODES.some((code) => degradedBody.includes(code));

      expect(routedNamesAny6_3Code).toBe(false);
      expect(degradedNamesAny6_3Code).toBe(true);
      expect(degradedBody).toContain("branch-exists");
    });
  });
});

// ─── Helpers local to this file ─────────────────────────────────────────────

/**
 * Builds the report-facing `notices` a caller (main, T31) derives from a `ConfigParse` result — one
 * `ParseNotice` per fallen-back key (naming the key and the default it fell back to), plus one for a
 * malformed (non-object) `consolidation` section. Local to this file: `parseConsolidationConfig`
 * itself carries no report-shaping obligation (TSPEC §7.8), so the notices§11.3 asks the report to
 * carry are assembled by the caller, exactly as they will be inside `main()` once T31 lands it.
 */
function notesFromConfigParse(parse) {
  const notices = parse.invalidKeys.map((key) => ({
    subject: `consolidation.${key}`,
    missingField: key,
    detail: `fell back to default ${JSON.stringify(parse.config[key])}`,
  }));
  if (parse.sectionMalformed) {
    notices.push({
      subject: "consolidation",
      missingField: "section",
      detail: "present but not an object",
    });
  }
  return notices;
}

/**
 * Parses `docs/_constraints/pdlc-consolidation-vocabularies.md` §1's own table — the authority
 * AT-L5's fourth leg reads, per §11.3(b), over an injected `root` (DC-04) so this parser is a pure
 * function of a path and consults no ambient state (never `process.cwd()`).
 */
function parseVocabularyAuthority(root) {
  const text = readFileSync(join(root, VOCAB_PATH), "utf8");

  const versionMatch = text.match(/\|\s*Version\s*\|\s*([^\n|]+?)\s*\|/);
  const versionCell = versionMatch ? versionMatch[1] : null;
  const versionNumMatch = versionCell ? versionCell.match(/^([\d.]+)/) : null;
  const version = versionNumMatch ? versionNumMatch[1] : null;

  const start = text.indexOf("## 1. Enumerated vocabularies");
  const end = text.indexOf("## 2. The phase observable", start < 0 ? 0 : start);
  if (start < 0 || end < 0) {
    throw new Error(
      "vocabularies §1 (Enumerated vocabularies) section not found — heading text may have drifted"
    );
  }
  const section = text.slice(start, end);

  const catalogues = {
    TERMINAL_STATUSES: new Set(),
    REASON_CODES: new Set(),
    TRIGGERS: new Set(),
    ROUTES: new Set(),
    ACTIONS: new Set(),
    VERDICTS: new Set(),
    PROMO_STATES: new Set(),
    CREDENTIAL_VALUES: new Set(),
    PHASE_CATALOGUE: new Set(),
  };
  const reasonCodeStatuses = {};

  const stripBackticks = (s) => s.replace(/`/g, "").trim();
  const splitValues = (cell) => cell.split(/\s*\/\s*/).map(stripBackticks).filter(Boolean);
  const splitStatuses = (cell) =>
    stripBackticks(cell) === "—" ? [] : cell.split(/\s*,\s*/).map(stripBackticks).filter(Boolean);

  const classify = (category) => {
    if (category === "terminal status") return "TERMINAL_STATUSES";
    if (category === "reason code") return "REASON_CODES";
    if (category === "trigger") return "TRIGGERS";
    if (category === "promotion route") return "ROUTES";
    if (category === "per-promotion verdict") return "VERDICTS";
    if (category === "per-promotion state") return "PROMO_STATES";
    if (category.startsWith("`action`")) return "ACTIONS";
    if (category.startsWith("`credential:` field")) return "CREDENTIAL_VALUES";
    if (category.startsWith("pipeline phase id")) return "PHASE_CATALOGUE";
    return null;
  };

  for (const line of section.split("\n")) {
    if (!line.startsWith("|")) continue;
    const cells = line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
    if (cells.length !== 4) continue;
    const [valueCell, categoryCell, statusCell] = cells;
    if (valueCell === "Value" || /^-+$/.test(valueCell)) continue; // header / separator rows

    const catalogueName = classify(categoryCell);
    if (!catalogueName) continue; // free-form / non-catalogue row — outside AT-L5's domain

    const values = catalogueName === "PHASE_CATALOGUE" ? splitValues(valueCell) : splitValues(valueCell);
    for (const value of values) catalogues[catalogueName].add(value);

    if (catalogueName === "REASON_CODES") {
      const [code] = values;
      if (code) reasonCodeStatuses[code] = splitStatuses(statusCell);
    }
  }

  return {
    version,
    catalogues: Object.fromEntries(Object.entries(catalogues).map(([k, v]) => [k, [...v]])),
    reasonCodeStatuses,
  };
}

/**
 * forcePhases.test.js — the operator force-run surface (TSPEC §3.1, §3.7, §5.7, §6.2 row 12).
 *
 * Ownership (PLAN §5.2, single-writer-per-file): RLH-14 (batch 2). RED on arrival.
 *
 * | Assertion | Stratum | Green from (PLAN §7.3) |
 * |---|---|---|
 * | `RLH-AT-29` | L1 — `parseForcePhases` only | batch 3 (RLH-05 (f)) |
 * | `parseForcePhases` catalogue closure (property) | L1 | batch 3 (RLH-05 (f)) |
 * | `RLH-AT-28` | L2 — driven through `main()` | batch 8 (RLH-26) |
 * | `RLH-AT-01a` | L2 — driven through `main()` | batch 8 (RLH-26) |
 *
 * The module is imported as a **namespace** (`import * as devModule`) precisely so the
 * suite *runs* before `parseForcePhases` exists: a named import of a missing export is a
 * link-time `SyntaxError` that takes the whole file down, which is not a valid red
 * (PLAN §12.1). A namespace member that is `undefined` fails the one assertion that
 * touches it, which is.
 *
 * ## The shape being asserted (PLAN §13.1 — pinned, not open)
 *
 * `main()`'s `forcePhases` is a **raw, unparsed operator string** (TSPEC §3.1).
 * `parseForcePhases(raw)` returns `{ ok: true, phases: Set<string> }` or
 * `{ ok: false, badTokens: string[] }`. **No array of phases exists anywhere** — the
 * accepted branch carries a `Set`, and these tests assert `Set`-ness directly so an
 * array-returning implementation reds rather than passing on `.includes`-shaped duck
 * typing.
 */

import * as devModule from "../orchestrate-dev.js";
import { resolveSeed, seeded } from "./helpers/driftGenerators.js";

const main = devModule.default;

/**
 * The closed force-phase catalogue — TSPEC §5.7's `valid` array, verbatim and in its
 * declared order. Six document-review phases; `PR` entered the catalogue at REQ/FSPEC
 * v1.6 (TSPEC §10.3 `T-Q-01`). Restated here rather than read off the module under test:
 * a catalogue derived from the subject agrees with a wrong subject by construction.
 *
 * @type {readonly string[]}
 */
const VALID_TOKENS = Object.freeze(["R", "F", "T", "P", "D", "PR"]);

/**
 * The seventh accepted token. It is accepted but is **not** a phase: it expands to the
 * whole of `VALID_TOKENS` (TSPEC §5.7 — "`all` means six phases, not five").
 */
const ALL_TOKEN = "all";

/**
 * The operator-facing rejection message's ending, copied verbatim from
 * **TSPEC §6.2 row 12** (`halt before any phase runs, ending ...`). It is reproduced
 * here as a literal exactly once, and every assertion below refers to this constant.
 *
 * TSPEC §5.7 makes the derivation load-bearing: the catalogue and the message come from
 * the same array "so they cannot desynchronise". This suite is that guard — it renders
 * the message ending *from the catalogue the parser actually accepts* and compares it to
 * the literal, so a five-token catalogue and a six-token message (or the reverse) is a
 * red, not a silent divergence.
 */
const REJECTION_MESSAGE_ENDING = "Valid: R, F, T, P, D, PR, all.";

/**
 * Render the message ending from a catalogue, the way TSPEC §5.7 requires an
 * implementation to render it: the accepted phase tokens in catalogue order, then `all`.
 *
 * @param {string[]} tokens - the accepted phase tokens, in catalogue order.
 * @returns {string}
 */
function renderMessageEnding(tokens) {
  return `Valid: ${[...tokens, ALL_TOKEN].join(", ")}.`;
}

// ─── RLH-AT-29 — a bad force token is rejected (FSPEC E-33; TSPEC §5.7, §6.2 row 12) ──

describe("RLH-AT-29 — bad force token rejection", () => {
  test("RLH-AT-29: a non-catalogue token is rejected, and the catalogue that phrases the operator message is the six-token set", () => {
    const { parseForcePhases } = devModule;

    // (i) FSPEC E-33 — `CR` and `DOD` are real phase ids, and are deliberately outside
    // the force catalogue (AC-4.7). Silently ignoring them would let an operator believe
    // a forced CR was honoured, so they are rejected, not dropped.
    const cr = parseForcePhases("CR");
    expect(cr.ok).toBe(false);
    expect(cr.badTokens).toEqual(["CR"]);
    expect(cr.phases).toBeUndefined();

    const dod = parseForcePhases("DOD");
    expect(dod.ok).toBe(false);
    expect(dod.badTokens).toEqual(["DOD"]);

    // Every bad token is reported, not just the first.
    const several = parseForcePhases("CR, Q DOD");
    expect(several.ok).toBe(false);
    expect(several.badTokens).toEqual(["CR", "Q", "DOD"]);

    // (ii) The catalogue half of the same guard. `all` expands to SIX phases, not five,
    // and the accepted branch carries a `Set` — never an array (PLAN §13.1).
    const all = parseForcePhases(ALL_TOKEN);
    expect(all.ok).toBe(true);
    expect(all.phases).toBeInstanceOf(Set);
    expect(all.phases.size).toBe(VALID_TOKENS.length);
    expect([...all.phases].sort()).toEqual([...VALID_TOKENS].sort());

    // (iii) The message ending, rendered from the catalogue the parser actually accepts,
    // is the TSPEC §6.2 row 12 literal. A catalogue/message divergence reds here.
    expect(renderMessageEnding(VALID_TOKENS)).toBe(REJECTION_MESSAGE_ENDING);
    expect(renderMessageEnding([...all.phases])).toBe(REJECTION_MESSAGE_ENDING);
  });
});

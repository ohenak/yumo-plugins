// learningsDocSignature.test.js — CODE_REVIEW v2 §1 G1 (DoD criterion 6(a)).
//
// LI-T-DOC-1: an operator/maintainer-facing disclosure oracle for the LEARNINGS INJECTION
// REGION. Where a function in the region carries a JSDoc `@param` whose type is an object
// literal, the key set that literal names must equal the key set the function actually
// destructures. `selectLearnings`'s doc named a third key (`feature`) the signature had already
// stopped accepting — a stale disclosure that reads as production contract.
//
// The oracle is DERIVED, not transcribed: it re-reads `orchestrate-dev.js` and compares doc to
// signature for EVERY member of the region, so a future member that drifts reds here too. It is
// failing-capable by construction — planting a bogus key in either half is what the negative
// control below asserts.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(path.join(HERE, "..", "orchestrate-dev.js"), "utf8");

const REGION_START = "// === LEARNINGS INJECTION REGION START ===";
const REGION_END = "// === LEARNINGS INJECTION REGION END ===";

/** The region source between the two sentinel comments. */
function learningsRegion(source) {
  const from = source.indexOf(REGION_START);
  const to = source.indexOf(REGION_END);
  if (from < 0 || to < 0 || to <= from) throw new Error("region sentinels not found");
  return source.slice(from, to);
}

/** Slice from `open` (index of an opening bracket) to its matching close, inclusive. */
function balancedSlice(text, open) {
  const pairs = { "{": "}", "(": ")" };
  const closer = pairs[text[open]];
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === text[open]) depth += 1;
    else if (text[i] === closer) {
      depth -= 1;
      if (depth === 0) return text.slice(open, i + 1);
    }
  }
  throw new Error("unbalanced brackets");
}

/** Top-level (depth-1) property names of an object-literal-ish body `{ a: X, b }`. */
function topLevelKeys(objectText) {
  const inner = objectText.slice(1, -1);
  const parts = [];
  let depth = 0;
  let buf = "";
  for (const ch of inner) {
    if ("{([<".includes(ch)) depth += 1;
    else if ("})]>".includes(ch)) depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
  }
  parts.push(buf);
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.split(/[:=]/)[0].trim().replace(/\?$/, ""))
    .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));
}

/**
 * Every function declaration in `regionText`, paired with the keys its JSDoc object-literal
 * `@param`s name and the keys it destructures.
 * @param {string} regionText
 * @returns {Array<{name: string, docKeys: string[]|null, signatureKeys: string[]}>}
 */
function documentedFunctions(regionText) {
  const decl = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm;
  const found = [];
  let match;
  while ((match = decl.exec(regionText)) !== null) {
    const name = match[1];
    const parenAt = regionText.indexOf("(", match.index + match[0].length - 1);
    const params = balancedSlice(regionText, parenAt);
    const braceAt = params.indexOf("{");
    const signatureKeys = braceAt < 0 ? [] : topLevelKeys(balancedSlice(params, braceAt));

    // The JSDoc block immediately preceding the declaration, if any.
    const before = regionText.slice(0, match.index);
    const openAt = before.lastIndexOf("/**");
    const closeAt = before.lastIndexOf("*/");
    const attached =
      openAt >= 0 && closeAt > openAt && before.slice(closeAt + 2).trim() === ""
        ? before.slice(openAt, closeAt + 2)
        : null;

    let docKeys = null;
    if (attached) {
      const paramAt = attached.indexOf("@param {{");
      if (paramAt >= 0) {
        const objectAt = attached.indexOf("{", attached.indexOf("{", paramAt) + 1);
        const body = balancedSlice(attached, objectAt).replace(/^\s*\*\s?/gm, "");
        docKeys = topLevelKeys(body);
      }
    }
    found.push({ name, docKeys, signatureKeys });
  }
  return found;
}

const REGION = learningsRegion(SOURCE);

test("LI-T-DOC-1: the region is found and carries at least one object-literal-@param function", () => {
  const fns = documentedFunctions(REGION);
  expect(fns.length).toBeGreaterThan(3);
  expect(fns.filter((f) => f.docKeys !== null).length).toBeGreaterThan(0);
});

test("LI-T-DOC-1: every documented @param key set equals the destructured key set", () => {
  const drifted = documentedFunctions(REGION)
    .filter((f) => f.docKeys !== null)
    .filter((f) => [...f.docKeys].sort().join(",") !== [...f.signatureKeys].sort().join(","))
    .map((f) => `${f.name}: doc=[${f.docKeys}] signature=[${f.signatureKeys}]`);

  expect(drifted).toEqual([]);
});

test("LI-T-DOC-1: selectLearnings's doc names exactly the two keys it accepts", () => {
  const selectLearnings = documentedFunctions(REGION).find((f) => f.name === "selectLearnings");
  expect(selectLearnings.signatureKeys.sort()).toEqual(["entries", "thresholds"]);
  expect(selectLearnings.docKeys.sort()).toEqual(["entries", "thresholds"]);
});

test("LI-T-DOC-1 negative control: a planted stale doc key is detected", () => {
  const planted = REGION.replace(
    "@param {{entries: object[], thresholds: object}} arg",
    "@param {{entries: object[], feature: string, thresholds: object}} arg",
  );
  expect(planted).not.toEqual(REGION);

  const drifted = documentedFunctions(planted)
    .filter((f) => f.docKeys !== null)
    .filter((f) => [...f.docKeys].sort().join(",") !== [...f.signatureKeys].sort().join(","))
    .map((f) => f.name);

  expect(drifted).toEqual(["selectLearnings"]);
});

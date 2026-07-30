/**
 * digest-vectors.js — the four SHA-256 known-answer vectors of TSPEC §8.2 / PROPERTIES §6.2.
 *
 * Ownership (PLAN §7.2, single-writer-per-file): RLH-06 (batch 2). Consumed by
 * `__tests__/approvalHash.test.js` only.
 *
 * **Literals, and nothing else.** Every digest below was computed *externally* — outside this
 * repository's test process, with a reference SHA-256 — and pasted in. This file deliberately
 * does not `require`/`import` `crypto`, and no consumer may "simplify" it into a live
 * `crypto.createHash("sha256")` call: that would compare the subject against itself and would
 * stay green if `sha256Hex` reached for `crypto`, which TSPEC C-2 forbids and the workflow
 * runtime cannot load at all (PROPERTIES §6.2, "Why externally").
 *
 * **The digests are over the CANONICAL bytes.** TSPEC §5.3 applies `canonicaliseForDigest`
 * *inside* `sha256Hex`, so `sha256Hex(input)` digests `canonical`, never `input`. Each vector
 * therefore records both, and the digest is SHA-256 over `utf8Bytes(canonical)`. The canonical
 * form of every vector below differs from its input by exactly the N-2 rule (one forced
 * trailing `\n`); CRLF collapsing (N-1) is exercised by `RLH-AT-14`, not by these vectors.
 *
 * **Vectors 3 and 4 are the point.** PLAN §4.2 records that the multi-byte UTF-8 and
 * surrogate-pair vectors are the *only* falsifier of a wrong hand-rolled `utf8Bytes`: an
 * implementation that hashes UTF-16 code units, or that emits a lone surrogate's code point
 * instead of the pair's scalar value, passes vectors 1 and 2 and reds on 3 and 4. Each records
 * its input as escaped code points and its expected UTF-8 byte string in hex, so a wrong
 * encoding can be diagnosed without recomputing anything.
 *
 * Every `input` and `canonical` string is written with `\u` escapes wherever a byte is not
 * printable ASCII, so the file is byte-stable under any editor or `.gitattributes` setting.
 */

/**
 * @typedef {Object} DigestVector
 * @property {string} id           - stable vector id, used in the jest failure message.
 * @property {string} label        - what class of input this vector pins.
 * @property {string} input        - the string handed to `sha256Hex` / `approvalHashOf`.
 * @property {string} canonical    - `canonicaliseForDigest(input)`; what is actually digested.
 * @property {string} utf8Hex      - `utf8Bytes(canonical)` as lowercase hex — the encoder oracle.
 * @property {number} utf8Length   - `utf8Bytes(canonical).length`.
 * @property {string} sha256Hex    - the externally computed 64 lowercase hex digest.
 * @property {string} approvalHash - `sha256:` + `sha256Hex` (TSPEC §5.3's prefixed form).
 */

/** @type {ReadonlyArray<DigestVector>} */
export const DIGEST_VECTORS = Object.freeze([
  Object.freeze({
    id: "V1-empty",
    label: "the empty string — canonicalises to a lone LF, so the answer is NOT sha256('')",
    // input: "" (zero code points)
    input: "",
    // canonical: "\n" — N-2 forces exactly one trailing newline onto an empty text.
    canonical: "\n",
    utf8Hex: "0a",
    utf8Length: 1,
    // sha256("\n"). The famous sha256("") is e3b0c442…b855; a subject returning THAT has
    // skipped the canonicalisation §5.3 puts inside the digest, and this vector says so.
    sha256Hex: "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b",
    approvalHash: "sha256:01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b",
  }),
  Object.freeze({
    id: "V2-ascii",
    label: "pure ASCII — one byte per code point; passes under every wrong encoder",
    // input code points: U+0054 'T' … U+0067 'g'; the standard pangram, 43 ASCII characters.
    input: "The quick brown fox jumps over the lazy dog",
    canonical: "The quick brown fox jumps over the lazy dog\n",
    utf8Hex:
      "54686520717569636b2062726f776e20666f78206a756d7073206f76657220746865206c617a7920646f670a",
    utf8Length: 44,
    sha256Hex: "c03905fcdab297513a620ec81ed46ca44ddb62d41cbbd83eb4a5a3592be26a69",
    approvalHash: "sha256:c03905fcdab297513a620ec81ed46ca44ddb62d41cbbd83eb4a5a3592be26a69",
  }),
  Object.freeze({
    id: "V3-multibyte",
    label: "multi-byte UTF-8 — 2-byte and 3-byte sequences, no surrogate pair",
    // input code points, in order:
    //   U+0063 U+0061 U+0066 U+00E9 U+0020 U+2014 U+0020 U+65E5 U+672C U+8A9E U+3067 U+3059
    //   i.e. "caf" + LATIN SMALL LETTER E WITH ACUTE, SPACE, EM DASH, SPACE, then the five
    //   CJK/kana code points U+65E5 U+672C U+8A9E U+3067 U+3059.
    //   - 12 code points, 12 UTF-16 code units, 25 UTF-8 bytes (26 once N-2 adds the LF).
    input: "caf\u00E9 \u2014 \u65E5\u672C\u8A9E\u3067\u3059",
    canonical: "caf\u00E9 \u2014 \u65E5\u672C\u8A9E\u3067\u3059\n",
    utf8Hex: "636166c3a920e2809420e697a5e69cace8aa9ee381a7e381990a",
    utf8Length: 26,
    sha256Hex: "118339730d011864bb20846089d1f5a2fce81970fa741c6fbd2a5e8fb28c2dca",
    approvalHash: "sha256:118339730d011864bb20846089d1f5a2fce81970fa741c6fbd2a5e8fb28c2dca",
  }),
  Object.freeze({
    id: "V4-surrogate",
    label: "surrogate-pair emoji — two astral code points; the UTF-16 falsifier",
    // input code points, in order:
    //   U+0072 U+006F U+0063 U+006B U+0065 U+0074 U+0020 U+1F680 U+0020
    //   U+0066 U+006C U+0061 U+0073 U+006B U+0020 U+1F9EA
    //   i.e. "rocket " + ROCKET + " flask " + TEST TUBE.
    //   16 code points but 18 UTF-16 code units — each astral character is stored as the
    //   surrogate pair (U+D83D U+DE80) / (U+D83E U+DDEA). A `utf8Bytes` that walks code UNITS
    //   emits two 3-byte CESU-8 sequences (ed a0 bd ed ba 80) where UTF-8 requires the single
    //   4-byte f0 9f 9a 80, and reds here and nowhere else.
    input: "rocket \uD83D\uDE80 flask \uD83E\uDDEA",
    canonical: "rocket \uD83D\uDE80 flask \uD83E\uDDEA\n",
    utf8Hex: "726f636b657420f09f9a8020666c61736b20f09fa7aa0a",
    utf8Length: 23,
    sha256Hex: "726015d4e18c5469095debbdbcdccf61b27c7b4a42d83eb25c43c64c437209c5",
    approvalHash: "sha256:726015d4e18c5469095debbdbcdccf61b27c7b4a42d83eb25c43c64c437209c5",
  }),
]);

/** Lookup by `id`, so a test names the vector it means rather than an array index. */
export function vector(id) {
  const found = DIGEST_VECTORS.find((v) => v.id === id);
  if (!found) {
    throw new Error(`digest-vectors: no vector with id ${JSON.stringify(id)}`);
  }
  return found;
}

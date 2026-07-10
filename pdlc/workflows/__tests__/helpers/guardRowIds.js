// Shared row-id registry for the harden-harvest-guard matrix suite (TSPEC § 6.3).
//
// This module lives in the jest-ignored helpers dir (see package.json
// `testPathIgnorePatterns` → "/__tests__/helpers/"), so it ships no test of its
// own. It is consumed by the matrix meta-tests in guardMatrix.test.js
// (self-audit meta-tests 1, 2) and the M33 G6 re-run parameterization.

// Every row id of the REQ v1.7 Canonical Block/Allow Matrix M-side: "M01".."M90"
// (strings, zero-padded to two digits). Exactly 90 entries.
export const M_ROWS = Array.from({ length: 90 }, (_, i) =>
  `M${String(i + 1).padStart(2, '0')}`,
);

// Every row id of the REQ v1.7 Canonical Block/Allow Matrix S-side: "S01".."S07".
export const S_ROWS = Array.from({ length: 7 }, (_, i) =>
  `S${String(i + 1).padStart(2, '0')}`,
);

// The maintained copy of the REQ v1.7 row M33 G6 re-run enumeration. This is the
// SINGLE NAMED COMPARISON SOURCE for the M33 re-run meta-test (TE F-07b) — the
// M33 parameterized it.each and meta-test (2) both compare against this array
// and nothing else. Copied verbatim from REQ-harden-harvest-guard.md v1.7, row
// M33:
//
//   "re-run M01, M02, M04–M24, M44–M54, M60–M64, M66–M67, M73–M74,
//    M79–M80, M82, M84–M90"
//
// Every range above is expanded explicitly below so drift against the REQ is a
// visible line-level diff. Keep this list in sync with REQ v1.7 row M33.
export const M33_RERUN_IDS = [
  'M01', 'M02',
  // M04–M24
  'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12', 'M13',
  'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24',
  // M44–M54
  'M44', 'M45', 'M46', 'M47', 'M48', 'M49', 'M50', 'M51', 'M52', 'M53', 'M54',
  // M60–M64
  'M60', 'M61', 'M62', 'M63', 'M64',
  // M66–M67
  'M66', 'M67',
  // M73–M74
  'M73', 'M74',
  // M79–M80
  'M79', 'M80',
  // M82
  'M82',
  // M84–M90
  'M84', 'M85', 'M86', 'M87', 'M88', 'M89', 'M90',
];

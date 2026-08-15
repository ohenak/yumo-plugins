// The write-replaying transport double (T49, BR-PARITY-5). See TSPEC §7.3 and
// PROPERTIES PROP-PARITY-5/8, PROP-SUITE-11..14 for the contract this file
// implements; `parity.test.js` is the first (and pinning) caller.
//
// `createReplayDouble({ cwd, feature, rules })` returns `{ transport, createdFiles }`.
// `transport.dispatch(prompt, opts)` parses the skill from the
// `--- BEGIN ROLE DEFINITION: {skill} ---` marker the real adapter composes
// (proven live by `smoke.test.js`), matches it against `rules`, and:
//
//   - for a review rule (`{ skill, isReview: true, roleSlug }`): parses
//     `doc`/`phase`/`feature` from the same "Review the document at ... This
//     is iteration N." text, but NEVER trusts the captured iteration
//     (PROP-PARITY-8) — the round is derived from the directory listing the
//     way `deriveRoundWindow` (`orchestrate-dev.js:6366`) does: starting at
//     round 1, the first round whose `CROSS-REVIEW-{roleSlug}-{docType}-vN.md`
//     does not already exist under `cwd` is the one written.
//   - for a non-review rule (`{ skill, write(cwd) => [{path, content}],
//     responseText() => string }`): performs exactly those writes, once.
//   - every write is appended to `createdFiles` as
//     `{ path, round, skill, contentAtWrite, ts }` — an APPEND-ONLY log
//     (PROP-SUITE-14). `contentAtWrite` is the double's own bytes at the
//     moment of writing, never re-read from disk later, so a downstream
//     module append (the approval anchors) can never leak into it
//     (BR-PARITY-5, PROP-SUITE-13).
//   - the double never writes `APPROVAL-HASH:` / `REVIEWED-COMMIT:` under any
//     rule — those are the module's own append, not the double's.

import path from "node:path";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";

const ROLE_MARKER = /--- BEGIN ROLE DEFINITION: ([a-z-]+) ---/;
const REVIEW_LINE =
  /Review the document at (\S+) for phase (\S+) of feature (\S+)\. This is iteration (\d+)\./;

/** Feature-relative CROSS-REVIEW path for a given round, never trusting the caller's claimed iteration. */
function crossReviewRelPath(feature, roleSlug, docType, round) {
  return `docs/${feature}/CROSS-REVIEW-${roleSlug}-${docType}-v${round}.md`;
}

/** Derives docType from a document's basename — the leading run of uppercase letters before the first hyphen. */
function docTypeOf(docPath) {
  const base = path.basename(docPath);
  const m = /^([A-Z]+)-/.exec(base);
  return m ? m[1] : base;
}

/** The double's own fixture bytes for a review creation event. Never carries an approval anchor. */
function reviewFixtureText(roleSlug, docType, round, doc) {
  return [
    `# Cross-Review — ${roleSlug} — ${docType} v${round}`,
    "",
    `Scope: ${doc}`,
    "",
    "## Findings",
    "No blocking findings (replay double fixture).",
    "",
    "## Verdict",
    "",
    "VERDICT: Approved",
    '{"high": 0, "medium": 0, "low": 0}',
    "",
  ].join("\n");
}

export function createReplayDouble({ cwd, feature, rules = [] }) {
  const createdFiles = [];

  const writeOne = (relPath, content, { skill, round = null } = {}) => {
    const abs = path.join(cwd, relPath);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
    createdFiles.push({ path: relPath, round, skill, contentAtWrite: content, ts: Date.now() });
  };

  /** Derives the next unwritten round for (roleSlug, docType) from the directory listing, never from the caller. */
  const nextRound = (roleSlug, docType) => {
    let round = 1;
    while (existsSync(path.join(cwd, crossReviewRelPath(feature, roleSlug, docType, round)))) {
      round += 1;
    }
    return round;
  };

  async function dispatch(prompt /*, opts */) {
    const roleMatch = ROLE_MARKER.exec(prompt);
    const skill = roleMatch ? roleMatch[1] : "unknown";
    const rule = rules.find((r) => r.skill === skill);

    if (!rule) {
      return { text: "ok", sessionId: "replay-double" };
    }

    if (rule.isReview) {
      const reviewMatch = REVIEW_LINE.exec(prompt);
      if (!reviewMatch) {
        return { text: "ok", sessionId: "replay-double" };
      }
      const [, doc] = reviewMatch;
      const docType = docTypeOf(doc);
      const round = nextRound(rule.roleSlug, docType);
      const relPath = crossReviewRelPath(feature, rule.roleSlug, docType, round);
      const content = reviewFixtureText(rule.roleSlug, docType, round, doc);
      writeOne(relPath, content, { skill, round });
      return {
        text: `Reviewed ${doc}.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`,
        sessionId: "replay-double",
      };
    }

    const writes = typeof rule.write === "function" ? rule.write(cwd) : [];
    for (const { path: relPath, content } of writes) {
      writeOne(relPath, content, { skill, round: null });
    }
    const text = typeof rule.responseText === "function" ? rule.responseText() : "ok";
    return { text, sessionId: "replay-double" };
  }

  return { transport: { dispatch }, createdFiles };
}

// Version resolution ladder (TSPEC §6.3/§6.4, PROP-VER-1..9, PROP-VER-16).
//
// `resolveVersion()` is pure: no fs, no exec, no clock. It takes a store
// listing, a `readEngineConfig`-shaped config read result, the `--dev` flag,
// an env snapshot and an `EngineLocation` record, and returns a total
// `ResolutionDecision` over the eight branches (0-7) the ladder table names.
// Every branch, including the three that succeed, produces a non-empty
// `announcement` (BR-4.4, PROP-VER-2) rendered through the `lib/catalogue.mjs`
// message seam so the same string is what an operator actually sees.

import path from "node:path";
import { message } from "./catalogue.mjs";
import { parseVersion, compare } from "./handshake.mjs";

/** @param {string[]} listing */
function highestOf(listing) {
  let best = null;
  for (const name of listing) {
    const v = parseVersion(name);
    if (!v) continue;
    if (best === null || compare(v, best.parsed) > 0) best = { name, parsed: v };
  }
  return best ? best.name : null;
}

function refuse(id, params) {
  const text = message(id, params);
  return { kind: "refuse", version: null, root: null, announcement: text, refusal: { id, text } };
}

function devConjunctFailure(location) {
  if (!location.isCheckout) {
    return "the running engine is not inside a git checkout of this repo";
  }
  const expectedPluginRoot = path.join(location.checkoutRoot, "pdlc");
  if (location.pluginRoot !== expectedPluginRoot) {
    return (
      `the resolved plugin root ("${location.pluginRoot}") does not match the checkout's ` +
      `pdlc/ ("${expectedPluginRoot}")`
    );
  }
  return "the --dev declaration is incomplete";
}

/**
 * @param {{listing: string[], configResult: object, dev: boolean, env: object,
 *   location: {enginePath: string, isCheckout: boolean, checkoutRoot: string, pluginRoot: string|null}}} args
 * @returns {{kind: "dev"|"pin"|"latest"|"refuse", version: string|null, root: string|null,
 *   announcement: string, refusal: {id: string, text: string}|null}}
 */
export function resolveVersion({ listing, configResult, dev, env, location }) {
  void env; // reserved input (§6.3's declared shape); no branch reads it yet.

  const engine = configResult && configResult.engine;

  // Branch 0: a corrupt config file refuses before any pin check (§6.4).
  if (engine && engine.state === "unreadable") {
    return refuse("config.unreadable", { path: engine.path, error: engine.error });
  }

  // Branches 1-2: --dev is decided next, ahead of pin/latest (dev ≻ pin ≻ latest, PROP-VER-1).
  if (dev) {
    const expectedPluginRoot = path.join(location.checkoutRoot || "", "pdlc");
    const conjunctsOk = location.isCheckout && location.pluginRoot === expectedPluginRoot;
    if (conjunctsOk) {
      const text = message("version.announce-dev", { root: location.enginePath });
      return { kind: "dev", version: null, root: null, announcement: text, refusal: null };
    }
    return refuse("version.dev-incomplete", { reason: devConjunctFailure(location) });
  }

  // Branches 3-5: a declared pin.
  const pinVersion =
    engine && engine.state === "no-pin" && engine.config && "version" in engine.config
      ? engine.config.version
      : undefined;

  if (pinVersion !== undefined) {
    if (!parseVersion(pinVersion)) {
      return refuse("version.pin-malformed", { value: String(pinVersion) });
    }
    if (!listing.includes(pinVersion)) {
      const installed = listing.length > 0 ? listing.join(", ") : "none";
      return refuse("version.pin-missing", { version: pinVersion, installed });
    }
    const text = message("version.announce-pin", { version: pinVersion });
    return { kind: "pin", version: pinVersion, root: null, announcement: text, refusal: null };
  }

  // Branches 6-7: no pin declared.
  const latest = highestOf(listing);
  if (latest === null) {
    return refuse("store.empty", undefined);
  }
  const text = message("version.announce-latest", { version: latest });
  return { kind: "latest", version: latest, root: null, announcement: text, refusal: null };
}

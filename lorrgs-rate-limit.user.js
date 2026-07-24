// ==UserScript==
// @name        Lorrgs copy counter reset
// @namespace   Mangelspec
// @description Reset the per-log copy counter on Lorrgs.io so the Copy Note feature is never rate-limited while testing.
// @match       https://lorrgs.io/*
// @version     2
// @grant       none
// @run-at      document-start
// @downloadURL https://raw.githubusercontent.com/MangelSpec/tampermonkey-scripts/main/lorrgs-note-formatter.user.js
// @updateURL   https://raw.githubusercontent.com/MangelSpec/tampermonkey-scripts/main/lorrgs-note-formatter.user.js
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "copynote_usage"; // where Lorrgs stores its copy counter
  const TAG = "[lorrgs-formatter]";

  // Lorrgs keeps its copy counter in localStorage["copynote_usage"] as a JSON
  // array of { key, ts }. We patch Storage.prototype so BOTH the read and the
  // write are no-ops for that one key: getItem returns null and setItem drops
  // the call. The counter is therefore always seen as empty, remainingUses
  // stays at its max (3), and copies are never gated or captcha'd.
  // We patch the prototype (not the instance) so every call path is caught,
  // at document-start before the site's bundle loads.
  const protoGetItem = Storage.prototype.getItem;
  const protoSetItem = Storage.prototype.setItem;
  Storage.prototype.getItem = function (key) {
    if (key === STORAGE_KEY) return null; // pretend the counter never exists
    return protoGetItem.call(this, key);
  };
  Storage.prototype.setItem = function (key, value) {
    if (key === STORAGE_KEY) return; // refuse to store the counter
    return protoSetItem.call(this, key, value);
  };
  try {
    localStorage.removeItem(STORAGE_KEY); // clear leftover from before install
  } catch (e) {}

  console.log(TAG, "rate-limit reset active.");
})();

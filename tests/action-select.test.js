import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// ActionSelect must tolerate pages that omit optional callbacks (no crash on click).
test("ActionSelect calls optional callbacks safely", () => {
  const src = readFileSync(new URL("../src/components/ActionSelect.jsx", import.meta.url), "utf8");
  for (const fn of ["statusAction", "approveAction", "editAction", "deleteAction"]) {
    assert.match(src, new RegExp(`${fn}\\?\\.\\(\\)`), `${fn} should be called with ?.()`);
  }
  assert.match(src, /approveAction,/, "approveAction must be a declared prop");
});

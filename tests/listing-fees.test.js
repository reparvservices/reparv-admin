import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { diffFees, amountsFromRules, withGst } from "../src/lib/listingFees.js";

const rules = [
  { id: 1, listing_type: "Any", property_category: "NewFlat", amount: 500 },
  { id: 2, listing_type: "Any", property_category: "Plot", amount: 0 },
  { id: 3, listing_type: "Rent", property_category: "RentalFlat", amount: 300 },
];

test("GST is added on top", () => {
  assert.deepEqual(withGst(500), { base: 500, gst: 90, total: 590 });
  assert.deepEqual(withGst(""), { base: 0, gst: 0, total: 0 });
});

test("the page shows one fee per property type (the 'Any' rules)", () => {
  assert.deepEqual(amountsFromRules(rules), { NewFlat: "500", Plot: "0" });
});

test("only what changed is saved", () => {
  const d = diffFees(rules, { NewFlat: "500", Plot: "0", ResaleFlat: "250" });
  assert.deepEqual(d, { save: [{ property_category: "ResaleFlat", amount: 250 }], remove: [], invalid: [] });
});

test("changing an amount saves it; emptying a box removes the rule so the default applies", () => {
  const d = diffFees(rules, { NewFlat: "700", Plot: "" });
  assert.deepEqual(d.save, [{ property_category: "NewFlat", amount: 700 }]);
  assert.deepEqual(d.remove, [2]);
});

test("bad amounts are flagged, not sent", () => {
  const d = diffFees(rules, { NewFlat: "-5", Plot: "1.5", ResaleFlat: "abc", ResalePlot: "9999999" });
  assert.deepEqual(d.invalid.sort(), ["NewFlat", "Plot", "ResaleFlat", "ResalePlot"].sort());
  assert.equal(d.save.length, 0);
});

test("the page is reachable: route and sidebar link exist", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const layout = readFileSync(new URL("../src/components/layout/Layout.jsx", import.meta.url), "utf8");
  assert.match(app, /path="\/listing-fees" element=\{<ListingFees \/>\}/);
  assert.match(layout, /label: "Listing Fees", to: "\/listing-fees"/);
});

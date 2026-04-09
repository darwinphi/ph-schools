import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

import * as esm from "../dist/index.js";

const require = createRequire(import.meta.url);
const cjs = require("../dist/index.cjs");

test("esm and cjs exports are available", () => {
  assert.equal(typeof esm.getAllSchools, "function");
  assert.equal(typeof esm.findByBeisId, "function");
  assert.equal(typeof cjs.getAllSchools, "function");
  assert.equal(typeof cjs.findByBeisId, "function");
});

test("dataset integrity and metadata", () => {
  assert.equal(esm.schools.length, 60924);
  assert.equal(esm.recordCount, 60924);
  assert.equal(esm.dataVersion.recordCount, 60924);
  assert.equal(esm.schoolYear, "2020-2021");
  assert.equal(esm.sourceFile, "schools_masterlist_2020_2021.json");
  assert.equal(esm.sourceOrganization, "gov.ph");
  assert.equal(esm.dataVersion.sourceOrganization, "gov.ph");
});

test("first record keeps normalized fields and raw payload", () => {
  const first = esm.schools[0];

  assert.equal(first.beisSchoolId, "100001");
  assert.equal(first.schoolName, "Apaleng-Libtong ES");
  assert.equal(first.region, "Region I");
  assert.equal(first.schoolClassification, "DepED Managed");

  assert.equal(first.raw["BEIS School ID"], "100001");
  assert.equal(first.raw["School Name"], "Apaleng-Libtong ES");
  assert.equal(
    first.raw["Modified Curricural Offering Classification"],
    "Purely ES"
  );
});

test("findByBeisId returns exact trimmed match", () => {
  const record = esm.findByBeisId(" 100001 ");
  assert.ok(record);
  assert.equal(record?.schoolName, "Apaleng-Libtong ES");
  assert.equal(esm.findByBeisId(""), undefined);
});

test("searchSchools is case-insensitive contains and preserves source order", () => {
  const results = esm.searchSchools("bacarra", { fields: ["municipality"] });
  assert.ok(results.length > 0);

  const firstMatchIndex = esm.schools.findIndex(
    (school) => school.municipality.toLowerCase().includes("bacarra")
  );

  assert.ok(firstMatchIndex >= 0);
  assert.equal(results[0].beisSchoolId, esm.schools[firstMatchIndex].beisSchoolId);
});

test("filterSchools applies case-insensitive exact AND semantics", () => {
  const filtered = esm.filterSchools({ region: "region i", sector: "public" });
  assert.ok(filtered.length > 0);

  for (const school of filtered) {
    assert.equal(school.region.toLowerCase(), "region i");
    assert.equal(school.sector.toLowerCase(), "public");
  }
});

test("getAllSchools supports optional pagination", () => {
  const full = esm.getAllSchools();
  const paged = esm.getAllSchools({ page: 2, pageSize: 5 });

  assert.equal(paged.length, 5);
  assert.deepEqual(
    paged.map((school) => school.beisSchoolId),
    full.slice(5, 10).map((school) => school.beisSchoolId)
  );
  assert.deepEqual(esm.getAllSchools({ page: 999999, pageSize: 10 }), []);
});

test("filterSchools supports optional pagination", () => {
  const full = esm.filterSchools({ region: "Region I" });
  const paged = esm.filterSchools({ region: "Region I" }, { page: 3, pageSize: 4 });

  assert.equal(paged.length, Math.min(4, Math.max(full.length - 8, 0)));
  assert.deepEqual(
    paged.map((school) => school.beisSchoolId),
    full.slice(8, 12).map((school) => school.beisSchoolId)
  );
});

test("searchSchools supports optional pagination", () => {
  const full = esm.searchSchools("bacarra", { fields: ["municipality"] });
  const paged = esm.searchSchools("bacarra", {
    fields: ["municipality"],
    page: 1,
    pageSize: 3
  });

  assert.equal(paged.length, Math.min(3, full.length));
  assert.deepEqual(
    paged.map((school) => school.beisSchoolId),
    full.slice(0, 3).map((school) => school.beisSchoolId)
  );
});

test("invalid JS inputs are handled safely", () => {
  assert.equal(esm.findByBeisId(100001), undefined);
  assert.deepEqual(esm.searchSchools(123), []);
  assert.deepEqual(esm.filterSchools(null), []);
  assert.deepEqual(esm.filterSchools({ madeUpField: "value" }), []);
  assert.equal(esm.filterSchools({ region: undefined }).length, esm.schools.length);
  assert.equal(esm.getAllSchools({ page: 0 }).length, 50);
});

test("search field validation is resilient", () => {
  assert.deepEqual(esm.searchSchools("bacarra", { fields: ["notARealField"] }), []);
  assert.ok(esm.searchSchools("bacarra", { fields: ["municipality", "notARealField"] }).length > 0);
});

test("records are frozen to prevent accidental mutation", () => {
  const record = esm.findByBeisId("100001");
  assert.ok(record);
  assert.equal(Object.isFrozen(record), true);
  assert.equal(Object.isFrozen(record.raw), true);
});

test("cjs and esm data are aligned", () => {
  assert.equal(cjs.schools.length, esm.schools.length);
  assert.equal(cjs.findByBeisId("100001").schoolName, esm.findByBeisId("100001").schoolName);
});

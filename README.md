# ph-schools

Quickly find and search Philippine school records in your app.

`ph-schools` includes ready-to-use school data (SY 2020-2021) and simple helpers for BEIS ID lookup, filtering, and search in both TypeScript and JavaScript.

## 📦 Install

```bash
npm install ph-schools
```

## 📜 Changelog

- See `CHANGELOG.md` for release notes and migration updates.

## 🏛️ Data Source

- Source organization: `gov.ph` 🇵🇭
- Source dataset: `SY 2020-2021 Masterlist of Schools` 🏫
- Canonical dataset repo: `darwinphi/ph-schools-dataset` 📚
- Pinned data release tag used by this library: `v1.0.0` (via `data-source.json`) 🧷
- Embedded source filename in generated output: `schools_masterlist_2020_2021.json` 🗂️

## 🔷 Usage (TypeScript)

```ts
import {
  getAllSchools,
  findByBeisId,
  searchSchools,
  type PaginationOptions,
  type SchoolRecord,
  type SearchOptions,
} from 'ph-schools';

const school: SchoolRecord | undefined = findByBeisId('100001');

const options: SearchOptions = {
  fields: ['schoolName', 'barangay'],
  page: 1,
  pageSize: 10,
};
const matches: SchoolRecord[] = searchSchools('bacarra', options);
const page2: readonly SchoolRecord[] = getAllSchools({ page: 2, pageSize: 5 });
const pagination: PaginationOptions = { page: 3, pageSize: 20 };
const page3Matches: SchoolRecord[] = searchSchools('region i', pagination);

console.log(school?.schoolName);
console.log(matches.length);
console.log(page2.length);
console.log(page3Matches.length);
```

## ⚡ Usage (JavaScript ESM)

```js
import {
  schools,
  getAllSchools,
  findByBeisId,
  filterSchools,
  searchSchools,
  dataVersion,
} from 'ph-schools';

const one = findByBeisId('100001');
const regionPublicPage1 = filterSchools(
  { region: 'Region I', sector: 'Public' },
  { page: 1, pageSize: 25 }
);
const matchesPage2 = searchSchools('bacarra', { page: 2, pageSize: 10 });
const allPage3 = getAllSchools({ page: 3, pageSize: 100 });

console.log(schools.length);
console.log(regionPublicPage1.length);
console.log(matchesPage2.length);
console.log(allPage3.length);
console.log(dataVersion.sourceOrganization);
```

## 🧩 Usage (CommonJS)

```js
const {
  schools,
  findByBeisId,
  filterSchools,
  searchSchools,
  dataVersion,
} = require('ph-schools');

console.log(findByBeisId('100001'));
console.log(dataVersion);
```

## 🛠️ API

- `schools: readonly SchoolRecord[]`
- `getAllSchools(options?: PaginationOptions): readonly SchoolRecord[]`
- `findByBeisId(beisId: string): SchoolRecord | undefined`
- `filterSchools(criteria: Partial<Omit<SchoolRecord, "raw">>, options?: PaginationOptions): SchoolRecord[]`
- `searchSchools(query: string, options?: { fields?: SearchableField[]; page?: number; pageSize?: number }): SchoolRecord[]`
- `PaginationOptions: { page?: number; pageSize?: number }`
- `dataVersion: { packageVersion: string; schoolYear: "2020-2021"; sourceFile: string; sourceOrganization: "gov.ph"; recordCount: number }`

## 🔁 Data Update (Maintainers)

When the dataset repo publishes a new tag:

1. Update `data-source.json` (`tag` and `sha256`)
2. Regenerate and test:
   - `npm run build`
   - `npm test`
3. Release npm package:
   - `npm version patch` (or `minor` / `major`)
   - `git push`
   - `git push --tags`

## 📝 Notes

- The runtime package uses generated embedded data built from a pinned release in `ph-schools-dataset` ✅
- Build command regenerates embedded data before bundling 🔁
- Set `PH_SCHOOLS_DATA_PATH=/path/to/local.json` to generate from a local override dataset for development 🛠️
- Runtime guards are included for JavaScript callers:
  - `findByBeisId(nonString)` returns `undefined`
  - `searchSchools(nonStringQuery)` returns `[]`
  - `filterSchools(nonObject)` returns `[]`
  - `filterSchools({})` and `filterSchools({ region: undefined })` return all schools
  - Unknown `filterSchools` keys or invalid `searchSchools` fields safely return `[]`
  - Invalid pagination values fall back to `page: 1`, `pageSize: 50`
- Exported school records are frozen to prevent accidental mutation

```bash
npm run build
```

import {
  dataVersion,
  filterSchools,
  findByBeisId,
  getAllSchools,
  recordCount,
  schoolYear,
  schools,
  searchSchools,
  sourceOrganization,
  sourceFile,
  type PaginationOptions,
  type SchoolRecord,
  type SchoolRecordRaw,
  type SearchOptions
} from "../dist/index.js";

const allSchools: readonly SchoolRecord[] = getAllSchools();
const pagedSchools: readonly SchoolRecord[] = getAllSchools({ page: 2, pageSize: 20 });
const maybeSchool: SchoolRecord | undefined = findByBeisId("100001");
const filteredSchools: SchoolRecord[] = filterSchools({
  region: "Region I",
  sector: "Public"
});
const filteredPagedSchools: SchoolRecord[] = filterSchools(
  { region: "Region I", sector: "Public" },
  { page: 1, pageSize: 10 }
);

const pagination: PaginationOptions = { page: 3, pageSize: 15 };

const searchOptions: SearchOptions = {
  fields: ["schoolName", "barangay"],
  page: 1,
  pageSize: 25
};
const searchedSchools: SchoolRecord[] = searchSchools("bacarra", searchOptions);
const searchedSchoolsWithPaginationObject: SchoolRecord[] = searchSchools("bacarra", pagination);

const rawSchool: SchoolRecordRaw | undefined = maybeSchool?.raw;
const pkgVersion: string = dataVersion.packageVersion;
const sy: "2020-2021" = schoolYear;
const sourceOrg: "gov.ph" = sourceOrganization;
const src: string = sourceFile;
const count: number = recordCount;

void allSchools;
void pagedSchools;
void maybeSchool;
void filteredSchools;
void filteredPagedSchools;
void searchedSchools;
void searchedSchoolsWithPaginationObject;
void pagination;
void rawSchool;
void pkgVersion;
void sy;
void sourceOrg;
void src;
void count;
void schools;

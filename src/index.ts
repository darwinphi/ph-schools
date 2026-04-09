import {
  packageVersion as generatedPackageVersion,
  rawRecords,
  schoolYear as generatedSchoolYear,
  sourceFile as generatedSourceFile
} from "./data.generated";
import type {
  DataVersion,
  PaginationOptions,
  SchoolRecord,
  SearchOptions,
  SearchableField
} from "./types";

const defaultSearchFields: readonly SearchableField[] = [
  "schoolName",
  "municipality",
  "division",
  "district",
  "barangay",
  "streetAddress"
];

type FilterCriteria = Partial<Omit<SchoolRecord, "raw">>;
type FilterField = keyof Omit<SchoolRecord, "raw">;
type PaginationSettings = {
  page: number;
  pageSize: number;
};

const defaultPage = 1;
const defaultPageSize = 50;

const searchableFieldSet = new Set<SearchableField>(defaultSearchFields);
const filterFieldSet = new Set<FilterField>([
  "region",
  "division",
  "district",
  "beisSchoolId",
  "schoolName",
  "streetAddress",
  "municipality",
  "legislativeDistrict",
  "barangay",
  "sector",
  "urbanRu",
  "schoolClassification",
  "modifiedCurricuralOfferingClassification"
]);

function freezeSchoolRecord(record: SchoolRecord): SchoolRecord {
  Object.freeze(record.raw);
  return Object.freeze(record);
}

const schoolsInternal: SchoolRecord[] = rawRecords.map((raw) =>
  freezeSchoolRecord({
    region: raw["Region"],
    division: raw["Division"],
    district: raw["District"],
    beisSchoolId: raw["BEIS School ID"],
    schoolName: raw["School Name"],
    streetAddress: raw["Street Address"],
    municipality: raw["Municipality"],
    legislativeDistrict: raw["Legislative District"],
    barangay: raw["Barangay"],
    sector: raw["Sector"],
    urbanRu: raw["Urban/Ru"],
    schoolClassification: raw["Sacl hColaosls Sifuicbactliaosnsification"],
    modifiedCurricuralOfferingClassification:
      raw["Modified Curricural Offering Classification"],
    raw
  })
);

export const schools: readonly SchoolRecord[] = Object.freeze(schoolsInternal);
export const schoolYear = generatedSchoolYear;
export const sourceFile = generatedSourceFile;
export const sourceOrganization = "gov.ph" as const;
export const recordCount = schools.length;

export const dataVersion: DataVersion = Object.freeze({
  packageVersion: generatedPackageVersion,
  schoolYear,
  sourceFile,
  sourceOrganization,
  recordCount
});

function normalizeForComparison(value: string): string {
  return value.trim().toLowerCase();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFilterField(value: string): value is FilterField {
  return filterFieldSet.has(value as FilterField);
}

function isSearchableField(value: unknown): value is SearchableField {
  return typeof value === "string" && searchableFieldSet.has(value as SearchableField);
}

function normalizePositiveInteger(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const normalized = Math.trunc(value);
  return normalized > 0 ? normalized : undefined;
}

function resolvePagination(pagination: unknown): PaginationSettings | undefined {
  if (!isPlainObject(pagination)) {
    return undefined;
  }

  const hasPaginationFields = "page" in pagination || "pageSize" in pagination;
  if (!hasPaginationFields) {
    return undefined;
  }

  return {
    page: normalizePositiveInteger(pagination.page) ?? defaultPage,
    pageSize: normalizePositiveInteger(pagination.pageSize) ?? defaultPageSize
  };
}

function applyPagination<T>(items: readonly T[], pagination?: PaginationSettings): T[] {
  if (!pagination) {
    return [...items];
  }

  const start = (pagination.page - 1) * pagination.pageSize;
  if (start >= items.length) {
    return [];
  }

  return items.slice(start, start + pagination.pageSize);
}

export function getAllSchools(options?: PaginationOptions): readonly SchoolRecord[] {
  const pagination = resolvePagination(options);
  if (!pagination) {
    return schools;
  }

  return applyPagination(schools, pagination);
}

export function findByBeisId(beisId: string): SchoolRecord | undefined {
  if (typeof beisId !== "string") {
    return undefined;
  }

  const target = beisId.trim();
  if (target.length === 0) {
    return undefined;
  }

  return schools.find((school) => school.beisSchoolId.trim() === target);
}

export function filterSchools(
  criteria: FilterCriteria,
  options?: PaginationOptions
): SchoolRecord[] {
  const pagination = resolvePagination(options);

  if (!isPlainObject(criteria)) {
    return [];
  }

  const rawEntries = Object.entries(criteria);
  if (rawEntries.length === 0) {
    return applyPagination(schools, pagination);
  }

  let hasInvalidEntry = false;
  const entries: [FilterField, string][] = [];

  for (const [key, value] of rawEntries) {
    if (value === undefined) {
      continue;
    }

    if (!isFilterField(key) || typeof value !== "string") {
      hasInvalidEntry = true;
      continue;
    }

    entries.push([key, value]);
  }

  if (entries.length === 0) {
    return hasInvalidEntry ? [] : applyPagination(schools, pagination);
  }

  const filtered = schools.filter((school) =>
    entries.every(([key, value]) => {
      const actual = school[key];
      return normalizeForComparison(actual) === normalizeForComparison(value);
    })
  );

  return applyPagination(filtered, pagination);
}

export function searchSchools(
  query: string,
  options: SearchOptions = {}
): SchoolRecord[] {
  if (typeof query !== "string") {
    return [];
  }

  const needle = normalizeForComparison(query);
  if (needle.length === 0) {
    return [];
  }

  const maybeFields = isPlainObject(options) && Array.isArray(options.fields)
    ? options.fields.filter(isSearchableField)
    : undefined;
  const pagination = resolvePagination(options);

  if (maybeFields && maybeFields.length === 0) {
    return [];
  }

  const fields = maybeFields && maybeFields.length > 0
    ? maybeFields
    : defaultSearchFields;

  const searched = schools.filter((school) =>
    fields.some((field) =>
      normalizeForComparison(school[field]).includes(needle)
    )
  );

  return applyPagination(searched, pagination);
}

export type {
  DataVersion,
  PaginationOptions,
  SchoolRecord,
  SchoolRecordRaw,
  SearchOptions,
  SearchableField
} from "./types";

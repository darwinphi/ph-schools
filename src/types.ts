export interface SchoolRecordRaw {
  "Region": string;
  "Division": string;
  "District": string;
  "BEIS School ID": string;
  "School Name": string;
  "Street Address": string;
  "Municipality": string;
  "Legislative District": string;
  "Barangay": string;
  "Sector": string;
  "Urban/Ru": string;
  "Sacl hColaosls Sifuicbactliaosnsification": string;
  "Modified Curricural Offering Classification": string;
}

export interface SchoolRecord {
  region: string;
  division: string;
  district: string;
  beisSchoolId: string;
  schoolName: string;
  streetAddress: string;
  municipality: string;
  legislativeDistrict: string;
  barangay: string;
  sector: string;
  urbanRu: string;
  schoolClassification: string;
  modifiedCurricuralOfferingClassification: string;
  raw: SchoolRecordRaw;
}

export type SearchableField =
  | "schoolName"
  | "municipality"
  | "division"
  | "district"
  | "barangay"
  | "streetAddress";

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface SearchOptions extends PaginationOptions {
  fields?: SearchableField[];
}

export interface DataVersion {
  packageVersion: string;
  schoolYear: "2020-2021";
  sourceFile: string;
  sourceOrganization: "gov.ph";
  recordCount: number;
}

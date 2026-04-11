# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by Keep a Changelog and follows semantic versioning.

## [1.0.3] - 2026-04-11

### Changed

- Pinned `data-source.json` to `darwinphi/ph-schools-dataset` tag `v1.0.1`.
- Updated canonical raw key handling to use:
  - `Urban/Rural` (was `Urban/Ru`)
  - `School Subclassification` (was `Sacl hColaosls Sifuicbactliaosnsification`)
- Updated generator fixture coverage for the corrected canonical keys.

## [1.0.2] - 2026-04-10

Maintenance release. No runtime API changes.

### Added

- CI workflow for pull requests (`CI / test`) to support protected branch rules.
- Pinned external dataset source config via `data-source.json`.
- Generator-path test suite (`tests/generate-data.test.mjs`) for:
  - pinned remote fetch success
  - checksum mismatch failure
  - remote 404 failure
  - local override success

### Changed

- `scripts/generate-data.mjs` now downloads dataset from pinned tag in `darwinphi/ph-schools-dataset` and validates SHA-256 checksum.
- Build flow now supports local override dataset via `PH_SCHOOLS_DATA_PATH`.
- README updated with maintainer data-update flow for pinned dataset tags.

### Removed

- Local tracked source file `schools_masterlist_2020_2021.json` from this repo.

## [1.0.1] - 2026-04-10

### Added

- Optional pagination support for:
  - `getAllSchools(options?)`
  - `filterSchools(criteria, options?)`
  - `searchSchools(query, options?)`
- Type exports for pagination options.
- Additional runtime and type tests for pagination and edge-case behavior.

### Changed

- README usage examples and API docs expanded for TypeScript and pagination.
- Release automation configured with GitHub Actions + npm Trusted Publishing.

### Fixed

- Runtime guards for JS callers to avoid crashes on invalid input shapes and values.
- Data records and raw payload objects frozen to prevent accidental mutation.

## [1.0.0] - 2026-04-10

### Added

- Initial npm release of `ph-schools`.
- TypeScript + JavaScript query helpers for the embedded SY 2020-2021 Philippine schools masterlist.
- Core APIs: `schools`, `getAllSchools`, `findByBeisId`, `filterSchools`, `searchSchools`, and `dataVersion`.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const scriptPath = resolve(rootDir, 'scripts', 'generate-data.mjs');
const defaultConfigPath = resolve(rootDir, 'data-source.json');

const sampleRecord = {
  Region: 'Region I',
  Division: 'Ilocos Norte',
  District: 'District I',
  'BEIS School ID': '999999',
  'School Name': 'Sample School',
  'Street Address': 'Sample Street',
  Municipality: 'Sample Municipality',
  'Legislative District': 'Sample District',
  Barangay: 'Sample Barangay',
  Sector: 'Public',
  'Urban/Rural': 'Urban',
  'School Subclassification': 'DepED Managed',
  'Modified Curricural Offering Classification': 'Purely ES',
};

function runGenerate(env) {
  return spawnSync(process.execPath, [scriptPath], {
    cwd: rootDir,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env,
    },
  });
}

async function createTempOutput() {
  const tempDir = await mkdtemp(join(tmpdir(), 'ph-schools-generate-'));
  return join(tempDir, 'data.generated.ts');
}

test('generate-data succeeds using pinned remote data source', async () => {
  const outputPath = await createTempOutput();
  const result = runGenerate({
    PH_SCHOOLS_DATA_OUTPUT_PATH: outputPath,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generated = await readFile(outputPath, 'utf8');
  assert.match(
    generated,
    /export const sourceFile = "schools_masterlist_2020_2021\.json"/,
  );
  assert.match(generated, /export const rawRecords = parseRawRecords/);
});

test('generate-data fails with checksum mismatch', async () => {
  const tempDir = await mkdtemp(
    join(tmpdir(), 'ph-schools-generate-checksum-'),
  );
  const outputPath = join(tempDir, 'data.generated.ts');
  const configPath = join(tempDir, 'data-source.bad-checksum.json');
  const config = JSON.parse(await readFile(defaultConfigPath, 'utf8'));
  config.sha256 = '0'.repeat(64);
  await writeFile(configPath, JSON.stringify(config, null, 2));

  const result = runGenerate({
    PH_SCHOOLS_DATA_SOURCE_CONFIG: configPath,
    PH_SCHOOLS_DATA_OUTPUT_PATH: outputPath,
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stderr}\n${result.stdout}`, /Checksum mismatch/);
});

test('generate-data fails when remote source cannot be downloaded', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ph-schools-generate-404-'));
  const outputPath = join(tempDir, 'data.generated.ts');
  const configPath = join(tempDir, 'data-source.missing.json');
  const config = JSON.parse(await readFile(defaultConfigPath, 'utf8'));
  config.tag = 'v1.0.0-does-not-exist';
  await writeFile(configPath, JSON.stringify(config, null, 2));

  const result = runGenerate({
    PH_SCHOOLS_DATA_SOURCE_CONFIG: configPath,
    PH_SCHOOLS_DATA_OUTPUT_PATH: outputPath,
  });

  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stderr}\n${result.stdout}`,
    /Failed to download dataset/,
  );
  assert.match(`${result.stderr}\n${result.stdout}`, /HTTP 404/);
});

test('generate-data succeeds with local override dataset', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ph-schools-generate-local-'));
  const outputPath = join(tempDir, 'data.generated.ts');
  const localDataPath = join(tempDir, 'schools_masterlist_2020_2021.json');
  await writeFile(localDataPath, JSON.stringify([sampleRecord]));

  const result = runGenerate({
    PH_SCHOOLS_DATA_PATH: localDataPath,
    PH_SCHOOLS_DATA_OUTPUT_PATH: outputPath,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Using local dataset override/);
  assert.match(result.stdout, /Records embedded: 1/);

  const generated = await readFile(outputPath, 'utf8');
  assert.match(generated, /Sample School/);
});

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_MIGRATION = path.join(REPO_ROOT, 'supabase', 'migrations', '20260306143000_growth_v2_schema.sql');

function printUsage() {
  console.log(`
Usage:
  node ./scripts/growth-v2/apply-supabase-migration.mjs [--file <sql-file>] [--yes]

Required environment:
  SUPABASE_URL
  SUPABASE_ACCESS_TOKEN

Optional environment:
  .env.local may also contain SUPABASE_URL / SUPABASE_ACCESS_TOKEN

Options:
  --file <path>   Apply a specific SQL file instead of the default growth-v2 migration
  --yes           Skip the interactive confirmation prompt
  --help          Show this help text
`);
}

function parseArgs(argv) {
  const args = {
    file: DEFAULT_MIGRATION,
    yes: false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--file') {
      args.file = path.resolve(process.cwd(), argv[index + 1] ?? '');
      index += 1;
      continue;
    }

    if (arg === '--yes') {
      args.yes = true;
      continue;
    }

    if (arg === '--help') {
      args.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function loadDotEnvFile(filePath) {
  try {
    const source = await fs.readFile(filePath, 'utf8');
    const env = {};

    for (const rawLine of source.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = line.slice(0, separatorIndex).trim();
      let value = line.slice(separatorIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }

    return env;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function readConfig() {
  const dotEnv = await loadDotEnvFile(path.join(REPO_ROOT, '.env.local'));
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || dotEnv.SUPABASE_URL?.trim() || '';
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim() || dotEnv.SUPABASE_ACCESS_TOKEN?.trim() || '';

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL.');
  }

  if (!accessToken) {
    throw new Error('Missing SUPABASE_ACCESS_TOKEN. This must be a Supabase personal access token for the Management API.');
  }

  const url = new URL(supabaseUrl);
  const projectRef = url.hostname.split('.')[0];

  if (!projectRef) {
    throw new Error(`Could not derive project ref from SUPABASE_URL: ${supabaseUrl}`);
  }

  return {
    projectRef,
    accessToken
  };
}

async function confirmOrThrow(message) {
  process.stdout.write(`${message} Type "yes" to continue: `);

  const answer = await new Promise((resolve) => {
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data) => resolve(String(data).trim()));
  });

  if (answer !== 'yes') {
    throw new Error('Aborted by user.');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  const { projectRef, accessToken } = await readConfig();
  const sql = await fs.readFile(args.file, 'utf8');

  if (!args.yes) {
    await confirmOrThrow(`About to apply SQL file ${args.file} to Supabase project ${projectRef}.`);
  }

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: sql
    })
  });

  const bodyText = await response.text();

  if (!response.ok) {
    throw new Error(`Migration request failed (${response.status}): ${bodyText}`);
  }

  console.log(`Migration applied to project ${projectRef}.`);
  if (bodyText) {
    console.log(bodyText);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Instala las skills del proyecto a nivel de proyecto (solo Claude Code):
// todas las de unity-technologies/skills mas las listadas en EXTRA_SKILLS.
// Uso: node tools/install-unity-skills.mjs [--dry-run]
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE = 'unity-technologies/skills';
const TREE_URL = `https://api.github.com/repos/${SOURCE}/git/trees/HEAD?recursive=1`;
// Skills sueltas de otros repos: { fuente: [nombres] }
const EXTRA_SKILLS = {
  'wheresryan22/anatomy': ['anatomy'],
};
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(PROJECT_ROOT, '.claude', 'skills');
const dryRun = process.argv.includes('--dry-run');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

// 1. Obtener la lista del propio repo (el indice de skills.sh puede listar skills ya retiradas)
const response = await fetch(TREE_URL, { headers: { 'User-Agent': 'install-unity-skills' } });
if (!response.ok) fail(`GitHub respondio ${response.status}`);
const { tree, truncated } = await response.json();
if (truncated) fail('GitHub devolvio un arbol truncado');
const unityNames = tree
  .map((entry) => entry.path.match(/^skills\/([^/]+)\/SKILL\.md$/)?.[1])
  .filter(Boolean)
  .sort();
if (unityNames.length === 0) fail(`ninguna skill encontrada en ${SOURCE}`);
console.log(`${unityNames.length} skills en ${SOURCE}`);

// 2. Avisar de skills instaladas que el repo ya retiro (no se borran solas)
const lockPath = join(PROJECT_ROOT, 'skills-lock.json');
if (existsSync(lockPath)) {
  const locked = JSON.parse(readFileSync(lockPath, 'utf8')).skills ?? {};
  const obsolete = Object.keys(locked).filter((n) => locked[n].source === SOURCE && !unityNames.includes(n));
  if (obsolete.length > 0) console.log(`AVISO: instaladas pero retiradas del repo: ${obsolete.join(', ')}`);
}

const installs = { [SOURCE]: unityNames, ...EXTRA_SKILLS };
const allNames = Object.values(installs).flat();
const invalid = allNames.filter((n) => !/^[a-z0-9-]+$/.test(n));
if (invalid.length > 0) fail(`nombres de skill no validos: ${invalid.join(', ')}`);

// 3. Instalar con un unico comando por fuente
for (const [source, names] of Object.entries(installs)) {
  const command = `npx --yes skills add ${source} -s ${names.join(' ')} -a claude-code --copy -y`;
  if (dryRun) {
    console.log(`[dry-run] ${command}`);
    continue;
  }
  const result = spawnSync(command, { cwd: PROJECT_ROOT, shell: true, encoding: 'utf8' });
  if (result.status !== 0) {
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
    fail(`el CLI termino con codigo ${result.status} en ${source}\n${output.slice(-2000)}`);
  }
}
if (dryRun) process.exit(0);

// 4. Verificar
const missing = allNames.filter((n) => !existsSync(join(SKILLS_DIR, n, 'SKILL.md')));

// 5. Resumen
console.log(`Instaladas: ${allNames.length - missing.length}/${allNames.length} en ${SKILLS_DIR}`);
if (missing.length > 0) fail(`faltan: ${missing.join(', ')}`);

// Instala todas las skills de unity-technologies/skills a nivel de proyecto (solo Claude Code).
// Uso: node tools/install-unity-skills.mjs [--dry-run]
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE = 'unity-technologies/skills';
const SEARCH_URL = 'https://skills.sh/api/search?q=unity-technologies&limit=100';
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(PROJECT_ROOT, '.claude', 'skills');
const dryRun = process.argv.includes('--dry-run');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

// 1. Obtener la lista
const response = await fetch(SEARCH_URL);
if (!response.ok) fail(`skills.sh respondio ${response.status}`);
const { skills } = await response.json();
if (!Array.isArray(skills) || skills.length === 0) fail('skills.sh no devolvio skills');

// 2. Comprobar la fuente: la busqueda es difusa, solo se acepta la fuente exacta
const fromSource = skills.filter((s) => s.source?.toLowerCase() === SOURCE);
if (fromSource.length === 0) fail(`ninguna skill de ${SOURCE} en la busqueda`);
const skipped = skills.filter((s) => s.source?.toLowerCase() !== SOURCE && s.source?.toLowerCase().startsWith('unity-technologies/'));
if (skipped.length > 0) {
  console.log(`Omitidas (otros repos de unity-technologies):\n${skipped.map((s) => `  ${s.id} (${s.installs})`).join('\n')}`);
}
const names = [...new Set(fromSource.map((s) => s.skillId ?? s.name))].sort();
const invalid = names.filter((n) => !/^[a-z0-9-]+$/.test(n));
if (invalid.length > 0) fail(`nombres de skill no validos: ${invalid.join(', ')}`);

console.log(`Fuente verificada: ${names.length} skills, todas de ${SOURCE}`);

// 3. Instalar con un unico comando
const command = `npx --yes skills add ${SOURCE} -s ${names.join(' ')} -a claude-code --copy -y`;
if (dryRun) {
  console.log(`[dry-run] ${command}`);
  process.exit(0);
}
const result = spawnSync(command, { cwd: PROJECT_ROOT, shell: true, encoding: 'utf8' });
if (result.status !== 0) {
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
  fail(`el CLI termino con codigo ${result.status}\n${output.slice(-2000)}`);
}

// 4. Verificar
const missing = names.filter((n) => !existsSync(join(SKILLS_DIR, n, 'SKILL.md')));

// 5. Resumen
console.log(`Instaladas: ${names.length - missing.length}/${names.length} en ${SKILLS_DIR}`);
if (missing.length > 0) fail(`faltan: ${missing.join(', ')}`);

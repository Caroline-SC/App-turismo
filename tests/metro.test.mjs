import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
const { corrigirDirents, instalarCorrecao } = createRequire(import.meta.url)('../scripts/metro-onedrive.cjs');
const { instalarMonitoramento, exclusaoDeSaidas } = createRequire(import.meta.url)('../scripts/metro-watch.cjs');

function tipo(nome) {
  return Object.fromEntries(['isFile', 'isDirectory', 'isSymbolicLink', 'isBlockDevice', 'isCharacterDevice', 'isFIFO', 'isSocket'].map(metodo => [metodo, () => metodo === nome]));
}

test('corrige arquivos e diretórios de nuvem identificados como links e mantém links reais', () => {
  const arquivo = { name: 'Constants.js', ...tipo('isSymbolicLink') };
  const pasta = { name: 'build', ...tipo('isSymbolicLink') };
  const link = { name: 'link', ...tipo('isSymbolicLink') };
  corrigirDirents('raiz', [arquivo, pasta, link], nome => tipo(nome.endsWith('Constants.js') ? 'isFile' : nome.endsWith('build') ? 'isDirectory' : 'isSymbolicLink'));
  assert.equal(arquivo.isFile(), true);
  assert.equal(arquivo.isSymbolicLink(), false);
  assert.equal(pasta.isDirectory(), true);
  assert.equal(pasta.isSymbolicLink(), false);
  assert.equal(link.isSymbolicLink(), true);
});

test('a correção do Metro fica limitada ao projeto e pode ser instalada apenas uma vez', () => {
  const raiz = path.resolve('projeto');
  let consultas = 0;
  const fs = {
    readdir: (_diretorio, _opcoes, callback) => callback(null, [{ name: 'arquivo.js', ...tipo('isSymbolicLink') }]),
    lstatSync: () => { consultas++; return tipo('isFile'); },
  };
  instalarCorrecao(fs, raiz, 'win32');
  const wrapper = fs.readdir;
  instalarCorrecao(fs, raiz, 'win32');
  assert.equal(fs.readdir, wrapper);
  fs.readdir(raiz, { withFileTypes: true }, (erro, entradas) => { assert.equal(erro, null); assert.equal(entradas[0].isFile(), true); });
  fs.readdir(path.resolve('fora'), { withFileTypes: true }, (_erro, entradas) => assert.equal(entradas[0].isSymbolicLink(), true));
  assert.equal(consultas, 1);
});

test('monitoramento no Windows exclui dependências sem excluir código e preserva as regras existentes', async () => {
  class Watcher {
    constructor(root) { this.root = root; this.ignored = /original/; this.doIgnore = nome => nome.includes('original'); }
    async startWatching() { return 'pronto'; }
  }
  const raiz = path.resolve('projeto');
  instalarMonitoramento(Watcher, raiz, 'win32');
  const wrapper = Watcher.prototype.startWatching;
  instalarMonitoramento(Watcher, raiz, 'win32');
  assert.equal(Watcher.prototype.startWatching, wrapper);
  const watcher = new Watcher(raiz);
  assert.equal(await watcher.startWatching(), 'pronto');
  assert.equal(watcher.ignored.test('C:/projeto/node_modules/react'), true);
  assert.equal(watcher.doIgnore('node_modules/react/index.js'), true);
  assert.equal(watcher.doIgnore('components/original.js'), true);
  assert.equal(watcher.doIgnore('components/Profile.js'), false);
  assert.equal(watcher.doIgnore('components/node_modules_info.js'), false);
  const fora = new Watcher(path.resolve('outro-projeto'));
  await fora.startWatching();
  assert.equal(fora.doIgnore('node_modules/react/index.js'), false);
  class OutroWatcher extends Watcher { async startWatching() {} }
  const anterior = OutroWatcher.prototype.startWatching;
  instalarMonitoramento(OutroWatcher, raiz, 'linux');
  assert.equal(OutroWatcher.prototype.startWatching, anterior);
});

test('saídas de compilação são excluídas sem esconder bibliotecas ou arquivos gerados do Expo', () => {
  const raiz = path.resolve('projeto.com+teste');
  const padrao = exclusaoDeSaidas(raiz);
  for (const pasta of ['.git', 'dist', 'coverage', '.expo/trip-final-web', '.expo/trip-check-android']) {
    assert.equal(padrao.test(path.join(raiz, pasta)), true, pasta);
    assert.equal(padrao.test(path.join(raiz, pasta).replaceAll('\\', '/')), true, pasta);
  }
  for (const arquivo of ['components/Home.js', 'node_modules/react/dist/index.js', '.expo/.virtual-metro-entry', '.expo/types/router.d.ts', 'public/route-map.html']) {
    assert.equal(padrao.test(path.join(raiz, arquivo)), false, arquivo);
  }
  assert.equal(padrao.test(path.resolve('outro/dist')), false);
});

test('watcher real inicia e detecta criação, alteração e exclusão de código', { skip: process.platform !== 'win32', timeout: 20000 }, async () => {
  const { default: Watcher } = createRequire(import.meta.url)('@expo/metro-file-map/build/watchers/FallbackWatcher');
  const raiz = await fs.mkdtemp(path.join(os.tmpdir(), 'citour-watch-'));
  assert.equal(path.dirname(raiz), path.resolve(os.tmpdir()));
  const codigo = path.join(raiz, 'components', 'probe.js');
  await fs.mkdir(path.dirname(codigo));
  await fs.mkdir(path.join(raiz, 'node_modules', 'fixture'), { recursive: true });
  await fs.writeFile(path.join(raiz, 'node_modules', 'fixture', 'index.js'), 'module.exports = 1;');
  instalarMonitoramento(Watcher, raiz);
  const watcher = new Watcher(raiz, { included: { extensions: new Set(['js']), basenames: new Set(), basenamePrefixes: [] } });
  let erros = [];
  watcher.onError(erro => erros.push(erro));
  try {
    await watcher.startWatching();
    const esperar = (tipo, alterar) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => { cancelar(); reject(new Error(`Evento ${tipo} não recebido.`)); }, 5000);
      const cancelar = watcher.onFileEvent(evento => {
        if (evento.event === tipo && evento.relativePath === path.join('components', 'probe.js')) {
          clearTimeout(timer); cancelar(); resolve(evento);
        }
      });
      alterar().catch(erro => { clearTimeout(timer); cancelar(); reject(erro); });
    });
    await esperar('touch', () => fs.writeFile(codigo, 'export const teste = 1;'));
    await esperar('touch', () => fs.writeFile(codigo, 'export const teste = 2;'));
    await esperar('delete', () => fs.unlink(codigo));
    assert.deepEqual(erros, []);
  } finally {
    await watcher.stopWatching();
    await fs.rm(raiz, { recursive: true, force: true });
  }
});

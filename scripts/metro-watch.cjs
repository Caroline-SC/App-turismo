const path = require('node:path');
const INSTALADO = Symbol.for('citouur.metro.watch');
const DEPENDENCIAS = /(?:^|[/\\])node_modules(?:[/\\]|$)/;

function dentroDaRaiz(raiz, diretorio) {
  const relativo = path.relative(raiz, path.resolve(diretorio));
  return relativo !== '..' && !relativo.startsWith('..' + path.sep) && !path.isAbsolute(relativo);
}

// O FallbackWatcher do Metro 58 percorre e monitora cada pasta de node_modules.
// No Windows/OneDrive isso excede os quatro minutos do watch mode. Mantemos
// o crawler/resolver intactos e limitamos APENAS o monitoramento de alterações.
// Depois de instalar ou alterar dependências, reinicie o Expo.
function instalarMonitoramento(Watcher, raiz, plataforma = process.platform) {
  if (plataforma !== 'win32') return;
  const prototype = Watcher.prototype;
  if (prototype[INSTALADO]) {
    prototype[INSTALADO].add(path.resolve(raiz));
    return;
  }
  const raizes = new Set([path.resolve(raiz)]);
  const original = prototype.startWatching;
  prototype.startWatching = function (...args) {
    if ([...raizes].some(diretorio => dentroDaRaiz(diretorio, this.root))) {
      const ignorado = this.ignored;
      this.ignored = new RegExp([ignorado?.source, DEPENDENCIAS.source].filter(Boolean).map(padrao => `(?:${padrao})`).join('|'), ignorado?.flags || '');
      const doIgnore = this.doIgnore;
      this.doIgnore = arquivo => DEPENDENCIAS.test(arquivo) || doIgnore(arquivo);
    }
    return original.apply(this, args);
  };
  prototype[INSTALADO] = raizes;
}

function exclusaoDeSaidas(raiz) {
  const prefixo = path.resolve(raiz).split(path.sep).map(parte => parte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[/\\\\]');
  return new RegExp(`^${prefixo}[/\\\\](?:\\.git|dist|coverage|\\.expo[/\\\\]trip-(?:check|final)-(?:android|web))(?:[/\\\\]|$)`);
}

module.exports = { instalarMonitoramento, exclusaoDeSaidas };

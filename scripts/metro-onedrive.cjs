const path = require('node:path');
const INSTALADO = Symbol.for('citouur.metro.dirents');
const TIPOS = ['isFile', 'isDirectory', 'isSymbolicLink', 'isBlockDevice', 'isCharacterDevice', 'isFIFO', 'isSocket'];

// No OneDrive, readdir pode marcar um arquivo comum como link, enquanto
// lstat informa o tipo correto. Confere apenas entradas marcadas como links.
function corrigirDirents(diretorio, entradas, lstat) {
  if (!Array.isArray(entradas)) return;
  for (const entrada of entradas) {
    if (typeof entrada?.name !== 'string' || !entrada.isSymbolicLink?.()) continue;
    try {
      const stat = lstat(path.join(diretorio, entrada.name));
      if (stat.isSymbolicLink()) continue;
      for (const tipo of TIPOS) entrada[tipo] = () => stat[tipo]();
    } catch {
      // O arquivo pode ter sido removido durante a varredura.
    }
  }
}

function instalarCorrecao(fs, raiz, plataforma = process.platform) {
  if (plataforma !== 'win32' || fs[INSTALADO]) return;
  const original = fs.readdir;
  fs.readdir = function (...args) {
    const diretorio = args[0];
    const indice = args.length - 1;
    const callback = args[indice];
    if (typeof diretorio === 'string' && typeof callback === 'function') {
      const relativo = path.relative(raiz, path.resolve(diretorio));
      if (relativo !== '..' && !relativo.startsWith('..' + path.sep) && !path.isAbsolute(relativo)) {
        args[indice] = (erro, entradas) => {
          if (!erro) corrigirDirents(diretorio, entradas, arquivo => fs.lstatSync(arquivo));
          callback(erro, entradas);
        };
      }
    }
    return original.apply(this, args);
  };
  fs[INSTALADO] = true;
}

module.exports = { corrigirDirents, instalarCorrecao };

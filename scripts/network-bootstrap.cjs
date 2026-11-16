const dns = require('node:dns');
const tls = require('node:tls');
if (process.platform === 'win32' && tls.setDefaultCACertificates && tls.getCACertificates) {
  tls.setDefaultCACertificates([...tls.getCACertificates('default'), ...tls.getCACertificates('system')]);
}
const resolver = new dns.promises.Resolver({ timeout: 3000, tries: 1 });
resolver.setServers(['1.1.1.1', '8.8.8.8']);
const original = dns.lookup.bind(dns);
const cache = new Map();
// Resolução alternativa restrita aos serviços públicos usados pelo Expo/npm.
const permitido = host => /(^|\.)(expo\.dev|expo\.io|exp\.host|expo\.app|expo\.fyi|npmjs\.org)$/.test(host);
dns.lookup = function lookup(host, options, callback) {
  if (typeof options === 'function') { callback = options; options = {}; }
  if (!permitido(host) || options?.family === 6 || options === 6) return original(host, options, callback);
  const responder = ips => options?.all ? callback(null, ips.map(address => ({ address, family: 4 }))) : callback(null, ips[0], 4);
  const anterior = cache.get(host);
  if (anterior && anterior.expira > Date.now()) { queueMicrotask(() => responder(anterior.ips)); return; }
  let concluido = false;
  const alternativo = () => {
    if (concluido) return;
    concluido = true;
    resolver.resolve4(host).then(ips => {
      if (!ips.length) throw new Error('DNS sem endereços.');
      cache.set(host, { ips, expira: Date.now() + 30000 }); responder(ips);
    }).catch(callback);
  };
  const timer = setTimeout(alternativo, 1500);
  original(host, options, (err, address, family) => {
    clearTimeout(timer);
    if (concluido) return;
    if (err) return alternativo();
    concluido = true; callback(null, address, family);
  });
};

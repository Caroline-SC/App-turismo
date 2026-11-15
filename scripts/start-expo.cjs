const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

function selecionarHost(interfaces) {
  return Object.values(interfaces).flat().filter(a => a && a.family === 'IPv4' && !a.internal)
    .map(a => a.address).filter(a => /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(a))
    .sort((a, b) => Number(b.startsWith('192.168.')) - Number(a.startsWith('192.168.')))[0];
}
module.exports = { selecionarHost };
if (require.main === module) {
  const host = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || selecionarHost(os.networkInterfaces());
  const args = process.argv.slice(2);
  console.log(`Expo LAN: ${host || 'automático'} | API: porta 5000`);
  const cli = path.join(path.dirname(require.resolve('expo/package.json')), 'bin', 'cli');
  const child = spawn(process.execPath, [cli, 'start', '--lan', '--max-workers', '2', ...args], {
    stdio: 'inherit', windowsHide: true,
    env: { ...process.env, NODE_USE_SYSTEM_CA: '1', ...(host ? { REACT_NATIVE_PACKAGER_HOSTNAME: host } : {}) },
  });
  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
  child.on('error', err => { console.error(err.message); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code || 0; });
}

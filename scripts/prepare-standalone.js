const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const nextDir = path.join(rootDir, '.next');
const standaloneDir = path.join(nextDir, 'standalone');
const standaloneNextDir = path.join(standaloneDir, '.next');

function copyRecursive(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
}

function copyFile(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

if (!fs.existsSync(path.join(standaloneDir, 'server.js'))) {
  console.error("Erro: '.next/standalone/server.js' não encontrado. Rode 'next build' antes.");
  process.exit(1);
}

copyRecursive(path.join(nextDir, 'static'), path.join(standaloneNextDir, 'static'));
copyFile(path.join(nextDir, 'BUILD_ID'), path.join(standaloneNextDir, 'BUILD_ID'));
copyFile(path.join(nextDir, 'prerender-manifest.json'), path.join(standaloneNextDir, 'prerender-manifest.json'));
copyFile(path.join(nextDir, 'routes-manifest.json'), path.join(standaloneNextDir, 'routes-manifest.json'));
copyFile(path.join(nextDir, 'required-server-files.json'), path.join(standaloneNextDir, 'required-server-files.json'));
copyRecursive(path.join(rootDir, 'public'), path.join(standaloneDir, 'public'));

console.log('Standalone preparado com sucesso.');

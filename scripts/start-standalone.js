const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = process.cwd();
const nextDir = path.join(rootDir, '.next');
const standaloneDir = path.join(nextDir, 'standalone');
const standaloneServerPath = path.join(standaloneDir, 'server.js');
const standaloneNextDir = path.join(standaloneDir, '.next');

function ensureExists(targetPath, message) {
  if (!fs.existsSync(targetPath)) {
    console.error(message);
    process.exit(1);
  }
}

function copyRecursive(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
}

ensureExists(
  standaloneServerPath,
  "Erro: build standalone não encontrado. Rode 'npm run build' antes do 'npm start'."
);

copyRecursive(path.join(nextDir, 'static'), path.join(standaloneNextDir, 'static'));
copyRecursive(path.join(rootDir, 'public'), path.join(standaloneDir, 'public'));

const child = spawn(process.execPath, ['server.js'], {
  cwd: standaloneDir,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

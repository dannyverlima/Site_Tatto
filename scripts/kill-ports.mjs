/**
 * Mata processos que estão usando as portas do dev antes de iniciar.
 * Funciona no Windows, macOS e Linux.
 */
import { createServer } from 'node:net';

const PORTS = [5173, 5175];

async function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function killPort(port) {
  const free = await isPortFree(port);
  if (free) return;

  const { execSync } = await import('node:child_process');
  const isWindows = process.platform === 'win32';

  try {
    if (isWindows) {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const pids = [...new Set(
        out.split('\n')
          .map(l => l.trim().split(/\s+/).pop())
          .filter(p => p && /^\d+$/.test(p) && p !== '0')
      )];
      for (const pid of pids) {
        try { execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' }); } catch (_) {}
      }
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore', shell: true });
    }
    console.log(`✓ Porta ${port} liberada`);
  } catch (_) {
    // porta já estava livre ou processo já encerrou
  }
}

for (const port of PORTS) {
  await killPort(port);
}

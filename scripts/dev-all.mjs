import { execFileSync, spawn } from 'node:child_process';

const ports = [5173, 5175];

const getListeningPids = (port) => {
  try {
    const output = execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`,
      ],
      { encoding: 'utf8' }
    );

    const pids = new Set();

    for (const line of output.split(/\r?\n/)) {
      const pid = line.trim();
      if (/^\d+$/.test(pid)) {
        pids.add(pid);
      }
    }

    return [...pids];
  } catch {
    return [];
  }
};

const killPid = (pid) => {
  try {
    execFileSync('taskkill', ['/F', '/T', '/PID', pid], { stdio: 'ignore' });
    console.log(`Liberada porta ocupada pelo PID ${pid}`);
  } catch {
    console.log(`Nao foi possivel encerrar o PID ${pid}`);
  }
};

for (const port of ports) {
  for (const pid of getListeningPids(port)) {
    killPid(pid);
  }
}

const api = process.platform === 'win32'
  ? spawn('cmd.exe', ['/c', 'pnpm', 'dev:server'], { stdio: 'inherit' })
  : spawn('pnpm', ['dev:server'], { stdio: 'inherit' });
const web = process.platform === 'win32'
  ? spawn('cmd.exe', ['/c', 'pnpm', 'dev'], { stdio: 'inherit' })
  : spawn('pnpm', ['dev'], { stdio: 'inherit' });

let shuttingDown = false;

const terminate = (code = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of [api, web]) {
    if (child?.pid) {
      try {
        if (process.platform === 'win32') {
          execFileSync('taskkill', ['/F', '/T', '/PID', String(child.pid)], { stdio: 'ignore' });
        } else {
          child.kill('SIGTERM');
        }
      } catch {
        // Ignore shutdown errors.
      }
    }
  }

  process.exit(code);
};

api.on('exit', (code) => terminate(code ?? 0));
web.on('exit', (code) => terminate(code ?? 0));
process.on('SIGINT', () => terminate(0));
process.on('SIGTERM', () => terminate(0));
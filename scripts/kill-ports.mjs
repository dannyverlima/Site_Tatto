/**
 * Mata processos que estão usando as portas do dev antes de iniciar.
 * Funciona no Windows, macOS e Linux.
 *
 * IMPORTANTE (Windows): usa `netstat -ano` sem `-p TCP` para ver tanto
 * IPv4 (0.0.0.0:5173) quanto IPv6 ([::]:5173 e [::1]:5173).
 */
import { execSync } from 'node:child_process';

const PORTS = [5173, 5175];
const isWindows = process.platform === 'win32';

function killPort(port) {
  try {
    if (isWindows) {
      // netstat -ano sem "-p TCP" mostra IPv4 + IPv6
      const out = execSync('netstat -ano', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });

      const pids = new Set();
      for (const line of out.split('\n')) {
        const trimmed = line.trim();
        // Só linhas LISTENING
        if (!trimmed.toUpperCase().includes('LISTENING')) continue;
        // Formato: "TCP  0.0.0.0:5173  0.0.0.0:0  LISTENING  PID"
        //          "TCP  [::]:5173     [::]:0     LISTENING  PID"
        //          "TCP  [::1]:5173    [::]:0     LISTENING  PID"
        const cols = trimmed.split(/\s+/);
        if (cols.length < 4) continue;
        const localAddr = cols[1]; // ex: "0.0.0.0:5173" ou "[::1]:5173"
        // Verifica se termina exactamente com ":PORT"
        if (!localAddr.endsWith(`:${port}`)) continue;
        const procId = cols[cols.length - 1];
        if (procId && /^\d+$/.test(procId) && procId !== '0') {
          pids.add(procId);
        }
      }

      for (const procId of pids) {
        try {
          execSync(`taskkill /PID ${procId} /F`, { stdio: 'ignore' });
          console.log(`✓ Porta ${port} liberada (PID ${procId})`);
        } catch (_) {}
      }
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, {
        stdio: 'ignore',
        shell: true,
      });
      console.log(`✓ Porta ${port} liberada`);
    }
  } catch (_) {
    // porta já estava livre
  }
}

for (const port of PORTS) {
  killPort(port);
}

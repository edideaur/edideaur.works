import { spawn } from 'node:child_process';

function run(cmd: string, args: string[]): import('node:child_process').ChildProcess {
    return spawn(cmd, args, { stdio: 'inherit' });
}

const astro = run('bun', ['x', 'astro', 'dev']);
const tunnel = run('cloudflared', ['tunnel', '--url', 'http://localhost:3000']);

let cleaned = false;
function cleanup(signal: NodeJS.Signals | 'exit' = 'SIGTERM') {
    if (cleaned) return;
    cleaned = true;
    if (!killProcessGroup(signal)) killChildren();
}

function killProcessGroup(signal: NodeJS.Signals | 'exit'): boolean {
    try {
        const pgid = (process as any).getpgid(process.pid);
        process.kill(-pgid, signal === 'exit' ? 'SIGTERM' : signal);
        return true;
    } catch {
        return false;
    }
}

function killChildren() {
    for (const p of [astro, tunnel]) {
        try {
            p.kill('SIGTERM');
        } catch {}
    }
}

process.on('SIGINT', () => {
    cleanup('SIGINT');
    process.exit(0);
});
process.on('SIGTERM', () => {
    cleanup('SIGTERM');
    process.exit(0);
});
process.on('exit', () => cleanup('exit'));

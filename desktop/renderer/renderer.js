import { appendText, processJsonlChunk } from './terminalLogic.js';

const outEl = document.getElementById('out');
const cmdEl = document.getElementById('cmd');
const runBtn = document.getElementById('run');
const cancelBtn = document.getElementById('cancel');

let stdoutBuf = '';

function append(text) {
  appendText(outEl, text);
}

function handleLine(line) {
  try {
    const obj = JSON.parse(line);

    if (obj.type === 'log' && obj.message) {
      append(obj.message + '\n');
    } else if (obj.type === 'result' && obj.result) {
      append('[RESULT] ' + JSON.stringify(obj.result) + '\n');
    } else if (obj.type) {
      append(`[${obj.type}] ${(obj.message || '').toString()}`.trim() + '\n');
    } else {
      append(line + '\n');
    }
  } catch {
    append(line + '\n');
  }
}

window.scannerAPI.onStdout((chunk) => {
  stdoutBuf = processJsonlChunk({
    chunk,
    stdoutBuf,
    onLine: handleLine
  });
});

window.scannerAPI.onStderr((chunk) => append('[stderr] ' + chunk));
window.scannerAPI.onExit((d) => append(`\n[exit] code=${d.code}\n`));

runBtn.addEventListener('click', async () => {
  const cmd = (cmdEl.value || '').trim();
  if (!cmd) return;

  outEl.textContent = '';
  stdoutBuf = '';

  if (cmd === 'help') {
    append('Available commands:\n');
    append('- help\n');
    append('- start <quick|custom>\n');
    append('- cancel\n');
    return;
  }

  if (cmd.startsWith('start')) {
    const mode = cmd.includes('custom') ? 'custom' : 'quick';

    // Update after you build the Go binary.
    const binaryPath = 'senpaiscanner.exe';

    const args = ['--jsonl-server', `-mode=${mode}`];
    await window.scannerAPI.start({ binaryPath, args });
    return;
  }

  append(`Unknown command: ${cmd}\n`);
});

cancelBtn.addEventListener('click', async () => {
  await window.scannerAPI.cancel();
  append('\n[cancel requested]\n');
});


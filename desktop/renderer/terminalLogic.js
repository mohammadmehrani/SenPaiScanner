// Shared terminal parsing/formatting helpers.

export function appendText(outEl, text) {
  outEl.textContent += text;
  outEl.scrollTop = outEl.scrollHeight;
}

export function processJsonlChunk({ chunk, stdoutBuf, onLine }) {
  stdoutBuf += chunk;
  let idx;
  while ((idx = stdoutBuf.indexOf('\n')) !== -1) {
    const line = stdoutBuf.slice(0, idx).trim();
    stdoutBuf = stdoutBuf.slice(idx + 1);
    if (!line) continue;
    onLine(line);
  }
  return stdoutBuf;
}


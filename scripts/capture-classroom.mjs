import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\PC05\\.gemini\\antigravity\\brain\\f0ecaf8d-050f-443e-a7db-6a06a6e84320';
const profileDir = path.join(artifactDir, 'scratch', 'chrome-profile');
fs.mkdirSync(profileDir, { recursive: true });

const targets = [
  {
    name: 'screenshot_corridor_doors.png',
    url: 'http://localhost:3001/dunia?preview=true&tp=corridor',
  },
  {
    name: 'screenshot_classroom_rear.png',
    url: 'http://localhost:3001/dunia?preview=true&tp=class1a_rear',
  },
  {
    name: 'screenshot_classroom_doors_open.png',
    url: 'http://localhost:3001/dunia?preview=true&tp=corridor&doors=open',
  },
  {
    name: 'screenshot_seat_field_view.png',
    url: 'http://localhost:3001/dunia?preview=true&tp=class1a_seat',
  },
  {
    name: 'screenshot_campus_layout_topdown.png',
    url: 'http://localhost:3001/dunia?preview=true&mode=topdown',
  },
];

async function main() {
  console.log('Spawning Chrome with isolated profile...');
  const port = 9555;
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--window-size=1280,720',
    '--use-angle=default',
    '--enable-webgl',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const tabs = await res.json();
      const pageTab = tabs.find((t) => t.type === 'page');
      if (pageTab?.webSocketDebuggerUrl) {
        wsUrl = pageTab.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error('Could not find active page tab');
    chrome.kill();
    process.exit(1);
  }

  console.log('Connecting to page WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  let reqId = 1;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = reqId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });

  for (const t of targets) {
    console.log(`\nNavigating to ${t.url} ...`);
    await send('Page.navigate', { url: t.url });
    // Allow 4 seconds for Next.js SSR hydration and Three.js WebGL scene draw
    await new Promise((r) => setTimeout(r, 4000));

    console.log(`Capturing ${t.name} ...`);
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(res.data, 'base64');
    const outPath = path.join(artifactDir, t.name);
    fs.writeFileSync(outPath, buf);
    console.log(`Saved ${t.name} (${buf.length} bytes)`);
  }

  ws.close();
  chrome.kill();
  console.log('\nAll 5 screenshots captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

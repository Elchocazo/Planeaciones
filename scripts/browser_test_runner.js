const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8765;
const CDP_PORT = 9222;

// 1. Static HTTP Server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, '..', reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeMap = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'text/plain' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
  }
});

async function main() {
  await new Promise(r => server.listen(PORT, r));
  console.log(`[Server] Local server running at http://localhost:${PORT}`);

  const userDataDir = path.join(__dirname, '..', 'backups', 'temp_browser_profile');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  // Find Edge or Chrome
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserBin = fs.existsSync(edgePath) ? edgePath : chromePath;

  console.log(`[Browser] Launching: ${browserBin}`);
  const browserProc = spawn(browserBin, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  // Wait for CDP port
  let targets = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (res.ok) {
        targets = await res.json();
        break;
      }
    } catch (e) {}
  }

  if (!targets || targets.length === 0) {
    console.error('[Browser] Failed to connect to browser CDP.');
    browserProc.kill();
    server.close();
    process.exit(1);
  }

  // Find page target
  let newTab = null;
  try {
    const newRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?http://localhost:${PORT}/index.html`, { method: 'PUT' });
    if (newRes.ok) {
      newTab = await newRes.json();
    }
  } catch (e) {}

  if (!newTab) {
    const pageTarget = targets.find(t => t.type === 'page');
    newTab = pageTarget || targets[0];
  }

  const wsUrl = newTab.webSocketDebuggerUrl;
  console.log(`[Browser] Connected to target: ${newTab.title} (${wsUrl})`);

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pendingRequests = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pendingRequests.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const logs = [];
  const errors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
      return;
    }

    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' ');
      logs.push(`[${msg.params.type.toUpperCase()}] ${text}`);
      if (msg.params.type === 'error') {
        errors.push(`Console error: ${text}`);
      }
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const desc = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
      errors.push(`Uncaught Exception: ${desc}`);
      console.error('🔴 BROWSER EXCEPTION:', desc);
    }
  };

  await new Promise(r => ws.onopen = r);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Console.enable');

  console.log('[Browser] Navigating to http://localhost:' + PORT + '/index.html ...');
  const navStart = Date.now();
  await send('Page.navigate', { url: `http://localhost:${PORT}/index.html` });

  // Wait for load
  await new Promise(r => setTimeout(r, 3000));
  console.log(`[Browser] Navigation completed in ${Date.now() - navStart}ms.`);

  // Evaluate state of page
  const pageState = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        title: document.title,
        hash: window.location.hash,
        appInitialized: typeof App !== 'undefined' ? App._isInitialized : null,
        currentView: typeof AppRouter !== 'undefined' ? AppRouter.currentView : null,
        activeRole: typeof UserService !== 'undefined' ? UserService.getCurrentUser()?.role : null,
        bodyClasses: document.body.className,
        htmlClasses: document.documentElement.className,
        visibleModals: Array.from(document.querySelectorAll('.modal, .modal-backdrop, .portal-gate-overlay')).filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }).map(el => ({ id: el.id, class: el.className, zIndex: window.getComputedStyle(el).zIndex }))
      };
    })()`,
    returnByValue: true
  });

  const getVal = (res) => res && res.result ? res.result.value : res;

  console.log('[Raw pageState]:', JSON.stringify(pageState, null, 2));

  // Find buttons containing "Planear"
  const planearButtons = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button, a, span')).filter(el => {
        const txt = el.innerText || el.textContent || '';
        return txt.toLowerCase().includes('planear');
      });
      return btns.map((b, idx) => {
        const rect = b.getBoundingClientRect();
        const style = window.getComputedStyle(b);
        return {
          idx,
          tag: b.tagName,
          text: (b.innerText || b.textContent || '').trim().slice(0, 50),
          onclick: b.getAttribute('onclick'),
          className: b.className,
          visible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0,
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          disabled: b.disabled || false
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('[Planear Buttons Found]:', JSON.stringify(getVal(planearButtons), null, 2));

  // Click on the first visible "+ Planear" button if available
  const clickResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(el => {
        const txt = (el.innerText || el.textContent || '').trim();
        return txt.includes('Planear') || txt.includes('+ Planear');
      });
      const visibleBtn = btns.find(b => {
        const rect = b.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (!visibleBtn) {
        return { success: false, reason: 'No visible Planear button found' };
      }
      try {
        visibleBtn.click();
        return {
          success: true,
          buttonText: (visibleBtn.innerText || visibleBtn.textContent || '').trim(),
          onclick: visibleBtn.getAttribute('onclick'),
          newViewAfterClick: typeof AppRouter !== 'undefined' ? AppRouter.currentView : null
        };
      } catch (err) {
        return { success: false, error: err.message, stack: err.stack };
      }
    })()`,
    returnByValue: true
  });

  console.log('[Click Simulation Result]:', JSON.stringify(getVal(clickResult), null, 2));

  // Wait 1 second to observe after-click state
  await new Promise(r => setTimeout(r, 1000));

  const afterClickState = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        currentView: typeof AppRouter !== 'undefined' ? AppRouter.currentView : null,
        currentOptions: typeof AppRouter !== 'undefined' ? AppRouter.currentOptions : null,
        editorVisible: (() => {
          const el = document.getElementById('class-editor-view');
          if (!el) return 'no element';
          const s = window.getComputedStyle(el);
          return { display: s.display, opacity: s.opacity, height: s.height };
        })(),
        editorInnerLength: document.getElementById('class-editor-view')?.innerHTML?.length || 0,
        dashboardVisible: (() => {
          const el = document.getElementById('dashboard-view');
          if (!el) return 'no element';
          const s = window.getComputedStyle(el);
          return { display: s.display };
        })()
      };
    })()`,
    returnByValue: true
  });

  console.log('[State After Click]:', JSON.stringify(getVal(afterClickState), null, 2));

  console.log(`\n--- BROWSER CONSOLE LOGS (${logs.length} entries) ---`);
  logs.slice(-30).forEach(l => console.log(l));

  if (errors.length > 0) {
    console.log(`\n🔴 BROWSER ERRORS ENCOUNTERED (${errors.length}):`);
    errors.forEach(e => console.error(e));
  } else {
    console.log('\n✅ Zero browser errors reported!');
  }

  // Cleanup
  ws.close();
  browserProc.kill();
  server.close();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (e) {}
}

main().catch(err => {
  console.error('FATAL RUNNER ERROR:', err);
  process.exit(1);
});

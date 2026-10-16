/* Corrected Phase D: restart/landscape regression derived from preserved historical harness. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn, spawnSync} from 'node:child_process';
import {startPreview, root, prefix} from '../tools/preview.mjs';

import evidence from '../tools/test-evidence.cjs';
const OUT = path.join(root, '.workbuddy-ai', process.env.NECTA_RESTART_SUBDIR || 'browser-restart-evidence');
fs.mkdirSync(OUT, {recursive: true});
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const cert = process.env.NECTA_TEST_CERT, key = process.env.NECTA_TEST_KEY;
if (!cert || !key) throw Error('Set NECTA_TEST_CERT and NECTA_TEST_KEY.');

const checks = [], errors = [], requests = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const check = (name, pass, detail) => {
  checks.push({name, pass: !!pass, ...(detail === undefined ? {} : {detail})});
  console.log((pass ? 'PASS' : 'FAIL') + ' | ' + name + (pass ? '' : ' | ' + JSON.stringify(detail)));
};

class CDP {
  constructor(ws) {
    this.ws = ws; this.seq = 0; this.pending = new Map();
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); clearTimeout(p.timer); this.pending.delete(m.id); m.error ? p.reject(Error(JSON.stringify(m.error))) : p.resolve(m.result); return; }
      if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(JSON.stringify(m.params.args));
      if (m.method === 'Network.requestWillBeSent') requests.push(m.params.request.url);
      if (m.method === 'Page.javascriptDialogOpening') this.send('Page.handleJavaScriptDialog', {accept: true}).catch(() => {});
    });
  }
  send(method, params = {}) { return new Promise((resolve, reject) => { const id = ++this.seq; const timer = setTimeout(() => { this.pending.delete(id); reject(Error('CDP timeout ' + method)); }, 15000); this.pending.set(id, {resolve, reject, timer}); this.ws.send(JSON.stringify({id, method, params})); }); }
  async eval(expression) { const r = await this.send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true}); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; }
  async wait(expression) { for (let i = 0; i < 120; i++) { try { if (await this.eval(expression)) return; } catch {} await sleep(100); } throw Error('Wait failed: ' + expression); }
  async click(selector) { await this.eval(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`); const r = await this.eval(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`); await this.send('Input.dispatchMouseEvent', {type: 'mousePressed', ...r, button: 'left', clickCount: 1}); await this.send('Input.dispatchMouseEvent', {type: 'mouseReleased', ...r, button: 'left', clickCount: 1}); }
  async shot(name) { await this.eval('window.scrollTo(0,0)'); const size = await this.eval('({width:innerWidth,height:document.documentElement.scrollHeight})'); const {data} = await this.send('Page.captureScreenshot', {format: 'png', captureBeyondViewport: true, clip: {x: 0, y: 0, width: size.width, height: size.height, scale: 1}}); fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(data, 'base64')); }
  close() { for (const p of this.pending.values()) clearTimeout(p.timer); try { this.ws.close(); } catch {} }
}
async function connect(url) { const ws = new WebSocket(url); await new Promise((r, j) => { ws.addEventListener('open', r, {once: true}); ws.addEventListener('error', j, {once: true}); }); return new CDP(ws); }

const run = fs.mkdtempSync(path.join(os.tmpdir(), 'necta-restart-'));
const profile = path.join(run, 'profile');
const evidenceStart = evidence.begin(path.basename(run));

async function launch() {
  // A previous run in the same profile leaves a stale DevToolsActivePort behind.
  // Remove it so we never dial a dead debug port after a browser restart.
  const portFile = path.join(profile, 'DevToolsActivePort');
  try { fs.rmSync(portFile, {force: true}); } catch {}
  const child = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--disable-sync', '--disable-extensions',
    '--disable-background-networking', '--ignore-certificate-errors', '--window-size=1280,900', 'about:blank'],
    {windowsHide: true, stdio: 'ignore'});
  let spawnError; child.on('error', (e) => { spawnError = e; });
  for (let i = 0; i < 150 && !fs.existsSync(portFile); i++) { if (spawnError) throw spawnError; await sleep(100); }
  if (!fs.existsSync(portFile)) throw Error('Chrome did not start');
  const debugPort = fs.readFileSync(portFile, 'utf8').split('\n')[0];
  const cdp = 'http://127.0.0.1:' + debugPort;
  let version;
  for (let i = 0; i < 60; i++) {
    try { version = await (await fetch(cdp + '/json/version')).json(); break; } catch { await sleep(250); }
  }
  if (!version) throw Error('DevTools endpoint never answered on ' + cdp);
  const bc = await connect(version.webSocketDebuggerUrl);
  const target = await (await fetch(cdp + '/json/new?about:blank', {method: 'PUT'})).json();
  const c = await connect(target.webSocketDebuggerUrl);
  for (const d of ['Runtime', 'Page', 'DOM', 'Network', 'ServiceWorker']) await c.send(d + '.enable');
  return {child, bc, c, version};
}
async function shutdown(h) {
  // Browser.close acknowledges before the process has necessarily flushed its
  // profile. Killing it immediately can lose localStorage on Linux. Observe the
  // actual child exit; a forced termination is a failed persistence test.
  const stopped = new Promise(resolve => {
    if(h.child.exitCode !== null || h.child.signalCode !== null){resolve(true);return;}
    const timer=setTimeout(()=>resolve(false),15000);
    h.child.once('exit',()=>{clearTimeout(timer);resolve(true);});
  });
  h.c.close(); try { await h.bc.send('Browser.close'); } catch {}
  const exited=await stopped;
  try { h.bc.close(); } catch {}
  if(!exited){
    if(process.platform==='win32')spawnSync('taskkill', ['/PID', String(h.child.pid), '/T', '/F'], {windowsHide: true, stdio: 'ignore'});
    h.child.kill();
    throw Error('Browser did not exit gracefully; forced shutdown cannot certify persistence.');
  }
}

const landscape = async (w, h) => { await c.send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile: true, screenOrientation: {type: 'landscapePrimary', angle: 90}}); await c.send('Emulation.setTouchEmulationEnabled', {enabled: true}); };
const portrait = async (w) => { await c.send('Emulation.setDeviceMetricsOverride', {width: w, height: 844, deviceScaleFactor: 1, mobile: true, screenOrientation: {type: 'portraitPrimary', angle: 0}}); await c.send('Emulation.setTouchEmulationEnabled', {enabled: true}); };
const input = async (selector, value) => { await c.eval(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}));})()`); };
const chooseTopic = async (name) => { await c.eval(`(()=>{const s=document.getElementById('topicSelect');s.value=${JSON.stringify(name)};s.dispatchEvent(new Event('change'));})()`); };
const navigate = async (url) => { await c.send('Page.navigate', {url}); await c.wait(`document.readyState==='complete'`); };

let server, handle, c, bc, browserVersion, origin, app;
const seededLegacy = JSON.stringify([{id: 'synthetic-restart-record', subject: 'civics', qref: '7', notes: 'Synthetic profile record seeded by the Phase D restart harness.', saved: '2026-10-16T08:00:00Z'}]);

try {
  server = await startPreview({port: 0, tls: {cert: fs.readFileSync(cert), key: fs.readFileSync(key)}});
  origin = 'https://127.0.0.1:' + server.address().port;
  app = origin + prefix;

  /* ---------- Phase 1: first visit, warm cache, seed synthetic data ---------- */
  handle = await launch(); ({c, bc} = handle); browserVersion = handle.version.Browser;
  console.log('Browser: ' + browserVersion);
  await navigate(app);
  await c.wait('!!navigator.serviceWorker.controller');
  await c.wait(`(async()=>(await caches.keys()).includes('necta-rescue-static-v8'))()`);
  check('phase 1: candidate v8 cache installed', await c.eval(`(async()=>(await caches.keys()).includes('necta-rescue-static-v8'))()`));
  check('phase 1: exactly 32 reviewed cards load', await c.eval(`NECTA_CIVICS.cards.length`) === 32, await c.eval(`NECTA_CIVICS.cards.length`));
  check('phase 1: worker controls the page', await c.eval(`!!navigator.serviceWorker.controller`));

  /* ---------- Landscape orientation (taken on the home screen) ---------- */
  for (const [w, hgt, label] of [[844, 390, '390-landscape'], [780, 360, '360-landscape'], [693, 320, '320-landscape']]) {
    await landscape(w, hgt);
    await c.shot('landscape-home-' + label);
    check('landscape home has no horizontal overflow ' + label, await c.eval('document.documentElement.scrollWidth<=innerWidth'), {scrollWidth: await c.eval('document.documentElement.scrollWidth'), innerWidth: await c.eval('innerWidth')});
    // Vertical scrolling is expected on a short landscape viewport; the real
    // requirement is that the primary action stays on-screen horizontally and
    // remains reachable by scrolling.
    check('landscape primary action reachable ' + label, await c.eval(`(()=>{const b=document.getElementById('startCivics');if(!b)return false;const r=b.getBoundingClientRect();return r.width>0&&r.height>=44&&r.width<=innerWidth&&document.documentElement.scrollHeight>=r.bottom})()`),
      await c.eval(`(()=>{const b=document.getElementById('startCivics');if(!b)return 'missing';const r=b.getBoundingClientRect();return{width:r.width,height:r.height,innerWidth,scrollHeight:document.documentElement.scrollHeight,bottom:r.bottom}})()`));
  }

  /* ---------- Seed synthetic data and enter the study flow ---------- */
  await portrait(390);
  await c.eval(`localStorage.setItem('necta-rescue-pilot-v1',${JSON.stringify(seededLegacy)})`);
  await c.click('#startCivics'); await c.click('.topic-button'); await c.click('#revealAnswer'); await c.click('#understood');
  const beforeLegacy = await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`);
  const beforeLearning = await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`);
  check('phase 1: synthetic learning record written', JSON.parse(beforeLearning).records.length === 1);
  const beforeCache = await c.eval(`(async()=>{const k=await caches.open('necta-rescue-static-v8');return (await k.keys()).map(r=>new URL(r.url).pathname).sort()})()`);
  check('phase 1: v8 cache holds 12 explicit assets', beforeCache.length === 12, beforeCache.length);

  await chooseTopic('Human rights'); await input('#kindSelect', 'original_exam'); await c.click('#revealAnswer');
  for (const [w, hgt, label] of [[844, 390, '390-landscape'], [693, 320, '320-landscape']]) {
    await landscape(w, hgt);
    await c.shot('landscape-answer-' + label);
    check('landscape revealed answer fits ' + label, await c.eval('document.documentElement.scrollWidth<=innerWidth'));
    check('landscape MCQ labels complete ' + label, await c.eval(`[...document.querySelectorAll('.option-label')].map(e=>e.textContent).join('')`) === 'ABCDE');
  }
  for (const w of [320, 360, 390]) { await portrait(w); await c.shot('restart-portrait-' + w); }

  /* ---------- Normal reload: the worker must still control the page ---------- */
  await portrait(390);
  await c.send('Page.reload');
  await c.wait(`document.readyState==='complete' && !!NECTA_CIVICS && NECTA_CIVICS.cards.length===32`);
  await c.wait(`!!navigator.serviceWorker.controller`);
  check('reload keeps 32 cards', await c.eval(`NECTA_CIVICS.cards.length`) === 32);
  check('reload keeps worker in control', await c.eval(`!!navigator.serviceWorker.controller`));
  check('reload preserves legacy bytes', await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`) === beforeLegacy);
  check('reload preserves learning bytes', await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`) === beforeLearning);

  /* ---------- Shift-reload (cache bypass): Chrome intentionally skips the
     service worker for this navigation. The app must still load and must
     still preserve student storage. ---------- */
  await c.send('Page.reload', {ignoreCache: true});
  await c.wait(`document.readyState==='complete' && !!NECTA_CIVICS && NECTA_CIVICS.cards.length===32`);
  check('shift-reload still delivers 32 cards', await c.eval(`NECTA_CIVICS.cards.length`) === 32);
  check('shift-reload preserves legacy bytes', await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`) === beforeLegacy);
  check('shift-reload preserves learning bytes', await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`) === beforeLearning);
  check('shift-reload bypasses the worker as Chrome specifies', await c.eval(`!navigator.serviceWorker.controller`),
    await c.eval(`!!navigator.serviceWorker.controller`));

  /* ---------- Phase 2: full browser restart on the same profile ---------- */
  await shutdown(handle);
  check('browser process fully stopped before restart', handle.child.exitCode === 0,
    {exitCode:handle.child.exitCode,signal:handle.child.signalCode});

  handle = await launch(); ({c, bc} = handle);
  check('restart: same browser build', handle.version.Browser === browserVersion, {first: browserVersion, second: handle.version.Browser});
  await navigate(app);
  await c.wait(`document.readyState==='complete' && !!NECTA_CIVICS`);
  await c.wait(`!!navigator.serviceWorker.controller`);
  check('restart: worker re-registered and controlling', await c.eval(`!!navigator.serviceWorker.controller`));
  check('restart: v8 cache survived the restart', await c.eval(`(async()=>(await caches.keys()).includes('necta-rescue-static-v8'))()`));
  const afterCache = await c.eval(`(async()=>{const k=await caches.open('necta-rescue-static-v8');return (await k.keys()).map(r=>new URL(r.url).pathname).sort()})()`);
  check('restart: cached asset set unchanged', JSON.stringify(afterCache) === JSON.stringify(beforeCache), {before: beforeCache.length, after: afterCache.length});
  const afterLegacy=await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`);
  const afterLearning=await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`);
  check('restart: synthetic legacy bytes survived', afterLegacy === beforeLegacy, {before:beforeLegacy,after:afterLegacy});
  check('restart: synthetic learning bytes survived', afterLearning === beforeLearning, {before:beforeLearning,after:afterLearning});
  await c.wait(`document.getElementById('collectionCount').textContent.includes('32')`);
  check('restart: 32 cards still offered', await c.eval(`NECTA_CIVICS.cards.length`) === 32);

  /* ---------- Offline after restart: stop the server, reveal every answer ---------- */
  await c.send('Network.emulateNetworkConditions', {offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0});
  await new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }); server = null;
  await navigate(app + '?restart-offline=1');
  await c.wait(`document.getElementById('collectionCount').textContent.includes('32')`);
  check('restart+offline: reviewed content still loads with server stopped', await c.eval(`!navigator.onLine && NECTA_CIVICS.cards.length===32`));

  const allCards = await c.eval(`NectaLearningCore.eligibleCards(NECTA_CIVICS)`);
  check('restart+offline: 32 eligible cards', allCards.length === 32, allCards.length);
  await c.click('#startCivics'); await c.click('.topic-button');
  let revealed = 0, mismatched = [];
  for (const item of allCards) {
    await chooseTopic(item.topic); await input('#kindSelect', item.kind);
    const ids = allCards.filter((x) => x.topic === item.topic && x.kind === item.kind).map((x) => x.id);
    for (let i = 0; i < ids.indexOf(item.id); i++) await c.click('#nextQuestion');
    await c.click('#revealAnswer');
    const got = JSON.stringify(await c.eval(`[...document.querySelectorAll('#answerBullets li')].map(e=>e.textContent)`));
    if (got === JSON.stringify(item.answer)) revealed++; else mismatched.push(item.id);
  }
  check('restart+offline: all 32 answers reveal with matching bullets', revealed === 32 && mismatched.length === 0, {revealed, mismatched});
  await c.shot('restart-offline-390');
  check('restart+offline: synthetic legacy bytes untouched', await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`) === beforeLegacy);

  const external = [...new Set(requests)].filter((u) => /^https?:/.test(u) && !u.startsWith(origin));
  check('no third-party requests across restart harness', external.length === 0, external);
  check('no JavaScript errors across restart harness', errors.length === 0, errors);
} catch (err) {
  check('restart harness completed', false, err.stack);
} finally {
  try { if(handle && handle.child.exitCode === null && handle.child.signalCode === null) await shutdown(handle); }
  catch(err){check('final browser shutdown was graceful',false,err.message);}
  if (server) await new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); });
}

const attribution = evidence.finish(evidenceStart);
check('test inputs and Git identity stayed unchanged', attribution.stable_inputs);
const failed = checks.filter((x) => !x.pass);
fs.writeFileSync(path.join(OUT, 'restart-landscape.json'), JSON.stringify({
  browser: browserVersion, ...attribution,
  checks, errors, external_requests: [...new Set(requests)].filter((u) => /^https?:/.test(u) && !u.startsWith(origin)),
  finished_at: new Date().toISOString(),
}, null, 2));
console.log(`\n${checks.length - failed.length}/${checks.length} restart/landscape checks passed`);
process.exit(failed.length ? 1 : 0);

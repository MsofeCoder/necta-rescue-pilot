/* Real Chrome, HTTPS project subpath, production -> candidate upgrade. No npm dependencies.
   Set NECTA_TEST_CERT, NECTA_TEST_KEY, and optionally CHROME_PATH before running. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn,execFileSync} from 'node:child_process';
import {startPreview,root,docs,prefix} from '../tools/preview.mjs';
const baseline='d0df839621f6ef4ec09625eb5f21edfea1087343';
const out=path.join(root,'.workbuddy-ai','browser-evidence');
fs.mkdirSync(out,{recursive:true});
// Keep Chrome's profile path short: deeply nested Windows paths break CacheStorage.
const run=fs.mkdtempSync(path.join(os.tmpdir(),'necta-civics-'));
const downloads=path.join(run,'downloads');fs.mkdirSync(downloads);
const checks=[],errors=[],requests=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function check(name,pass,detail){checks.push({name,pass:!!pass,...(detail===undefined?{}:{detail})});console.log((pass?'PASS':'FAIL')+' | '+name+(pass?'':' | '+JSON.stringify(detail)));}
function demand(name,pass,detail){check(name,pass,detail);if(!pass)throw Error(name);}
const prod=new Map();
for(const name of execFileSync('git',['ls-tree','--name-only',baseline+':docs'],{cwd:root,encoding:'utf8'}).trim().split('\n')){
  prod.set(name,execFileSync('git',['show',baseline+':docs/'+name],{cwd:root}));
}
let phase='baseline', fixture=null,server,chrome,c,bc;
const cert=process.env.NECTA_TEST_CERT,key=process.env.NECTA_TEST_KEY;
if(!cert||!key)throw Error('Provide existing local HTTPS test certificate and key via NECTA_TEST_CERT and NECTA_TEST_KEY.');
class CDP {
  constructor(ws){this.ws=ws;this.seq=0;this.pending=new Map();ws.addEventListener('message',e=>{
    const m=JSON.parse(e.data);if(m.id&&this.pending.has(m.id)){const p=this.pending.get(m.id);clearTimeout(p.timer);this.pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);return;}
    if(m.method==='ServiceWorker.workerErrorReported')console.log('WORKER ERROR',JSON.stringify(m.params));
    if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
    if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(JSON.stringify(m.params.args));
    if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);
    if(m.method==='Page.javascriptDialogOpening')this.send('Page.handleJavaScriptDialog',{accept:true}).catch(()=>{});
  });}
  send(method,params={}){return new Promise((resolve,reject)=>{const id=++this.seq;const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('CDP timeout '+method));},15000);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify({id,method,params}));});}
  async eval(expression){const r=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
  async wait(expression){for(let i=0;i<100;i++){try{if(await this.eval(expression))return;}catch{}await sleep(100);}throw Error('Wait failed: '+expression);}
  async click(selector){await this.eval(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);const r=await this.eval(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await this.send('Input.dispatchMouseEvent',{type:'mousePressed',...r,button:'left',clickCount:1});await this.send('Input.dispatchMouseEvent',{type:'mouseReleased',...r,button:'left',clickCount:1});}
  async shot(name){await this.eval('window.scrollTo(0,0)');const size=await this.eval('({width:innerWidth,height:document.documentElement.scrollHeight})');const {data}=await this.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:size.width,height:size.height,scale:1}});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(data,'base64'));}
  async file(selector,filename){const {root:r}=await this.send('DOM.getDocument');const {nodeId}=await this.send('DOM.querySelector',{nodeId:r.nodeId,selector});await this.send('DOM.setFileInputFiles',{nodeId,files:[filename]});}
  close(){for(const p of this.pending.values())clearTimeout(p.timer);this.ws.close();}
}
async function connect(url){const ws=new WebSocket(url);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});return new CDP(ws);}
async function input(selector,value){await c.eval(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}));})()`);}
async function chooseTopic(name){await c.eval(`(()=>{const s=document.getElementById('topicSelect');s.value=${JSON.stringify(name)};s.dispatchEvent(new Event('change'));})()`);}
async function mobile(width){await c.send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await c.send('Emulation.setTouchEmulationEnabled',{enabled:true});}
async function navigate(url){await c.send('Page.navigate',{url});await c.wait(`document.readyState==='complete'`);}
try{
  server=await startPreview({port:0,tls:{cert:fs.readFileSync(cert),key:fs.readFileSync(key)},read:name=>{
    if(phase==='baseline')return prod.get(name);
    if(name==='civics-content.js'&&fixture!==null)return Buffer.from('window.NECTA_CIVICS = '+JSON.stringify(fixture)+';');
    return fs.readFileSync(path.join(docs,name));
  }});
  const origin='https://127.0.0.1:'+server.address().port,app=origin+prefix;
  chrome=spawn(process.env.CHROME_PATH||path.join(process.env.PROGRAMFILES||'','Google/Chrome/Application/chrome.exe'),[
    '--headless=new','--remote-debugging-port=0','--user-data-dir='+path.join(run,'profile'),
    '--no-first-run','--no-default-browser-check','--disable-gpu','--disable-sync','--disable-extensions','--disable-background-networking',
    '--ignore-certificate-errors','--window-size=1280,900','about:blank'],{windowsHide:true,stdio:'ignore'});
  let spawnError;chrome.on('error',e=>{spawnError=e;});
  const portFile=path.join(run,'profile','DevToolsActivePort');
  for(let i=0;i<100&&!fs.existsSync(portFile);i++){if(spawnError)throw spawnError;await sleep(100);}
  if(!fs.existsSync(portFile))throw Error('Chrome did not start');
  const debugPort=fs.readFileSync(portFile,'utf8').split('\n')[0],cdp='http://127.0.0.1:'+debugPort;
  const version=await(await fetch(cdp+'/json/version')).json();
  bc=await connect(version.webSocketDebuggerUrl);await bc.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads,eventsEnabled:true});
  const target=await(await fetch(cdp+'/json/new?about:blank',{method:'PUT'})).json();c=await connect(target.webSocketDebuggerUrl);
  for(const domain of ['Runtime','Page','DOM','Network','ServiceWorker'])await c.send(domain+'.enable');
  await navigate(app);
  await c.wait('!!navigator.serviceWorker.controller');
  demand('production baseline loads v2',await c.eval(`(async()=> (await caches.keys()).includes('necta-rescue-static-v2'))()`));
  await input('#subject','civics');await input('#qref','3');await input('#notes','Seeded in production before the Civics upgrade.');
  await c.click('#attemptForm button[type=submit]');
  const originalRecords=await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`);
  demand('production writes a genuine legacy record',JSON.parse(originalRecords).length===1);
  await c.click('#exportBtn');
  for(let i=0;i<40&&!fs.readdirSync(downloads).some(f=>f.endsWith('.json'));i++)await sleep(100);
  const oldBackup=path.join(downloads,fs.readdirSync(downloads).find(f=>f.endsWith('.json'))||'missing');
  demand('pre-upgrade backup downloaded',fs.existsSync(oldBackup));
  await c.eval(`caches.open('unrelated-application-cache')`);
  await c.eval(`caches.open('necta-rescue-static-v3')`);
  phase='candidate';await navigate(app);await c.wait(`!!document.getElementById('startCivics')&&document.getElementById('collectionCount').textContent.includes('14')`);
  await c.wait(`(async()=>{const k=await caches.keys();return k.includes('necta-rescue-static-v4')&&!k.includes('necta-rescue-static-v2')})()`);
  demand('v2 -> v4 upgrade preserves legacy bytes',await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`)===originalRecords);
  check('cache upgrade preserves unrelated applications',await c.eval(`(async()=>(await caches.keys()).includes('unrelated-application-cache'))()`));
  check('cache upgrade also removes stale v3',await c.eval(`(async()=>!(await caches.keys()).includes('necta-rescue-static-v3'))()`));
  check('GitHub Pages subpath worker scope',await c.eval(`(async()=>(await navigator.serviceWorker.getRegistration()).scope)()` )===app);
  check('home has a clear Civics action and no PDF input',await c.eval(`!!document.getElementById('startCivics')&&!document.querySelector('input[type=file][accept*="pdf"]')`));
  for(const width of [360,390]){
    await mobile(width);await c.shot('home-'+width);
    check('home fits '+width,await c.eval('document.documentElement.scrollWidth<=innerWidth'));
  }
  await c.click('#startCivics');
  check('six topic choices',await c.eval(`document.querySelectorAll('.topic-button').length`)===6);
  await c.shot('topics-390');
  await c.click('.topic-button');
  check('question appears before answer',await c.eval(`document.getElementById('questionTitle').textContent.length>20&&document.getElementById('answerPanel').hidden&&document.getElementById('answerBullets').childElementCount===0&&document.getElementById('explanation').textContent===''`));
  const hiddenAX=await c.send('Accessibility.getFullAXTree');
  check('concealed answer is absent from accessibility tree',!hiddenAX.nodes.some(n=>!n.ignored&&n.role?.value==='heading'&&n.name?.value==='Answer'));
  check('five printed MCQ labels in A-E order',await c.eval(`[...document.querySelectorAll('.option-label')].map(e=>e.textContent).join('')`)==='ABCDE');
  for(const width of [360,390]){await mobile(width);await c.shot('question-'+width);}
  await c.click('.choice:first-child');await c.click('#revealAnswer');
  check('reveal shows E aligned to printed option text',await c.eval(`document.getElementById('answerBullets').textContent==='E. Economic, social and cultural rights'`));
  check('chosen option stays separate from supplied answer',await c.eval(`document.getElementById('choiceFeedback').textContent.includes('Your choice: A')`));
  check('reveal moves keyboard focus to answer heading',await c.eval(`document.activeElement.id==='answerTitle'`));
  const revealedAX=await c.send('Accessibility.getFullAXTree');
  check('revealed answer is available to assistive technology',revealedAX.nodes.some(n=>!n.ignored&&n.role?.value==='heading'&&n.name?.value==='Answer'));
  await c.click('#understood');
  const learningSaved=await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`);
  check('Understood saved and acknowledged',JSON.parse(learningSaved).records[0].status==='understood'&&await c.eval(`document.getElementById('studyStatus').textContent.startsWith('Saved')`));
  check('self-check never mutates legacy records',await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`)===originalRecords);
  for(const width of [360,390]){
    await mobile(width);await c.shot('answer-'+width);
    check('answer fits '+width,await c.eval('document.documentElement.scrollWidth<=innerWidth'));
    check('primary actions meet 44px at '+width,await c.eval(`['understood','reviseAgain','nextQuestion','previousQuestion'].every(id=>document.getElementById(id).getBoundingClientRect().height>=44)`));
  }
  await c.click('#hideAnswer');
  check('try again hides and clears answer',await c.eval(`document.getElementById('answerPanel').hidden&&!document.getElementById('answerBullets').textContent&&document.activeElement.id==='revealAnswer'`));
  await c.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await c.send('Input.dispatchKeyEvent',{type:'char',text:'\r',unmodifiedText:'\r',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  demand('keyboard Enter reveals the answer',await c.eval(`!document.getElementById('answerPanel').hidden`));
  await c.click('#reviseAgain');
  check('Revise Again updates the same stable record',await c.eval(`(()=>{const p=JSON.parse(localStorage.getItem('necta-rescue-learning-v1'));return p.records.length===1&&p.records[0].status==='revise_again'})()`));
  await navigate(app);await c.click('#startCivics');await c.click('.topic-button');await c.click('#revealAnswer');
  check('self-check persists after reload',await c.eval(`document.getElementById('reviseAgain').getAttribute('aria-pressed')==='true'`));
  const historical=await c.eval(`NECTA_CIVICS.cards.filter(c=>c.kind==='original_exam').map(c=>({id:c.id,topic:c.topic,correct:c.correctOption,answer:c.answer}))`);
  for(const item of historical){
    await chooseTopic(item.topic);await input('#kindSelect','original_exam');
    const topicIds=await c.eval(`NECTA_CIVICS.cards.filter(c=>c.topic===document.getElementById('topicSelect').value&&c.kind==='original_exam').map(c=>c.id)`);
    for(let i=0;i<topicIds.indexOf(item.id);i++)await c.click('#nextQuestion');
    await c.click('#revealAnswer');
    check('source answer alignment '+item.id,JSON.stringify(await c.eval(`[...document.querySelectorAll('#answerBullets li')].map(e=>e.textContent)`))===JSON.stringify(item.answer));
    if(item.correct)check('complete MCQ alternatives '+item.id,await c.eval(`document.querySelectorAll('.choice').length===5`));
  }
  await chooseTopic('Work and careers');await c.click('#revealAnswer');
  check('written answer has six explained points and source count guidance',await c.eval(`document.querySelectorAll('#answerBullets li').length===6&&document.getElementById('answerStyle').textContent.includes('six distinct points')&&document.getElementById('choices').hidden`));
  await chooseTopic('Democracy');await input('#kindSelect','all');await c.click('#revealAnswer');await c.click('#nextQuestion');
  check('next question resets answer and focuses prompt',await c.eval(`document.getElementById('answerPanel').hidden&&!document.getElementById('answerBullets').textContent&&document.activeElement.id==='questionTitle'`));
  check('concept variation visibly distinguished',await c.eval(`document.getElementById('kindBadge').textContent==='Authored concept variation'&&document.getElementById('questionRef').textContent.includes('Define')`));
  await c.click('#previousQuestion');check('previous returns to original wording with answer hidden',await c.eval(`document.getElementById('kindBadge').textContent==='Original exam wording'&&document.getElementById('answerPanel').hidden`));
  await input('#kindSelect','authored_concept');check('concept filter has seven variations',await c.eval(`document.getElementById('position').textContent==='1 / 7'`));
  await c.click('#revealAnswer');await c.shot('concept-390');
  await chooseTopic('Leadership');
  check('empty filtered topic is helpful',await c.eval(`!document.getElementById('emptyStudy').hidden&&document.getElementById('questionCard').hidden&&document.getElementById('nextQuestion').disabled`));
  await c.click('#resetFilters');check('empty-state recovery restores question',await c.eval(`!document.getElementById('questionCard').hidden`));
  await c.eval(`document.getElementById('reviseOnly').checked=true;document.getElementById('reviseOnly').dispatchEvent(new Event('change'))`);
  check('Revise Again filter handles zero matches',await c.eval(`!document.getElementById('emptyStudy').hidden`));
  await chooseTopic('Human rights');check('Revise Again filter finds saved card',await c.eval(`document.getElementById('position').textContent==='1 / 1'`));
  await c.click('#resetFilters');
  const beforeImport=await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`);
  await c.file('#backupFile',oldBackup);await c.wait(`document.getElementById('backupStatus').textContent.includes('Old paper-practice backup accepted')`);
  check('old backup import keeps learning progress',await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`)===beforeImport);
  await c.eval(`document.querySelector('.backup-tools').open=true`);await c.click('#exportProgress');
  const findCombined=()=>fs.readdirSync(downloads).find(f=>f.endsWith('.json')&&JSON.parse(fs.readFileSync(path.join(downloads,f),'utf8')).learning);
  for(let i=0;i<50&&!findCombined();i++)await sleep(100);
  const combined=path.join(downloads,findCombined()||'missing-combined-backup');
  const combinedData=JSON.parse(fs.readFileSync(combined,'utf8'));
  check('new export contains old notes and new self-checks',!!combinedData.learning&&combinedData.records[0].notes.includes('Seeded in production'));
  await c.eval(`localStorage.setItem('necta-rescue-learning-v1',JSON.stringify({version:1,records:[]}))`);
  await c.file('#backupFile',combined);await c.wait(`document.getElementById('backupStatus').textContent.includes('Paper attempts and Civics self-checks are ready')`);
  check('combined backup restores Civics progress',await c.eval(`JSON.parse(localStorage.getItem('necta-rescue-learning-v1')).records.length`)===1);
  const invalid=path.join(run,'invalid-backup.json');fs.writeFileSync(invalid,JSON.stringify({...combinedData,learning:{version:99,records:[]}}));
  const preInvalid=await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`);await c.file('#backupFile',invalid);await c.wait(`document.getElementById('backupStatus').textContent.includes('Cannot import')`);
  check('invalid backup preserves existing self-checks',await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`)===preInvalid);
  await navigate(app+'paper-practice.html');
  check('legacy page still displays production notes',await c.eval(`document.querySelectorAll('#history .record').length===1&&document.getElementById('history').textContent.includes('Seeded in production')`));
  await c.file('#importFile',combined);await c.wait(`document.getElementById('backupStatus').textContent.includes('Backup restored')`);
  check('legacy importer accepts additive new backup',await c.eval(`document.getElementById('statAttempts').textContent==='1'`));
  check('legacy PDF guidance, timer and subject selectors retained',await c.eval(`!!document.getElementById('pdfNote')&&document.getElementById('timer').textContent==='25:00'&&document.querySelectorAll('#subject option').length===8`));
  await c.click('#timerStart');await sleep(1200);await c.click('#timerPause');check('legacy focus timer counts down',await c.eval(`document.getElementById('timer').textContent!=='25:00'`));
  const synthetic=path.join(run,'test-paper.pdf');fs.writeFileSync(synthetic,'%PDF-1.4\n1 0 obj <</Type /Catalog>> endobj\n%%EOF');await c.file('#pdfFile',synthetic);
  check('local PDF still uses blob without upload',await c.eval(`document.querySelector('#pdfholder iframe').src.startsWith('blob:')&&!document.getElementById('openPdf').disabled`));
  await navigate(app);await c.click('#startCivics');await c.click('.topic-button');
  await c.wait(`document.getElementById('offlineStatus').textContent.includes('Ready to study offline')`);
  const cachePaths=await c.eval(`(async()=>{const cache=await caches.open('necta-rescue-static-v4');return(await cache.keys()).map(r=>new URL(r.url).pathname)})()`);
  check('offline bundle caches all 11 explicit public assets',cachePaths.length===11&&cachePaths.every(p=>p.startsWith(prefix)));
  for(const name of ['questions.jsonl','answers.jsonl','review/civics-starter-ledger.json','.workbuddy-ai/memory/MEMORY.md','Civics-F4-2025.pdf']){
    const status=await c.eval(`(async()=>(await fetch(${JSON.stringify('./'+name)})).status)()`);check('private path HTTP 404: '+name,status===404);
  }
  const afterProbe=await c.eval(`(async()=>{const cache=await caches.open('necta-rescue-static-v4');return(await cache.keys()).length})()`);
  check('unknown paths are never cached',afterProbe===11);
  await c.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  // Stop the HTTPS server as well: the worker is the only possible source.
  await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});server=null;
  await navigate(app+'?offline-test=1');await c.wait(`document.getElementById('collectionCount').textContent.includes('14')`);
  check('offline reload loads reviewed content with server stopped',await c.eval(`!navigator.onLine&&NECTA_CIVICS.cards.length===14`));
  await c.click('#startCivics');await c.click('.topic-button');await c.click('#revealAnswer');await c.click('#understood');
  check('answer flow and persistence work offline',await c.eval(`!document.getElementById('answerPanel').hidden&&document.getElementById('studyStatus').textContent.startsWith('Saved')`));
  await c.shot('offline-390');
  check('offline unknown paths do not receive the app shell',await c.eval(`(async()=>{try{await fetch('./questions.jsonl');return false}catch{return true}})()`));
  check('legacy records still unchanged after offline use',await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`)===originalRecords);
  // Restart same origin for fixture, denied-storage, and XSS scenarios.
  const testPort=new URL(app).port;
  server=await startPreview({port:Number(testPort),tls:{cert:fs.readFileSync(cert),key:fs.readFileSync(key)},read:name=>{
    if(name==='civics-content.js'&&fixture!==null)return Buffer.from('window.NECTA_CIVICS = '+JSON.stringify(fixture)+';');
    return fs.readFileSync(path.join(docs,name));
  }});
  await c.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  await c.send('Network.setBypassServiceWorker',{bypass:true});
  const realBundle=await c.eval(`NECTA_CIVICS`);
  fixture={version:1,allowlist:[],cards:[]};await navigate(app);await c.click('#startCivics');
  check('zero-content collection gives an honest empty state',await c.eval(`!document.getElementById('topicsEmpty').hidden&&document.querySelectorAll('.topic-button').length===0`));
  fixture=JSON.parse(JSON.stringify(realBundle));fixture.cards=fixture.cards.slice(0,1);fixture.allowlist=fixture.allowlist.slice(0,1);
  const attack='<img src=x onerror="window.__xss=1">';fixture.cards[0].question=attack;fixture.cards[0].originalQuestion=attack;fixture.cards[0].answer=[fixture.cards[0].answer[0],attack];
  await navigate(app);await c.click('#startCivics');await c.click('.topic-button');await c.click('#revealAnswer');
  check('single card collection is navigable',await c.eval(`document.getElementById('position').textContent==='1 / 1'&&document.getElementById('previousQuestion').disabled&&document.getElementById('nextQuestion').textContent.includes('Back to topics')`));
  check('question and answer markup are escaped as text',await c.eval(`!window.__xss&&!document.querySelector('#questionTitle img')&&!document.querySelector('#answerBullets img')&&document.getElementById('questionTitle').textContent.startsWith('<img')`));
  fixture=JSON.parse(JSON.stringify(realBundle));fixture.cards[0].review.status='held';await navigate(app);
  check('held card never reaches topic count',await c.eval(`document.getElementById('collectionCount').textContent.includes('13 learning cards')`));
  fixture=null;
  await c.eval(`localStorage.setItem('necta-rescue-learning-v1','corrupt-original')`);await navigate(app);await c.click('#startCivics');await c.click('.topic-button');await c.click('#revealAnswer');await c.click('#understood');
  check('corrupt existing progress is never overwritten',await c.eval(`localStorage.getItem('necta-rescue-learning-v1')==='corrupt-original'&&document.getElementById('studyStatus').textContent.includes('could not be saved')`));
  await c.eval(`localStorage.setItem('necta-rescue-learning-v1',${JSON.stringify(preInvalid)})`);await navigate(app);await c.click('#startCivics');await c.click('.topic-button');await c.click('#revealAnswer');
  await c.eval(`window.__realSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Quota exceeded','QuotaExceededError')}`);await c.click('#understood');
  check('storage failure is reported without claiming saved',await c.eval(`document.getElementById('studyStatus').textContent.includes('not saved')`));
  await c.eval(`Storage.prototype.setItem=window.__realSet`);
  const beforeRestore=await c.eval(`({legacy:localStorage.getItem('necta-rescue-pilot-v1'),learning:localStorage.getItem('necta-rescue-learning-v1')})`);
  await c.eval(`window.__realSet=Storage.prototype.setItem;window.__restoreFail=true;Storage.prototype.setItem=function(key,value){if(key==='necta-rescue-learning-v1'&&window.__restoreFail){window.__restoreFail=false;throw new DOMException('Quota exceeded','QuotaExceededError')}return window.__realSet.call(this,key,value)}`);
  await c.file('#backupFile',combined);await c.wait(`document.getElementById('backupStatus').textContent.includes('previous saved progress was restored')`);
  check('failed two-key restore rolls back both records safely',JSON.stringify(await c.eval(`({legacy:localStorage.getItem('necta-rescue-pilot-v1'),learning:localStorage.getItem('necta-rescue-learning-v1')})`))===JSON.stringify(beforeRestore));
  await c.eval(`Storage.prototype.setItem=window.__realSet`);
  check('no JavaScript errors throughout browser scenarios',errors.length===0,errors);
  const external=[...new Set(requests)].filter(u=>/^https?:/.test(u)&&!u.startsWith(origin));
  check('no third-party network requests',external.length===0,external);
  console.log('Browser: '+version.Browser);
} catch(err){check('browser suite completed',false,err.stack);}
finally{
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({baseline,checks,errors,requests:[...new Set(requests)],finished_at:new Date().toISOString()},null,2));
  if(c)c.close();if(bc){try{await bc.send('Browser.close');}catch{}bc.close();}if(chrome)chrome.kill();
  if(server)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
const failed=checks.filter(c=>!c.pass);console.log(`${checks.length-failed.length}/${checks.length} browser checks passed`);process.exitCode=failed.length?1:0;

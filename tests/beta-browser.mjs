/* Isolated synthetic profiles. Never visits the production origin or real student storage. */
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawn,execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {startPreview,root,prefix,docs} from '../tools/preview.mjs';
const out=path.join(root,'.workbuddy-ai',process.env.NECTA_BETA_EVIDENCE_SUBDIR||'beta-evidence');fs.mkdirSync(out,{recursive:true});
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'necta-beta-')),profile=path.join(scratch,'profile'),downloads=path.join(scratch,'downloads');fs.mkdirSync(downloads);
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const release=JSON.parse(fs.readFileSync(path.join(root,'review/beta-current-release.json'),'utf8'));
const upgradeBaseline=release.baseline_commit;
const oldBeta=new Map(['index.html','beta.css','beta.js','core.js','civics.js','sources.js','sw.js'].map(n=>['beta/'+n,execFileSync('git',['show',upgradeBaseline+':docs/beta/'+n],{cwd:root})]));
const batch=JSON.parse(fs.readFileSync(path.join(root,release.latest_ledger),'utf8'));batch.records=batch.records.filter(r=>r.display);
for(const name of release.display_amendments||[])batch.records.push(...JSON.parse(fs.readFileSync(path.join(root,name),'utf8')).records);
const expectedCounts=release.subject_counts;
let serveOldBeta=true;
const files=()=>Object.fromEntries(fs.readdirSync(path.join(docs,'beta')).sort().map(n=>[n,createHash('sha256').update(fs.readFileSync(path.join(docs,'beta',n))).digest('hex')]));
const before={commit:git('rev-parse','HEAD'),dirty:git('status','--porcelain','--untracked-files=no'),files:files(),started_at:new Date().toISOString()};
const checks=[],errors=[],requests=[];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function check(name,pass,detail){checks.push({name,pass:!!pass,...(detail===undefined?{}:{detail})});console.log((pass?'PASS':'FAIL')+' | '+name);if(!pass)throw Error(name+': '+JSON.stringify(detail));}
class CDP{
  constructor(ws){this.ws=ws;this.seq=0;this.pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&this.pending.has(m.id)){const p=this.pending.get(m.id);clearTimeout(p.timer);this.pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);return;}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);if(m.method==='Page.javascriptDialogOpening')this.send('Page.handleJavaScriptDialog',{accept:true}).catch(()=>{});});}
  send(method,params={}){return new Promise((resolve,reject)=>{const id=++this.seq;const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('CDP timeout '+method));},15000);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify({id,method,params}));});}
  async eval(expression){const r=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
  async wait(expression){for(let i=0;i<150;i++){try{if(await this.eval(expression))return;}catch{}await sleep(100);}throw Error('Wait failed '+expression);}
  async click(selector){await this.eval(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);const p=await this.eval(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await this.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await this.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});}
  async shot(name){const size=await this.eval('({width:innerWidth,height:document.documentElement.scrollHeight})');const {data}=await this.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:size.width,height:size.height,scale:1}});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(data,'base64'));}
  async file(selector,filename){const {root:r}=await this.send('DOM.getDocument');const {nodeId}=await this.send('DOM.querySelector',{nodeId:r.nodeId,selector});await this.send('DOM.setFileInputFiles',{nodeId,files:[filename]});}
  close(){for(const p of this.pending.values())clearTimeout(p.timer);try{this.ws.close();}catch{}}
}
async function connect(url){const ws=new WebSocket(url);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});return new CDP(ws);}
let server,browser,c,bc,browserBuild,origin,app;
const seedProgress={version:1,records:[{card_id:'concept-democracy-state',status:'revise_again',updated:'2026-10-16T00:00:00Z'},{card_id:'future-card-id',status:'understood',updated:'2026-10-16T00:00:00Z'}]};
const seedLegacy=[{id:'synthetic-beta-legacy',subject:'english',year:'2025',paper:'1',question:'1',status:'need_review',notes:'Synthetic beta preservation test',created:'2026-10-16T00:00:00Z'}];
try{
  server=await startPreview({port:0,read:name=>serveOldBeta&&oldBeta.has(name)?oldBeta.get(name):fs.readFileSync(path.join(docs,name))});origin='http://127.0.0.1:'+server.address().port;app=origin+prefix+'beta/';
  browser=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--disable-gpu','--disable-sync','--disable-extensions','--disable-background-networking','about:blank'],{windowsHide:true,stdio:'ignore'});
  let spawnError;browser.on('error',e=>spawnError=e);const portFile=path.join(profile,'DevToolsActivePort');for(let i=0;i<150&&!fs.existsSync(portFile);i++){if(spawnError)throw spawnError;await sleep(100);}const debug='http://127.0.0.1:'+fs.readFileSync(portFile,'utf8').split('\n')[0];
  const version=await(await fetch(debug+'/json/version')).json();browserBuild=version.Browser;bc=await connect(version.webSocketDebuggerUrl);await bc.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads,eventsEnabled:true});const tab=await(await fetch(debug+'/json/new?about:blank',{method:'PUT'})).json();c=await connect(tab.webSocketDebuggerUrl);for(const d of ['Page','Runtime','Network','DOM'])await c.send(d+'.enable');
  await c.send('Page.navigate',{url:origin+prefix});await c.wait('!!window.NECTA_CIVICS&&!!navigator.serviceWorker.controller');
  check('accepted root still offers exactly fourteen cards',await c.eval('NECTA_CIVICS.cards.length')===14);
  await c.eval(`localStorage.setItem('necta-rescue-learning-v1',${JSON.stringify(JSON.stringify(seedProgress))});localStorage.setItem('necta-rescue-pilot-v1',${JSON.stringify(JSON.stringify(seedLegacy))})`);
  await c.send('Page.navigate',{url:app});await c.wait(`!!window.NECTA_BETA&&document.querySelectorAll('[data-subject]').length===8`);await c.wait(`navigator.serviceWorker.controller?.scriptURL.endsWith('/beta/sw.js')`);await c.wait(`document.getElementById('offline').textContent.includes('ready')`);
  check('upgrade starts with exact deployed baseline content',await c.eval(`NECTA_BETA.cards.length===${release.prior_question_only}&&(async()=>await caches.has('${release.prior_cache}'))()`));
  await c.eval(`(async()=>{await caches.open('necta-rescue-beta-v0');const other=await caches.open('other-app-cache');await other.put('/unrelated',new Response('preserve'));})()`);
  serveOldBeta=false;
  await c.eval(`navigator.serviceWorker.getRegistration(location.href).then(r=>r.update())`);
  await c.wait(`(async()=>{const keys=await caches.keys();return keys.includes('${release.cache}')&&!keys.includes('${release.prior_cache}')})()`);
  await c.send('Page.reload');await c.wait(`window.NECTA_BETA?.cards.length===${release.question_only}`);await c.wait(`document.getElementById('offline').textContent.includes('ready')`);
  check('current version update purges only old beta generations',await c.eval(`(async()=>{const keys=await caches.keys();return !keys.includes('necta-rescue-beta-v0')&&!keys.includes('${release.prior_cache}')&&keys.includes('${release.cache}')&&keys.includes('necta-rescue-static-v6')&&await(await caches.open('other-app-cache')).match('/unrelated').then(r=>r.text())==='preserve'})()`));
  check('emergency beta warning is visible',await c.eval(`document.body.textContent.includes('Emergency beta · provisional')&&document.body.textContent.includes('physical Android checks are pending')`));
  check('home summary matches the actual eligible collection',await c.eval(`document.getElementById('coverageSummary').textContent`)===release.total_beta_items+' practice items: 30 provisional Civics cards + '+release.question_only+' question-only records. Original source references span 2020–2025.');
  check('beta worker retains accepted root cache',await c.eval(`(async()=>{const keys=await caches.keys();return keys.includes('necta-rescue-static-v6')&&keys.includes('${release.cache}')})()`));
  check('initial load preserves both storage keys',await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`)===JSON.stringify(seedProgress)&&await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`)===JSON.stringify(seedLegacy));
  const subjects=await c.eval('NECTA_BETA.subjects');let questionOnly=0,answered=0;
  for(const s of subjects){
    await c.click(`[data-subject="${s.id}"]`);check('subject opens '+s.id,await c.eval(`document.getElementById('subjectTitle').textContent`)===s.name);
    check('six year choices '+s.id,await c.eval(`document.querySelectorAll('#year option').length`)===7);
    const count=Number((await c.eval(`document.getElementById('coverage').textContent`)).split(' ')[0]);check('expected checked practice count '+s.id,count===expectedCounts[s.id],count);
    for(let i=0;i<count;i++){
      const id=await c.eval(`document.getElementById('reference').textContent`);
      check('answer initially concealed '+id,await c.eval(`document.getElementById('answer').hidden&&!document.getElementById('bullets').textContent`));
      const questionOnlyRecord=await c.eval(`NECTA_BETA.cards.some(r=>${JSON.stringify(id)}.endsWith(' · '+r.id))`);
      if(!questionOnlyRecord){await c.click('#reveal');check('bounded educational answer revealed '+i,await c.eval(`!document.getElementById('answer').hidden&&document.querySelectorAll('#bullets li').length>0`));answered++;}
      else{check('unreviewed answer reveal unavailable '+id,await c.eval(`document.getElementById('reveal').hidden&&document.getElementById('state').textContent.includes('Question-only practice')`));questionOnly++;}
      const added=batch.records.find(r=>id.endsWith(r.record_id));
      if(added){
        check('new batch printed text and parent context '+added.record_id,await c.eval(`document.getElementById('question').textContent`)===added.display.question&&await c.eval(`document.getElementById('context').textContent`)=== (added.display.context||''));
        check('new batch exact original page link '+added.record_id,await c.eval(`document.querySelector('#source a').href`)===added.display.exam.url+'#page='+added.display.exam.pages[0]);
        check('exact printed alternatives '+added.record_id,JSON.stringify(await c.eval(`Array.from(document.querySelectorAll('#options li')).map(e=>e.textContent)`))===JSON.stringify((added.display.options||[]).map(o=>o.text)));
        check('no unaccepted solution link '+added.record_id,await c.eval(`document.querySelectorAll('#source a').length===1`));
      }
      if(['geography-2025-p1-q01i','geography-2025-p1-q01ii'].some(record=>id.endsWith(' · '+record)))check('conflicting supplied solution visibly withheld '+id,await c.eval(`document.getElementById('state').textContent.includes('conflicts with the printed alternatives')&&document.querySelectorAll('#source a').length===1`));
      for(const width of [320,360,390]){await c.send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});check('fits '+width+' '+s.id+' '+i,await c.eval('document.documentElement.scrollWidth<=innerWidth'));}
      if(added)await c.shot(added.record_id+'-390');
      if(i===0)await c.shot(s.id+'-390');if(added&&s.id==='geography'&&i===3)await c.shot('new-geography-conflict-390');if(added&&s.id==='literature'&&i===count-1)await c.shot('new-literature-parent-390');if(i<count-1)await c.click('#next');
    }
    check('no disputed card presented '+s.id,!(await c.eval(`document.getElementById('reference').textContent`)).includes('concept-democracy-state')&&!(await c.eval(`document.getElementById('reference').textContent`)).includes('concept-democracy-reasons'));
    if(s.id==='civics'){
      const recent=await c.eval(`NECTA_BETA.cards.filter(r=>r.subject==='civics'&&r.year===2024).length`);
      await c.eval(`document.getElementById('year').value='2024';document.getElementById('year').dispatchEvent(new Event('change'))`);
      check('Civics 2024 exposes only checked question-only records',recent>0&&await c.eval(`document.getElementById('coverage').textContent.startsWith('${recent} ')&&document.getElementById('reveal').hidden&&document.getElementById('answer').hidden`));
    }
    await c.eval(`document.getElementById('year').value='2020';document.getElementById('year').dispatchEvent(new Event('change'))`);
    check('2020 has source references without claiming checked question coverage '+s.id,await c.eval(`document.getElementById('empty').hidden===false&&document.querySelectorAll('#papers .paper').length>0`));
    await c.click('#homeButton');
  }
  check('exact counts 30 Civics and current question-only batch',answered===30&&questionOnly===release.question_only,{answered,questionOnly});
  await c.click('[data-subject="english"]');await c.click('#revise');
  check('self-check preserves hidden and unknown IDs',await c.eval(`(()=>{const p=JSON.parse(localStorage.getItem('necta-rescue-learning-v1'));return p.records.length===3&&p.records.some(x=>x.card_id==='concept-democracy-state')&&p.records.some(x=>x.card_id==='future-card-id')})()`));
  const saved=await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`);await c.send('Page.reload');await c.wait('!!window.NECTA_BETA');check('saved progress survives reload',await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`)===saved);
  await c.eval(`document.querySelector('aside details').open=true`);await c.click('#export');let backup;
  for(let i=0;i<150&&!backup;i++){for(const name of fs.readdirSync(downloads).filter(n=>n.endsWith('.json'))){try{const value=JSON.parse(fs.readFileSync(path.join(downloads,name),'utf8'));if(value.learning?.records?.length===3)backup={filename:path.join(downloads,name),value};}catch{}}if(!backup)await sleep(100);}
  check('real combined backup includes hidden IDs and legacy notes',!!backup&&backup.value.records[0].notes===seedLegacy[0].notes&&backup.value.learning.records.length===3);
  const snapshot=path.join(scratch,'combined-snapshot.json');fs.copyFileSync(backup.filename,snapshot);
  await c.eval(`localStorage.setItem('necta-rescue-learning-v1',JSON.stringify({version:1,records:[]}))`);await c.file('#import',snapshot);await c.wait(`document.getElementById('backupStatus').textContent.includes('Backup restored')`);check('combined import restores both formats',await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`)===saved&&await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`)===JSON.stringify(seedLegacy));
  const invalid=path.join(scratch,'invalid.json');fs.writeFileSync(invalid,JSON.stringify({...backup.value,learning:{version:99,records:[]}}));await c.file('#import',invalid);await c.wait(`document.getElementById('backupStatus').textContent.includes('Cannot import')`);check('invalid backup preserves existing progress',await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`)===saved);
  const changedLegacy=JSON.stringify([{...seedLegacy[0],notes:'Synthetic pre-restore data must survive rollback'}]);
  await c.eval(`localStorage.setItem('necta-rescue-pilot-v1',${JSON.stringify(changedLegacy)});window.originalSetItem=Storage.prototype.setItem;window.failNextLearningWrite=true;Storage.prototype.setItem=function(k,v){if(k==='necta-rescue-learning-v1'&&window.failNextLearningWrite){window.failNextLearningWrite=false;throw new DOMException('Synthetic quota exceeded','QuotaExceededError');}return window.originalSetItem.call(this,k,v);}`);
  await c.file('#import',snapshot);await c.wait(`document.getElementById('backupStatus').textContent.includes('Synthetic quota exceeded')`);
  check('failed second backup write rolls both keys back',await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`)===saved&&await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`)===changedLegacy);
  await c.eval(`localStorage.setItem('necta-rescue-pilot-v1',${JSON.stringify(JSON.stringify(seedLegacy))})`);
  await c.click('[data-subject="english"]');await c.eval(`window.failNextLearningWrite=true`);await c.click('#revise');check('full storage fails visibly and preserves progress',await c.eval(`localStorage.getItem('necta-rescue-learning-v1')`)===saved&&await c.eval(`document.getElementById('saveStatus').textContent.includes('Not saved')`));
  await c.eval(`Storage.prototype.setItem=window.originalSetItem;localStorage.setItem('necta-rescue-learning-v1','broken')`);await c.click('#revise');check('corrupt storage cannot be silently overwritten',await c.eval(`localStorage.getItem('necta-rescue-learning-v1')==='broken'&&document.getElementById('saveStatus').textContent.includes('Not saved')`));await c.eval(`localStorage.setItem('necta-rescue-learning-v1',${JSON.stringify(saved)})`);
  await c.click('#homeButton');await c.eval(`document.querySelector('[data-subject="civics"]').focus()`);await c.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await c.send('Input.dispatchKeyEvent',{type:'char',text:'\r',unmodifiedText:'\r',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});check('keyboard opens subject',await c.eval(`!document.getElementById('practice').hidden&&document.getElementById('subjectTitle').textContent==='Civics'`));await c.click('#reveal');check('answer focus moves accessibly',await c.eval(`document.activeElement.id==='answerTitle'`));
  for(const name of ['questions.jsonl','review/RELEASE_ACCEPTANCE.json','beta/private.json','beta/Civics-F4-2025.pdf','beta/../review.jsonl']){const response=await fetch(origin+prefix+name);check('private path unavailable '+name,response.status===404);}
  await c.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});server=null;
  await c.send('Page.navigate',{url:app+'?offline=1'});await c.wait(`document.querySelectorAll('[data-subject]').length===8`);await c.click('[data-subject="biology"]');check('question-only practice reopens offline',await c.eval(`!navigator.onLine&&!document.getElementById('card').hidden&&document.getElementById('reveal').hidden`));await c.click('#homeButton');await c.click('[data-subject="civics"]');await c.click('#reveal');check('Civics answers reopen offline',await c.eval(`!document.getElementById('answer').hidden&&document.querySelectorAll('#bullets li').length>0`));check('offline preserves synthetic legacy data',await c.eval(`localStorage.getItem('necta-rescue-pilot-v1')`)===JSON.stringify(seedLegacy));
  await c.shot('offline-390');check('no JavaScript exceptions',errors.length===0,errors);check('no automatic third-party requests',!requests.some(u=>/^https?:/.test(u)&&!u.startsWith(origin)));
}catch(e){checks.push({name:'beta suite completed',pass:false,detail:e.stack});console.log('FAIL',e.stack);}
finally{
  const after=files(),endCommit=git('rev-parse','HEAD'),endDirty=git('status','--porcelain','--untracked-files=no');
  const stable=JSON.stringify(before.files)===JSON.stringify(after)&&before.commit===endCommit&&before.dirty===endDirty;
  checks.push({name:'stable test inputs',pass:stable});
  const result={tested_commit:before.commit,tracked_changes:before.dirty,exact_commit:stable&&!before.dirty,stable_inputs:stable,upgrade_baseline_commit:upgradeBaseline,run_profile:path.basename(scratch),browser:browserBuild,started_at:before.started_at,finished_at:new Date().toISOString(),checks,errors,tested_files:before.files,finished_files:after,public_requests:[...new Set(requests)].filter(u=>!u.startsWith('blob:'))};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));
  try{if(c)c.close();if(bc){await bc.send('Browser.close');bc.close();}}catch{}if(browser)browser.kill();if(server)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
const failed=checks.filter(c=>!c.pass);console.log((checks.length-failed.length)+'/'+checks.length+' beta checks passed');process.exitCode=failed.length?1:0;

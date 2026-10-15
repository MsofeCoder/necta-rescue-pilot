/* Run only with an owner-authorized Android phone connected over ADB.
   Uses a temporary preview origin and tab; restores its storage and removes its forwards. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {startPreview,root,prefix,docs} from './preview.mjs';
const out=path.join(root,'.workbuddy-ai/device-evidence');fs.mkdirSync(out,{recursive:true});
const adb=process.env.ADB_PATH||'adb';
const call=(...args)=>execFileSync(adb,args,{encoding:'utf8',windowsHide:true}).trim();
const devices=call('devices').split('\n').slice(1).filter(s=>/\tdevice\s*$/.test(s.trim()));
if(devices.length!==1&&!process.env.ANDROID_SERIAL)throw Error('Connect exactly one authorized phone, or select ANDROID_SERIAL.');
const model=call('shell','getprop','ro.product.model'),android=call('shell','getprop','ro.build.version.release');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const checks=[],errors=[];
function check(name,pass,detail){checks.push({name,pass:!!pass,...(detail===undefined?{}:{detail})});console.log((pass?'PASS':'FAIL')+' | '+name);if(!pass)throw Error(name);}
let server,forwardPort,target,ws,prior,browser,viewport,seq=0;
const pending=new Map();
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error('Device CDP timeout: '+method));},15000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function wait(expr){for(let i=0;i<100;i++){try{if(await evaluate(expr))return;}catch{}await sleep(150);}throw Error('Device wait failed: '+expr);}
async function tap(selector){await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);const p=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,radiusX:3,radiusY:3,force:1,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(100);}
async function shot(name,selector){await evaluate(selector?`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start'})`:'scrollTo(0,0)');const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(data,'base64'));}
const devicePort=18085;
if(call('reverse','--list').split('\n').some(line=>line.includes('tcp:'+devicePort+' ')))throw Error('Device preview port already used; no changes made.');
try{
  server=await startPreview({port:0});
  call('reverse','tcp:'+devicePort,'tcp:'+server.address().port);
  forwardPort=call('forward','tcp:0','localabstract:chrome_devtools_remote');
  const app='http://127.0.0.1:'+devicePort+prefix,cdp='http://127.0.0.1:'+forwardPort;
  call('shell','am','start','-a','android.intent.action.VIEW','-d',app,'-p','com.android.chrome');
  for(let i=0;i<50&&!target;i++){
    try{const tabs=await(await fetch(cdp+'/json/list')).json();target=tabs.find(t=>t.type==='page'&&t.url.startsWith(app));}catch{}await sleep(200);
  }
  if(!target)throw Error('The authorized preview tab is not available through Chrome debugging.');
  browser=(await(await fetch(cdp+'/json/version')).json()).Browser;
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
  ws.addEventListener('message',event=>{
    const m=JSON.parse(event.data);
    if(m.id&&pending.has(m.id)){const p=pending.get(m.id);clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);return;}
    if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
  });
  for(const domain of ['Page','Runtime','Network'])await send(domain+'.enable');
  await wait(`document.getElementById('collectionCount').textContent.includes('14 learning cards')`);
  prior=await evaluate(`({legacy:localStorage.getItem('necta-rescue-pilot-v1'),learning:localStorage.getItem('necta-rescue-learning-v1')})`);
  viewport=await evaluate(`({width:innerWidth,height:innerHeight,dpr:devicePixelRatio})`);
  check('actual Android Chrome loads the complete collection',await evaluate(`NECTA_CIVICS.cards.length===14`));
  check('real phone preview is a secure context',await evaluate(`isSecureContext`));
  check('phone home has no horizontal overflow',await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await shot('android-home');await tap('#startCivics');
  check('physical touch opens six topics',await evaluate(`document.querySelectorAll('.topic-button').length===6&&!document.getElementById('topicsView').hidden`));
  await shot('android-topics');await tap('.topic-button');
  check('physical touch opens a question with answer concealed',await evaluate(`!document.getElementById('studyView').hidden&&document.getElementById('answerPanel').hidden&&!document.getElementById('answerBullets').textContent`));
  check('all printed MCQ alternatives are readable',await evaluate(`document.querySelectorAll('.choice').length===5&&document.documentElement.scrollWidth<=innerWidth`));
  await shot('android-question');await tap('.choice');await tap('#revealAnswer');
  check('physical touch reveals the aligned correct answer',await evaluate(`!document.getElementById('answerPanel').hidden&&document.getElementById('answerBullets').textContent.startsWith('E. ')&&document.getElementById('choiceFeedback').textContent.includes('Your choice: A')`));
  await tap('#reviseAgain');
  check('self-check saves on the actual phone',await evaluate(`JSON.parse(localStorage.getItem('necta-rescue-learning-v1')).records.some(r=>r.card_id==='civics-2025-p1-q01i'&&r.status==='revise_again')`));
  check('phone touch targets are at least 44px',await evaluate(`['understood','reviseAgain','nextQuestion'].every(id=>document.getElementById(id).getBoundingClientRect().height>=44)`));
  await shot('android-answer','#answerPanel');await tap('#hideAnswer');
  check('physical retry clears the revealed answer',await evaluate(`document.getElementById('answerPanel').hidden&&!document.getElementById('answerBullets').textContent`));
  await send('Page.reload',{ignoreCache:true});await wait(`document.getElementById('collectionCount').textContent.includes('14')`);
  await tap('#startCivics');await tap('.topic-button');await tap('#revealAnswer');
  check('phone self-check survives reload',await evaluate(`document.getElementById('reviseAgain').getAttribute('aria-pressed')==='true'`));
  console.log('Offline readiness:',await evaluate(`(async()=>({message:document.getElementById('offlineStatus').textContent,online:navigator.onLine,controller:!!navigator.serviceWorker.controller,caches:await caches.keys(),registrations:(await navigator.serviceWorker.getRegistrations()).map(r=>({active:r.active&&r.active.state,installing:r.installing&&r.installing.state}))}))()`));
  await wait(`/Ready to study offline|bundled revision cards still work/.test(document.getElementById('offlineStatus').textContent)`);
  check('actual phone confirms the v6 offline bundle',await evaluate(`(async()=>(await caches.keys()).includes('necta-rescue-static-v6'))()`));
  await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});server=null;
  await send('Page.navigate',{url:app+'?device-offline=1'});await wait(`document.getElementById('collectionCount').textContent.includes('14')`);
  check('real phone reloads offline with preview server stopped',await evaluate(`!navigator.onLine&&!!navigator.serviceWorker.controller`));
  await tap('#startCivics');await tap('.topic-button');await tap('#revealAnswer');await tap('#understood');
  check('real phone answer and save flow work offline',await evaluate(`!document.getElementById('answerPanel').hidden&&document.getElementById('studyStatus').textContent.startsWith('Saved')`));
  check('offline phone preserves unrelated paper-practice data',await evaluate(`localStorage.getItem('necta-rescue-pilot-v1')`)===prior.legacy);
  await shot('android-offline','#answerPanel');
  check('actual phone produced no JavaScript exceptions',errors.length===0,errors);
}catch(error){checks.push({name:'device suite completed',pass:false,detail:error.message});console.log('FAIL | '+error.message);}
finally{
  if(ws&&ws.readyState===WebSocket.OPEN){
    if(prior){try{await evaluate(`(()=>{const prior=${JSON.stringify(prior)};for(const [key,value] of [['necta-rescue-pilot-v1',prior.legacy],['necta-rescue-learning-v1',prior.learning]]){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}})()`);}catch(error){checks.push({name:'restore original preview storage',pass:false,detail:error.message});}}
    try{await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});}catch{}
    ws.close();
  }
  for(const p of pending.values())clearTimeout(p.timer);
  if(target&&forwardPort){try{await fetch('http://127.0.0.1:'+forwardPort+'/json/close/'+target.id);}catch{}}
  if(forwardPort)try{call('forward','--remove','tcp:'+forwardPort);}catch{}
  try{call('reverse','--remove','tcp:'+devicePort);}catch{}
  if(server)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
  const tested_files=Object.fromEntries(fs.readdirSync(docs).map(name=>[name,createHash('sha256').update(fs.readFileSync(path.join(docs,name))).digest('hex')]));
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({model,android,browser,viewport,checks,errors,tested_files,finished_at:new Date().toISOString(),limits:'Real Chrome browser and touch flow; home-screen installation and production-origin testing require the approved release.'},null,2));
}
const failed=checks.filter(c=>!c.pass);console.log(`${checks.length-failed.length}/${checks.length} physical Android checks passed`);process.exitCode=failed.length?1:0;

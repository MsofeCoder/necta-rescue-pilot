const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'../docs/sw.js'),'utf8');
function worker({failInstall=false}={}){
  const handlers={},deleted=[],calls={network:0,skip:0,claim:0};let added=[];
  const cache={addAll:async list=>{if(failInstall)throw Error('Missing public asset');added=[...list]},match:async key=>({key,from:'complete-cache'})};
  const scope='https://example.test/necta-rescue-pilot/';
  const self={registration:{scope},location:{origin:'https://example.test'},clients:{claim:async()=>calls.claim++},skipWaiting:async()=>calls.skip++,addEventListener:(name,fn)=>handlers[name]=fn};
  const caches={open:async()=>cache,keys:async()=>['necta-rescue-static-v2','necta-rescue-static-v4','necta-rescue-static-v6','necta-rescue-static-v7','necta-rescue-static-v8','unrelated-cache'],delete:async name=>{deleted.push(name)}};
  vm.runInNewContext(script,{self,caches,URL,Set,fetch:async()=>{calls.network++;throw Error('Stalled network should not be needed')},Response});
  return {handlers,calls,deleted,get added(){return added}};
}
test('an incomplete update never activates or purges the previous good bundle',async()=>{
  const w=worker({failInstall:true});let install;
  w.handlers.install({waitUntil:p=>install=p});await assert.rejects(install,/Missing public asset/);
  assert.equal(w.calls.skip,0);assert.equal(w.calls.claim,0);assert.deepEqual(w.deleted,[]);
});
test('successful install precaches everything and activation deletes only old NECTA generations',async()=>{
  const w=worker();let operation;w.handlers.install({waitUntil:p=>operation=p});await operation;
  assert.equal(w.added.length,12);assert.equal(w.calls.skip,1);
  w.handlers.activate({waitUntil:p=>operation=p});await operation;
  assert.deepEqual(w.deleted,['necta-rescue-static-v2','necta-rescue-static-v4','necta-rescue-static-v6','necta-rescue-static-v7']);assert.equal(w.calls.claim,1);
});
test('cached public requests never wait for a stalled network; unknown paths are not intercepted',async()=>{
  const w=worker();let response;
  w.handlers.fetch({request:{method:'GET',url:'https://example.test/necta-rescue-pilot/?offline=1'},respondWith:p=>response=p});
  assert.equal((await response).from,'complete-cache');assert.equal(w.calls.network,0);
  let intercepted=false;
  w.handlers.fetch({request:{method:'GET',url:'https://example.test/necta-rescue-pilot/questions.jsonl'},respondWith:()=>intercepted=true});
  assert.equal(intercepted,false);
});

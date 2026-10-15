const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..'),docs=path.join(root,'docs');
const read=name=>fs.readFileSync(path.join(docs,name),'utf8');
test('both entry points enforce local scripts, block embedded objects and prevent referrer disclosure',()=>{
  for(const file of ['index.html','paper-practice.html']){
    const html=read(file),policy=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
    assert.match(policy,/script-src 'self'/);assert(!policy.includes('unsafe-eval'));
    assert.match(policy,/object-src 'none'/);assert.match(policy,/base-uri 'none'/);assert.match(policy,/form-action 'none'/);
    assert.match(html,/name="referrer" content="no-referrer"/);
    assert(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html),'inline application script in '+file);
  }
});
test('every local script, stylesheet and icon reference exists inside the public bundle',()=>{
  for(const file of ['index.html','paper-practice.html']){
    for(const m of read(file).matchAll(/(?:src|href)="\.\/([^"#?]+)"/g))assert(fs.existsSync(path.join(docs,m[1])),m[1]);
  }
});
test('worker version and offline readiness agree and every public asset is precached',()=>{
  const sw=read('sw.js'),learning=read('learning.js');
  const generation=sw.match(/const CACHE = '([^']+)'/)[1];
  assert.match(generation,/necta-rescue-static-v[5-9]\d*/);
  assert(learning.includes("const EXPECTED_CACHE = '"+generation+"'"));
  const assets=vm.runInNewContext(sw.match(/const ASSETS = (\[[^;]+\]);/)[1]);
  const cacheFiles=new Set(assets.filter(a=>a!=='./').map(a=>a.slice(2)));
  assert.deepEqual([...cacheFiles].sort(),fs.readdirSync(docs).filter(f=>f!=='.nojekyll'&&f!=='sw.js').sort());
});
test('release carries no third-party executable resources or accidental source files',()=>{
  for(const file of ['index.html','paper-practice.html'])assert(!/<(?:script|link)[^>]+(?:src|href)="https?:/i.test(read(file)));
  const total=fs.readdirSync(docs).filter(f=>/\.(js|css|html)$/.test(f)).reduce((n,f)=>n+fs.statSync(path.join(docs,f)).size,0);
  assert(total<150*1024,'HTML/JS/CSS transfer budget exceeded');
  assert(!fs.readdirSync(docs).some(f=>/\.(pdf|jsonl|pem|key|env)$/i.test(f)));
});
test('both importers accept backups up to the same 16 MB ceiling',()=>{
  const core=require('../docs/learning-core.js');assert.equal(core.MAX_BACKUP_BYTES,16*1024*1024);
  assert(read('paper-practice.js').includes('MAX_BACKUP_BYTES=16*1024*1024'));
  assert(read('learning.js').includes('file.size > core.MAX_BACKUP_BYTES'));
});

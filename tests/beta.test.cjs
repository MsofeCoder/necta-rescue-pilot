const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'docs/beta'),sandbox={window:{}};
for(const name of ['sources.js','civics.js'])vm.runInNewContext(fs.readFileSync(path.join(dir,name),'utf8'),sandbox);
const data=JSON.parse(JSON.stringify(sandbox.window.NECTA_BETA)),civics=JSON.parse(JSON.stringify(sandbox.window.NECTA_CIVICS));
const released='79044ec5fce9e52baaaff4e3764ea569c5025e82',candidate='8140fc5c9b0e0c46a3d4a15a234979b196b605f0';
test('emergency beta preserves all thirteen accepted root public files and release policy',()=>{
  const files=execFileSync('git',['ls-tree','--name-only',released+':docs'],{cwd:root,encoding:'utf8'}).trim().split('\n');assert.equal(files.length,13);
  for(const name of files)assert.deepEqual(fs.readFileSync(path.join(root,'docs',name)),execFileSync('git',['show',released+':docs/'+name],{cwd:root}),name);
  const clean=execFileSync('git',['hash-object','--path=RELEASE_POLICY.md','RELEASE_POLICY.md'],{cwd:root,encoding:'utf8'}).trim();
  assert.equal(clean,execFileSync('git',['rev-parse',released+':RELEASE_POLICY.md'],{cwd:root,encoding:'utf8'}).trim());
});
test('Civics beta is exactly the corrected 32-card baseline minus two disputed authored cards',()=>{
  const old={window:{}};vm.runInNewContext(execFileSync('git',['show',candidate+':docs/civics-content.js'],{cwd:root,encoding:'utf8'}),old);
  const expected=JSON.parse(JSON.stringify(old.window.NECTA_CIVICS));
  for(const key of ['cards','allowlist'])expected[key]=expected[key].filter(c=>!data.pending_human_review.includes(c.id));
  assert.deepEqual(civics,expected);assert.equal(civics.cards.length,30);
  const originals=new Set(civics.cards.filter(c=>c.kind==='original_exam').map(c=>c.id));
  for(const c of civics.cards)if(c.kind==='authored_concept')assert(originals.has(c.derivedFrom));
  for(const h of data.held_original_ids)assert(!civics.cards.some(c=>c.id===h.id||c.derivedFrom===h.id));
});
test('all eight subjects and six years have genuine source references; no missing answer is invented',()=>{
  assert.equal(data.subjects.length,8);assert.equal(data.papers.length,64);assert.equal(data.cards.length,26);
  for(const subject of data.subjects)for(let year=2020;year<=2025;year++)assert(data.papers.some(p=>p.subject===subject.id&&p.year===year));
  for(const c of data.cards){assert.equal(c.kind,'original_exam');assert.equal(c.answer_state,'question_only');assert.equal(c.question_review,'source_page_checked');assert(!('answer'in c));assert(!('correctOption'in c));assert.equal(c.marks,null);assert(c.exam.pages.every(p=>Number.isInteger(p)&&p>0));assert.match(c.exam.sha256,/^[a-f0-9]{64}$/);assert.match(c.exam.url,/^https:\/\/maktaba\.tetea\.org\/past-papers\/csee\//);}
  assert.equal(new Set(data.cards.map(c=>c.id)).size,26);
  assert(data.papers.some(p=>p.subject==='basic_mathematics'&&p.year===2025&&!p.solution));
});
test('question-only display copies are separately ledgered; hierarchy and source pages retained',()=>{
  const first=JSON.parse(fs.readFileSync(path.join(root,'review/emergency-beta-question-ledger.json'),'utf8'));
  const second=JSON.parse(fs.readFileSync(path.join(root,'review/beta-2025-batch-02-ledger.json'),'utf8'));
  assert.equal(first.records.length,14);assert.equal(second.records.length,12);
  const ledger={records:[...first.records,...second.records]};
  assert.equal(ledger.records.length,26);
  for(const c of data.cards){const l=ledger.records.find(l=>l.record_id===c.id);assert(l);assert.deepEqual(l.display,c);assert.match(l.render_sha256||l.original_exam_review.page_renders[String(c.exam.pages[0])],/^[a-f0-9]{64}$/);assert.equal(c.subquestion?!!c.parent_question:true,true);}
});
test('beta assets are explicit; worker cannot purge accepted app caches or expose private sources',()=>{
  assert.deepEqual(fs.readdirSync(dir).sort(),['index.html','beta.css','beta.js','core.js','civics.js','sources.js','sw.js'].sort());
  for(const f of fs.readdirSync(dir)){const s=fs.readFileSync(path.join(dir,f),'utf8');assert(!/C:\\Users\\|local_path|source_file|PRIVATE KEY|api[_-]?key\s*[:=]/i.test(s),f);}
  const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');assert(sw.includes("key.startsWith('necta-rescue-beta-')"));assert(!sw.includes("key.startsWith('necta-rescue-static-')"));
  const ui=fs.readFileSync(path.join(dir,'beta.js'),'utf8');assert(ui.includes("KEY='necta-rescue-learning-v1',LEGACY='necta-rescue-pilot-v1'"));assert(ui.includes('core.validBackup'));assert(ui.includes('core.validProgress'));
});
test('2025 batch is additive, preserves source hierarchy and withholds all twelve answers',()=>{
  const baseline={window:{}};vm.runInNewContext(execFileSync('git',['show','77636ece7e63d4183c934130e4b8268f7fb39a4e:docs/beta/sources.js'],{cwd:root,encoding:'utf8'}),baseline);
  const prior=JSON.parse(JSON.stringify(baseline.window.NECTA_BETA));
  assert.deepEqual(data.papers,prior.papers);assert.deepEqual(data.pending_human_review,prior.pending_human_review);assert.deepEqual(data.held_original_ids,prior.held_original_ids);
  for(const c of prior.cards)assert.deepEqual(data.cards.find(n=>n.id===c.id),c);
  const added=data.cards.filter(c=>!prior.cards.some(p=>p.id===c.id));assert.equal(added.length,12);
  assert.equal(added.filter(c=>!c.subquestion).length,3);assert.equal(added.filter(c=>c.subquestion).length,9);
  assert.deepEqual(Object.fromEntries(['kiswahili','english','geography','history','literature'].map(s=>[s,added.filter(c=>c.subject===s).length])),{kiswahili:3,english:2,geography:3,history:2,literature:2});
  for(const c of added){assert.equal(c.year,2025);assert.equal(c.paper,'1');assert.equal(c.answer_state,'question_only');assert.equal(c.marks,null);assert(!('answer'in c));assert(!('correctOption'in c));if(c.subquestion){assert(c.context);assert.equal(c.reference,String(c.parent_question)+c.subquestion);}if(c.options)assert.deepEqual(c.options.map(o=>o.label),['A','B','C','D','E']);}
  for(const id of ['geography-2025-p1-q01i','geography-2025-p1-q01ii']){const c=added.find(c=>c.id===id);assert(!c.solution);assert(c.answer_note.includes('conflicts'));assert.equal(c.options.length,5);}
  assert(!added.some(c=>c.id.startsWith('geography-2025-p1-q07')));
  const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8'),ui=fs.readFileSync(path.join(dir,'beta.js'),'utf8');assert(sw.includes("CACHE='necta-rescue-beta-v2'"));assert(ui.includes("caches.open('necta-rescue-beta-v2')"));
});

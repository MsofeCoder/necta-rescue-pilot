const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'docs/beta'),sandbox={window:{}};
for(const name of ['sources.js','civics.js'])vm.runInNewContext(fs.readFileSync(path.join(dir,name),'utf8'),sandbox);
const data=JSON.parse(JSON.stringify(sandbox.window.NECTA_BETA)),civics=JSON.parse(JSON.stringify(sandbox.window.NECTA_CIVICS));
const release=JSON.parse(fs.readFileSync(path.join(root,'review/beta-current-release.json'),'utf8'));
const amendments=(release.display_amendments||[]).map(name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8')));
function amendedDisplay(prior){let result=prior;for(const ledger of amendments){const r=ledger.records.find(r=>r.record_id===result.id);if(r&&JSON.stringify(result)===JSON.stringify(r.before_display))result=r.display;}return result;}
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
  assert.equal(data.subjects.length,8);assert.equal(data.papers.length,64);assert.equal(data.cards.length,release.question_only);
  for(const subject of data.subjects)for(let year=2020;year<=2025;year++)assert(data.papers.some(p=>p.subject===subject.id&&p.year===year));
  for(const c of data.cards){assert.equal(c.kind,'original_exam');assert.equal(c.answer_state,'question_only');assert.equal(c.question_review,'source_page_checked');assert(!('answer'in c));assert(!('correctOption'in c));assert.equal(c.marks,null);assert(c.exam.pages.every(p=>Number.isInteger(p)&&p>0));assert.match(c.exam.sha256,/^[a-f0-9]{64}$/);assert.match(c.exam.url,/^https:\/\/maktaba\.tetea\.org\/past-papers\/csee\//);}
  assert.equal(new Set(data.cards.map(c=>c.id)).size,release.question_only);
  assert(data.papers.some(p=>p.subject==='basic_mathematics'&&p.year===2025&&!p.solution));
});
test('question-only display copies are separately ledgered; hierarchy and source pages retained',()=>{
  const ledger={records:release.display_ledgers.flatMap(name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8')).records.filter(r=>r.display))};
  assert.equal(ledger.records.length,release.question_only);
  for(const c of data.cards){const l=ledger.records.find(l=>l.record_id===c.id);assert(l);assert.deepEqual(amendedDisplay(l.display),c);assert.match(l.render_sha256||(l.original_exam_review||l.source_review).page_renders[String(c.exam.pages[0])],/^[a-f0-9]{64}$/);assert.equal(c.subquestion?!!c.parent_question:true,true);}
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
  const ids=JSON.parse(fs.readFileSync(path.join(root,'review/beta-2025-batch-02-ledger.json'),'utf8')).records.map(r=>r.record_id);
  const added=data.cards.filter(c=>ids.includes(c.id));assert.equal(added.length,12);
  assert.equal(added.filter(c=>!c.subquestion).length,3);assert.equal(added.filter(c=>c.subquestion).length,9);
  assert.deepEqual(Object.fromEntries(['kiswahili','english','geography','history','literature'].map(s=>[s,added.filter(c=>c.subject===s).length])),{kiswahili:3,english:2,geography:3,history:2,literature:2});
  for(const c of added){assert.equal(c.year,2025);assert.equal(c.paper,'1');assert.equal(c.answer_state,'question_only');assert.equal(c.marks,null);assert(!('answer'in c));assert(!('correctOption'in c));if(c.subquestion){assert(c.context);assert.equal(c.reference,String(c.parent_question)+c.subquestion);}if(c.options)assert.deepEqual(c.options.map(o=>o.label),['A','B','C','D','E']);}
  for(const id of ['geography-2025-p1-q01i','geography-2025-p1-q01ii']){const c=added.find(c=>c.id===id);assert(!c.solution);assert(c.answer_note.includes('conflicts'));assert.equal(c.options.length,5);}
  assert(!added.some(c=>c.id.startsWith('geography-2025-p1-q07')));
  const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8'),ui=fs.readFileSync(path.join(dir,'beta.js'),'utf8');assert(sw.includes("CACHE='"+release.cache+"'"));assert(ui.includes("caches.open('"+release.cache+"')"));
});

test('English exact-ID review admits only two intact-hierarchy records and preserves merged baseline',()=>{
  const old={window:{}};vm.runInNewContext(execFileSync('git',['show','20f3a79a15ef027871c46b4cd41d19bd31e297e0:docs/beta/sources.js'],{cwd:root,encoding:'utf8'}),old);
  const prior=JSON.parse(JSON.stringify(old.window.NECTA_BETA));
  for(const key of ['papers','subjects','pending_human_review','held_original_ids'])assert.deepEqual(data[key],prior[key]);
  for(const c of prior.cards)assert.deepEqual(data.cards.find(n=>n.id===c.id),c);
  const ledger=JSON.parse(fs.readFileSync(path.join(root,'review/english-2025-source-review-ledger.json'),'utf8'));
  assert.equal(ledger.records.length,4);assert.equal(ledger.records.filter(r=>r.display).length,2);
  const added=data.cards.filter(c=>ledger.records.some(r=>r.display&&r.record_id===c.id));assert.equal(added.length,2);
  for(const r of ledger.records){const c=data.cards.find(c=>c.id===r.record_id);if(r.decision==='approved_for_question_only'){
    assert.deepEqual(c,r.display);assert.equal(c.parent_question,r.canonical_parent_question);assert.equal(c.subquestion,r.canonical_subquestion);
    assert.deepEqual(c.exam.pages,[2]);assert.equal(c.exam.sha256,'a85ce4cac21318c1ef9d93f02f9609de5fc659bb35c7384dfd71c943d30089b1');
    assert.deepEqual(c.options.map(o=>o.label),['A','B','C','D','E']);assert.equal(c.answer_state,'question_only');assert(!c.solution);assert(!c.answer);assert(!c.correctOption);
  }else{assert(!c);assert.equal(r.display,null);assert.equal(r.canonical_parent_question,'1');assert.equal(r.proposed_display_if_hierarchy_separately_reconciled.printed_parent_question,'2');}}
  assert.equal(ledger.android.status,'NOT TESTED');
});

test('three-question integration freezes prepared ledger, hierarchy, prior content and holds',()=>{
  const {createHash}=require('node:crypto'),hash=b=>createHash('sha256').update(b).digest('hex');
  const old={window:{}};vm.runInNewContext(execFileSync('git',['show','03f64944e3712cb0bcd3beb4281c109ea6fad41f:docs/beta/sources.js'],{cwd:root,encoding:'utf8'}),old);
  const prior=JSON.parse(JSON.stringify(old.window.NECTA_BETA));
  for(const key of ['papers','subjects','pending_human_review','held_original_ids'])assert.deepEqual(data[key],prior[key]);
  for(const c of prior.cards)assert.deepEqual(data.cards.find(n=>n.id===c.id),c);
  const ledger=JSON.parse(fs.readFileSync(path.join(root,'review/core-three-integration-ledger.json'),'utf8'));
  const prepared=fs.readFileSync(path.join(root,'review/next-core-source-batch-2026-10-17.json'));
  assert.deepEqual(prepared,execFileSync('git',['show','2c748e55657396ec02b6e1579eb4f1cf4523c0ab:review/next-core-source-batch-2026-10-17.json'],{cwd:root}));
  assert.equal(hash(prepared),ledger.prepared_ledger_sha256);
  const added=data.cards.filter(c=>ledger.records.some(r=>r.record_id===c.id));assert.equal(added.length,3);
  assert.equal(added.filter(c=>!c.subquestion).length,2);assert.equal(added.filter(c=>c.subquestion).length,1);
  assert.equal(data.cards.filter(c=>!c.subquestion).length,release.parent_questions);assert.equal(data.cards.filter(c=>c.subquestion).length,release.subquestions);
  for(const r of ledger.records){const c=added.find(c=>c.id===r.record_id),p=JSON.parse(prepared).records.find(p=>p.record_id===r.record_id).proposed_display;
    assert.deepEqual(c,r.display);assert.equal(c.parent_question,r.canonical_parent_question);assert.equal(c.subquestion,r.canonical_subquestion);
    for(const key of ['question','context','options','exam'])assert.deepEqual(c[key],p[key]);
    assert.equal(c.answer_state,'question_only');assert.equal(c.marks,null);for(const key of ['answer','correctOption','solution'])assert(!(key in c));
  }
  for(const id of ledger.preserved_holds.english_withheld)assert(!data.cards.some(c=>c.id===id));
  const h8=added.find(c=>c.id==='history-2025-p1-q08'),h9=added.find(c=>c.id==='history-2025-p1-q09');
  assert(!h8.context);assert(!h8.question.includes('statement.'));assert(!h9.question.includes('Depression'));assert(h9.context.includes('Answer two (2)'));
  assert.equal(ledger.android.status,'NOT TESTED');
});

test('current bounded release is additive and all latest display decisions are traceable',()=>{
  const before={window:{}};vm.runInNewContext(execFileSync('git',['show',release.baseline_commit+':docs/beta/sources.js'],{cwd:root,encoding:'utf8'}),before);
  const old=JSON.parse(JSON.stringify(before.window.NECTA_BETA)),ledger=JSON.parse(fs.readFileSync(path.join(root,release.latest_ledger),'utf8'));
  for(const key of ['subjects','papers','pending_human_review','held_original_ids'])assert.deepEqual(data[key],old[key]);
  for(const c of old.cards)assert.deepEqual(data.cards.find(n=>n.id===c.id),amendedDisplay(c));
  const added=data.cards.filter(c=>!old.cards.some(o=>o.id===c.id));assert.equal(added.length,ledger.counts.added_records);
  assert.equal(added.filter(c=>!c.subquestion).length,ledger.counts.added_parent_questions);assert.equal(added.filter(c=>c.subquestion).length,ledger.counts.added_subquestions);
  for(const r of ledger.records){const c=added.find(c=>c.id===r.record_id);assert.deepEqual(c,r.display);assert.equal(c.parent_question,r.canonical_parent_question);assert.equal(c.subquestion,r.canonical_subquestion);assert.equal(c.answer_state,'question_only');assert.equal(c.marks,null);for(const k of ['answer','correctOption','solution'])assert(!(k in c));if(c.options)assert.deepEqual(c.options.map(o=>o.label),['A','B','C','D','E']);}
  for(const id of ['english-2025-p1-q01iii','english-2025-p1-q01iv'])assert(!data.cards.some(c=>c.id===id));
  assert.equal(ledger.android.status,'NOT TESTED');
});

test('English 2024 parent correction changes only the source-checked context and preserves historical ledgers',()=>{
  const hash=b=>require('node:crypto').createHash('sha256').update(b).digest('hex');
  const ledger=amendments.find(l=>l.amendment_id==='english-2024-parent-instruction-2026-10-17');assert(ledger);
  assert.equal(ledger.records.length,5);assert.deepEqual(ledger.allowed_fields,['context']);
  assert.equal(ledger.original_exam.sha256,'570ab9f645b1607ff635a446f1ac970c63b2545774f334f31fdd3b7986f6d54f');
  assert.deepEqual(ledger.original_exam.pages,[2]);assert.match(ledger.original_exam.page_renders[2],/^[a-f0-9]{64}$/);
  for(const [file,fingerprint]of Object.entries(ledger.preserved_historical_ledger_sha256))assert.equal(hash(fs.readFileSync(path.join(root,file))),fingerprint);
  for(const r of ledger.records){
    const history=release.display_ledgers.flatMap(file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8')).records).find(h=>h.record_id===r.record_id);assert.deepEqual(history.display,r.before_display);
    assert.equal(r.before_display.context,'For each of the items (i) – (x), choose the correct answer from the given alternatives and write its letter beside the item number in the answer booklet provided.');
    assert.equal(r.display.context,'For each of the items (i) – (x), choose the correct answer from the given alternatives and write its letter in the answer booklet provided.');
    assert.deepEqual({...r.display,context:r.before_display.context},r.before_display);assert.deepEqual(data.cards.find(c=>c.id===r.record_id),r.display);
  }
});

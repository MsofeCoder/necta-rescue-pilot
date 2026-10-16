const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../docs/learning-core.js');
const root = path.resolve(__dirname,'..');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'docs/civics-content.js'),'utf8'),context);
const bundle = JSON.parse(JSON.stringify(context.window.NECTA_CIVICS));
const copy = o => JSON.parse(JSON.stringify(o));
const phaseLedger = JSON.parse(fs.readFileSync(path.join(root,'review/phase-d-ledger.json'),'utf8'));
const audit = JSON.parse(fs.readFileSync(path.join(root,'review/phase-d-existing-audit.json'),'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root,'review/civics-starter-ledger.json'),'utf8'));
test('32 reviewed cards include 18 Phase D additions across 10 topics',() => {
  const cards=core.eligibleCards(bundle);
  assert.equal(cards.length,32);
  assert.equal(cards.filter(c=>c.kind==='original_exam').length,15);
  assert.equal(cards.filter(c=>c.kind==='authored_concept').length,17);
  assert.equal(new Set(cards.map(c=>c.topic)).size,10);
  assert.deepEqual(cards.slice(0,14).filter(c=>c.command).map(c=>c.command),['Define','State','Mention','Explain','Describe','Give reasons','Discuss']);
  assert(!cards.some(c=>c.id==='civics-2025-p1-q01v'||c.id==='civics-2025-p1-q01viii'));
});
for(const status of ['verified','pipeline-verified','provisional','held','pending','approved']) test('gate excludes '+status+' even if allowlisted',()=>{
  const b=copy(bundle);b.cards[0].review.status=status;b.allowlist[0].status=status;
  assert(!core.eligibleCards(b).some(c=>c.id===b.cards[0].id));
});
test('gate rejects missing allowlist, missing review, and invalid bundles without throwing',()=>{
  assert.equal(core.eligibleCards(null).length,0);assert.equal(core.eligibleCards({cards:[]}).length,0);
  const b=copy(bundle);b.allowlist=[];assert.equal(core.eligibleCards(b).length,0);
  b.allowlist=copy(bundle.allowlist);delete b.cards[0].review;assert.equal(core.eligibleCards(b).length,30);
  b.allowlist=[null];assert.equal(core.eligibleCards(b).length,0);
});
test('gate rejects absent options, shifted labels, wrong keys and malformed choices',()=>{
  for(const mutate of [c=>c.options.pop(),c=>c.options.reverse(),c=>c.correctOption='B',c=>c.options[0]=null,c=>c.options[0].text='']){
    const b=copy(bundle);mutate(b.cards[0]);assert.equal(core.eligibleCards(b).length,30);
  }
});
test('unreviewed parent concepts cannot grant access to authored variations',()=>{
  const b=copy(bundle);b.cards.find(c=>c.id==='civics-2025-p1-q01vi').review.status='held';
  assert.equal(core.eligibleCards(b).length,24);
});
test('duplicate IDs do not inflate collection counts',()=>{
  const b=copy(bundle);b.cards.push(b.cards[0]);assert.equal(core.eligibleCards(b).length,32);
});
test('source metadata, literal original text, bullet count and safe source URL are enforced',()=>{
  for(const mutate of [c=>c.exam.pages=[],c=>c.exam.sha256='invalid',c=>c.exam.url='javascript:alert(1)',c=>c.originalQuestion='Changed',c=>c.requiredPoints=6]){
    const b=copy(bundle);mutate(b.cards[0]);assert.equal(core.eligibleCards(b).length,30);
  }
});
test('historical approval is retained only for the unchanged starter cards; additions await approval',()=>{
  assert.equal(audit.length,14);assert.equal(phaseLedger.length,18);
  for(const c of bundle.cards){
    const old=ledger.find(l=>l.card_id===c.id),l=old||phaseLedger.find(l=>l.card_id===c.id);
    assert(l);assert.equal(l.review_id,c.review.id);assert.equal(l.status,c.review.status);
    assert.deepEqual(l.answer_bullets,c.answer);
    assert.equal(l.owner_release_approval,old?'approved_for_pilot_2026-10-15':'pending_phase_d');
    if(c.kind==='original_exam'){
      assert.equal(l.source_question_transcription,c.originalQuestion);
      assert(l.original_pipeline_question_text);assert(l.independent_reasoning);
      assert.deepEqual(l.exam,c.exam);assert.deepEqual(l.solution,c.solution);
      assert.equal(c.marks,null);assert.match(c.solutionAttribution,/not an official/);
    }
    assert(c.transfer.length>30);assert(c.review.date);
  }
});

test('all 14 released IDs, answers, source evidence and command styles are unchanged',()=>{
  const {execFileSync}=require('node:child_process');
  const prior={window:{}};
  vm.runInNewContext(execFileSync('git',['show','79044ec:docs/civics-content.js'],{cwd:root,encoding:'utf8'}),prior);
  for(const old of JSON.parse(JSON.stringify(prior.window.NECTA_CIVICS.cards))){
    const current=copy(bundle.cards.find(c=>c.id===old.id));
    delete current.transfer;delete current.review.date;
    assert.deepEqual(current,old,old.id);
    assert(audit.some(a=>a.card_id===old.id&&a.decision==='retain'));
  }
});

test('source identity rejects mismatched year, filename, URL and unsupported papers',()=>{
  for(const mutate of [c=>c.year=2024,c=>c.paper='2',c=>c.exam.filename='Civics-F4-2023.pdf',c=>c.solution.url+='?other=1',c=>c.transfer='']){
    const c=copy(bundle.cards[0]);mutate(c);assert(!core.validCard(c));
  }
});

test('all rejected candidates and their authored dependants remain outside the student bundle',()=>{
  const held=JSON.parse(fs.readFileSync(path.join(root,'review/phase-d-held.json'),'utf8'));
  for(const h of held){assert(!bundle.cards.some(c=>c.id===h.card_id||c.derivedFrom===h.card_id));}
});

test('old v1 backups and additive new backups both validate; malformed learning never passes',()=>{
  const record={id:'old-1',subject:'civics',year:'2025',paper:'1',question:'3',status:'need_review',notes:'Original note',created:'2026-10-01T10:00:00Z'};
  const old={format:'necta-rescue-pilot',version:1,records:[record]};assert(core.validBackup(old));
  const b={...old,learning:{version:1,records:[{card_id:'x',status:'understood',updated:'2026-10-15T10:00:00Z'}]}};assert(core.validBackup(b));
  b.learning.records[0].status='mastered';assert(!core.validBackup(b));assert(core.validBackup(old));
  assert(!core.validBackup({...old,records:[{...record,subject:'__proto__'}]}));
  assert(!core.validProgress({version:1,records:[{card_id:'x',status:'understood',updated:'invalid'}]}));
});
test('short explanations and six source-requested career points; no inferred marks',()=>{
  assert(bundle.cards.every(c=>c.explanation.length<=400));
  const career=bundle.cards.find(c=>c.id.endsWith('-q03'));assert.equal(career.answer.length,6);assert.equal(career.requiredPoints,6);assert.equal(career.marks,null);
});
test('public directory contains only the static allowlist and no raw/private records',()=>{
  const expected=['.nojekyll','civics-content.js','icon-192.png','icon-512.png','icon.svg','index.html','learning-core.js','learning.css','learning.js','manifest.webmanifest','paper-practice.html','paper-practice.js','sw.js'];
  assert.deepEqual(fs.readdirSync(path.join(root,'docs')).sort(),expected.sort());
  for(const f of expected.filter(f=>/\.(js|html|css|webmanifest)$/.test(f))){
    const s=fs.readFileSync(path.join(root,'docs',f),'utf8');
    assert(!/C:\\Users\\|local_path|source_file|PRIVATE KEY|api[_-]?key\s*[:=]/i.test(s),f);
  }
});

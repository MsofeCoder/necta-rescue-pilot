const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const c=require('../tools/wording-corrections.cjs');
const baseline=c.load(c.historical(c.BASELINE,'docs/civics-content.js').toString('utf8'));
test('exact two-field correction overlay preserves the entire Phase D content bundle',()=>{
  const candidate=c.load(fs.readFileSync(path.join(c.root,'docs/civics-content.js'),'utf8'));
  c.verifyCandidate(candidate);
  for(const op of c.record.corrections){
    const card=candidate.cards.find(x=>x.id===op.card_id);
    assert(op.exam_pages.every(p=>card.exam.pages.includes(p)));
    assert(op.solution_pages.every(p=>card.solution.pages.includes(p)));
    for(const source of ['exam','solution']){
      assert.equal(card[source].sha256,c.record.sources[source].sha256);
      assert.equal(card[source].url,c.record.sources[source].url);
    }
  }
});
test('correction validator rejects changed authority state, extra operations, wrong old text and replacement text',()=>{
  for(const mutate of [r=>r.owner_release_approval='approved',r=>r.corrections.push(c.copy(r.corrections[0])),
    r=>r.corrections[0].before='wrong',r=>r.corrections[1].after='unapproved',r=>r.corrections[0].path=['question']]){
    const record=c.copy(c.record);mutate(record);assert.throws(()=>c.applyCorrections(baseline,record));
  }
  const wrongBase=c.copy(baseline);wrongBase.cards.find(x=>x.id==='civics-2025-p1-q07').answer[4]='wrong';
  assert.throws(()=>c.applyCorrections(wrongBase));
});
test('undeclared changes to any card or approval relationship are rejected',()=>{
  for(const mutate of [b=>b.cards[0].question+='changed',b=>b.cards[1].correctOption='A',
    b=>b.allowlist.reverse(),b=>b.cards.find(x=>x.id==='concept-democracy-state').answer[1]='new feature']){
    const candidate=c.applyCorrections(baseline);mutate(candidate);assert.throws(()=>c.verifyCandidate(candidate));
  }
});
test('historical review ledgers, fingerprints and original acceptance retain their exact Git blobs',()=>{
  const {execFileSync}=require('node:child_process');
  for(const file of ['RELEASE_POLICY.md','review/civics-starter-ledger.json','review/phase-d-ledger.json',
    'review/phase-d-existing-audit.json','review/phase-d-corrections.json','review/phase-d-held.json',
    'review/phase-d-source-fingerprints.json','review/RELEASE_ACCEPTANCE.json']){
    // Git's checkout filters may use CRLF on Windows; compare canonical blob bytes,
    // without rewriting the original worktree evidence or ignoring content changes.
    const actual=execFileSync('git',['hash-object','--path='+file,file],{cwd:c.root,encoding:'utf8'}).trim();
    const expected=execFileSync('git',['rev-parse',c.BASELINE+':'+file],{cwd:c.root,encoding:'utf8'}).trim();
    assert.equal(actual,expected,file);
  }
  const acceptance=JSON.parse(fs.readFileSync(path.join(c.root,'review/RELEASE_ACCEPTANCE.json'),'utf8'));
  const hash=createHash('sha256').update(c.historical(c.RELEASED,'docs/civics-content.js')).digest('hex');
  assert.equal(hash,acceptance.public_file_sha256['civics-content.js']);
});

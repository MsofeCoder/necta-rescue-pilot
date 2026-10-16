'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const BASELINE = 'a4678651cf5671ff67fc264f248e19c4c2f96c63';
const RELEASED = '79044ec5fce9e52baaaff4e3764ea569c5025e82';
const copy = value => JSON.parse(JSON.stringify(value));
function load(source) {
  const context = {window:{}};
  vm.runInNewContext(source, context, {timeout:1000});
  return copy(context.window.NECTA_CIVICS);
}
function historical(ref, file) {
  return execFileSync('git', ['show', ref + ':' + file], {cwd:root});
}
const declared = [
  {id:'C-01',card_id:'civics-2025-p1-q07',path:['answer',4],
    before:'Orderly shared use: signs guide different road users at crossings and junctions.',
    after:'Public order and reduced congestion: obeying road signs promotes orderly road use and helps reduce traffic congestion.'},
  {id:'C-04',card_id:'civics-2025-p1-q01iii',path:['explanation'],
    before:'A trade deficit means the value of imports is greater than the value of exports.',
    after:'Imports exceeding exports establishes a trade deficit. “High trade deficit” is the wording of printed option B, but the question does not provide enough information to determine how large the deficit is.'}
];
const record = JSON.parse(fs.readFileSync(path.join(root,'review/phase-d-approved-wording-v1.json'),'utf8'));
function validateRecord(value) {
  assert.equal(value.version,1);
  assert.equal(value.baseline_commit,BASELINE); assert.equal(value.released_commit,RELEASED);
  assert.equal(value.owner_wording_approval,'approved_2026-10-16');
  assert.equal(value.owner_release_approval,'pending');
  assert.equal(value.human_subject_expert_approval,'not_claimed');
  assert.deepEqual(value.pending_subject_review,['C-02','C-08']);
  assert.deepEqual(value.corrections.map(({id,card_id,path,before,after})=>({id,card_id,path,before,after})),declared);
}
function applyCorrections(baseline, value=record) {
  validateRecord(value);
  const expected = copy(baseline);
  for (const operation of value.corrections) {
    const matches = expected.cards.filter(c=>c.id===operation.card_id);
    assert.equal(matches.length,1,'one target per declared correction');
    let parent=matches[0];
    for (const key of operation.path.slice(0,-1)) parent=parent[key];
    const key=operation.path.at(-1);
    assert.equal(parent[key],operation.before,'original literal must match '+operation.id);
    parent[key]=operation.after;
  }
  return expected;
}
function verifyCandidate(candidate) {
  const baseline=load(historical(BASELINE,'docs/civics-content.js').toString('utf8'));
  assert.deepEqual(candidate,applyCorrections(baseline),'only the two declared content fields may differ from Phase D');
  return baseline;
}
module.exports={root,BASELINE,RELEASED,copy,load,historical,record,declared,validateRecord,applyCorrections,verifyCandidate};

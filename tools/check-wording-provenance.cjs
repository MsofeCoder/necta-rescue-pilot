'use strict';
const fs=require('node:fs');
const path=require('node:path');
const c=require('./wording-corrections.cjs');
const evidence=require('./test-evidence.cjs');
const start=evidence.begin(null);
const candidate=c.load(fs.readFileSync(path.join(c.root,'docs/civics-content.js'),'utf8'));
c.verifyCandidate(candidate);
const result={...evidence.finish(start),baseline_commit:c.BASELINE,released_commit:c.RELEASED,
  candidate_cards:candidate.cards.length,declared_changed_fields:c.declared,
  undeclared_content_changes:0,historical_acceptance:'preserved; applies to historical version only',
  owner_release_approval:'pending',pending_subject_review:['C-02','C-08'],
  human_subject_expert_approval:'not_claimed'};
const out=process.env.NECTA_PROVENANCE_OUTPUT;
if(out){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result,null,2));
if(!result.stable_inputs)process.exitCode=1;

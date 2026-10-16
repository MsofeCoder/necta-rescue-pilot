'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function fingerprints(){
  return Object.fromEntries(fs.readdirSync(path.join(root,'docs')).sort().map(name=>[name,
    createHash('sha256').update(fs.readFileSync(path.join(root,'docs',name))).digest('hex')]));
}
function identity(){
  const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
  return {commit:git('rev-parse','HEAD'),tracked_changes:git('status','--porcelain','--untracked-files=no')};
}
function begin(profile){return {...identity(),started_at:new Date().toISOString(),profile,tested_files:fingerprints()};}
function finish(start){
  const end=identity(),tested_files=fingerprints();
  const stable=JSON.stringify(start.tested_files)===JSON.stringify(tested_files)&&
    start.commit===end.commit&&start.tracked_changes===end.tracked_changes;
  return {tested_commit:start.commit,tracked_changes:start.tracked_changes,
    exact_commit:stable&&start.tracked_changes==='',stable_inputs:stable,
    profile:start.profile,started_at:start.started_at,finished_at:new Date().toISOString(),
    tested_files:start.tested_files,finished_files:tested_files};
}
module.exports={begin,finish,fingerprints};

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
function harness(){
  const file=path.relative(root,process.argv[1]).split(path.sep).join('/');
  const bytes=fs.readFileSync(process.argv[1]),sha256=createHash('sha256').update(bytes).digest('hex');
  let committed=false;
  try{committed=bytes.equals(execFileSync('git',['show','HEAD:'+file],{cwd:root,stdio:['ignore','pipe','ignore']}));}catch{}
  return {file,sha256,committed};
}
function begin(profile){return {...identity(),started_at:new Date().toISOString(),profile,harness:harness(),tested_files:fingerprints()};}
function finish(start){
  const end=identity(),tested_files=fingerprints();
  const stable=JSON.stringify(start.tested_files)===JSON.stringify(tested_files)&&
    start.commit===end.commit&&start.tracked_changes===end.tracked_changes&&
    JSON.stringify(start.harness)===JSON.stringify(harness());
  return {tested_commit:start.commit,tracked_changes:start.tracked_changes,
    exact_commit:stable&&start.tracked_changes===''&&start.harness.committed,stable_inputs:stable,
    harness:start.harness,
    profile:start.profile,started_at:start.started_at,finished_at:new Date().toISOString(),
    tested_files:start.tested_files,finished_files:tested_files};
}
module.exports={begin,finish,fingerprints};

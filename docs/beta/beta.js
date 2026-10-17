'use strict';
(()=>{
  const data=window.NECTA_BETA,core=window.NectaLearningCore;
  const $=id=>document.getElementById(id),make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
  const KEY='necta-rescue-learning-v1',LEGACY='necta-rescue-pilot-v1';
  const excluded=new Set(data.pending_human_review),held=new Set(data.held_original_ids.map(x=>x.id));
  const civics=core.eligibleCards(window.NECTA_CIVICS).filter(c=>!excluded.has(c.id)&&!held.has(c.id)).map(c=>({...c,subject:'civics',year:c.year||window.NECTA_CIVICS.cards.find(p=>p.id===c.derivedFrom)?.year,paper:c.paper||'1',answer_state:'source_checked_answer'}));
  const practice=data.cards.filter(c=>c.question_review==='source_page_checked'&&!held.has(c.id)&&!excluded.has(c.id));
  $('coverageSummary').textContent=(civics.length+practice.length)+' practice items: '+civics.length+' provisional Civics cards + '+practice.length+' question-only records. Original source references span 2020–2025.';
  let subject='',selection=[],index=0;
  const current=()=>selection[index];
  function link(label,url){const a=make('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function progress(){const raw=localStorage.getItem(KEY);const value=raw===null?{version:1,records:[]}:JSON.parse(raw);if(!core.validProgress(value))throw Error('Saved self-checks are unreadable. Export recovery from the accepted app before making changes.');return value;}
  function updateSaved(){
    try{const saved=progress().records.find(x=>x.card_id===current()?.id);$('understood').setAttribute('aria-pressed',String(saved?.status==='understood'));$('revise').setAttribute('aria-pressed',String(saved?.status==='revise_again'));}
    catch(e){$('saveStatus').textContent=e.message;}
  }
  function save(status){try{const value=progress(),c=current();if(!c)return;value.records=value.records.filter(x=>x.card_id!==c.id).concat({card_id:c.id,status,updated:new Date().toISOString()});if(!core.validProgress(value))throw Error('Cannot save this self-check.');localStorage.setItem(KEY,JSON.stringify(value));$('saveStatus').textContent='Saved on this device.';updateSaved();}catch(e){$('saveStatus').textContent='Not saved. '+e.message;}}
  function renderCard(focus=true){
    const c=current();$('card').hidden=!c;$('empty').hidden=!!c;$('answer').hidden=true;$('bullets').replaceChildren();$('explanation').textContent='';$('guidance').textContent='';$('reveal').setAttribute('aria-expanded','false');$('saveStatus').textContent='';
    if(!c)return;
    $('position').textContent=(index+1)+' / '+selection.length;
    $('kind').textContent=c.kind==='authored_concept'?'Authored practice':'Original examination question';
    $('reference').textContent=(c.year||'')+' · Paper '+c.paper+' · Q'+(c.reference||'')+' · '+c.id;
    $('question').textContent=c.question;
    const parent=c.derivedFrom?window.NECTA_CIVICS.cards.find(x=>x.id===c.derivedFrom):null;
    $('context').hidden=!c.context&&!parent;$('context').textContent=c.context|| (parent?'Source example: '+parent.question:'');
    $('options').replaceChildren(...(c.options||[]).map(o=>make('li',o.text)));$('options').hidden=!c.options;
    const answered=c.answer_state==='source_checked_answer';$('reveal').hidden=!answered;
    $('state').textContent=answered?'Prior source/editorial checks support this educational answer. Emergency beta: final human academic acceptance is pending.': 'Question text checked against the printed page. Question-only practice: the answer has not been academically checked and is not shown. '+({pipeline_verified:'A pipeline association exists; that is not answer verification.',provisional_or_ambiguous:'The answer association is provisional or ambiguous.',missing_answer:'No accepted answer association is available.'}[c.pipeline_state]||'')+' '+(c.answer_note||'');
    const exam=c.exam||parent?.exam,solution=c.solution||parent?.solution;
    $('source').replaceChildren();
    if(exam){$('source').append(link('Original exam · PDF page '+exam.pages.join(', '),exam.url+'#page='+exam.pages[0]),make('p','Exam SHA-256: '+exam.sha256));}
    if(solution)$('source').append(link('Supplied educational solution · PDF page '+solution.pages.join(', '),solution.url+'#page='+solution.pages[0]),make('p','Solution SHA-256: '+solution.sha256));
    $('source').append(make('p',answered?(c.review?.note||'Prior bounded source review; no human certification.'):'Printed question checked by Codex; see original page and review ledger for the review date. No answer key or marks inferred. Original page remains authoritative.'));
    $('previous').disabled=index===0;$('next').disabled=index===selection.length-1;updateSaved();if(focus)$('question').focus();
  }
  function select(){
    const year=$('year').value,paper=$('paper').value;
    selection=[...(subject==='civics'?civics:[]),...practice.filter(c=>c.subject===subject)].filter(c=>(year==='all'||String(c.year)===year)&&(paper==='all'||c.paper===paper));index=0;
    $('coverage').textContent=selection.length+' practice items in this selection. Source-reference coverage is separate from checked question coverage.';
    const papers=data.papers.filter(p=>p.subject===subject&&(year==='all'||String(p.year)===year)&&(paper==='all'||p.paper===paper)).sort((a,b)=>b.year-a.year||a.paper.localeCompare(b.paper));
    $('papers').replaceChildren(...papers.map(p=>{const box=make('article');box.className='paper';box.append(make('h3',p.year+' · Paper '+p.paper),link('Open original exam ('+p.exam.pages+' PDF pages)',p.exam.url),make('p','Source reference only. Read the original paper; this listing does not certify questions or answers.'));
      if(p.source_state==='unreadable_extraction')box.append(make('p','Unreadable extraction: no usable checked question text. Open the original source with a teacher.'));
      if(p.source_state==='unsegmented_source')box.append(make('p','Source not segmented reliably: question boundaries are unverified. Use the original paper, not inferred records.'));
      if(p.solution)box.append(link('Open supplied educational solutions — not an official marking scheme',p.solution.url));else box.append(make('p','Supplied solution missing from this collection. No answer generated.'));return box;}));
    renderCard();
  }
  function openSubject(id){subject=id;$('home').hidden=true;$('practice').hidden=false;$('subjectTitle').textContent=data.subjects.find(x=>x.id===id).name;
    $('year').replaceChildren(new Option('All years','all'),...[2025,2024,2023,2022,2021,2020].map(y=>new Option(String(y),String(y))));
    const papers=[...new Set(data.papers.filter(p=>p.subject===id).map(p=>p.paper))];$('paper').replaceChildren(new Option('All papers','all'),...papers.map(p=>new Option(p,p)));
    $('academicNote').hidden=id!=='civics';$('academicNote').textContent=civics.length+' Civics cards have prior bounded answer review; '+practice.filter(c=>c.subject==='civics').length+' additional checked questions have unavailable answers. All remain provisional. Two authored democracy cards (C-02/C-08) are withheld from this beta pending human review. Their historical records and saved progress are preserved. Six original source-conflict items remain withheld.';select();$('subjectTitle').focus();
  }
  $('subjects').replaceChildren(...data.subjects.map(s=>{const n=practice.filter(c=>c.subject===s.id).length;const b=make('button');b.type='button';b.dataset.subject=s.id;b.append(make('strong',s.name),make('small',s.id==='civics'?civics.length+' provisional answer cards + '+n+' question-only':n+' checked questions · answers unavailable'),make('small','2020–2025 original source references'));b.addEventListener('click',()=>openSubject(s.id));return b;}));
  $('homeButton').onclick=()=>{$('practice').hidden=true;$('home').hidden=false;$('subjects').querySelector('button').focus();};$('year').onchange=select;$('paper').onchange=select;
  $('previous').onclick=()=>{if(index>0){index--;renderCard();}};$('next').onclick=()=>{if(index<selection.length-1){index++;renderCard();}};
  $('reveal').onclick=()=>{const c=current();if(c?.answer_state!=='source_checked_answer')return;$('answer').hidden=false;$('bullets').replaceChildren(...c.answer.map(t=>make('li',t)));$('explanation').textContent=c.explanation;$('guidance').textContent=c.transfer||'';$('reveal').setAttribute('aria-expanded','true');$('answerTitle').focus();};
  $('understood').onclick=()=>save('understood');$('revise').onclick=()=>save('revise_again');
  $('export').onclick=()=>{try{const value={format:'necta-rescue-pilot',version:1,exported_at:new Date().toISOString(),records:JSON.parse(localStorage.getItem(LEGACY)||'[]'),learning:progress()};if(!core.validBackup(value))throw Error('Saved data unreadable; use the accepted app recovery export.');const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=make('a');a.href=url;a.download='necta-rescue-beta-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('backupStatus').textContent='Combined backup download started. Keep it private.';}catch(e){$('backupStatus').textContent='Export failed: '+e.message;}};
  $('import').onchange=async()=>{const file=$('import').files[0];if(!file)return;try{if(file.size>core.MAX_BACKUP_BYTES)throw Error('File exceeds the 16 MB limit.');const value=JSON.parse(await file.text());if(!core.validBackup(value))throw Error('Invalid backup. Existing data preserved.');if(!confirm('Replace the records included in this backup? Export your current data first.'))return;const oldLegacy=localStorage.getItem(LEGACY),oldLearning=localStorage.getItem(KEY);try{localStorage.setItem(LEGACY,JSON.stringify(value.records));if(Object.hasOwn(value,'learning'))localStorage.setItem(KEY,JSON.stringify(value.learning));}catch(error){try{for(const [k,v]of [[LEGACY,oldLegacy],[KEY,oldLearning]]){if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}}catch{throw Error('Restore failed and rollback could not complete. Keep both backups; use recovery in the accepted app.');}throw error;}$('backupStatus').textContent='Backup restored. Hidden and historical card IDs retained.';updateSaved();}catch(e){$('backupStatus').textContent='Cannot import: '+e.message;}finally{$('import').value='';}};
  window.addEventListener('storage',()=>updateSaved());
  if('serviceWorker' in navigator){
    const ready=async()=>{try{if(!navigator.serviceWorker.controller?.scriptURL.endsWith('/beta/sw.js'))return;const cache=await caches.open('necta-rescue-beta-v18');if((await cache.keys()).length===7)$('offline').textContent='Beta files ready for offline practice. Original PDF links still need internet.';}catch{$('offline').textContent='Offline verification failed. Keep this page open while online.';}};
    navigator.serviceWorker.addEventListener('controllerchange',ready);
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(()=>navigator.serviceWorker.ready).then(ready).catch(()=>{$('offline').textContent='Offline setup unavailable. Keep this page open while online.';});
  }else $('offline').textContent='Offline service worker unavailable in this browser.';
})();

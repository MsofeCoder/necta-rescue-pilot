'use strict';
(() => {
  const KEY = 'necta-rescue-pilot-v1';
  const $ = id => document.getElementById(id);
  const subjects = {kiswahili:'Kiswahili',english:'English',civics:'Civics',geography:'Geography',history:'History',literature:'Literature in English',biology:'Biology',basic_mathematics:'Basic Mathematics'};
  const statuses = {need_review:'Need to review',attempted:'Attempted',confident:'Confident',reviewed:'Reviewed with mentor'};
  /* Object.hasOwn() is ES2022. On an older mobile browser it is absent, which would
     make isValidRecord() throw, empty getSaved() via its catch, and let the next save
     overwrite the student's stored attempts. Use the ES5 form instead. */
  const hasOwn = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
  let records=[]; let pdfUrl=null; let storageBlocked=false;
  const MAX_BACKUP_BYTES=16*1024*1024;
  function getSaved(){
    try{
      const raw=localStorage.getItem(KEY), value=raw?JSON.parse(raw):[];
      if(!Array.isArray(value)||value.length>3000||!value.every(isValidRecord))throw Error('Unreadable history');
      storageBlocked=false;$('storageNotice').hidden=true;return value;
    }catch{
      storageBlocked=true;
      $('storageNotice').textContent='Saved history could not be read. Your original data has been kept and saving is paused. Return to Learn Civics to export a recovery copy, or restore a valid backup here.';
      $('storageNotice').hidden=false;return records;
    }
  }
  function isValidRecord(r){return r && typeof r==='object' && typeof r.id==='string' && typeof r.subject==='string' && hasOwn(subjects,r.subject) && /^(202[0-5])$/.test(String(r.year)) && typeof r.paper==='string' && r.paper.length<=12 && typeof r.question==='string' && r.question.length<=90 && hasOwn(statuses,r.status) && typeof r.notes==='string' && r.notes.length<=5000 && typeof r.created==='string';}
  function persist(next,restoring=false){
    if(storageBlocked&&!restoring){alert('Saving is paused to protect unreadable history. Export a recovery copy from Learn Civics or import a valid backup.');return false;}
    try{localStorage.setItem(KEY,JSON.stringify(next));records=next;storageBlocked=false;$('storageNotice').hidden=true;return true;}
    catch{alert('Browser storage is unavailable or full. Your existing history has not been changed. Please export a backup and try again.');return false;}
  }
  function element(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
  function render(){ $('statAttempts').textContent=String(records.length);$('statReviewed').textContent=String(records.filter(r=>r.status==='reviewed').length);$('statConfident').textContent=String(records.filter(r=>r.status==='confident').length);$('statSubjects').textContent=String(new Set(records.map(r=>r.subject)).size);
    const list=$('history');list.replaceChildren(); if(records.length===0){list.appendChild(element('p',storageBlocked?'Existing saved history is unreadable and has not been erased. Use recovery export or restore a valid backup.':'No attempts yet. Open an original paper and record your first question.','muted'));return;}
    for(const r of [...records].reverse()){const section=element('article',undefined,'record');const top=element('div',undefined,'recordhead');const title=element('strong',(subjects[r.subject]||r.subject)+' • '+r.year+' • Paper '+r.paper+' • Q'+r.question);const badge=element('span',statuses[r.status]||'Attempted','pill'+(r.status==='confident'||r.status==='reviewed'?' strong':r.status==='need_review'?' review':''));top.append(title,badge);section.append(top);
      if(r.notes)section.appendChild(element('p',r.notes));const foot=element('div',undefined,'topline');foot.appendChild(element('span',new Date(r.created).toLocaleString()+' • Saved in this browser','mini'));const del=element('button','Delete','btn outline');del.type='button';del.addEventListener('click',()=>{if(confirm('Delete this practice attempt?')){const latest=getSaved();if(persist(latest.filter(x=>x.id!==r.id)))render();}});foot.appendChild(del);section.append(foot);list.appendChild(section);}
  }
  records=getSaved();render();
  $('attemptForm').addEventListener('submit',e=>{e.preventDefault();const question=$('qref').value.trim();if(!question)return;const latest=getSaved();if(latest.length>=3000){alert('History has reached 3,000 attempts. Export a backup before removing any old attempts.');return;}const r={id:(self.crypto&&crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random()),subject:$('subject').value,year:$('year').value,paper:$('paperNum').value.trim()||'1',question,status:$('outcome').value,notes:$('notes').value.trim(),created:new Date().toISOString()};if(!persist(latest.concat(r)))return;render();$('qref').value='';$('notes').value='';$('formStatus').textContent='Saved locally. Remember to export a backup.';});
  $('pdfFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(pdfUrl){URL.revokeObjectURL(pdfUrl);pdfUrl=null;}const holder=$('pdfholder');holder.replaceChildren();if(!f){$('fileName').textContent='No paper selected';$('openPdf').disabled=true;holder.appendChild(element('div','Select a PDF from your device to view it.','empty'));return;}if(!(/\.pdf$/i.test(f.name)||f.type==='application/pdf')){alert('Please choose a PDF file.');e.target.value='';return;}pdfUrl=URL.createObjectURL(f);$('fileName').textContent=f.name;$('openPdf').disabled=false;const frame=document.createElement('iframe');frame.src=pdfUrl;frame.title='Original examination paper PDF';holder.appendChild(frame);});
  $('openPdf').addEventListener('click',()=>{if(pdfUrl)window.open(pdfUrl,'_blank','noopener');});window.addEventListener('beforeunload',()=>{if(pdfUrl)URL.revokeObjectURL(pdfUrl);});
  $('exportBtn').addEventListener('click',()=>{records=getSaved();if(storageBlocked){$('backupStatus').textContent='Cannot export a normal backup from unreadable history. Return to Learn Civics and choose Export recovery copy; your raw data will be kept.';return;}const json=JSON.stringify({format:'necta-rescue-pilot',version:1,exported_at:new Date().toISOString(),records},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download='necta-rescue-progress-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$('backupStatus').textContent='Backup download started. Keep it safe.';});
  $('importBtn').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>MAX_BACKUP_BYTES){alert('Backup is too large (maximum 16 MB).');e.target.value='';return;}try{const obj=JSON.parse(await f.text());if(obj.format!=='necta-rescue-pilot'||obj.version!==1||!Array.isArray(obj.records)||obj.records.length>3000||!obj.records.every(isValidRecord))throw Error('Unsupported or invalid backup');if(!confirm('Replace all locally saved attempts with '+obj.records.length+' imported attempts?'))return;if(!persist(obj.records,true))return;render();$('backupStatus').textContent='Backup restored: '+records.length+' attempts.';}catch(err){alert('Cannot import: '+err.message);}finally{e.target.value='';}});
  $('clearBtn').addEventListener('click',()=>{if(confirm('Permanently clear ALL practice attempts from this browser? Export your backup first.')){getSaved();if(!persist([]))return;render();$('backupStatus').textContent='Local history cleared.';}});
  window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){records=getSaved();render();}});
  let remaining=25*60*1000,until=0,ticker=null;function showTimer(){const sec=Math.max(0,Math.ceil(remaining/1000));$('timer').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
  function stop(){if(ticker!==null)clearInterval(ticker);ticker=null;}function tick(){remaining=Math.max(0,until-Date.now());showTimer();if(remaining===0){stop();$('formStatus').textContent='Focus sprint finished. Record your next question.';}}
  $('timerStart').addEventListener('click',()=>{if(ticker!==null)return;if(remaining<=0)remaining=25*60*1000;until=Date.now()+remaining;ticker=setInterval(tick,400);tick();});$('timerPause').addEventListener('click',()=>{if(ticker!==null){tick();stop();}});$('timerReset').addEventListener('click',()=>{stop();remaining=25*60*1000;showTimer();});showTimer();
  if('serviceWorker' in navigator && location.protocol==='https:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
})();

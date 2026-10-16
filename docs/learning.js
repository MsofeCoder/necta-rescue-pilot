'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const core = window.NectaLearningCore;
  if (!core) { $('collectionCount').textContent = 'Revision could not load. Please reconnect and refresh.'; return; }
  const cards = core.eligibleCards(window.NECTA_CIVICS);
  const topics = [...new Set(cards.map(c => c.topic))];
  const KEY = 'necta-rescue-learning-v1', LEGACY = 'necta-rescue-pilot-v1';
  const EXPECTED_CACHE = 'necta-rescue-static-v8';
  let progress = {version:1, records:[]}, storageBlocked = false;
  let topic = '', index = 0, selection = [], revealed = false;
  const make = (tag, value, className) => { const el = document.createElement(tag); if (value !== undefined) el.textContent = value; if (className) el.className = className; return el; };
  function loadProgress() {
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : {version:1, records:[]};
      if (!core.validProgress(data)) throw Error('Invalid self-check data');
      progress = data; storageBlocked = false;
    } catch (_) {
      storageBlocked = true;
      $('backupStatus').textContent = 'Saved self-checks could not be read. Your existing data has been kept. Saving is paused; restore a valid backup to recover it.';
    }
  }
  loadProgress();
  const statusFor = id => progress.records.find(r => r.card_id === id);
  function view(name, focus) {
    ['home', 'topics', 'study'].forEach(n => { $(n + 'View').hidden = n !== name; });
    if (focus) $(focus).focus();
    window.scrollTo(0, 0);
  }
  function renderTopics() {
    $('topicGrid').replaceChildren(); $('topicSelect').replaceChildren();
    for (const name of topics) {
      const count = cards.filter(c => c.topic === name).length;
      const button = make('button', undefined, 'topic-button'); button.type = 'button';
      button.append(make('strong', name), make('small', count + (count === 1 ? ' question' : ' questions')));
      button.addEventListener('click', () => { topic = name; $('topicSelect').value = name; resetSelection(); view('study', 'questionTitle'); });
      $('topicGrid').append(button);
      const option = make('option', name); option.value = name; $('topicSelect').append(option);
    }
    $('topicsEmpty').hidden = cards.length !== 0;
    $('collectionCount').textContent = topics.length + ' topics · ' + cards.length + ' learning cards';
  }
  function resetSelection() { index = 0; filterSelection(); renderQuestion(true); }
  function filterSelection() {
    const kind = $('kindSelect').value;
    selection = cards.filter(c => c.topic === topic && (kind === 'all' || c.kind === kind) &&
      (!$('reviseOnly').checked || (statusFor(c.id) || {}).status === 'revise_again'));
  }
  function sourceLine(label, source) {
    const p = make('p');
    p.append(make('strong', label + ': '), make('span', source.filename + ', PDF page' + (source.pages.length > 1 ? 's ' : ' ') + source.pages.join(', ') + '. '));
    const link = make('a', 'View source PDF'); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; p.append(link);
    $('sourceText').append(p);
  }
  function renderQuestion(focus) {
    revealed = false; $('answerPanel').hidden = true; $('answerBullets').replaceChildren();
    $('explanation').textContent = ''; $('wordingGuidance').textContent = ''; $('answerAttribution').textContent = ''; $('choiceFeedback').hidden = true;
    $('choiceFeedback').textContent = ''; $('revealAnswer').hidden = false; $('revealAnswer').setAttribute('aria-expanded', 'false');
    $('sourceDetails').open = false; $('sourceText').replaceChildren(); $('choiceList').replaceChildren();
    $('studyStatus').textContent = ''; $('thinkingHint').hidden = false;
    $('questionCard').hidden = selection.length === 0; $('emptyStudy').hidden = selection.length !== 0;
    $('previousQuestion').disabled = index === 0 || selection.length === 0;
    $('nextQuestion').disabled = selection.length === 0;
    $('nextQuestion').textContent = index === selection.length - 1 ? 'Back to topics →' : 'Next question →';
    $('position').textContent = selection.length ? (index + 1) + ' / ' + selection.length : '0 questions';
    if (!selection.length) {
      $('emptyReason').textContent = $('reviseOnly').checked ? 'No cards match your Revise Again selection. You can show all cards and choose what to practise next.' : 'This topic has no cards in the selected collection. Try all reviewed cards.';
      if (focus) $('resetFilters').focus();
      return;
    }
    const c = selection[index];
    const original = c.kind === 'original_exam';
    $('kindBadge').textContent = original ? 'Original exam wording' : 'Authored concept variation';
    $('kindBadge').className = 'badge' + (original ? '' : ' concept');
    $('questionRef').textContent = original ? 'Civics ' + c.year + ' · Q' + c.reference : c.command + ' · Practice prompt';
    $('questionTitle').textContent = c.question; $('answerStyle').textContent = 'How to answer: ' + c.style;
    $('conceptContext').hidden = original;
    const base = original ? c : cards.find(item => item.id === c.derivedFrom);
    $('conceptContext').textContent = original ? '' : 'Source question (' + base.year + ', Q' + base.reference + '): ' + base.question;
    $('choices').hidden = c.type !== 'mcq';
    if (c.type === 'mcq') for (const option of c.options) {
      const label = make('label', undefined, 'choice');
      const radio = make('input'); radio.type = 'radio'; radio.name = 'answerChoice'; radio.value = option.label;
      label.append(radio, make('span', option.label, 'option-label'), make('span', option.text)); $('choiceList').append(label);
    }
    if (original) {
      sourceLine('Question', c.exam); sourceLine('Supplied solution', c.solution);
      $('sourceText').append(make('p', c.solutionAttribution));
      $('sourceText').append(make('p', 'Question transcribed from the printed page; line breaks normalized. Answer bullets and short explanations are educational adaptations.'));
    } else {
      $('sourceText').append(make('p', 'Independently authored by NECTA Rescue. This is not an original NECTA question and has no examination marks.'));
      $('sourceText').append(make('p', 'Concept based on Civics ' + base.year + ', Q' + base.reference + '.'));
      sourceLine('Concept source', base.exam);
      sourceLine('Concept supplied solution', base.solution);
      $('sourceText').append(make('p', base.solutionAttribution));
    }
    $('sourceText').append(make('p', 'Review: ' + (original ? 'source checked' : 'editorially checked') + ' by Codex, ' + c.review.date + '.'));
    $('sourceText').append(make('p', c.review.note));
    $('sourceText').append(make('p', 'Record: ' + c.id + ' · Review: ' + c.review.id));
    updateSelfCheck();
    if (focus) $('questionTitle').focus();
  }
  function updateSelfCheck() {
    const c = selection[index], saved = c && statusFor(c.id);
    $('understood').setAttribute('aria-pressed', String(!!saved && saved.status === 'understood'));
    $('reviseAgain').setAttribute('aria-pressed', String(!!saved && saved.status === 'revise_again'));
  }
  function reveal() {
    const c = selection[index]; if (!c) return;
    revealed = true;
    $('answerBullets').replaceChildren(...c.answer.map(a => make('li', a)));
    $('explanation').textContent = c.explanation;
    $('wordingGuidance').textContent = c.transfer;
    $('answerAttribution').textContent = c.kind === 'original_exam' ? 'Based on the supplied TETEA solution. Short explanation by NECTA Rescue; not an official marking scheme.' : 'Independently authored practice answer. This variation was not taken from an examination.';
    const chosen = document.querySelector('input[name="answerChoice"]:checked');
    $('choiceFeedback').hidden = !chosen;
    if (chosen) $('choiceFeedback').textContent = 'Your choice: ' + chosen.value + '. Compare it with the answer below.';
    $('answerPanel').hidden = false; $('revealAnswer').hidden = true; $('thinkingHint').hidden = true;
    $('revealAnswer').setAttribute('aria-expanded', 'true'); $('answerTitle').focus();
  }
  function saveSelfCheck(status) {
    if (!revealed || !selection[index]) return;
    loadProgress();
    if (storageBlocked) { $('studyStatus').textContent = 'Your self-check could not be saved. Existing data is kept; check the backup message below.'; return; }
    const id = selection[index].id;
    const next = {version:1,records:progress.records.filter(r => r.card_id !== id).concat({card_id:id,status,updated:new Date().toISOString()})};
    try {
      if (!core.validProgress(next)) throw Error('Progress limit reached');
      localStorage.setItem(KEY, JSON.stringify(next)); progress = next; updateSelfCheck();
      $('studyStatus').textContent = status === 'understood' ? 'Saved. Good work thinking it through. Continue when you’re ready.' : 'Saved for another try. Taking another look is part of learning.';
    } catch (_) { $('studyStatus').textContent = 'This self-check was not saved. Browser storage may be full or unavailable. Export your progress below.'; }
  }
  $('startCivics').addEventListener('click', () => view('topics', 'topicsTitle'));
  $('backHome').addEventListener('click', () => view('home', 'homeTitle'));
  $('backTopics').addEventListener('click', () => { renderTopics(); view('topics', 'topicsTitle'); });
  $('topicSelect').addEventListener('change', () => { topic = $('topicSelect').value; resetSelection(); });
  $('kindSelect').addEventListener('change', resetSelection); $('reviseOnly').addEventListener('change', resetSelection);
  $('resetFilters').addEventListener('click', () => { $('kindSelect').value = 'all'; $('reviseOnly').checked = false; resetSelection(); });
  $('revealAnswer').addEventListener('click', reveal);
  $('hideAnswer').addEventListener('click', () => { renderQuestion(false); $('revealAnswer').focus(); });
  $('understood').addEventListener('click', () => saveSelfCheck('understood'));
  $('reviseAgain').addEventListener('click', () => saveSelfCheck('revise_again'));
  $('previousQuestion').addEventListener('click', () => { if (index > 0) { index--; renderQuestion(true); } });
  $('nextQuestion').addEventListener('click', () => {
    if (index < selection.length - 1) { index++; renderQuestion(true); }
    else { renderTopics(); view('topics', 'topicsTitle'); }
  });
  window.addEventListener('storage', e => { if (e.key === KEY || e.key === null) { loadProgress(); updateSelfCheck(); } });
  function download(value, name) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], {type:'application/json'}));
    const link = make('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $('exportProgress').addEventListener('click', () => {
    try {
      loadProgress(); if (storageBlocked) throw Error('Saved self-check data is unreadable; it has not been overwritten.');
      const legacy = JSON.parse(localStorage.getItem(LEGACY) || '[]');
      const backup = {format:'necta-rescue-pilot',version:1,exported_at:new Date().toISOString(),records:legacy,learning:progress};
      if (!core.validBackup(backup)) throw Error('Saved paper-practice data is unreadable; it has not been overwritten.');
      download(backup, 'necta-rescue-progress-' + new Date().toISOString().slice(0,10) + '.json');
      $('backupStatus').textContent = 'Backup download started. It includes your self-checks and original paper-practice notes.';
    } catch (err) { $('backupStatus').textContent = 'Cannot export: ' + err.message; }
  });
  $('exportRecovery').addEventListener('click', () => {
    try {
      download({format:'necta-rescue-recovery',version:1,exported_at:new Date().toISOString(),raw:{
        paper_practice:localStorage.getItem(LEGACY),learning:localStorage.getItem(KEY)
      }}, 'necta-rescue-recovery-' + new Date().toISOString().slice(0,10) + '.json');
      $('backupStatus').textContent = 'Recovery copy downloaded without changing saved data. This raw copy needs repair before normal import; keep it private.';
    } catch (_) { $('backupStatus').textContent = 'Browser storage could not be read. Your existing saved data has not been changed.'; }
  });
  $('importProgress').addEventListener('click', () => $('backupFile').click());
  $('backupFile').addEventListener('change', async e => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    try {
      if (file.size > core.MAX_BACKUP_BYTES) throw Error('Backup is too large (maximum 16 MB).');
      const backup = JSON.parse(await file.text());
      if (!core.validBackup(backup)) throw Error('Unsupported or invalid backup. Nothing was changed.');
      const hasLearning = Object.prototype.hasOwnProperty.call(backup, 'learning');
      if (!confirm('Restore ' + backup.records.length + ' paper-practice attempts' + (hasLearning ? ' and ' + backup.learning.records.length + ' Civics self-checks? This replaces the corresponding saved progress.' : '? Your Civics self-checks will be kept.') + ' Export a backup first if needed.')) return;
      const oldLegacy = localStorage.getItem(LEGACY), oldLearning = localStorage.getItem(KEY);
      try {
        localStorage.setItem(LEGACY, JSON.stringify(backup.records));
        if (hasLearning) localStorage.setItem(KEY, JSON.stringify(backup.learning));
      } catch (_) {
        try { if (oldLegacy === null) localStorage.removeItem(LEGACY); else localStorage.setItem(LEGACY, oldLegacy);
          if (oldLearning === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, oldLearning);
        } catch (_) { throw Error('Storage failed during restore and rollback. Keep your backup and retry when storage is available.'); }
        throw Error('Storage unavailable. The previous saved progress was restored.');
      }
      loadProgress(); updateSelfCheck();
      if (!$('studyView').hidden) resetSelection();
      $('backupStatus').textContent = 'Backup restored. ' + (hasLearning ? 'Paper attempts and Civics self-checks are ready.' : 'Old paper-practice backup accepted; Civics self-checks kept.');
    } catch (err) { $('backupStatus').textContent = 'Cannot import: ' + err.message; }
    finally { e.target.value = ''; }
  });
  renderTopics();
  let offlineReady = false;
  function offlineMessage() {
    $('offlineStatus').textContent = offlineReady ? (navigator.onLine ? '✓ Ready to study offline on this device.' : 'You’re offline. Your bundled revision cards still work.') :
      (navigator.onLine ? 'Offline copy is not ready yet. Stay connected for the first load.' : 'You’re offline. An offline copy has not been confirmed.');
  }
  window.addEventListener('online', offlineMessage); window.addEventListener('offline', offlineMessage);
  function confirmOfflineBundle(worker) {
    if (!worker) return;
    const channel = new MessageChannel();
    const timer = setTimeout(() => channel.port1.close(), 5000);
    channel.port1.onmessage = event => {
      if (event.data && event.data.type === 'offline-ready' && event.data.cache === EXPECTED_CACHE) {
        offlineReady = true; offlineMessage();
      } else if (event.data && event.data.type === 'offline-ready' && /^necta-rescue-static-v\d+$/.test(event.data.cache) &&
          Number(event.data.cache.split('-v')[1]) > Number(EXPECTED_CACHE.split('-v')[1])) {
        $('updateNotice').hidden = false;
      }
      clearTimeout(timer); channel.port1.close();
    };
    worker.postMessage({type:'offline-ready'}, [channel.port2]);
  }
  $('reloadUpdate').addEventListener('click', () => location.reload());
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.addEventListener('controllerchange', () => confirmOfflineBundle(navigator.serviceWorker.controller));
    navigator.serviceWorker.register('./sw.js').then(registration => {
      const watch = worker => { if (worker) worker.addEventListener('statechange', () => { if (worker.state === 'activated') confirmOfflineBundle(worker); }); };
      confirmOfflineBundle(registration.active); watch(registration.installing);
      registration.addEventListener('updatefound', () => watch(registration.installing));
      return navigator.serviceWorker.ready;
    }).then(registration => confirmOfflineBundle(registration.active))
      .catch(() => { $('offlineStatus').textContent = 'Offline saving is unavailable in this browser. You can study while this page is open.'; });
  } else $('offlineStatus').textContent = 'Offline installation needs HTTPS or localhost. You can study while this page is open.';
})();

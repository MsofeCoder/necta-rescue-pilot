/* Shared validation: browser application and dependency-free Node checks. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NectaLearningCore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const text = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max;
  const strings = (a, max) => Array.isArray(a) && a.length > 0 && a.length <= max && a.every(s => text(s, 600));
  const source = s => s && text(s.filename, 100) && /^https:\/\/maktaba\.tetea\.org\/past-papers\/csee\/civics\//.test(s.url) && /^[a-f0-9]{64}$/.test(s.sha256) &&
    Array.isArray(s.pages) && s.pages.length > 0 && s.pages.every(n => Number.isInteger(n) && n > 0);
  function validCard(c) {
    if (!c || !text(c.id, 100) || !text(c.topic, 80) || !text(c.question, 2000) ||
        !strings(c.answer, 8) || !text(c.explanation, 400) || !text(c.style, 500) ||
        !c.review || !text(c.review.id, 100) || !text(c.review.note, 600)) return false;
    if (c.kind === 'original_exam') {
      if (c.review.status !== 'source_checked' || !source(c.exam) || !source(c.solution) ||
          !text(c.recordId, 100) || !text(c.reference, 20) || c.year !== 2025 || c.paper !== '1' ||
          !text(c.originalQuestion, 2000) || c.question !== c.originalQuestion) return false;
    } else if (c.kind === 'authored_concept') {
      if (c.review.status !== 'editorially_checked' || !text(c.derivedFrom, 100) || !text(c.command, 30)) return false;
    } else return false;
    if (c.type === 'mcq') {
      if (!Array.isArray(c.options) || c.options.length !== 5 ||
          !c.options.every(o => o && text(o.text, 400)) ||
          c.options.map(o => o.label).join('') !== 'ABCDE' || !/^[A-E]$/.test(c.correctOption)) return false;
      const option = c.options.find(o => o.label === c.correctOption);
      if (c.answer[0] !== option.label + '. ' + option.text) return false;
    } else if (c.type !== 'written') return false;
    return c.requiredPoints == null || (Number.isInteger(c.requiredPoints) && c.requiredPoints > 0 && c.answer.length === c.requiredPoints);
  }
  function eligibleCards(bundle) {
    if (!bundle || bundle.version !== 1 || !Array.isArray(bundle.cards) || !Array.isArray(bundle.allowlist)) return [];
    const seen = new Set();
    const accepted = bundle.cards.filter(c => {
      if (!validCard(c) || seen.has(c.id) || !bundle.allowlist.some(a => a && a.id === c.id && a.reviewId === c.review.id && a.status === c.review.status)) return false;
      seen.add(c.id); return true;
    });
    const originals = new Set(accepted.filter(c => c.kind === 'original_exam').map(c => c.id));
    return accepted.filter(c => c.kind !== 'authored_concept' || originals.has(c.derivedFrom));
  }
  function validProgress(p) {
    return p && p.version === 1 && Array.isArray(p.records) && p.records.length <= 5000 &&
      p.records.every(r => r && text(r.card_id, 100) && ['understood', 'revise_again'].includes(r.status) &&
        typeof r.updated === 'string' && Number.isFinite(Date.parse(r.updated))) &&
      new Set(p.records.map(r => r.card_id)).size === p.records.length;
  }
  const subjects = ['kiswahili', 'english', 'civics', 'geography', 'history', 'literature', 'biology', 'basic_mathematics'];
  function validLegacyRecord(r) {
    return r && typeof r.id === 'string' && subjects.includes(r.subject) && /^(202[0-5])$/.test(String(r.year)) &&
      typeof r.paper === 'string' && r.paper.length <= 12 && typeof r.question === 'string' && r.question.length <= 90 &&
      ['need_review', 'attempted', 'confident', 'reviewed'].includes(r.status) && typeof r.notes === 'string' &&
      r.notes.length <= 5000 && typeof r.created === 'string';
  }
  function validBackup(b) {
    return b && b.format === 'necta-rescue-pilot' && b.version === 1 && Array.isArray(b.records) &&
      b.records.length <= 3000 && b.records.every(validLegacyRecord) &&
      (!own(b, 'learning') || validProgress(b.learning));
  }
  return {validCard, eligibleCards, validProgress, validLegacyRecord, validBackup, MAX_BACKUP_BYTES:16 * 1024 * 1024};
}));

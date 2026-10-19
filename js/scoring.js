/* =========================================================================
   HR Persona Scanner — Logic tính điểm (hàm thuần, đặc tả mục 6)
   Không phụ thuộc DOM; dùng được cho kiểm thử.
   ========================================================================= */
(function (g) {
  const ORDER = g.ORDER;

  /* Fisher–Yates; random truyền vào để kiểm thử xác định được (14.3) */
  function shuffle(arr, random = Math.random) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* 6.6 — khóa xếp hạng: score ↓, lastQ ↓, thứ tự cố định */
  function score(answers) {
    if (answers.length !== 6 || !answers.every(a => ORDER.includes(a))) throw new Error('Cần đúng 6 đáp án hợp lệ');
    const s = new Map(ORDER.map(p => [p, { p, score: 0, lastQ: 0 }]));
    answers.forEach((p, i) => { const r = s.get(p); r.score++; r.lastQ = i + 1; });
    const ranked = [...s.values()].sort((a, b) =>
      b.score - a.score || b.lastQ - a.lastQ || ORDER.indexOf(a.p) - ORDER.indexOf(b.p));
    const top = ranked[0].score;
    const nTop = ranked.filter(r => r.score === top).length;
    const type = nTop === 1 ? 'A' : nTop === 2 ? 'B' : nTop === 3 ? 'C' : 'D';
    return {
      primary: ranked[0].p,
      secondary: type === 'A' ? (ranked[1].score >= 2 ? ranked[1].p : null) : ranked[1].p,
      third: type === 'C' || type === 'D' ? ranked[2].p : null,
      type,
      scoreVector: ORDER.map(p => s.get(p).score),
      answers: [...answers],
    };
  }

  /* 6.5 — chính trước, còn lại theo thứ tự cố định */
  function displayNames(r) {
    return [r.primary, ...ORDER.filter(p => p !== r.primary && (p === r.secondary || p === r.third))];
  }

  /* 7.2 — điểm ↓; cùng điểm: chính lên đầu, còn lại theo thứ tự cố định */
  function barOrder(r) {
    return [...ORDER].sort((a, b) => {
      const d = r.scoreVector[ORDER.indexOf(b)] - r.scoreVector[ORDER.indexOf(a)];
      if (d) return d;
      if (a === r.primary) return -1;
      if (b === r.primary) return 1;
      return ORDER.indexOf(a) - ORDER.indexOf(b);
    });
  }

  /* 6.9 */
  const straightLine = positions => positions.every(p => p === positions[0]);

  g.Scoring = { shuffle, score, displayNames, barOrder, straightLine };
})(window);

/* =========================================================================
   HR Persona Scanner — Giao diện
   Mỗi màn hình là một hàm render*. Chuỗi lấy từ content.js, class từ components.css.
   ========================================================================= */
(function () {
  const { CONFIG, ORDER, PERSONAS: P, QUESTIONS, TEXT, Scoring } = window;
  const app = document.getElementById('app');

  const devTools = !!CONFIG.DEV_TOOLS;   // công cụ preview UI (hiện ở mọi môi trường, có ghi chú "chỉ dùng cho preview UI")
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => { if (!(k in vars)) throw new Error('Thiếu biến ' + k); return vars[k]; });
  const color = code => `var(--persona-${code.toLowerCase()})`;
  const icon = (name, cls = '') => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
  const icons = () => { try { window.lucide && window.lucide.createIcons(); } catch (e) {} };

  /* ---------- Trạng thái lượt làm (sessionStorage, đặc tả Q2) ---------- */
  const KEY = 'hrps-attempt';
  const store = {
    get() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; } },
    set(v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} },
    clear() { try { sessionStorage.removeItem(KEY); } catch (e) {} },
  };
  let S = store.get();
  const save = () => store.set(S);
  function newAttempt() {
    let channel = 'qr';
    try { channel = new URLSearchParams(location.search).get('ch') || 'qr'; } catch (e) {}
    S = {
      attemptId: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      startedAt: new Date().toISOString(), channel,
      displayedOrder: QUESTIONS.map(() => Scoring.shuffle(ORDER)),
      answers: Array(6).fill(null), clickedPositions: Array(6).fill(null),
      q: 0, screen: 'gender', gender: null, contact: null,
    };
    save();
  }
  function endAttempt() { store.clear(); S = null; go(); }

  let idleTimer = null;
  /* Logo TCP (bản nền sáng) — dùng ở hero và thanh trên các màn làm bài */
  const logo = (cls = '') => `<span class="logo ${cls}"><img class="logo__mark" src="assets/logo-mark.png" alt="" width="160" height="128">${esc(TEXT.brandShort)}</span>`;

  /* Thứ tự các bước để biết đang đi tới hay lùi lại → hướng trượt khi chuyển màn */
  const stepOf = () => !S ? 0 : S.screen === 'gender' ? 1 : S.screen === 'quiz' ? 2 + S.q : S.screen === 'form' ? 8 : 9;
  const isFlow = n => n >= 1 && n <= 8;              // chọn nhân vật · 6 câu hỏi · form
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastStep = null;
  function render() {
    clearInterval(idleTimer);
    if (!S) renderHome();
    else if (S.screen === 'gender') renderGender();
    else if (S.screen === 'quiz') renderQuiz();
    else if (S.screen === 'form') renderForm();
    else renderResult();
    icons();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  /* Chuyển màn kiểu "lướt": màn cũ trượt ra, màn mới trượt vào theo hướng cuộn (đi tới = lên, lùi lại = xuống).
     Dùng View Transitions khi trình duyệt hỗ trợ; nếu không thì chỉ trượt màn mới vào. */
  function go() {
    const step = stepOf(), animate = lastStep !== null && step !== lastStep && isFlow(step) && isFlow(lastStep) && !reduceMotion();
    const dir = step > lastStep ? 'next' : 'prev';
    lastStep = step;
    if (!animate) return render();
    document.documentElement.dataset.nav = dir;
    // Tab đang ẩn thì trình duyệt không chạy được View Transition (render sẽ bị treo tới khi tab hiện lại) → bỏ hiệu ứng
    if (document.startViewTransition && document.visibilityState === 'visible') {
      // An toàn: nếu trình duyệt không vẽ được khung hình (tab nền, webview…) thì sau 900ms vẫn đổi màn, không bao giờ kẹt
      let done = false; const run = () => { if (done) return; done = true; render(); };
      document.startViewTransition(run); setTimeout(run, 900); return;
    }
    render();
    app.firstElementChild?.classList.add('slide-' + dir);
  }

  /* ---------- Trang chủ ---------- */
  function renderHome() {
    const H = TEXT.home;
    const cards = ORDER.map(c => `<figure class="cards__item" style="--persona:${color(c)}">
        <img src="assets/card-${c}.webp?v=4" alt="Minh họa ${esc(P[c].name)}" width="720" height="975" loading="lazy">
        <figcaption><b>${esc(P[c].name)}</b><span>${esc(P[c].en)}</span></figcaption>
      </figure>`).join('');
    app.innerHTML = `
    <section class="hero"><header class="container res__top">${logo()}</header>
      <div class="container"><div class="hero__grid home-block">
      <div class="hero__copy enter">
        <h1 class="h1 hero__title">${esc(H.title[0])}<br><span class="hero__accent">${esc(H.title[1])}</span></h1>
        <p class="p hero__lead">${esc(H.lead)}</p>
        <p class="p hero__method">${esc(H.method)}</p>
        <ul class="facts">${H.facts.map(f => `<li class="fact"><span class="fact__icon" style="-webkit-mask-image:url('${f.img}');mask-image:url('${f.img}')" aria-hidden="true"></span>
          <span class="fact__text">${esc(fill(f.label, { seconds: CONFIG.TIME_PROMISE_SECONDS }))}</span></li>`).join('')}</ul>
        <div class="intro">
          ${(() => {   // "1000+" tách thành con số lớn, phần còn lại nối liền thành một câu
            const m = H.socialProof[0].match(/^([\d.,]+\+?)\s*(.*)$/) || ['', '', H.socialProof[0]];
            return `<p class="intro__proof"><span class="intro__num">${esc(m[1])}</span><span class="intro__lines">${esc(m[2])}. <span class="intro__ask">${esc(H.socialProof[1])}</span></span></p>`;
          })()}
          <button class="btn btn--lg btn--round intro__cta" id="start">${esc(H.cta)} ${icon('arrow-right')}</button>
        </div>
      </div>
      <div class="hero__art"><img src="assets/hero-scene.webp" alt="${esc(H.heroAlt)}" width="1672" height="941"></div>
    </div></div></section>
    <section class="cards-band" aria-label="${esc(H.stripLabel)}"><div class="container"><div class="cards home-block">
      <div class="cards__head">
        <div class="cards__title"><span class="eyebrow">${esc(H.cardsEyebrow)}</span><h2 class="h2">${esc(H.cardsTitle)}</h2></div>
      </div>
      <div class="cards__track" id="cardsTrack" tabindex="0">${cards}</div>
      <div class="cards__nav">
        <button class="btn btn--outline icon-btn btn--round" id="cardsPrev" aria-label="Xem slide trước">${icon('chevron-left')}</button>
        <div class="cards__dots" id="cardsDots"></div>
        <button class="btn btn--outline icon-btn btn--round" id="cardsNext" aria-label="Xem slide tiếp">${icon('chevron-right')}</button>
      </div>
      <p class="p-mini text-muted home-disclaimer">${esc(H.disclaimer)}</p>
    </div></div></section>`;
    document.getElementById('start').onclick = () => { newAttempt(); go(); };
    initCards();
  }

  /* Slider ngang theo "slide": mỗi slide = số thẻ vừa khung (desktop 6 → ẩn điều hướng, tablet 3, mobile 1).
     Nút ‹ › cuộn đúng 1 slide; chấm chỉ số = số slide, chấm đang xem kéo dài; vuốt vẫn dùng scroll-snap. */
  function initCards() {
    const track = document.getElementById('cardsTrack'), dots = document.getElementById('cardsDots');
    const prev = document.getElementById('cardsPrev'), next = document.getElementById('cardsNext');
    const nav = prev.parentElement, n = track.querySelectorAll('.cards__item').length;
    const itemStep = () => track.querySelector('.cards__item').getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16);
    const perView = () => Math.max(1, Math.round((track.clientWidth + parseFloat(getComputedStyle(track).columnGap || 16)) / itemStep()));
    const pages = () => Math.ceil(n / perView());
    const page = () => Math.min(pages() - 1, Math.round(track.scrollLeft / (itemStep() * perView())));
    const goTo = i => track.scrollTo({ left: i * perView() * itemStep(), behavior: 'smooth' });
    const sync = () => {
      const total = pages(), cur = page();
      nav.hidden = total <= 1;   // đủ chỗ cho cả 6 thẻ thì ẩn điều hướng
      if (dots.childElementCount !== total) {
        dots.innerHTML = Array.from({ length: total }, (_, i) => `<button type="button" class="cards__dot" aria-label="Slide ${i + 1} / ${total}"></button>`).join('');
        [...dots.children].forEach((d, i) => { d.onclick = () => goTo(i); });
      }
      [...dots.children].forEach((d, i) => { d.classList.toggle('is-active', i === cur); d.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    prev.onclick = () => goTo(Math.max(0, page() - 1));
    next.onclick = () => goTo(Math.min(pages() - 1, page() + 1));
    track.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
  }

  /* ---------- Chọn nhân vật (giới tính) — trước câu 1 ---------- */
  let autoGender = null;
  function renderGender() {
    const G = TEXT.gender;
    app.innerHTML = `
    <section class="flow gender"><div class="gender__col">
      <div class="gender__top">${navUp('back', G.back)}</div>
      <div class="gender__head">
        <h1 class="gender__title" id="gt">${esc(G.title)}</h1>
        <p class="gender__lead">${esc(G.lead)}</p>
      </div>
      <div class="gender__options" role="radiogroup" aria-labelledby="gt">
        ${G.options.map(o => `<button type="button" class="gender__card" role="radio" data-id="${o.id}" aria-checked="${S.gender === o.id}">
          <span class="gender__art"><img src="${o.img}" alt="${esc(o.alt)}" width="640" height="853"></span>
          <span class="gender__label">${esc(o.label)}</span></button>`).join('')}
      </div>
      <div class="gender__nav">${navDown('next', G.next, !S.gender)}</div>
    </div></section>`;
    app.querySelectorAll('.gender__card').forEach(b => b.onclick = () => {
      S.gender = b.dataset.id; save();
      app.querySelectorAll('.gender__card').forEach(c => c.setAttribute('aria-checked', c === b));
      document.getElementById('next').disabled = false;
      clearTimeout(autoGender); autoGender = setTimeout(() => document.getElementById('next')?.click(), 450);   // tự sang câu 1
    });
    document.getElementById('back').onclick = endAttempt;
    document.getElementById('next').onclick = () => { if (!S.gender) return; S.screen = 'quiz'; S.q = 0; save(); go(); };
  }

  /* ---------- Câu hỏi ---------- */
  /* Nút điều hướng dạng chữ + mũi tên (Figma: "↑ Quay lại" ở trên, "Tiếp tục ↓" ở dưới) */
  const navUp = (id, label) => `<button type="button" class="flow-link flow-link--up" id="${id}">${icon('move-up')}<span>${esc(label)}</span></button>`;
  const navDown = (id, label, disabled) => `<button type="button" class="flow-link flow-link--down" id="${id}" ${disabled ? 'disabled' : ''}><span>${esc(label)}</span>${icon('move-down')}</button>`;

  function renderQuiz() {
    const T = TEXT.quiz, i = S.q, Q = QUESTIONS[i], order = S.displayedOrder[i], sel = S.answers[i];
    app.innerHTML = `
    <section class="flow quiz"><div class="quiz__col">
      ${navUp('back', T.back)}
      <div class="quiz__progress">
        <span class="quiz__count">${esc(fill(T.step, { n: String(i + 1).padStart(2, '0') }))}</span>
        <div class="quiz__bar" role="progressbar" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${i + 1}" aria-label="Tiến độ"><i style="width:${(i + 1) / 6 * 100}%"></i></div>
      </div>
      <div class="quiz__card enter">
        <h1 class="quiz__q" id="qt">${esc(Q.q)}</h1>
        <img class="quiz__art" src="${Q.img[S.gender] || Q.img.female}" alt="" aria-hidden="true" width="640" height="360">
      </div>
      <div class="quiz__options" role="radiogroup" aria-labelledby="qt">
        ${order.map((code, pos) => `<button type="button" class="option" role="radio" data-code="${code}" data-pos="${pos + 1}" aria-checked="${sel === code}" tabindex="${(sel ? sel === code : pos === 0) ? 0 : -1}">
          <span class="option__radio" aria-hidden="true"></span><span class="option__text">${esc(Q.a[code])}</span></button>`).join('')}
      </div>
      ${navDown('next', T.next, !sel)}
    </div></section>`;
    app.querySelectorAll('.option').forEach(b => b.onclick = () => choose(b.dataset.code, +b.dataset.pos));
    document.getElementById('back').onclick = () => { if (i === 0) S.screen = 'gender'; else S.q--; save(); go(); };
    document.getElementById('next').onclick = next;
  }
  let autoNext = null;
  function choose(code, pos) {
    S.answers[S.q] = code; S.clickedPositions[S.q] = pos; save();
    app.querySelectorAll('.option').forEach(b => { const on = b.dataset.code === code; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
    document.getElementById('next').disabled = false;
    clearTimeout(autoNext); autoNext = setTimeout(next, 320);
  }
  function next() {
    clearTimeout(autoNext);
    if (!S || !S.answers[S.q]) return;
    if (S.q < 5) S.q++; else S.screen = 'form';
    save(); go();
  }
  document.addEventListener('keydown', e => {
    if (!S || S.screen !== 'quiz' || e.target.closest('input,select,textarea') || document.querySelector('.backdrop')) return;
    if (/^[1-6]$/.test(e.key)) {
      const pos = +e.key; choose(S.displayedOrder[S.q][pos - 1], pos);
      const el = app.querySelector(`.option[data-pos="${pos}"]`); el && el.focus();
    } else if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key) && e.target.classList.contains('option')) {
      e.preventDefault();
      const pos = +e.target.dataset.pos, d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
      const n = ((pos - 1 + d + 6) % 6) + 1;
      app.querySelector(`.option[data-pos="${n}"]`).focus();
    } else if (e.key === 'Enter' && S.answers[S.q] && !e.target.closest('button')) next();
  });

  /* Điều hướng bằng cuộn (bánh xe / trackpad / vuốt):
     - Ở đầu trang, cuộn lên  → câu trước (câu 1 → chọn nhân vật; form → câu 6).
     - Ở cuối trang, cuộn xuống → câu sau, chỉ khi câu hiện tại đã trả lời.
     Mỗi cú cuộn chỉ chuyển 1 bước: sau khi chuyển phải dừng tay (~220ms không có sự kiện wheel) mới tính cú tiếp,
     nên đà quán tính của trackpad không làm nhảy nhiều câu. */
  let wheelAcc = 0, navLock = 0, touchY = null, lastWheel = 0, gestureUsed = false;
  const answered = () => S && ((S.screen === 'gender' && S.gender) || (S.screen === 'quiz' && S.answers[S.q]));
  function scrollStep(d) {
    if (!S || Date.now() < navLock || document.querySelector('.backdrop')) return;
    if (d < 0) {
      if (S.screen === 'quiz') { if (S.q === 0) S.screen = 'gender'; else S.q--; }
      else if (S.screen === 'form') { S.screen = 'quiz'; S.q = 5; }
      else return;
    } else {
      if (!answered()) return;
      if (S.screen === 'gender') { S.screen = 'quiz'; S.q = 0; }
      else if (S.screen === 'quiz') { clearTimeout(autoNext); if (S.q < 5) S.q++; else S.screen = 'form'; }
      else return;
    }
    navLock = Date.now() + 800; wheelAcc = 0; gestureUsed = true; save(); go();
  }
  let movedAt = 0;   // lúc trang còn đang cuộn giữa chừng — đà cuộn chạm đỉnh/đáy chưa tính là muốn chuyển câu
  addEventListener('scroll', () => { movedAt = Date.now(); }, { passive: true });
  const settled = () => Date.now() - movedAt > 350;
  const atTop = () => window.scrollY <= 2 && settled();
  const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2 && settled();
  const inFlow = () => S && ['gender', 'quiz', 'form'].includes(S.screen);
  addEventListener('wheel', e => {
    const now = Date.now(), newGesture = now - lastWheel > 220; lastWheel = now;
    if (newGesture) { gestureUsed = false; wheelAcc = 0; }
    if (!inFlow() || gestureUsed || e.target.closest?.('select, textarea')) return;
    if (e.deltaY < 0 && atTop()) { wheelAcc = Math.min(wheelAcc, 0) + e.deltaY; if (wheelAcc < -60) scrollStep(-1); }
    else if (e.deltaY > 0 && atBottom()) { wheelAcc = Math.max(wheelAcc, 0) + e.deltaY; if (wheelAcc > 60) scrollStep(1); }
    else wheelAcc = 0;
  }, { passive: true });
  let touchTop = false, touchBottom = false;
  addEventListener('touchstart', e => { touchY = inFlow() ? e.touches[0].clientY : null; touchTop = atTop(); touchBottom = atBottom(); }, { passive: true });
  addEventListener('touchend', e => {
    if (touchY === null) return;
    const dy = e.changedTouches[0].clientY - touchY; touchY = null;
    if (dy > 70 && touchTop && window.scrollY <= 2) scrollStep(-1);
    else if (dy < -70 && touchBottom) scrollStep(1);
  }, { passive: true });

  /* ---------- Form ---------- */
  function renderForm() {
    const F = TEXT.form, c = S.contact || {}, short = CONFIG.FORM_MODE === 'short';
    const req = '<span class="uline__req" aria-hidden="true">*</span>';
    const err = id => `<span class="field__error" id="${id}-err" aria-live="polite"></span>`;
    const input = (id, type, attrs = '') => `
      <div class="uline">
        <label class="uline__label" for="${id}">${esc(F.fields[id])}${req}</label>
        <input class="uline__input" id="${id}" name="${id}" type="${type}" required aria-required="true" placeholder="${esc(F.placeholders[id] || '')}" value="${esc(c[id] || '')}" aria-describedby="${id}-err${id === 'email' ? ' email-hint' : ''}" ${attrs}>
        ${id === 'email' ? `<span class="uline__hint" id="email-hint">${esc(F.sendNote)}</span>` : ''}
        ${err(id)}
      </div>`;
    const select = (id, placeholder, options, required) => `
      <div class="uline">
        <label class="uline__label" for="${id}">${esc(F.fields[id])}${required ? req : ''}</label>
        <select class="uline__input uline__select" id="${id}" name="${id}" ${required ? 'required aria-required="true"' : ''} aria-describedby="${id}-err">
          <option value="">${esc(placeholder)}</option>
          ${options.map(([v, l]) => `<option value="${esc(v)}" ${c[id] === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}
        </select>
        ${err(id)}
      </div>`;
    app.innerHTML = `
    <section class="flow lead"><div class="lead__col">
      ${navUp('back', F.back)}
      <div class="lead__head enter">
        <span class="lead__eyebrow">${esc(F.eyebrow)}</span>
        <h1 class="h2 lead__title">${esc(F.title)}</h1>
        <p class="p-sm lead__lead">${esc(F.lead)}</p>
      </div>
      <form class="lead__form" id="lead" novalidate>
        ${input('fullName', 'text', 'autocomplete="name"')}
        ${input('email', 'email', 'autocomplete="email" inputmode="email"')}
        ${short ? '' : input('company', 'text', 'autocomplete="organization"')}
        ${short ? '' : select('companySize', F.sizePlaceholder, F.sizes, false)}
        ${short ? '' : input('phone', 'tel', 'autocomplete="tel" inputmode="tel"')}
        ${short ? '' : select('jobTitle', F.rolePlaceholder, F.roles.map(r => [r, r]), true)}
        <label class="choice lead__consent"><input type="checkbox" class="checkbox" id="consent" ${c.marketingConsent ? 'checked' : ''}><span>${esc(CONFIG.MARKETING_CONSENT_TEXT)}</span></label>
        <button type="submit" class="btn btn--cta btn--lg btn--round lead__submit">${esc(F.submit)}</button>
        <p class="p-mini text-muted lead__foot">${esc(F.footnote)}</p>
        ${devTools ? `<button type="button" class="link-btn link-btn--sm lead__demo" id="demo">${esc(F.demo)} <span class="dev-note">${esc(TEXT.devNote)}</span></button>` : ''}
      </form>
    </div></section>`;
    document.getElementById('back').onclick = () => { S.screen = 'quiz'; S.q = 5; save(); go(); };
    if (devTools) document.getElementById('demo').onclick = () => {
      const d = { fullName: 'Nguyễn Thị Lan', email: 'lan.nguyen@congty-mau.vn', company: 'Công ty Mẫu', companySize: '200-1000', phone: '0912 345 678', jobTitle: 'HR Business Partner' };
      Object.entries(d).forEach(([k, v]) => { const el = document.getElementById(k); if (el) { el.value = v; el.dispatchEvent(new Event('change')); } });
    };
    // chữ gợi ý của ô chọn hiển thị màu xám khi chưa chọn
    app.querySelectorAll('.uline__select').forEach(el => { const t = () => el.classList.toggle('is-empty', !el.value); el.addEventListener('change', t); t(); });
    document.getElementById('lead').onsubmit = submit;
  }
  function submit(e) {
    e.preventDefault();
    const E = TEXT.form.errors, val = id => (document.getElementById(id)?.value || '').trim();
    const rules = {
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
      fullName: v => !!v,
      phone: v => /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(v.replace(/[\s.\-]/g, '')),
      company: v => !!v,
      jobTitle: v => !!v,
    };
    let first = null;
    Object.entries(rules).forEach(([id, ok]) => {
      const input = document.getElementById(id); if (!input) return;
      const bad = !ok(val(id));
      input.setAttribute('aria-invalid', bad);
      document.getElementById(id + '-err').innerHTML = bad ? `${icon('circle-alert')}<span>${esc(E[id])}</span>` : '';
      if (bad && !first) first = input;
    });
    icons();
    if (first) { first.focus(); return; }
    const consent = document.getElementById('consent').checked;
    S.contact = {
      email: val('email').toLowerCase().replace(/\s+/g, ''), fullName: val('fullName'), phone: val('phone'),
      company: val('company'), jobTitle: val('jobTitle'), companySize: val('companySize') || null,
      marketingConsent: consent, marketingConsentText: CONFIG.MARKETING_CONSENT_TEXT,
      marketingConsentAt: consent ? new Date().toISOString() : null,
    };
    S.submittedAt = new Date().toISOString();
    S.result = Scoring.score(S.answers);
    S.straightLine = Scoring.straightLine(S.clickedPositions);
    S.screen = 'result'; save(); go();
  }

  /* ---------- Thẻ Nhân Vật (Figma 5:3192 … 67:3143) — bố cục bento + banner ---------- */
  const D = window.PERSONA_DETAIL, ESS = window.ESSENCE, FR = window.FRAMES;
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');   // `**…**` trong đặc tả = chữ đậm
  const cut = c => `assets/card-${c}.webp?v=4`;   // thẻ chân dung Figma 265:3428 … 265:3433 (xuất 3x, lưu 720px)
  /* Nền khối "Mảnh ghép chiến lược": assets/tcp-{mã}.jpg là vùng chỉ có đồ vật (không có người), cắt sẵn từ PNG gốc
     của banner rồi phóng lên 1600px cho màn retina → không còn vỡ hạt. Điểm neo dọc giữ đúng phần tranh đẹp nhất.
     URL để inline (không qua biến CSS). */
  const TCP_POS = { KT: '0% 100%', DH: '0% 100%', TP: '100% 60%', GN: '0% 55%', GM: '100% 15%', TL: '50% 40%' };   // TP: cụm núi bên phải ảnh; TL: đám đông (đã bỏ nhân vật chính); GM: chỉ cụm biểu đồ (cắt từ banner-GM, bỏ người)
  const tcpBg = c => `background-image:url('assets/tcp-${c}.webp?v=5');background-size:cover;background-position:${TCP_POS[c]}`;

  /* Phân loại 10 trường hợp Figma: single · double1 (A có chân dung phụ) · double2 (B) · multi3 (C) · multi6 (D) */
  function resultCase(r) {
    if (r.type === 'A') return r.secondary ? 'double1' : 'single';
    return { B: 'double2', C: 'multi3', D: 'multi6' }[r.type];
  }

  /* Radar 6 trục, thang 0–6, vòng 2/4/6 điểm (Figma "Ring 2/4/6 điểm"). Trục theo thứ tự cố định, KT ở đỉnh. */
  function radar(r) {
    const W = 340, H = 300, cx = W / 2, cy = H / 2, R = 108, top = Math.max(...r.scoreVector);
    const pt = (i, v) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [cx + Math.cos(a) * R * v / 6, cy + Math.sin(a) * R * v / 6]; };
    const poly = vals => vals.map((v, i) => pt(i, v).map(n => n.toFixed(1)).join(',')).join(' ');
    const rings = [2, 4, 6].map(v => `<polygon class="radar__ring" points="${poly(ORDER.map(() => v))}"/>`).join('');
    const axes = ORDER.map((_, i) => { const [x, y] = pt(i, 6); return `<line class="radar__axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join('');
    const labels = ORDER.map((c, i) => {
      const v = r.scoreVector[i], [x, y] = pt(i, 7.3), anchor = Math.abs(x - cx) < 4 ? 'middle' : x > cx ? 'start' : 'end';
      const hot = v === top;
      return `<text x="${x.toFixed(1)}" y="${(y + (i === 0 ? -6 : i === 3 ? 12 : 4)).toFixed(1)}" text-anchor="${anchor}" class="radar__label${hot ? ' is-top' : ''}" ${hot ? `style="fill:${color(c)}"` : ''}>${esc(P[c].name.replace(/^(Nhà|Người) /, ''))} <tspan class="radar__num">${v}</tspan></text>`;
    }).join('');
    /* Vùng màu chỉ nối các chân dung có điểm (theo thứ tự trục), không kéo về tâm ở trục 0 điểm.
       Chỉ 1–2 chân dung có điểm thì thêm tâm để vẫn thành một vùng. */
    const hit = r.scoreVector.map((v, i) => v ? pt(i, v) : null).filter(Boolean);
    const shape = (hit.length >= 3 ? hit : [[cx, cy], ...hit]).map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
    const dots = r.scoreVector.map((v, i) => { const [x, y] = pt(i, v); return v ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" class="radar__dot"/>` : ''; }).join('');
    const aria = ORDER.map((c, i) => `${P[c].name} ${r.scoreVector[i]}`).join(', ');
    return `<svg class="radar" viewBox="0 0 ${W} ${H}" role="img" aria-label="Phổ điểm: ${esc(aria)} (trên 6)">
      ${rings}${axes}<polygon class="radar__shape" points="${shape}"/>${dots}${labels}</svg>`;
  }

  function renderResult() {
    const R = TEXT.result, r = S.result || Scoring.score(S.answers), kase = resultCase(r);
    const pc = r.primary, p = { ...P[pc], ...D[pc] }, names = Scoring.displayNames(r);
    const others = names.slice(1);                                    // B/C theo 6.5; D: còn lại theo thứ tự cố định
    const crew = kase === 'multi6' ? ORDER.filter(c => c !== pc) : kase === 'single' ? [] : kase === 'double1' ? [r.secondary] : others;
    const tied = kase === 'double2' || kase === 'multi3' || kase === 'multi6';

    /* Khối "bộ chân dung" (đoạn ghép 9.3) */
    let combo = '';
    if (kase !== 'single') {
      const heading = kase === 'multi6' ? `<p class="combo__all6">${esc(R.combo.all6)}</p>`
        : `<p class="combo__names">${names.slice(0, kase === 'multi3' ? 3 : 2).map(c => `<span>${esc(P[c].name)}</span>`).join('<i>×</i>')}</p>`;
      const text = kase === 'multi6' ? fill(FR.ALL6, { primary: p.name })
        : kase === 'multi3' ? fill(FR.C, { e1: ESS[pc], e2: ESS[others[0]], e3: ESS[others[1]] })
        : fill(FR.B, { e1: ESS[pc], e2: ESS[crew[0]] });
      const slides = crew.map((c, i) => `<figure class="combo__card" data-i="${i}"${i ? ' hidden' : ''} style="--c:${color(c)}"><img src="${cut(c)}" alt="Minh họa ${esc(P[c].name)}" width="240" height="240"><figcaption><b>${esc(P[c].name)}</b><span>${esc(P[c].en)}</span></figcaption></figure>`).join('');
      const nav = crew.length > 1 ? `<div class="combo__nav"><button class="btn btn--ghost icon-btn btn--sm" data-dir="-1" aria-label="Chân dung trước">${icon('chevron-left')}</button><span class="p-mini" id="combo-pos">1 / ${crew.length}</span><button class="btn btn--ghost icon-btn btn--sm" data-dir="1" aria-label="Chân dung sau">${icon('chevron-right')}</button></div>` : '';
      combo = `<article class="tile tile--combo">
        <div class="combo__copy">
          <p class="tile__kicker tile__kicker--ink">${esc(kase === 'double1' || kase === 'double2' ? R.combo.double : R.combo.multi)}</p>
          ${heading}
          <p class="p-sm">${md(text)}</p>
          ${tied ? `<p class="p-mini combo__note">${esc(R.combo.tieNote)}</p>` : ''}
        </div>
        <div class="combo__deck">${slides}${nav}</div>
      </article>`;
    }

    /* Đồng đội ăn ý (9.4): đoạn thay thế khi đồng đội trùng chân dung phụ/thứ ba, hoặc nhánh D */
    const tm = p.teammate.code, swap = r.type === 'D' || tm === r.secondary || tm === r.third;
    const tmText = swap ? md(fill(FR.TEAMMATE_SWAP, { primary: p.name, teammate: P[tm].name, teammateEssence: `**${ESS[tm]}**` }))
      : `<b>${esc(P[tm].name)}</b>, ${esc(p.teammate.line)}`;

    const qArt = (TEXT.result.questionArt || {})[pc];                // minh họa riêng cho "Câu hỏi mang về" (nếu có)
    const A = p.analysis;
    const rest = A.slice(1);                                          // 4 mục phân tích còn lại (mục "Chân dung" A[0] đã bỏ khỏi banner, hiện không hiển thị) — lưới 2×2 cho mọi trường hợp
    const aTile = (a, i, n) => `<article class="tile tile--a${i === n - 1 ? ' tile--dark' : ''}${n % 2 && i === n - 1 ? ' tile--odd' : ''}" style="--span:${n === 4 ? 6 : 12 / n}">
        <p class="tile__kicker">${esc(a.t)}</p><p class="p-sm">${md(a.x)}</p></article>`;
    const utm = `?utm_source=hrdigest2026&utm_medium=web&utm_campaign=hr_persona_scanner&utm_content=persona_${pc.toLowerCase()}`;
    const B = R.brandCard;

    app.innerHTML = `
    <div class="res" data-pc="${pc}" style="--pc:${color(pc)};--bn:var(--banner-${pc.toLowerCase()})">
      <header class="container res__top">${logo()}</header>

      <section class="container res__body">
        <div class="res-banner enter">
          <div class="res-banner__copy">
            <span class="res-banner__pill">${esc(R.eyebrow)}</span>
            <h1 class="res-banner__name">${esc(p.name)}</h1>
            <p class="res-banner__en">${esc(p.en)} · ${esc(p.role)}</p>
            <blockquote class="res-banner__quote">${icon('quote')}<span>${esc(p.chatRieng)}</span></blockquote>
          </div>
          <div class="res-banner__art"><img src="assets/banner-${pc}.webp" alt="Minh họa ${esc(p.name)}" width="1672" height="940" fetchpriority="high"></div>
        </div>

        <div class="bento">
          <article class="tile tile--radar" style="--span:5">
            <p class="tile__kicker tile__kicker--ink">${esc(R.chartTitle)}</p>
            <p class="p-mini tile__sub">${esc(R.chartSub)}</p>
            ${radar(r)}
          </article>
          ${(() => {
            const teaser = `<article class="tile tile--teaser">
              <span class="teaser__icon" style="-webkit-mask-image:url('assets/result-mail.svg');mask-image:url('assets/result-mail.svg')" aria-hidden="true"></span>
              <div><p class="p-sm"><b>${esc(R.teaserTitle)}</b></p><p class="p-sm">${esc(R.teaser)}</p></div>
            </article>`;
            const analysis = rest.map((a, i) => aTile(a, i, rest.length)).join('');
            /* Chân dung rõ nét: cột phải = "Đây chỉ là bề nổi" + 4 mục phân tích (lưới 2×2) cạnh radar.
               Kép/đa diện: cột phải = khối bộ chân dung + "Đây chỉ là bề nổi"; 4 mục phân tích xuống hàng dưới. */
            return kase === 'single'
              ? `<div class="bento__stack bento__stack--single" style="--span:7">${teaser}<div class="bento__sub">${analysis}</div></div>`
              : `<div class="bento__stack" style="--span:7">${combo}${teaser}</div>${analysis}`;
          })()}

          <article class="tile tile--skills" style="--span:12">
            <p class="tile__kicker">${esc(R.skillsTitle)}</p>
            <ol class="skills">${p.skills.map((s, i) => `<li><span class="skills__n">0${i + 1}</span><div><b>${esc(s.t)}</b><p class="p-sm">${md(s.x)}</p></div></li>`).join('')}</ol>
          </article>
          <article class="tile tile--half" style="--span:6"><p class="tile__kicker">${esc(R.mentorTitle)}</p><p class="p-sm">${md(p.mentor)}</p></article>
          <article class="tile tile--half" style="--span:6"><p class="tile__kicker">${esc(R.stepTitle)}</p><p class="p-sm">${md(p.step)}</p></article>

          <article class="tile tile--question" style="--span:${qArt ? 7 : 12}">
            <p class="tile__q-label">${icon('message-circle-question')} ${esc(R.questionTitle)}</p>
            <p class="tile__q">${esc(p.question)}</p>
          </article>
          ${qArt ? `<figure class="q-art" style="--span:5"><img src="${qArt}" alt="" loading="lazy"></figure>` : ''}

          <figure class="tile tile--mate-art" style="--span:5;--bn-mate:var(--banner-${tm.toLowerCase()});--mate:${color(tm)}">
            <img src="assets/banner-${tm}.webp" alt="Minh họa ${esc(P[tm].name)}" width="1672" height="940" loading="lazy">
            <figcaption>${esc(P[tm].name)}</figcaption>
          </figure>
          <article class="tile tile--mate" style="--span:7;--mate:${color(tm)}">
            <div class="mate__text">
              <p class="tile__kicker">${esc(R.teammateTitle)}</p>
              <p class="mate__body">${tmText}</p>
            </div>
            <figure class="mate__quote">
              ${icon('quote')}
              <blockquote>${esc(p.quote)}</blockquote>
            </figure>
          </article>

          <article class="tile tile--tcp" style="--span:7;${tcpBg(pc)}">
            <p class="tile__eyebrow">${esc(R.tcp.eyebrow)}</p>
            <h2 class="h3">${esc(R.tcp.title)}</h2>
            <p class="p-sm">${md(p.tcp.text)}</p>
            <a class="btn btn--round tcp__btn" href="${R.tcp.url + utm}" target="_blank" rel="noopener">${esc(R.tcp.cta)} ${icon('arrow-right')}</a>
          </article>
          <article class="tile tile--brand" style="--span:5">
            <img class="brand__logo" src="assets/logo.webp" alt="${esc(TEXT.brand)}" height="40">
            <p class="p-sm">${esc(B.desc)}</p>
            <div class="brand__badges">${B.badges.map(b => `<span class="badge badge--secondary">${esc(b)}</span>`).join('')}</div>
            <ul class="brand__links">${B.programs.map(x => `<li><a href="${R.tcp.url + utm}" target="_blank" rel="noopener">${esc(x)} ${icon('arrow-right')}</a></li>`).join('')}</ul>
            <p class="p-mini brand__meta">${esc(B.more)} <a href="${R.tcp.url}" target="_blank" rel="noopener">${esc(B.site)}</a><br>${esc(B.contact)}</p>
          </article>
        </div>

        <div class="res__foot">
          <button class="btn btn--outline btn--round" id="again">${esc(R.again)}</button>
          <span class="p-sm text-muted" id="idle"></span>
        </div>
        <div class="res__disclaimer">${R.disclaimer.map(t => `<p class="p-mini">${esc(t)}</p>`).join('')}
          <p class="p-mini">${esc(R.sourcesTitle)}:</p>
          <ul class="res__sources">${R.sources.map(t => `<li class="p-mini">${esc(t)}</li>`).join('')}</ul></div>
      </section>
    </div>`;

    /* Carousel bộ chân dung (Figma 67:2830: ‹ 1 — 2 — 3 ›) */
    const deck = app.querySelector('.combo__deck');
    if (deck && crew.length > 1) {
      let k = 0; const cards = [...deck.querySelectorAll('.combo__card')];
      deck.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => {
        cards[k].hidden = true; k = (k + Number(b.dataset.dir) + cards.length) % cards.length; cards[k].hidden = false;
        document.getElementById('combo-pos').textContent = `${k + 1} / ${cards.length}`;
      });
    }
    document.getElementById('again').onclick = endAttempt;
    if (S.channel === 'booth') {
      let left = CONFIG.BOOTH_IDLE_RESET_SECONDS; const el = document.getElementById('idle');
      const tick = () => { el.textContent = fill(R.idle, { s: left }); if (left-- <= 0) endAttempt(); };
      const bump = () => { left = CONFIG.BOOTH_IDLE_RESET_SECONDS; };
      ['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, bump, { passive: true }));
      tick(); idleTimer = setInterval(tick, 1000);
    }
  }

  /* ---------- Bộ chọn nhanh 10 trường hợp kết quả (chỉ cho bản demo) ---------- */
  const CASES = [
    ...ORDER.map(c => ({ group: 'single', code: c, answers: Array(6).fill(c) })),
    { group: 'double1', answers: ['KT', 'KT', 'KT', 'DH', 'DH', 'GM'] },   // Figma 67:2161: Kiến Tạo × Đồng Hành
    { group: 'double2', answers: ['TL', 'GM', 'TL', 'KT', 'DH', 'GM'] },   // Figma 67:2481: Giải Mã × Truyền Lửa
    { group: 'multi3', answers: ['DH', 'GM', 'TL', 'GM', 'TL', 'DH'] },    // Figma 67:2830: Đồng Hành · Giải Mã · Truyền Lửa
    { group: 'multi6', answers: ['KT', 'DH', 'GN', 'GM', 'TL', 'TP'] },    // Figma 67:3143: chính = Tiên Phong
  ];
  function picker() {
    if (!devTools || document.getElementById('picker')) return;
    const T = TEXT.result.picker;
    const label = c => c.group === 'single' ? `${P[c.code].name}` : T[c.group];
    const el = document.createElement('div');
    el.id = 'picker'; el.className = 'picker';
    el.innerHTML = `<button class="picker__toggle" aria-expanded="false" aria-controls="picker-menu">${icon('layout-grid')} <span>${esc(T.button)} <span class="dev-note">${esc(TEXT.devNote)}</span></span></button>
      <div class="picker__menu" id="picker-menu" role="menu" hidden>
        <p class="picker__title">${esc(T.title)}</p>
        <p class="picker__group">${esc(T.single)}</p>
        ${CASES.map((c, i) => `${i === 6 ? '<p class="picker__group">Kép · Đa diện</p>' : ''}<button role="menuitem" data-case="${i}">${c.code ? `<i style="background:${color(c.code)}"></i>` : `<i class="multi"></i>`}${esc(label(c))}</button>`).join('')}
      </div>`;
    document.body.appendChild(el);
    const btn = el.querySelector('.picker__toggle'), menu = el.querySelector('.picker__menu');
    const open = v => { menu.hidden = !v; btn.setAttribute('aria-expanded', v); };
    btn.onclick = () => open(menu.hidden);
    document.addEventListener('click', e => { if (!el.contains(e.target)) open(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { open(false); btn.focus(); } });
    menu.addEventListener('click', e => {
      const b = e.target.closest('[data-case]'); if (!b) return;
      if (!S) newAttempt();
      const c = CASES[b.dataset.case];
      S.answers = [...c.answers]; S.result = Scoring.score(S.answers); S.screen = 'result';
      S.contact = S.contact || { email: 'ban@congty.vn' };
      save(); open(false); go();
    });
    icons();
  }

  /* ---------- Alert Dialog "Lượt mới" ---------- */
  function confirmReset() {
    if (!S || S.screen === 'result') return endAttempt();
    const T = TEXT.reset, opener = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'backdrop';
    wrap.innerHTML = `<div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-d">
        <h2 class="dialog__title" id="dlg-t">${esc(T.title)}</h2>
        <p class="dialog__desc" id="dlg-d">${esc(T.desc)}</p>
        <div class="dialog__actions">
          <button class="btn btn--outline" data-act="cancel">${esc(T.cancel)}</button>
          <button class="btn btn--destructive" data-act="ok">${icon('trash-2')} ${esc(T.confirm)}</button>
        </div></div>`;
    document.body.appendChild(wrap); icons();
    const btns = [...wrap.querySelectorAll('button')];
    const close = ok => { wrap.remove(); document.removeEventListener('keydown', onKey, true); ok ? endAttempt() : opener && opener.focus(); };
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); close(false); }
      if (e.key === 'Tab') { const i = btns.indexOf(document.activeElement); e.preventDefault(); btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    wrap.addEventListener('click', e => { if (e.target === wrap) close(false); const a = e.target.closest('[data-act]'); if (a) close(a.dataset.act === 'ok'); });
    btns[0].focus();
  }


  go();
  picker();
})();

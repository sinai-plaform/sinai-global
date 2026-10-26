/*! SINAI concierge — website chat that understands a business and prepares a brief.
 *  Mount: <div class="concierge" data-site="sinai-global" data-lang="he" data-wa="972507763923" data-form="#f-name"></div>
 *  Backend: Supabase edge function `concierge` (public, rate-limited). Knowledge per site lives on the server.
 *  Reusable on any SINAI site: copy this file, add a row to core.concierge_sites, allow the origin in the function.
 */
(function () {
  'use strict';
  var API = 'https://ooxdupeihzvbzudibaoi.supabase.co/functions/v1/concierge';
  var RTL = { he: 1, ar: 1 };
  var T = {
    he: { title: 'בואו נבין מה העסק שלכם צריך', sub: 'תשובה מיידית · בלי התחייבות', greet: 'היי! ספרו לנו בכמה מילים מה העסק שלכם עושה ומה הכי מעיק עליכם היום, ונראה לכם איך אפשר לחסוך זמן.', ph: 'כתבו כאן…', send: 'שליחה', form: 'מעדיפים טופס?', err: 'משהו השתבש אצלנו. אפשר לכתוב לנו ישירות:', wa: 'שליחה ללירן ב-WhatsApp', mail: 'שליחה במייל', done: 'הסיכום מוכן. לחיצה אחת והוא אצל לירן:', you: 'אתם', us: 'SINAI Global', s: ['יש לנו סוכנים בשטח', 'צריך אפליקציה לעסק', 'רוצה אוטומציה ל-WhatsApp', 'אתר עם צ׳אט שמביא לידים'] },
    en: { title: "Let's see what your business needs", sub: 'Instant answers · no commitment', greet: "Hi! Tell us in a few words what your business does and what slows you down most today, and we'll show you where you can save time.", ph: 'Type here…', send: 'Send', form: 'Prefer a form?', err: 'Something went wrong on our side. You can write to us directly:', wa: 'Send to Liran on WhatsApp', mail: 'Send by email', done: 'Your summary is ready. One tap and Liran has it:', you: 'You', us: 'SINAI Global', s: ['We have field sales agents', 'We need an app', 'WhatsApp automation', 'A website that brings leads'] },
    ru: { title: 'Разберёмся, что нужно вашему бизнесу', sub: 'Мгновенный ответ · без обязательств', greet: 'Привет! Расскажите в двух словах, чем занимается ваш бизнес и что сейчас мешает больше всего, и мы покажем, где можно сэкономить время.', ph: 'Напишите здесь…', send: 'Отправить', form: 'Удобнее форма?', err: 'Что-то пошло не так. Напишите нам напрямую:', wa: 'Отправить Лирану в WhatsApp', mail: 'Отправить по почте', done: 'Сводка готова. Одно нажатие — и она у Лирана:', you: 'Вы', us: 'SINAI Global', s: ['У нас выездные агенты', 'Нужно приложение', 'Автоматизация WhatsApp', 'Сайт, который приводит клиентов'] },
    ar: { title: 'لنفهم ما يحتاجه عملك', sub: 'رد فوري · بدون التزام', greet: 'مرحبًا! أخبرونا بكلمات قليلة ماذا يعمل مصلحتكم وما الذي يعيقكم أكثر اليوم، وسنريكم أين يمكن توفير الوقت.', ph: 'اكتبوا هنا…', send: 'إرسال', form: 'تفضلون نموذجًا؟', err: 'حدث خطأ لدينا. يمكنكم مراسلتنا مباشرة:', wa: 'إرسال إلى ليران عبر WhatsApp', mail: 'إرسال بالبريد', done: 'الملخص جاهز. نقرة واحدة ويصل إلى ليران:', you: 'أنتم', us: 'SINAI Global', s: ['لدينا مندوبون ميدانيون', 'نحتاج تطبيقًا', 'أتمتة WhatsApp', 'موقع يجلب زبائن'] },
    es: { title: 'Veamos qué necesita tu negocio', sub: 'Respuesta inmediata · sin compromiso', greet: '¡Hola! Cuéntanos en pocas palabras a qué se dedica tu negocio y qué te frena más hoy, y te mostraremos dónde ahorrar tiempo.', ph: 'Escribe aquí…', send: 'Enviar', form: '¿Prefieres un formulario?', err: 'Algo falló de nuestro lado. Puedes escribirnos directamente:', wa: 'Enviar a Liran por WhatsApp', mail: 'Enviar por correo', done: 'Tu resumen está listo. Un toque y Liran lo tiene:', you: 'Tú', us: 'SINAI Global', s: ['Tenemos vendedores de campo', 'Necesitamos una app', 'Automatizar WhatsApp', 'Una web que traiga clientes'] },
    de: { title: 'Was braucht Ihr Unternehmen?', sub: 'Sofortige Antwort · unverbindlich', greet: 'Hallo! Erzählen Sie uns kurz, was Ihr Unternehmen macht und was Sie heute am meisten bremst – wir zeigen Ihnen, wo Sie Zeit sparen.', ph: 'Hier schreiben…', send: 'Senden', form: 'Lieber ein Formular?', err: 'Bei uns ist etwas schiefgelaufen. Schreiben Sie uns direkt:', wa: 'An Liran per WhatsApp senden', mail: 'Per E-Mail senden', done: 'Ihre Zusammenfassung ist fertig. Ein Tipp und Liran hat sie:', you: 'Sie', us: 'SINAI Global', s: ['Wir haben Außendienst', 'Wir brauchen eine App', 'WhatsApp automatisieren', 'Website, die Kunden bringt'] },
    it: { title: 'Vediamo di cosa ha bisogno la tua attività', sub: 'Risposta immediata · senza impegno', greet: 'Ciao! Raccontaci in poche parole cosa fa la tua attività e cosa ti rallenta di più oggi: ti mostriamo dove risparmiare tempo.', ph: 'Scrivi qui…', send: 'Invia', form: 'Preferisci un modulo?', err: 'Qualcosa è andato storto. Puoi scriverci direttamente:', wa: 'Invia a Liran su WhatsApp', mail: 'Invia per email', done: 'Il riepilogo è pronto. Un tocco e Liran lo riceve:', you: 'Tu', us: 'SINAI Global', s: ['Abbiamo agenti sul campo', 'Ci serve un’app', 'Automazione WhatsApp', 'Un sito che porta clienti'] },
    fr: { title: 'Voyons ce dont votre entreprise a besoin', sub: 'Réponse immédiate · sans engagement', greet: 'Bonjour ! Dites-nous en quelques mots ce que fait votre entreprise et ce qui vous freine le plus aujourd’hui : on vous montre où gagner du temps.', ph: 'Écrivez ici…', send: 'Envoyer', form: 'Vous préférez un formulaire ?', err: 'Un problème est survenu chez nous. Écrivez-nous directement :', wa: 'Envoyer à Liran sur WhatsApp', mail: 'Envoyer par e-mail', done: 'Votre résumé est prêt. Un geste et Liran l’a :', you: 'Vous', us: 'SINAI Global', s: ['Nous avons des commerciaux terrain', 'Il nous faut une application', 'Automatiser WhatsApp', 'Un site qui amène des clients'] },
    pt: { title: 'Vamos ver o que o seu negócio precisa', sub: 'Resposta imediata · sem compromisso', greet: 'Olá! Conte-nos em poucas palavras o que o seu negócio faz e o que mais atrasa vocês hoje, e mostramos onde dá para ganhar tempo.', ph: 'Escreva aqui…', send: 'Enviar', form: 'Prefere um formulário?', err: 'Algo deu errado do nosso lado. Fale conosco diretamente:', wa: 'Enviar ao Liran no WhatsApp', mail: 'Enviar por e-mail', done: 'O resumo está pronto. Um toque e o Liran recebe:', you: 'Você', us: 'SINAI Global', s: ['Temos vendedores externos', 'Precisamos de um app', 'Automação de WhatsApp', 'Um site que traga clientes'] },
    hi: { title: 'आइए समझें आपके बिज़नेस को क्या चाहिए', sub: 'तुरंत जवाब · कोई बाध्यता नहीं', greet: 'नमस्ते! कुछ शब्दों में बताइए आपका बिज़नेस क्या करता है और आज सबसे ज़्यादा क्या धीमा करता है, हम दिखाएँगे कि समय कहाँ बचेगा।', ph: 'यहाँ लिखें…', send: 'भेजें', form: 'फ़ॉर्म पसंद है?', err: 'हमारी तरफ़ कुछ गड़बड़ हुई। सीधे लिखें:', wa: 'Liran को WhatsApp पर भेजें', mail: 'ईमेल से भेजें', done: 'सारांश तैयार है। एक टैप और Liran के पास:', you: 'आप', us: 'SINAI Global', s: ['हमारे फ़ील्ड सेल्स एजेंट हैं', 'हमें ऐप चाहिए', 'WhatsApp ऑटोमेशन', 'लीड लाने वाली वेबसाइट'] },
  };
  var CSS = '.cg{--cg-acc:var(--sun,#b4483a);--cg-bg:var(--paper,#f8f9f6);--cg-ink:var(--ink,#16202b);--cg-mut:var(--slate,#56616d);--cg-line:var(--line,#d7dcd6);--cg-soft:var(--stone,#eef0ec);background:var(--cg-bg);color:var(--cg-ink);border:1px solid var(--cg-line);border-radius:22px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 18px 40px -28px rgba(10,16,24,.35)}' +
    '.cg-h{display:flex;gap:12px;align-items:center;padding:16px 18px;border-bottom:1px solid var(--cg-line)}.cg-dot{width:38px;height:38px;border-radius:50%;flex:none;background:radial-gradient(circle at 50% 42%,#eaa36b 0,var(--cg-acc) 60%,#7d2d27 100%)}' +
    '.cg-h b{display:block;font-size:16px;line-height:1.3}.cg-h small{color:var(--cg-mut);font-size:13px}' +
    '.cg-log{display:flex;flex-direction:column;gap:10px;padding:16px 18px;min-height:120px;max-height:min(52vh,460px);overflow-y:auto;scroll-behavior:smooth}' +
    '.cg-m{max-width:86%;padding:10px 14px;border-radius:16px;font-size:15.5px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}' +
    '.cg-a{background:var(--cg-soft);align-self:flex-start;border-start-start-radius:6px}.cg-u{background:var(--cg-acc);color:#fff;align-self:flex-end;border-start-end-radius:6px}' +
    '.cg-typing{display:inline-flex;gap:4px;align-items:center}.cg-typing i{width:7px;height:7px;border-radius:50%;background:var(--cg-mut);opacity:.4;animation:cg-b 1s infinite}.cg-typing i:nth-child(2){animation-delay:.15s}.cg-typing i:nth-child(3){animation-delay:.3s}@keyframes cg-b{50%{opacity:1;transform:translateY(-2px)}}' +
    '@media (prefers-reduced-motion:reduce){.cg-typing i{animation:none}.cg-log{scroll-behavior:auto}}' +
    '.cg-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 18px 12px}.cg-chip{font:inherit;font-size:14px;color:var(--cg-ink);background:transparent;border:1px solid var(--cg-line);border-radius:999px;padding:7px 13px;cursor:pointer;min-height:38px}.cg-chip:hover{border-color:var(--cg-acc);color:var(--cg-acc)}' +
    '.cg-f{display:flex;gap:8px;padding:12px;border-top:1px solid var(--cg-line);background:var(--cg-bg)}.cg-f textarea{flex:1;font:inherit;font-size:16px;color:var(--cg-ink);background:var(--cg-soft);border:1px solid var(--cg-line);border-radius:14px;padding:11px 13px;resize:none;min-height:46px;max-height:140px;line-height:1.4}' +
    '.cg-f textarea:focus{outline:2px solid var(--cg-acc);outline-offset:1px;border-color:transparent}.cg-f button{font:inherit;font-weight:700;font-size:15px;border:0;border-radius:14px;padding:0 18px;background:var(--cg-acc);color:#fff;cursor:pointer;min-height:46px}.cg-f button[disabled]{opacity:.55;cursor:default}' +
    '.cg-done{margin:0 18px 14px;padding:14px;border:1px solid var(--cg-line);border-radius:16px;background:var(--cg-soft)}.cg-done p{margin:0 0 10px;font-weight:600}.cg-done pre{white-space:pre-wrap;font:inherit;font-size:14px;color:var(--cg-mut);margin:0 0 12px}.cg-acts{display:flex;flex-wrap:wrap;gap:8px}' +
    '.cg-btn{display:inline-flex;align-items:center;justify-content:center;font:inherit;font-weight:700;font-size:15px;border-radius:999px;padding:11px 18px;text-decoration:none;cursor:pointer;border:1px solid var(--cg-acc);min-height:44px}.cg-btn.p{background:var(--cg-acc);color:#fff}.cg-btn.l{background:transparent;color:var(--cg-acc)}' +
    '.cg-alt{padding:0 18px 14px;font-size:14px}.cg-alt a{color:var(--cg-mut)}';

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || 'null'); sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  function mount(root) {
    var site = root.getAttribute('data-site') || 'sinai-global';
    var lang = (root.getAttribute('data-lang') || document.documentElement.lang || 'he').slice(0, 2);
    var wa = root.getAttribute('data-wa') || '972507763923';
    var mail = root.getAttribute('data-mail') || 'hello@sinai-global.com';
    var t = T[lang] || T.en;
    var brand = root.getAttribute('data-name') || t.us;
    var starters = root.getAttribute('data-starters') === 'off' ? [] : t.s;
    var key = 'cg:' + site + ':' + lang;
    var st = store(key) || { id: null, log: [], chips: starters, done: null };
    var busy = false;

    if (!document.getElementById('cg-css')) { var s = el('style'); s.id = 'cg-css'; s.textContent = CSS; document.head.appendChild(s); }
    root.innerHTML = '';
    var box = el('div', 'cg'); box.setAttribute('dir', RTL[lang] ? 'rtl' : 'ltr');
    if (root.getAttribute('data-accent')) box.style.setProperty('--cg-acc', root.getAttribute('data-accent'));
    var head = el('div', 'cg-h'); head.appendChild(el('span', 'cg-dot'));
    var ht = el('div'); ht.appendChild(el('b', '', t.title)); ht.appendChild(el('small', '', t.sub)); head.appendChild(ht);
    var log = el('div', 'cg-log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
    var chips = el('div', 'cg-chips');
    var doneBox = el('div');
    var form = el('form', 'cg-f');
    var ta = el('textarea'); ta.rows = 1; ta.placeholder = t.ph; ta.maxLength = 600; ta.setAttribute('aria-label', t.ph);
    var sendB = el('button', '', t.send); sendB.type = 'submit';
    form.appendChild(ta); form.appendChild(sendB);
    var alt = el('div', 'cg-alt'); var altA = el('a', '', t.form); altA.href = root.getAttribute('data-form-link') || '#tell-form'; alt.appendChild(altA);
    altA.addEventListener('click', function () { var d = document.querySelector('details.formalt'); if (d) d.open = true; });
    box.appendChild(head); box.appendChild(log); box.appendChild(chips); box.appendChild(doneBox); box.appendChild(form); if (root.getAttribute('data-form-link') && !document.querySelector('details.formalt')) box.appendChild(alt);
    root.appendChild(box);

    function bubble(role, text) { var m = el('div', 'cg-m ' + (role === 'u' ? 'cg-u' : 'cg-a'), text); log.appendChild(m); log.scrollTop = log.scrollHeight; return m; }
    function renderChips(list) {
      chips.innerHTML = '';
      (list || []).forEach(function (c) { var b = el('button', 'cg-chip', c); b.type = 'button'; b.addEventListener('click', function () { send(c); }); chips.appendChild(b); });
    }
    function waLink(text) { return 'https://wa.me/' + wa + '?text=' + encodeURIComponent(text); }
    function renderDone(d) {
      doneBox.innerHTML = '';
      if (!d) return;
      var c = el('div', 'cg-done'); c.appendChild(el('p', '', t.done)); c.appendChild(el('pre', '', d.summary));
      var acts = el('div', 'cg-acts');
      var a1 = el('a', 'cg-btn p', t.wa); a1.href = waLink(d.summary); a1.target = '_blank'; a1.rel = 'noopener';
      var a2 = el('a', 'cg-btn l', t.mail); a2.href = 'mailto:' + mail + '?subject=' + encodeURIComponent(brand) + '&body=' + encodeURIComponent(d.summary);
      [a1, a2].forEach(function (a) { a.addEventListener('click', function () { post({ action: 'handoff', id: st.id }).catch(function () {}); }); acts.appendChild(a); });
      c.appendChild(acts); doneBox.appendChild(c);
    }
    function post(body) {
      return fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw j; return j; }); });
    }
    function failCard() {
      var m = bubble('a', t.err + '\n');
      var a = el('a', 'cg-btn p', t.wa); a.href = waLink(st.log.filter(function (x) { return x.r === 'u'; }).map(function (x) { return x.x; }).join('\n')); a.target = '_blank'; a.rel = 'noopener'; a.style.marginTop = '8px';
      m.appendChild(a);
    }
    function send(text) {
      text = String(text || '').trim();
      if (!text || busy) return;
      busy = true; sendB.disabled = true; ta.value = ''; ta.style.height = '';
      bubble('u', text); st.log.push({ r: 'u', x: text }); renderChips([]);
      var typing = bubble('a', ''); typing.innerHTML = '<span class="cg-typing" aria-label="…"><i></i><i></i><i></i></span>';
      post({ site: site, lang: lang, id: st.id, message: text, page: location.pathname }).then(function (j) {
        typing.remove();
        st.id = j.id || st.id;
        bubble('a', j.reply); st.log.push({ r: 'a', x: j.reply });
        st.chips = j.chips || []; renderChips(st.chips);
        if (j.ready && j.summary) { st.done = { summary: j.summary }; renderDone(st.done); }
        store(key, st);
      }).catch(function () { typing.remove(); failCard(); renderChips(st.log.length > 1 ? st.chips : starters); })
        .then(function () { busy = false; sendB.disabled = false; });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); send(ta.value); });
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(ta.value); } });
    ta.addEventListener('input', function () { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'; });

    bubble('a', t.greet);
    st.log.forEach(function (m) { bubble(m.r, m.x); });
    renderChips(st.log.length ? st.chips : starters);
    renderDone(st.done);
  }
  // Show the chat only when the backend says this site is active and the AI answers; otherwise open the form.
  function fallback(root) {
    root.style.display = 'none';
    var d = document.querySelector('details.formalt'); if (d) d.open = true;
  }
  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.concierge'), function (root) {
      var site = root.getAttribute('data-site') || 'sinai-global';
      var done = false, timer = setTimeout(function () { if (!done) { done = true; fallback(root); } }, 8000);
      fetch(API + '?site=' + encodeURIComponent(site), { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (done) return; done = true; clearTimeout(timer); if (j && j.ok) mount(root); else fallback(root); })
        .catch(function () { if (done) return; done = true; clearTimeout(timer); fallback(root); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.SinaiConcierge = { mount: mount };
})();

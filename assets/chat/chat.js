/* Fleet United visitor chat. Answers from /assets/chat/knowledge.json by keyword match.
   No API keys, no paid services. To plug in an LLM later, implement llmProvider below. */
(function () {
  var KB = null;
  function load() { return KB ? Promise.resolve(KB) : fetch('/assets/chat/knowledge.json').then(function (r) { return r.json(); }).then(function (j) { KB = j; return j; }); }
  function norm(s) { return ' ' + s.toLowerCase().replace(/[^a-z0-9$ ]+/g, ' ').replace(/\s+/g, ' ') + ' '; }
  function hits(q, kws) { var n = 0; kws.forEach(function (k) { if (q.indexOf(' ' + k + ' ') > -1 || (k.length > 4 && q.indexOf(k) > -1) || (k === '$' && q.indexOf('$') > -1)) n++; }); return n; }

  // LLM hook (disabled). Example:
  // var llmProvider = async function (question, kb) {
  //   const r = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ question, kb }) });
  //   return (await r.json()).answer;   // server must enforce the same guardrails as kb.guarded
  // };
  // Guardrails for any LLM provider (system prompt must include): never claim DOT/SAE/FMVSS compliance,
  // legality or approval; never say logos are molded or hot-stamped (they are printed on); never claim US
  // manufacture or Made in USA; never mention a Naperville location; never promise durability, lifetime
  // or won't-peel results. Contact: hello@fleetunitedusa.com, Ahsan Tanvir, Founder, Fleet United.
  var llmProvider = null;

  async function answer(question) {
    var kb = await load(), q = norm(question);
    if (hits(q, kb.guarded.keywords)) return { text: kb.guarded.answer, quote: true };
    if (llmProvider) { try { return { text: await llmProvider(question, kb), quote: true }; } catch (e) {} }
    var best = null, score = 0;
    kb.faq.forEach(function (f) { var s = hits(q, f.keywords); if (s > score) { score = s; best = f; } });
    return { text: best ? best.answer : kb.fallback, quote: true };
  }
  window.FleetUnitedChat = { answer: answer };

  var css = '.fuc-btn{position:fixed;right:20px;bottom:20px;z-index:999;background:var(--red,#C8102E);color:#fff;border:0;border-radius:28px;padding:14px 20px;font:600 15px var(--body,Arial);box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer}'
   + '.fuc-box{position:fixed;right:20px;bottom:84px;z-index:999;width:340px;max-width:calc(100vw - 40px);height:440px;max-height:calc(100vh - 120px);background:#fff;border:1px solid var(--line,#d5dae0);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden;font:14px/1.45 var(--body,Arial)}'
   + '.fuc-box.open{display:flex}.fuc-h{background:var(--navy,#0B2545);color:#fff;padding:12px 14px;font:600 16px var(--display,Arial);letter-spacing:.5px;display:flex;justify-content:space-between}.fuc-h button{background:none;border:0;color:#fff;font-size:18px;cursor:pointer}'
   + '.fuc-m{flex:1;overflow:auto;padding:12px;background:var(--light,#E6E9ED)}.fuc-m div{margin:6px 0;padding:8px 11px;border-radius:10px;max-width:85%}.fuc-b{background:#fff;color:#0B2545}.fuc-u{background:var(--navy,#0B2545);color:#fff;margin-left:auto!important}'
   + '.fuc-m a{color:var(--red,#C8102E);font-weight:600}.fuc-f{display:flex;border-top:1px solid var(--line,#d5dae0)}.fuc-f input{flex:1;border:0;padding:12px;font:inherit}.fuc-f button{border:0;background:var(--red,#C8102E);color:#fff;padding:0 16px;font-weight:600;cursor:pointer}';
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function init() {
    var st = el('style'); st.textContent = css; document.head.appendChild(st);
    var btn = el('button', 'fuc-btn', 'Questions? Chat'); btn.setAttribute('aria-label', 'Open chat');
    var box = el('div', 'fuc-box'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Fleet United automated assistant');
    box.innerHTML = '<div class="fuc-h">Automated assistant<button aria-label="Close">&times;</button></div><div class="fuc-m"></div><form class="fuc-f"><input aria-label="Your question" placeholder="Ask about our parts..." maxlength="300"><button>Send</button></form>';
    document.body.appendChild(btn); document.body.appendChild(box);
    var m = box.querySelector('.fuc-m'), f = box.querySelector('form'), inp = f.querySelector('input');
    function say(text, cls, quote) {
      var d = el('div', cls); d.textContent = text;
      if (quote && KB) { d.appendChild(document.createElement('br')); var a = el('a', '', 'Email a quote request'); a.href = 'mailto:' + KB.contact + '?subject=Quote%20request'; d.appendChild(a); }
      m.appendChild(d); m.scrollTop = m.scrollHeight;
    }
    var greeted = false;
    function toggle(o) { box.classList.toggle('open', o); if (o && !greeted) { greeted = true; load().then(function () { say("Hi, I'm Fleet United's automated assistant.", 'fuc-b'); }); inp.focus(); } }
    btn.onclick = function () { toggle(!box.classList.contains('open')); };
    box.querySelector('.fuc-h button').onclick = function () { toggle(false); };
    f.onsubmit = function (e) { e.preventDefault(); var q = inp.value.trim(); if (!q) return; inp.value = ''; say(q, 'fuc-u'); answer(q).then(function (r) { say(r.text, 'fuc-b', r.quote); }); };
    window.FleetUnitedChat.open = function () { toggle(true); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

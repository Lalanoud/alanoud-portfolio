(function () {
  var header = document.querySelector('.site-header');
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));

  document.getElementById('yr').textContent = new Date().getFullYear();

  function setMenu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  links.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); a.removeAttribute('aria-current'); });
          var a = map[en.target.id];
          if (a) { a.classList.add('active'); a.setAttribute('aria-current', 'true'); }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // Project galleries
  Array.prototype.forEach.call(document.querySelectorAll('[data-gallery]'), function (g) {
    var track = g.querySelector('.track');
    var prev = g.querySelector('.prev'), next = g.querySelector('.next');
    var dots = Array.prototype.slice.call(g.querySelectorAll('.dots button'));
    function idx() { return Math.round(track.scrollLeft / track.clientWidth); }
    function sync() {
      var i = idx();
      prev.disabled = i <= 0; next.disabled = i >= dots.length - 1;
      dots.forEach(function (d, n) { d.classList.toggle('on', n === i); });
    }
    function go(n) { track.scrollTo({ left: n * track.clientWidth, behavior: 'smooth' }); }
    prev.addEventListener('click', function () { go(idx() - 1); });
    next.addEventListener('click', function () { go(idx() + 1); });
    dots.forEach(function (d, n) { d.addEventListener('click', function () { go(n); }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(idx() + 1); else if (e.key === 'ArrowLeft') go(idx() - 1);
    });
    sync();
  });

  // Floating AI assistant chat, connected to the FastAPI backend on Render.
  // Contract of the FastAPI /chat route: POST {"question": "..."} returns {"answer": "..."}.
  var AGENT = {
    url: 'https://alanoud-ai-agent.onrender.com/chat',
    requestField: 'question',
    replyFields: ['answer']
  };
  var chat = document.getElementById('chat');
  var toggle = document.getElementById('chat-toggle');
  var panel = document.getElementById('chat-panel');
  var msgs = document.getElementById('msgs');
  var form = document.getElementById('chat-form');
  var input = document.getElementById('chat-input');
  var sendBtn = form.querySelector('button');
  var busy = false;
  input.addEventListener('input', function () {
    input.dir = input.value.trim() ? dirOf(input.value) : 'ltr';
  });

  // Text direction: Arabic-majority text is RTL, everything else LTR.
  var AR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  function dirOf(text, fallback) {
    var ar = (text.match(AR) || []).length;
    var la = (text.match(/[A-Za-z]/g) || []).length;
    if (!ar && !la) return fallback || 'ltr';
    return ar > 0 && ar >= la * 0.4 ? 'rtl' : 'ltr';
  }
  function render(el, text) {
    var whole = dirOf(text);
    el.dir = whole;
    el.textContent = '';
    text.split('\n').forEach(function (line) {
      var p = document.createElement('div');
      if (line.trim()) {
        p.dir = dirOf(line, whole);
        p.lang = p.dir === 'rtl' ? 'ar' : 'en';
        p.textContent = line;
      } else { p.className = 'gap'; }
      el.appendChild(p);
    });
  }

  function add(text, cls) {
    var d = document.createElement('div');
    d.className = 'msg ' + cls;
    render(d, text);
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  add('Hi! Ask me about Alanoud\u2019s background, skills, or projects.', 'bot');

  // CV requests (Arabic or English) are answered on the page with a link to the real PDF.
  var CV_URL = 'assets/Alanoud-Alotaibi-CV.pdf';
  function isCvRequest(text) {
    var t = text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[\u0623\u0625\u0622]/g, '\u0627')
      .replace(/\u0629/g, '\u0647').replace(/\u0649/g, '\u064A');
    if (/\u0633\u064A \u0641\u064A/.test(t) || /curriculum\s+vitae/.test(t)) return true;
    return t.split(/[^\u0621-\u063A\u0641-\u064Aa-z0-9]+/).some(function (w) {
      return w === 'cv' || w === 'resume' ||
        /^[\u0648\u0628\u0641\u0643]?(\u0627\u0644|\u0644\u0644|\u0644)?(\u0633\u064A\u0631\u0647|\u0633\u064A\u0631\u062A(\u0647\u0627|\u0647|\u064A|\u0643)?)$/.test(w);
    });
  }
  function addCv(dir) {
    var ar = dir === 'rtl';
    var d = document.createElement('div');
    d.className = 'msg bot'; d.dir = dir;
    var p = document.createElement('div');
    p.lang = ar ? 'ar' : 'en';
    p.textContent = ar ? '\u062A\u0641\u0636\u0644\u060C \u0647\u0630\u0647 \u0627\u0644\u0633\u064A\u0631\u0629 \u0627\u0644\u0630\u0627\u062A\u064A\u0629 \u0644\u0644\u0639\u0646\u0648\u062F \u0628\u0635\u064A\u063A\u0629 PDF:' : 'Sure! Here\u2019s Alanoud\u2019s CV:';
    var a = document.createElement('a');
    a.className = 'cv-link'; a.href = CV_URL; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('download', 'Alanoud-Alotaibi-CV.pdf');
    a.dir = 'ltr'; a.lang = 'en';
    a.textContent = 'Download Alanoud\u2019s CV';
    d.appendChild(p); d.appendChild(a);
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function pickReply(data) {
    if (typeof data === 'string') return data;
    for (var i = 0; i < AGENT.replyFields.length; i++) {
      var v = data && data[AGENT.replyFields[i]];
      if (typeof v === 'string' && v) return v;
    }
    return null;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || busy) return;
    if (isCvRequest(text)) {
      add(text, 'user'); input.value = ''; input.dir = 'ltr';
      addCv(dirOf(text));
      return;
    }
    busy = true; sendBtn.disabled = true;
    add(text, 'user'); input.value = ''; input.dir = 'ltr';
    var typing = add('', 'bot typing');
    typing.innerHTML = '<i></i><i></i><i></i>';
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 60000);
    var body = {}; body[AGENT.requestField] = text;
    fetch(AGENT.url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: ctrl.signal
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      var reply = pickReply(data);
      if (!reply) throw new Error('Unexpected response shape');
      typing.remove(); add(reply, 'bot');
    }).catch(function (err) {
      console.warn('Chat request failed:', err);
      typing.remove();
      add('Sorry, the assistant is unavailable right now. It may be waking up, so please try again in a moment.', 'err');
    }).then(function () {
      clearTimeout(t); busy = false; sendBtn.disabled = false; input.focus();
    });
  });

  function setChat(open) {
    chat.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close AI assistant chat' : 'Open AI assistant chat');
    panel.setAttribute('aria-hidden', String(!open));
    if (open) { setTimeout(function () { input.focus(); }, 250); } else { toggle.focus(); }
  }
  toggle.addEventListener('click', function () { setChat(!chat.classList.contains('open')); });
  panel.querySelector('.chat-x').addEventListener('click', function () { setChat(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && chat.classList.contains('open')) setChat(false);
  });
})();

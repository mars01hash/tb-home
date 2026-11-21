/* Contact: three-step onboarding form that emails the enquiry to TechBeez */
(function (TB) {
  /* Web3Forms access key for info@techbeez.tech. Get one free at https://web3forms.com
     (it is safe to keep in the page; it can only send to that inbox).
     While it is empty, "Send enquiry" opens the visitor's email app with the message filled in. */
  var WEB3FORMS_KEY = '3e8ab26a-0b5b-4bd0-aaa0-a137ae099a8c';
  var TO = 'info@techbeez.tech';

  var wiz = document.getElementById('wizard');
  if (!wiz) return;
  var wSteps = wiz.querySelectorAll('.wiz-step');
  var back = document.getElementById('wiz-back');
  var next = document.getElementById('wiz-next');
  var fillEl = document.getElementById('wiz-fill');
  var done = document.getElementById('wiz-done');
  var err = document.getElementById('wiz-error');
  var cur = 0, sending = false;
  var LAST = 'Send enquiry';

  function show(n) {
    cur = n;
    Array.prototype.forEach.call(wSteps, function (s, i) { s.classList.toggle('on', i === n); });
    document.getElementById('wiz-label').textContent = 'Step ' + (n + 1) + ' of ' + wSteps.length;
    document.getElementById('wiz-name').textContent = wSteps[n].dataset.name;
    fillEl.style.transform = 'scaleX(' + ((n + 1) / wSteps.length) + ')';
    back.hidden = n === 0;
    next.textContent = n === wSteps.length - 1 ? LAST : 'Continue';
    err.hidden = true;
  }

  function answers() {
    var e = wiz.elements;
    return [['Role', e.role.value], ['Need', e.need.value], ['Budget', e.budget.value], ['Start', e.when.value],
            ['Name', e.name.value.trim()], ['Email', e.email.value.trim()], ['Company', e.company.value.trim()],
            ['Project', e.brief.value.trim()]];
  }

  function subjectFor(a) { return 'New enquiry: ' + a[1][1] + ' from ' + a[4][1]; }

  function mailto(a) {
    var body = a.map(function (r) { return r[0] + ': ' + (r[1] || '-'); }).join('\n');
    return 'mailto:' + TO + '?subject=' + encodeURIComponent(subjectFor(a)) + '&body=' + encodeURIComponent(body);
  }

  function finish(a, title, note) {
    var list = document.getElementById('wiz-summary');
    list.textContent = '';
    a.slice(0, 6).forEach(function (r) { var li = document.createElement('li'); li.textContent = r[0] + ': ' + r[1]; list.appendChild(li); });
    document.getElementById('wiz-done-title').textContent = title;
    document.getElementById('wiz-done-note').innerHTML = note;
    wSteps[cur].classList.remove('on');
    document.getElementById('wiz-nav').hidden = true;
    err.hidden = true;
    document.getElementById('wiz-label').textContent = 'Done';
    document.getElementById('wiz-name').textContent = 'Sent';
    done.classList.add('on');
  }

  function fail(a) {
    sending = false;
    next.disabled = false;
    next.textContent = LAST;
    err.innerHTML = 'Sorry, your enquiry could not be sent. Please try again, or <a href="' + mailto(a) + '">email us at ' + TO + '</a>.';
    err.hidden = false;
  }

  back.addEventListener('click', function () { if (!sending) show(cur - 1); });
  next.addEventListener('click', function () {
    if (sending) return;
    if (cur < wSteps.length - 1) { show(cur + 1); return; }
    var nameEl = wiz.elements.name, emailEl = wiz.elements.email;
    if (!nameEl.value.trim()) { nameEl.value = ''; }
    if (!nameEl.checkValidity()) { nameEl.reportValidity(); return; }
    if (!emailEl.checkValidity()) { emailEl.reportValidity(); return; }
    var a = answers();

    /* bots tick the hidden box; humans never see it */
    if (wiz.elements.botcheck && wiz.elements.botcheck.checked) {
      finish(a, 'Thanks, your enquiry was sent', 'We reply within one working day.');
      return;
    }

    if (!WEB3FORMS_KEY) {
      location.href = mailto(a);
      finish(a, 'Your email app should now open', 'Press Send in your email app to reach us. If nothing opened, email <a href="mailto:' + TO + '">' + TO + '</a> directly.');
      return;
    }

    sending = true;
    next.disabled = true;
    next.textContent = 'Sending…';
    err.hidden = true;
    var payload = { access_key: WEB3FORMS_KEY, subject: subjectFor(a), from_name: 'TechBeez website', botcheck: false };
    a.forEach(function (r) { payload[r[0].toLowerCase()] = r[1]; });
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().then(function (j) { if (!res.ok || !j.success) throw new Error(j.message || 'Send failed'); });
    }).then(function () {
      sending = false;
      finish(a, 'Thanks, your enquiry was sent', 'We reply within one working day, usually sooner.');
    }).catch(function () { fail(a); });
  });
  wiz.addEventListener('submit', function (e) { e.preventDefault(); });
})(window.TB);

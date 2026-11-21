/* Hero hub: background network animation */
(function (TB) {
  var reduce = TB.reduce;

  /* hero hub background: a slowly drifting network of points */
  (function () {
    var cv = document.getElementById('hub-net');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), W = 0, H = 0, pts = [], running = false, visible = true;
    function size() {
      var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, W * H / 7000));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 1 + Math.random() * 1.6 });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var reach = Math.max(W, H) * 0.16;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < reach) { ctx.strokeStyle = 'rgba(57, 85, 254, ' + (0.22 * (1 - d / reach)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        ctx.fillStyle = i % 5 ? 'rgba(57, 85, 254, 0.45)' : 'rgba(124, 92, 255, 0.6)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    function step() {
      if (!running) return;
      pts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      draw();
      requestAnimationFrame(step);
    }
    function start() { if (!running && visible && !document.hidden && !reduce) { running = true; requestAnimationFrame(step); } }
    size(); draw();
    addEventListener('resize', function () { size(); draw(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) running = false; else start(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); else running = false; }).observe(cv);
    start();
  })();
})(window.TB);

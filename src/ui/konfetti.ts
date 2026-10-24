// Kurzes Konfetti auf einem Canvas. Entfällt bei „reduzierter Bewegung“ oder ohne Canvas-Unterstützung.

const FARBEN = ['#6366f1', '#a855f7', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'];

export function konfetti(dauerMs = 1800): void {
  try {
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof requestAnimationFrame !== 'function') return;
    canvas.className = 'konfetti';
    canvas.setAttribute('aria-hidden', 'true');
    const dpr = window.devicePixelRatio || 1;
    const breite = window.innerWidth;
    const hoehe = window.innerHeight;
    canvas.width = breite * dpr;
    canvas.height = hoehe * dpr;
    ctx.scale(dpr, dpr);
    document.body.append(canvas);

    const teile = Array.from({ length: 140 }, () => ({
      x: breite / 2 + (Math.random() - 0.5) * breite * 0.3,
      y: hoehe * 0.35,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 13 - 4,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      farbe: FARBEN[Math.floor(Math.random() * FARBEN.length)],
    }));

    const start = performance.now();
    const schritt = (jetzt: number) => {
      const t = jetzt - start;
      ctx.clearRect(0, 0, breite, hoehe);
      for (const p of teile) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - t / dauerMs);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.farbe;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t < dauerMs) requestAnimationFrame(schritt);
      else canvas.remove();
    };
    requestAnimationFrame(schritt);
  } catch {
    /* rein dekorativ */
  }
}

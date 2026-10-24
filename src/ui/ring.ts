// Kreisförmige Fortschrittsanzeige als SVG.
import { h } from './dom';

export function ring(anteil: number, inhalt: Node | string, label: string, groesse = 56): HTMLElement {
  const r = 22;
  const umfang = 2 * Math.PI * r;
  const wert = Math.max(0, Math.min(1, anteil));
  const el = h('div', {
    class: 'ring',
    role: 'progressbar',
    'aria-label': label,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': Math.round(wert * 100),
    style: `--groesse:${groesse}px`,
  });
  el.innerHTML = `<svg viewBox="0 0 52 52" aria-hidden="true"><circle class="ring-spur" cx="26" cy="26" r="${r}"/><circle class="ring-wert" cx="26" cy="26" r="${r}" stroke-dasharray="${umfang}" stroke-dashoffset="${umfang * (1 - wert)}"/></svg>`;
  el.append(h('span', { class: 'ring-inhalt' }, inhalt));
  return el;
}

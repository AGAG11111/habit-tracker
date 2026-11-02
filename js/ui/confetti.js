import { h } from './dom.js';

const COLORS = ['#4f6bed', '#e5484d', '#f08c00', '#2f9e44', '#12b886', '#ae3ec9', '#fab005'];
const PIECES = 40;

// Short confetti burst over the whole screen, then removes itself. Pure CSS animation
// (see .confetti in styles.css), so no library or canvas is needed.
export function launchConfetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pieces = Array.from({ length: PIECES }, (_, i) => h('span', {
    class: 'confetti-piece',
    style: [
      `left:${Math.random() * 100}%`,
      `background:${COLORS[i % COLORS.length]}`,
      `--drift:${Math.round((Math.random() - 0.5) * 160)}px`,
      `--spin:${Math.round(Math.random() * 720 - 360)}deg`,
      `animation-delay:${Math.round(Math.random() * 250)}ms`,
      `animation-duration:${1300 + Math.round(Math.random() * 700)}ms`,
    ].join(';'),
  }));
  const layer = h('div', { class: 'confetti', 'aria-hidden': 'true' }, pieces);
  document.body.append(layer);
  setTimeout(() => layer.remove(), 2400);
}

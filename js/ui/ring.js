const SVG_NS = 'http://www.w3.org/2000/svg';
const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function circle(className) {
  const node = document.createElementNS(SVG_NS, 'circle');
  node.setAttribute('cx', 60);
  node.setAttribute('cy', 60);
  node.setAttribute('r', RADIUS);
  node.setAttribute('class', className);
  return node;
}

// Circular progress: `done` out of `total`. Drawing is CSS-driven (see .ring-* in styles.css).
export function createRing(done, total) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 120 120');
  svg.setAttribute('class', 'ring');
  svg.setAttribute('aria-hidden', 'true');

  const progress = circle('ring-progress');
  const fraction = total ? done / total : 0;
  progress.setAttribute('stroke-dasharray', CIRCUMFERENCE);
  progress.setAttribute('stroke-dashoffset', CIRCUMFERENCE * (1 - fraction));
  progress.setAttribute('transform', 'rotate(-90 60 60)');

  svg.append(circle('ring-track'), progress);
  return svg;
}

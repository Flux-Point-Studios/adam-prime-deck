import * as k from './anatomy/iso-kit.mjs';

export function officeSvg(id = 'office') {
  const floor = { x: -122, y: -102, w: 244, d: 204, r: 10 };
  const P = k.fitProjection([...k.boxCorners(floor, -12, 0), [-95, -75, 79], [95, 75, 79]], 760, 570, { pad: 35, azimuth: 43, elevation: 33 });
  const S = (plan, z, h, lit = false) => k.solidSvg(k.slabOf(plan, z, h, P, 5, .65), { tone: 'mid', lit });
  const L = d => k.lineSvg(d, { tone: 'faint' });
  const base = [
    `<path class="iso-halo" d="${k.haloOf(floor, -12, 10, P)}"/>`,
    S(floor, -12, 12),
    L(k.planOutline(k.insetPlan(floor, 4), .1, P)),
  ];
  const positions = [
    { name: 'Research', x: -99, y: -75 },
    { name: 'Risk', x: -4, y: -75 },
    { name: 'Treasury', x: -99, y: 18 },
    { name: 'Execution', x: -4, y: 18 },
  ].sort((a, b) => k.depthOf([a.x, a.y, 0], P) - k.depthOf([b.x, b.y, 0], P));
  const stations = positions.map(({ name, x, y }) => {
    const parts = [];
    const add = (dx, dy, w, d, z, h, lit = false, css = '') => {
      const plan = { x: x + dx, y: y + dy, w, d, r: Math.min(2, w / 3, d / 3) };
      parts.push({ order: k.depthOf([plan.x + w / 2, plan.y + d / 2, z + h / 2], P), svg: `<g class="${css}">${S(plan, z, h, lit)}</g>` });
    };
    for (const dx of [3, 61]) for (const dy of [3, 29]) add(dx, dy, 3, 3, 0, 37);
    add(0, 0, 68, 36, 37, 4, false, 'worktop');
    add(26, 7, 12, 10, 41, 2);
    add(30, 8, 4, 3, 43, 7);
    add(14, 7, 36, 4, 50, 24);
    add(17, 11.05, 30, .25, 53, 18, true, 'monitor');
    add(20, 23, 26, 10, 41, 1);
    add(24, 51, 21, 17, 0, 3);
    add(33, 58, 4, 4, 3, 15);
    add(23, 50, 24, 22, 18, 4);
    add(23, 69, 24, 3, 22, 20);
    add(29, 55, 13, 11, 22, 17, false, 'person');
    add(31, 55, 9, 9, 39, 11, false, 'person');
    const keys = [];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 7; col++) keys.push(k.planOutline({ x: x + 22 + col * 3.2, y: y + 24 + row * 2.5, w: 2.1, d: 1.5, r: .2 }, 42.05, P, 2));
    parts.push({ order: k.depthOf([x + 33, y + 28, 42.1], P), svg: L(keys.join('')) });
    const screws = k.corners({ x, y, w: 68, d: 36, r: 2 }, 3);
    parts.push({ order: k.depthOf([x + 34, y + 18, 41.1], P), svg: k.dotsSvg(screws.map(([a, b]) => k.iso([a, b, 41.1], P)), { size: .75 }) });
    const stripePaths = [0, 1, 2].map((row) => k.segment([x + 20, y + 11.4, 57 + row * 4], [x + 29 + row * 6, y + 11.4, 57 + row * 4], P)).join('');
    parts.push({ order: k.depthOf([x + 34, y + 11.4, 65], P), svg: k.lineSvg(stripePaths, { tone: 'lit', free: true }) });
    const mat = { x: x - 4, y: y - 4, w: 77, d: 83, r: 4 };
    const art = parts.sort((a, b) => a.order - b.order).map(p => p.svg).join('');
    return `<g class="station" data-station="${name}" role="button" tabindex="0" aria-label="Meet ${name}" aria-pressed="${name === 'Research'}"><title>${name} desk</title><path class="desk-hit" d="${k.planOutline(mat, .2, P)}"/>${L(k.planOutline(mat, .1, P))}${art}</g>`;
  });
  const plants = [[91, -73], [91, 59]].sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P)).map(([x, y]) => {
    return S({ x, y, w: 16, d: 17, r: 3 }, 0, 17) + S({ x: x + 3, y: y + 3, w: 10, d: 11, r: 3 }, 17, 18) + S({ x: x + 6, y: y + 4, w: 5, d: 8, r: 2 }, 35, 10);
  });
  return k.figureSvg({ width: 760, height: 570, className: 'office-art', label: 'An isometric office with four staffed workstations. Select Research, Risk, Execution or Treasury to explore each role.', body: `<g id="${id}" class="office-world">${base.join('')}${stations.join('')}${plants.join('')}</g>` });
}

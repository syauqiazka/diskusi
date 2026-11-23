// Usage: node validate-layout.mjs [path/to/campus.json]
import fs from 'node:fs';
const L = JSON.parse(fs.readFileSync(process.argv[2] ?? './campus.json', 'utf8'));
const errs = [];
const F = L.fence, gap = L.rules.minBuildingGap, fm = L.rules.minFenceMargin;
const rects = [
  ...L.buildings.map(b => ({ id: b.id, x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, kind: 'building' })),
  ...L.zones.map(z => ({ id: z.id, x0: z.x0, x1: z.x1, z0: z.z0, z1: z.z1, kind: 'zone' })),
];
const dist = (a, b) => {
  const dx = Math.max(a.x0 - b.x1, b.x0 - a.x1, 0), dz = Math.max(a.z0 - b.z1, b.z0 - a.z1, 0);
  return Math.hypot(dx, dz);
};
// 1. inside fence (guard post by the gate is exempt from margin)
for (const r of rects) {
  const m = r.id === 'guard' ? 0 : fm;
  if (r.x0 < F.x0 + m || r.x1 > F.x1 - m || r.z0 < F.z0 + m || r.z1 > F.z1 - m)
    errs.push(`OUTSIDE/TOO CLOSE TO FENCE: ${r.id}`);
}
// 2. no overlaps + minimum gaps (building/zone pairs)
for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
  const d = dist(rects[i], rects[j]);
  if (d < gap) errs.push(`TOO CLOSE (${d.toFixed(1)} m < ${gap}): ${rects[i].id} <-> ${rects[j].id}`);
}
// 3. fountain circle vs rects
const f = L.fountain;
for (const r of rects) {
  const cx = Math.min(Math.max(f.cx, r.x0), r.x1), cz = Math.min(Math.max(f.cz, r.z0), r.z1);
  const d = Math.hypot(cx - f.cx, cz - f.cz) - f.roadOuterR;
  if (d < gap) errs.push(`FOUNTAIN TOO CLOSE (${d.toFixed(1)} m): ${r.id}`);
}
// 4. doors lie on the facing side of their building
for (const b of L.buildings) for (const d of b.doors) {
  const on = { south: d.z === b.z0, north: d.z === b.z1, west: d.x === b.x0, east: d.x === b.x1 };
  const any = on.south || on.north || on.west || on.east;
  const inRange = d.x >= b.x0 && d.x <= b.x1 && d.z >= b.z0 && d.z <= b.z1;
  if (!any || !inRange) errs.push(`DOOR NOT ON WALL: ${b.id}/${d.id}`);
}
// 5. soccer + track + baseball geometry
const fl = L.field, sc = fl.soccer, tr = fl.track.outer, bb = fl.baseball;
if (sc.x1 - sc.x0 !== 105 || sc.z1 - sc.z0 !== 68) errs.push('SOCCER PITCH must be 105x68');
if (!(tr.x0 <= sc.x0 - 8 && tr.x1 >= sc.x1 + 8 && tr.z0 <= sc.z0 - 8 && tr.z1 >= sc.z1 + 8)) errs.push('TRACK must ring pitch by 8 m');
for (const [n, p] of [['home', bb.homePlate], ['first', bb.first], ['second', bb.second], ['third', bb.third], ['mound', bb.mound]])
  if (p.x < sc.x0 || p.x > sc.x1 || p.z < sc.z0 || p.z > sc.z1) errs.push(`BASEBALL ${n} outside pitch`);
if (bb.homePlate.z + bb.outfieldRadius > sc.z1) errs.push('OUTFIELD ARC exceeds pitch');
const dd = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
if (Math.abs(dd(bb.homePlate, bb.first) - bb.baseDistance) > 0.1) errs.push('BASE DISTANCE wrong');
// 6. graph: every door + zone entry reachable from the gate
const adj = {}; for (const [a, b] of L.edges) (adj[a] ??= []).push(b), (adj[b] ??= []).push(a);
for (const k of Object.keys(L.nodes)) if (!(k in adj)) errs.push(`ISOLATED NODE: ${k}`);
const seen = new Set(['gate']), q = ['gate'];
while (q.length) for (const n of adj[q.shift()] ?? []) if (!seen.has(n)) seen.add(n), q.push(n);
for (const b of L.buildings) for (const d of b.doors) if (!seen.has(d.id)) errs.push(`UNREACHABLE FROM GATE: ${d.id}`);
for (const z of L.zones) if (z.entry && ![...Object.entries(L.nodes)].some(([k, v]) => seen.has(k) && v[0] === z.entry.x && v[1] === z.entry.z))
  errs.push(`ZONE ENTRY UNREACHABLE: ${z.id}`);
// 7. main building grid consistency
const m = L.buildings.find(b => b.id === 'main'), g = m.grid;
const length = 2 * g.endStairBlockWidth + 2 * g.wingBays * g.bayWidth + (m.atrium.x1 - m.atrium.x0);
const depth = 2 * g.wallThickness + 2 * g.bayDepth + g.corridorWidth;
if (length !== m.x1 - m.x0) errs.push(`MAIN LENGTH ${length} != ${m.x1 - m.x0}`);
if (depth !== m.z1 - m.z0) errs.push(`MAIN DEPTH ${depth} != ${m.z1 - m.z0}`);
for (const r of m.rooms) { const s = r.bays.reduce((a, b) => a + b.span, 0); if (s !== g.wingBays) errs.push(`ROW SPAN ${s} != ${g.wingBays}: F${r.floor} ${r.wing}${r.row}`); }
// 8. Japanese classroom rules
const C = L.classroom;
if (!C) errs.push('MISSING classroom spec');
else {
  if (C.size.alongCorridor !== g.bayWidth || C.size.depth !== g.bayDepth) errs.push('CLASSROOM size must equal bay (alongCorridor x depth)');
  if (C.doors.count !== 2 || !/hikido/.test(C.doors.type)) errs.push('CLASSROOM needs 2 hikido sliding doors');
  const fd = C.doors.front, rd = C.doors.rear;
  if (Math.abs(fd.uEnd - fd.uStart - C.doors.doorwayWidth) > 1e-6 || Math.abs(rd.uEnd - rd.uStart - C.doors.doorwayWidth) > 1e-6) errs.push('DOORWAY width mismatch');
  if (rd.uEnd > C.size.alongCorridor) errs.push('REAR DOOR outside room');
  if (C.desks.rows * C.desks.columns !== 36) errs.push('DESKS must be 36');
  const lastRowU = C.desks.firstRowU + (C.desks.rows - 1) * C.desks.rowSpacingU;
  if (lastRowU > C.size.alongCorridor - 1.0) errs.push('LAST DESK ROW too close to rear wall');
  const lastColV = C.desks.firstColumnV + (C.desks.columns - 1) * C.desks.columnSpacingV;
  if (lastColV > C.size.depth - 0.6) errs.push('LAST DESK COLUMN too close to window wall');
}
for (const r of m.rooms) for (const b of r.bays) if (/^Kelas /.test(b.name) && r.row !== 'N') errs.push(`CLASSROOM ${b.name} must be on the NORTH row (windows face the field)`);
// 9. no path may enter a building (except its own doors), the track or the pitch
const inside = (r, p, q) => { // Liang-Barsky against shrunken rect
  const e = 0.01, x0 = r.x0 + e, x1 = r.x1 - e, z0 = r.z0 + e, z1 = r.z1 - e;
  let t0 = 0, t1 = 1; const dx = q[0] - p[0], dz = q[1] - p[1];
  for (const [pp, qq] of [[-dx, p[0] - x0], [dx, x1 - p[0]], [-dz, p[1] - z0], [dz, z1 - p[1]]]) {
    if (pp === 0) { if (qq < 0) return false; } else { const t = qq / pp; if (pp < 0) { if (t > t1) return false; t0 = Math.max(t0, t); } else { if (t < t0) return false; t1 = Math.min(t1, t); } }
  } return t0 < t1;
};
const doorOwner = {}; for (const b of L.buildings) for (const d of b.doors) doorOwner[d.id] = b.id;
const blockers = [...rects, { id: 'track', ...L.field.track.outer }, { id: 'pitch', ...L.field.soccer }];
for (const [a, b] of L.edges) for (const r of blockers) {
  if (doorOwner[a] === r.id || doorOwner[b] === r.id) continue;
  if (inside(r, L.nodes[a], L.nodes[b])) errs.push(`PATH ${a}->${b} CROSSES ${r.id}`);
}
console.log(errs.length ? errs.join('\n') + `\n\nFAILED (${errs.length})` : 'LAYOUT OK: no overlaps, everything reachable from the gate.');
process.exit(errs.length ? 1 : 0);

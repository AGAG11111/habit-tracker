import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHeatmap } from './heatmap.js';

// 2026-11-02 is a Monday; its week starts on Sunday 2026-11-01.
const TODAY = '2026-11-02';

test('buildHeatmap covers whole weeks, Sunday first, ending with the current week', () => {
  const cells = buildHeatmap(new Set(), TODAY, 12);
  assert.equal(cells.length, 84);
  assert.equal(cells[0].date, '2026-08-16');
  assert.equal(cells[77].date, '2026-11-01');
  assert.equal(cells[83].date, '2026-11-07');
});

test('buildHeatmap marks done, missed and future days', () => {
  const cells = buildHeatmap(new Set(['2026-11-01', '2026-11-02']), TODAY, 2);
  const byDate = Object.fromEntries(cells.map((c) => [c.date, c.state]));
  assert.equal(byDate['2026-11-01'], 'done');
  assert.equal(byDate['2026-11-02'], 'done');
  assert.equal(byDate['2026-10-31'], 'missed');
  assert.equal(byDate['2026-11-03'], 'future');
});

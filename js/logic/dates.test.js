import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, weekStart, weekDays, toDateString, parseDate } from './dates.js';

test('weekStart returns the Sunday of that week', () => {
  assert.equal(weekStart('2026-11-02'), '2026-11-01'); // Monday
  assert.equal(weekStart('2026-11-01'), '2026-11-01'); // Sunday
  assert.equal(weekStart('2026-11-07'), '2026-11-01'); // Saturday
});

test('addDays crosses month and year boundaries', () => {
  assert.equal(addDays('2026-11-30', 1), '2026-12-01');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
});

test('weekDays lists Sunday through Saturday', () => {
  const days = weekDays('2026-11-04');
  assert.equal(days.length, 7);
  assert.equal(days[0], '2026-11-01');
  assert.equal(days[6], '2026-11-07');
});

test('toDateString and parseDate round-trip', () => {
  assert.equal(toDateString(parseDate('2026-03-09')), '2026-03-09');
});

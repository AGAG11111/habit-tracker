import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBackfillDates } from './backfill.js';
import { calcStreak } from './streaks.js';

// 2026-11-04 is a Wednesday; its week starts Sunday 2026-11-01.
const today = '2026-11-04';

test('daily habit: last N days ending yesterday', () => {
  const dates = buildBackfillDates({ type: 'daily' }, 3, 'days', today);
  assert.deepEqual(dates, ['2026-11-03', '2026-11-02', '2026-11-01']);
});

test('weeks and months convert to days (month = 30 days)', () => {
  assert.equal(buildBackfillDates({ type: 'daily' }, 2, 'weeks', today).length, 14);
  assert.equal(buildBackfillDates({ type: 'daily' }, 1, 'months', today).length, 30);
});

test('weekly habit: target days filled in each of the last N whole weeks', () => {
  const dates = buildBackfillDates({ type: 'weekly', weeklyTarget: 2, days: [] }, 2, 'weeks', today);
  assert.deepEqual(dates.sort(), ['2026-10-18', '2026-10-19', '2026-10-25', '2026-10-26']);
});

test('weekly habit with fixed days uses those weekdays', () => {
  const dates = buildBackfillDates({ type: 'weekly', weeklyTarget: 1, days: [6] }, 2, 'weeks', today);
  assert.deepEqual(dates.sort(), ['2026-10-24', '2026-10-31']); // Saturdays
});

test('zero or invalid amount gives nothing; less than a week gives no weekly history', () => {
  assert.deepEqual(buildBackfillDates({ type: 'daily' }, 0, 'days', today), []);
  assert.deepEqual(buildBackfillDates({ type: 'weekly', weeklyTarget: 3, days: [] }, 5, 'days', today), []);
});

test('backfilled history produces the expected streak', () => {
  const daily = { type: 'daily' };
  const dailyDates = new Set(buildBackfillDates(daily, 10, 'days', today));
  assert.equal(calcStreak(daily, dailyDates, today).current, 10);

  const weekly = { type: 'weekly', weeklyTarget: 3, days: [] };
  const weeklyDates = new Set(buildBackfillDates(weekly, 4, 'weeks', today));
  assert.equal(calcStreak(weekly, weeklyDates, today).current, 4);
});

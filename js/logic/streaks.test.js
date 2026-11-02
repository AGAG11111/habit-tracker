import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcStreak, formatStreak, getStreakTier } from './streaks.js';

const daily = { type: 'daily' };
const weekly = (weeklyTarget) => ({ type: 'weekly', weeklyTarget });
const set = (...dates) => new Set(dates);

// 2026-11-01 is a Sunday, so 11-01..11-07 is one week and 11-08..11-14 the next.

test('no completions means no streak', () => {
  assert.deepEqual(calcStreak(daily, set(), '2026-11-04'), { unit: 'days', current: 0, best: 0 });
});

test('daily streak counts consecutive days ending today', () => {
  const result = calcStreak(daily, set('2026-11-02', '2026-11-03', '2026-11-04'), '2026-11-04');
  assert.equal(result.current, 3);
  assert.equal(result.best, 3);
});

test('today not done yet does not break the streak', () => {
  const result = calcStreak(daily, set('2026-11-02', '2026-11-03'), '2026-11-04');
  assert.equal(result.current, 2);
});

test('one missed day in a week is forgiven', () => {
  // Sun, Mon done; Tue missed (forgiven); Wed, Thu done.
  const result = calcStreak(daily, set('2026-11-01', '2026-11-02', '2026-11-04', '2026-11-05'), '2026-11-05');
  assert.equal(result.current, 4);
});

test('a second miss in the same week breaks the streak', () => {
  // Sun done; Mon, Tue missed; Wed, Thu done -> streak restarts after Tue.
  const result = calcStreak(daily, set('2026-11-01', '2026-11-04', '2026-11-05'), '2026-11-05');
  assert.equal(result.current, 2);
  assert.equal(result.best, 2);
});

test('best streak survives a later break', () => {
  const dates = set('2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-12');
  const result = calcStreak(daily, dates, '2026-11-12');
  assert.equal(result.best, 5);
});

test('weekly streak counts consecutive weeks that met the target', () => {
  const dates = set('2026-11-01', '2026-11-02', '2026-11-08', '2026-11-09'); // 2 + 2 per week
  const result = calcStreak(weekly(2), dates, '2026-11-10');
  assert.deepEqual(result, { unit: 'weeks', current: 2, best: 2 });
});

test('current week below target does not break a weekly streak', () => {
  const dates = set('2026-11-01', '2026-11-02', '2026-11-08'); // last week met, this week 1 of 2
  const result = calcStreak(weekly(2), dates, '2026-11-10');
  assert.equal(result.current, 1);
});

test('a past week below target breaks a weekly streak', () => {
  const dates = set('2026-11-01', '2026-11-02', '2026-11-08', '2026-11-15', '2026-11-16'); // middle week 1 of 2
  const result = calcStreak(weekly(2), dates, '2026-11-17');
  assert.equal(result.current, 1);
  assert.equal(result.best, 1);
});

test('formatStreak handles singular and plural', () => {
  assert.equal(formatStreak('days', 1), 'יום אחד');
  assert.equal(formatStreak('days', 5), '5 ימים');
  assert.equal(formatStreak('weeks', 1), 'שבוע אחד');
  assert.equal(formatStreak('weeks', 3), '3 שבועות');
});

test('getStreakTier maps a streak to a level and the next milestone', () => {
  assert.deepEqual(getStreakTier('days', 0), { level: 0, emoji: '🌱', title: 'מתחילים היום', nextTarget: 1, remaining: 1 });
  assert.equal(getStreakTier('days', 1).level, 1);
  assert.equal(getStreakTier('days', 2).remaining, 1); // 1 day to reach 3
  assert.equal(getStreakTier('days', 7).level, 3);
  assert.equal(getStreakTier('days', 29).nextTarget, 30);
});

test('getStreakTier tops out at the last level', () => {
  const top = getStreakTier('days', 100);
  assert.equal(top.level, 5);
  assert.equal(top.nextTarget, null);
  assert.equal(top.remaining, 0);
});

test('getStreakTier uses week milestones for weekly streaks', () => {
  assert.equal(getStreakTier('weeks', 2).level, 2);
  assert.equal(getStreakTier('weeks', 4).level, 3);
  assert.equal(getStreakTier('weeks', 3).nextTarget, 4);
});

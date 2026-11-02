import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isScheduledOn, formatFrequency, describeSchedule } from './schedule.js';

// 2026-11-07 is a Saturday, 2026-11-02 a Monday.

test('habit without fixed days is scheduled every day', () => {
  assert.equal(isScheduledOn({ days: [] }, '2026-11-02'), true);
  assert.equal(isScheduledOn({}, '2026-11-02'), true); // habits saved before `days` existed
});

test('fixed-day habit is scheduled only on its days', () => {
  const saturdayOnly = { days: [6] };
  assert.equal(isScheduledOn(saturdayOnly, '2026-11-07'), true);
  assert.equal(isScheduledOn(saturdayOnly, '2026-11-02'), false);
});

test('formatFrequency uses natural Hebrew', () => {
  assert.equal(formatFrequency(1), 'פעם בשבוע');
  assert.equal(formatFrequency(2), 'פעמיים בשבוע');
  assert.equal(formatFrequency(4), '4 פעמים בשבוע');
  assert.equal(formatFrequency(7), 'כל יום');
});

test('describeSchedule appends the fixed days', () => {
  assert.equal(describeSchedule({ type: 'weekly', weeklyTarget: 1, days: [6] }), 'פעם בשבוע · שבת');
  assert.equal(describeSchedule({ type: 'weekly', weeklyTarget: 3, days: [4, 0, 2] }), '3 פעמים בשבוע · ראשון, שלישי, חמישי');
  assert.equal(describeSchedule({ type: 'daily', weeklyTarget: 7, days: [] }), 'כל יום');
  assert.equal(describeSchedule({ type: 'weekly', weeklyTarget: 3 }), '3 פעמים בשבוע');
});

import { addDays, weekStart } from './dates.js';

// Streaks for one habit. `dates` is a Set of 'YYYY-MM-DD' strings the habit was done.
//
// Daily habit (type 'daily'): consecutive days done. Grace: the first missed day in each
// Sunday-Saturday week is forgiven (it doesn't break the streak and isn't counted);
// a second miss in the same week breaks it. A day that isn't over yet never breaks it.
//
// Weekly habit: consecutive weeks where the weekly target was met. The current week
// doesn't break the streak until it has passed.
//
// Returns { unit: 'days' | 'weeks', current, best }.
export function calcStreak(habit, dates, todayString) {
  return habit.type === 'weekly'
    ? weeklyStreak(habit.weeklyTarget, dates, todayString)
    : dailyStreak(dates, todayString);
}

function dailyStreak(dates, todayString) {
  if (dates.size === 0) return { unit: 'days', current: 0, best: 0 };
  const start = [...dates].sort()[0];
  const end = dates.has(todayString) ? todayString : addDays(todayString, -1);

  let run = 0;
  let best = 0;
  const graceUsedInWeek = new Set();
  for (let day = start; day <= end; day = addDays(day, 1)) {
    if (dates.has(day)) {
      run += 1;
      best = Math.max(best, run);
    } else if (!graceUsedInWeek.has(weekStart(day))) {
      graceUsedInWeek.add(weekStart(day));
    } else {
      run = 0;
    }
  }
  return { unit: 'days', current: run, best };
}

function weeklyStreak(target, dates, todayString) {
  if (dates.size === 0) return { unit: 'weeks', current: 0, best: 0 };

  const countPerWeek = new Map();
  for (const date of dates) {
    const key = weekStart(date);
    countPerWeek.set(key, (countPerWeek.get(key) ?? 0) + 1);
  }

  const thisWeek = weekStart(todayString);
  const firstWeek = [...countPerWeek.keys()].sort()[0];
  const lastWeek = (countPerWeek.get(thisWeek) ?? 0) >= target ? thisWeek : addDays(thisWeek, -7);

  let run = 0;
  let best = 0;
  for (let week = firstWeek; week <= lastWeek; week = addDays(week, 7)) {
    if ((countPerWeek.get(week) ?? 0) >= target) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return { unit: 'weeks', current: run, best };
}

export function formatStreak(unit, count) {
  if (unit === 'weeks') return count === 1 ? 'שבוע אחד' : `${count} שבועות`;
  return count === 1 ? 'יום אחד' : `${count} ימים`;
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLocalRepository } from './localRepository.js';

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  };
}

test('saveHabit creates with defaults, then updates by id', async () => {
  const repo = createLocalRepository(fakeStorage());
  const created = await repo.saveHabit({ name: 'Read' });
  assert.ok(created.id);
  assert.equal(created.status, 'active');
  assert.equal(created.type, 'daily');

  await repo.saveHabit({ id: created.id, name: 'Read 10 pages' });
  const habits = await repo.listHabits();
  assert.equal(habits.length, 1);
  assert.equal(habits[0].name, 'Read 10 pages');
});

test('archived habits are hidden by default but kept', async () => {
  const repo = createLocalRepository(fakeStorage());
  const h = await repo.saveHabit({ name: 'Run' });
  await repo.archiveHabit(h.id);
  assert.equal((await repo.listHabits()).length, 0);
  assert.equal((await repo.listHabits({ includeArchived: true })).length, 1);
});

test('setCompletion is idempotent and can be undone', async () => {
  const repo = createLocalRepository(fakeStorage());
  await repo.setCompletion('h1', '2026-11-02', true);
  await repo.setCompletion('h1', '2026-11-02', true);
  assert.equal((await repo.listCompletions()).length, 1);
  await repo.setCompletion('h1', '2026-11-02', false);
  assert.equal((await repo.listCompletions()).length, 0);
});

test('listCompletions filters by date range and habit', async () => {
  const repo = createLocalRepository(fakeStorage());
  await repo.setCompletion('h1', '2026-11-01', true);
  await repo.setCompletion('h1', '2026-11-05', true);
  await repo.setCompletion('h2', '2026-11-05', true);
  const inRange = await repo.listCompletions({ from: '2026-11-02', to: '2026-11-30', habitId: 'h1' });
  assert.deepEqual(inRange.map((c) => c.date), ['2026-11-05']);
});

test('export then import restores the data', async () => {
  const source = createLocalRepository(fakeStorage());
  const h = await source.saveHabit({ name: 'Meditate' });
  await source.setCompletion(h.id, '2026-11-02', true);
  await source.saveReflection('2026-11-01', 'good week');
  const backup = await source.exportAll();

  const target = createLocalRepository(fakeStorage());
  await target.importAll(JSON.parse(JSON.stringify(backup)));
  assert.equal((await target.listHabits()).length, 1);
  assert.equal((await target.listCompletions()).length, 1);
  assert.equal(await target.getReflection('2026-11-01'), 'good week');
});

test('importAll rejects an unknown format', async () => {
  const repo = createLocalRepository(fakeStorage());
  await assert.rejects(() => repo.importAll({ foo: 1 }));
});

test('settings merge partial updates', async () => {
  const repo = createLocalRepository(fakeStorage());
  assert.equal((await repo.getSettings()).theme, 'system');
  await repo.saveSettings({ theme: 'dark' });
  assert.equal((await repo.getSettings()).theme, 'dark');
});

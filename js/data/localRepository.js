// localStorage implementation of the repository contract (see repository.js).
// The storage object is injected so tests can pass an in-memory fake.

const STORAGE_KEY = 'habitTracker';
const SCHEMA_VERSION = 1;

function emptyState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    habits: [],
    completions: [],
    reflections: {},
    settings: { theme: 'system' },
  };
}

// crypto.randomUUID only exists in secure contexts (HTTPS or localhost). Opening the app
// over plain http from a phone on the local network would crash without this fallback.
function generateId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createLocalRepository(storage) {
  function load() {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  }

  function save(state) {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const completionId = (habitId, date) => `${habitId}|${date}`;

  return {
    async listHabits({ includeArchived = false } = {}) {
      const { habits } = load();
      return includeArchived ? habits : habits.filter((h) => h.status === 'active');
    },

    // Creates the habit if it has no id, otherwise updates the existing one.
    async saveHabit(input) {
      const state = load();
      const index = input.id ? state.habits.findIndex((h) => h.id === input.id) : -1;
      const base = index >= 0 ? state.habits[index] : {
        id: generateId(),
        icon: '⭐',
        color: '#4f6bed',
        type: 'daily',
        weeklyTarget: 7,
        durationMinutes: 0, // 0 = no duration set
        anchor: '',
        notes: '',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      const habit = { ...base, ...input, id: base.id };
      if (index >= 0) state.habits[index] = habit;
      else state.habits.push(habit);
      save(state);
      return habit;
    },

    // Archive instead of delete, so history is kept.
    async archiveHabit(id, archived = true) {
      const state = load();
      const habit = state.habits.find((h) => h.id === id);
      if (!habit) throw new Error(`Habit not found: ${id}`);
      habit.status = archived ? 'archived' : 'active';
      save(state);
      return habit;
    },

    // Dates are local 'YYYY-MM-DD' strings, so string comparison orders them correctly.
    async listCompletions({ from, to, habitId } = {}) {
      return load().completions.filter(
        (c) =>
          (!from || c.date >= from) &&
          (!to || c.date <= to) &&
          (!habitId || c.habitId === habitId),
      );
    },

    async setCompletion(habitId, date, done) {
      const state = load();
      const id = completionId(habitId, date);
      const exists = state.completions.some((c) => c.id === id);
      if (done && !exists) state.completions.push({ id, habitId, date });
      if (!done && exists) state.completions = state.completions.filter((c) => c.id !== id);
      save(state);
    },

    async getReflection(weekStart) {
      return load().reflections[weekStart] ?? '';
    },

    async saveReflection(weekStart, text) {
      const state = load();
      state.reflections[weekStart] = text;
      save(state);
    },

    async getSettings() {
      return load().settings;
    },

    async saveSettings(partial) {
      const state = load();
      state.settings = { ...state.settings, ...partial };
      save(state);
      return state.settings;
    },

    async exportAll() {
      return load();
    },

    async importAll(data) {
      if (!data || data.schemaVersion !== SCHEMA_VERSION) {
        throw new Error('Unsupported backup format');
      }
      save({ ...emptyState(), ...data });
    },
  };
}

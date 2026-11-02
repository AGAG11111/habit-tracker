// The single entry point to persistence. The rest of the app imports `repository`
// from here and never touches localStorage directly.
//
// Contract (all methods async, so a cloud implementation can drop in later):
//   listHabits({ includeArchived })        -> Habit[]
//   saveHabit(habit)                       -> Habit   (creates when no id)
//   archiveHabit(id, archived = true)      -> Habit
//   deleteHabit(id)                        -> void    (permanent, also removes its completions)
//   listCompletions({ from, to, habitId }) -> Completion[]
//   setCompletion(habitId, date, done)     -> void
//   setCompletions(habitId, dates)         -> void    (marks many dates done at once)
//   getReflection(weekStart)               -> string
//   saveReflection(weekStart, text)        -> void
//   getSettings() / saveSettings(partial)  -> Settings
//   exportAll() / importAll(data)          -> backup / restore
//
// Phase B: swap this line for a cloud implementation with the same methods.
import { createLocalRepository } from './localRepository.js';

export const repository = createLocalRepository(globalThis.localStorage);

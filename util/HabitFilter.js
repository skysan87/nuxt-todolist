/* eslint-disable */
import { Habit } from '@/model/Habit'

export const HabitFilter = {
  Today: {
    value: 0,
    label: '今日',
    filter: (habit, weekday) => {
      if (!habit.isActive) {
        return false
      }
      if (habit.frequency === Habit.FREQ_DAILY) {
        return true
      } else if (habit.frequency === Habit.FREQ_WEEKLY) {
        return habit.weekdays.includes(weekday.toString())
      } else {
        return false
      }
    }
  },
  OnlyActive: {
    value: 1,
    label: '有効のみ',
    filter: (habit) => {
      return habit.isActive === true
    }
  },
  All: {
    value: 2,
    label: '全て',
    filter: (habit) => {
      return true
    }
  }
}

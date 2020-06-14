export const HabitFilter = {
  Today: {
    value: 0,
    label: '今日',
    filter: (habit) => {
      return habit.isPlanDay
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

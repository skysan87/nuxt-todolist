/* eslint-disable */
import { Habit } from '@/model/Habit'
import { Habitlist } from '@/model/Habitlist'
import { dateFactory } from '@/util/DateFactory'

// private
const maxIndex = Symbol('maxHabitIndex')

export class HabitDaoBase {

  constructor() {
    this[maxIndex] = 0
  }

  async getInfo(userId) {
    return [ new Habitlist('dummyHabitId', { userId }) ]
  }

  async addInfo(userId) {
    const list =  new Habitlist('', { userId })
    list.id = Date.now().toString()

    return list
  }

  async get(rootId, userId) {
    const habits = []
    const lastUpdate = dateFactory().subtract(1, 'year')
    const lastUpdateNum = parseInt(lastUpdate.getDateNumber())
    for (let i = 1; i <= 15; i++) {
      const habit = new Habit('dummy' + i, {})
      habit.title = `${habit.id}_${i}`
      habit.detail = 'dummy_detail' + i
      habit.isActive = i !== 2
      if (i < 5) {
        habit.frequency = Habit.FREQ_DAILY
        habit.weekdays = []
      } else {
        habit.frequency = Habit.FREQ_WEEKLY
        habit.weekdays.push((i % 7).toString())
      }
      habit.rootId = rootId
      habit.userId = userId
      habit.orderIndex = i * 1000
      habit.plan[`${lastUpdate.get('year')}`] = Array.from({ length: 12 }, () => '0')
      habit.totalActivityCount = i + 20
      habit.totalCount = i + 100
      habit.summaryUpdatedAt = lastUpdateNum
      habit.lastActivityDate = lastUpdateNum
      habits.push(habit)
      this[maxIndex] += 1
    }
    return habits
  }

  async add(params, userId) {
    const tmpId = Date.now()
    const habit = new Habit(tmpId.toString(), params)
    habit.userId = userId
    this[maxIndex] += 1
    habit.orderIndex = this[maxIndex] * 1000

    return habit
  }

  async update(habit) {
    return true
  }

  async updateSummary(habits) {
    return true
  }

  async delete(habit) {
    return true
  }
}

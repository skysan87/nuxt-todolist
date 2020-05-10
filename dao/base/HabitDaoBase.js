/* eslint-disable */
import { Habit } from '@/model/Habit'
import { Habitlist } from '@/model/Habitlist'

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

    return {
      isSuccess: false,
      value: list
    }
  }

  async get(rootId, userId) {
    const habits = []
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
      habits.push(habit)
      this[maxIndex] = i
    }
    return habits
  }

  async add(params, userId) {
    const returnValues = {
      isSuccess: false,
      value: null
    }
    const tmpId = Date.now()
    const habit = new Habit(tmpId.toString(), {})
    habit.title = params.title
    habit.detail = params.detail
    habit.isActive = params.isActive
    habit.frequency = params.frequency
    habit.weekdays = params.weekdays
    habit.rootId = params.rootId
    habit.userId = userId
    this[maxIndex] += 1
    habit.orderIndex = this[maxIndex] * 1000

    returnValues.isSuccess = true
    returnValues.value = habit
    return returnValues
  }

  async update(habit) {
    return true
  }

  async delete(habit) {
    return true
  }
}

/* eslint-disable */
import { Todo } from '@/model/Todo'
import { dateFactory } from '@/util/DateFactory'
import { TaskState } from '@/util/TaskState'

// private
const maxIndex = Symbol('maxIndex')

export class TodoDaoBase {

  constructor() {
    this[maxIndex] = 0
  }

  async getTodos(listId) {
    const todos = []
    for (let i = 1; i <= 10; i++) {
      const todo = new Todo('', {})
      todo.id = 'dummy' + i
      todo.type ='todo'
      todo.listId = listId
      todo.userId = 'dummy_user_id'
      todo.title = `${listId}_${i}`
      todo.orderIndex = i * 1000,
      todo.detail = 'dummy_detail' + i
      todo.startdate = dateFactory().getDateNumber()
      todo.enddate = dateFactory().addDay(1).getDateNumber()
      todos.push(todo)
      this[maxIndex] = i
    }
    return todos
  }

  /**
   * 今日の残タスクを取得する
   */
  async getTodaysTask (userId, date) {
    const todos = []
    todos.push(...this.createDummyTodo(userId, TaskState.Todo))
    todos.push(...this.createDummyTodo(userId, TaskState.InProgress))
    return todos
  }

  async getTodaysDone(userId, date) {
    return this.createDummyTodo(userId, TaskState.Done)
  }

  createDummyTodo(userId, state) {
    const todos = []
    for (let i = 1; i <= 10; i++) {
      const todo = new Todo('', {})
      todo.id = `dummy_${state.label}_${i}`
      todo.type ='todo'
      todo.listId = 'list' + (i % 3)
      todo.userId = userId
      todo.title = `title_${i}_${state.label}`
      todo.detail = `detail_${i}_${state.label}`
      todo.state = state.value
      todo.startdate = dateFactory().getDateNumber()
      todo.enddate = dateFactory().addDay(i).getDateNumber()
      todos.push(todo)
      todo.orderIndex = this[maxIndex] * 1000
      this[maxIndex] += 1
    }
    return todos
  }

  /**
   * 今日の習慣タスクを取得
   * @param {String} userId ユーザId
   * @param {Number} date YYYYMMDD
   * @returns {Todo[]} 習慣のタスク
   */
  async getHabits(userId, date) {
    return []
  }

  async add(listId, params, userId) {
    const returnValues = {
      isSuccess: false,
      value: null
    }
    const tmpId = Date.now()
    const todo = new Todo('', params)
    todo.id = tmpId.toString()
    todo.listId = listId
    todo.userId = userId
    this[maxIndex] += 1
    todo.orderIndex = this[maxIndex] * 1000

    returnValues.isSuccess = true
    returnValues.value = todo
    return returnValues
  }

  /**
   *
   * @param {ToDo[]} todos
   * @param {Number} date YYYYMMDD
   */
  addHabits(todos) {
    const promisses = []
    for (let i = 0; i < todos.length; i++) {
      const p = new Promise(resolve => {
        todos[i].id = Date.now().toString() + i
        resolve(todos[i])
      })
      promisses.push(p)
    }
    return Promise.all(promisses)
  }

  async update(todo) {
    return true
  }

  async updateHabit(todo, habit, habitCounter) {
    return true
  }

  async delete(id) {
    return true
  }

  async deleteTodos(todos, taskState) {
    return true
  }

  getDate(offset) {
    new Date()
  }
}

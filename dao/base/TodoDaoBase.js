/* eslint-disable */
import moment from 'moment'
import { Todo } from '@/model/Todo'
import { getDateNumber } from '@/util/MomentEx'
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
      todos.push(todo)
      this[maxIndex] = i
    }
    return todos
  }

  /**
   * 今日の残タスクを取得する
   */
  async getTodaysToDo(date) {
    return this.createDummyTodo(TaskState.Todo)
  }

  async getTodaysInProgress(date) {
    return this.createDummyTodo(TaskState.InProgress)
  }

  async getTodaysDone(date) {
    return this.createDummyTodo(TaskState.Done)
  }

  createDummyTodo(state) {
    const todos = []
    for (let i = 1; i <= 10; i++) {
      const today = moment()
      const todo = new Todo('', {})
      todo.id = 'dummy' + i
      todo.type ='todo'
      todo.listId = 'list' + (i % 3)
      todo.userId = 'dummy_user_id'
      todo.title = `title_${i}_${state.label}`
      todo.detail = `detail_${i}_${state.label}`
      todo.state = state.value
      todo.startdate = getDateNumber(today)
      todo.enddate = getDateNumber(today.add(i, 'days'))
      todos.push(todo)
      todo.orderIndex = this[maxIndex] * 1000
      this[maxIndex] += 1
    }
    return todos
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

  async update(todo) {
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

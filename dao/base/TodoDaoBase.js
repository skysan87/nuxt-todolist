/* eslint-disable */
import { Todo } from '@/model/Todo'

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
      todo.listId = listId
      todo.userId = 'dummy_user_id'
      todo.comment = `${listId}_${i}`
      todo.orderIndex = i * 1000,
      todo.note = 'dummy_note' + i
      todos.push(todo)
      this[maxIndex] = i
    }
    return todos
  }

  async add(listId, params, userId) {
    const returnValues = {
      isSuccess: false,
      value: null
    }
    const tmpId = Date.now()
    const todo = new Todo('', {})
    todo.id = tmpId.toString()
    todo.comment = params.comment
    todo.deadline = params.deadline
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
}

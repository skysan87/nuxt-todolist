import DB from '@/plugins/DB'
import { TodoDaoBase } from '@/dao/base/TodoDaoBase'
import { Todo } from '@/model/Todo'
import { TaskState } from '@/util/TaskState'

export class TodoDao extends TodoDaoBase {
  getTodos (listId) {
    return new Promise((resolve, reject) => {
      const db = DB.getInstance()
      try {
        const tx = db.transaction('todo', 'readonly')
        const store = tx.objectStore('todo')
        const index = store.index('listId')
        const key = IDBKeyRange.only(listId)
        const req = index.openCursor(key)
        const todos = []
        req.onsuccess = (e) => {
          if (req.result === null) {
            resolve(todos)
          } else {
            const cursor = req.result
            todos.push(new Todo(cursor.value.id, cursor.value))
            cursor.continue()
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  getTodaysToDo (userId, date) {
    return new Promise((resolve, reject) => {
      const db = DB.getInstance()
      try {
        const tx = db.transaction('todo', 'readonly')
        const store = tx.objectStore('todo')
        const index = store.index('todays_todo')
        const key = IDBKeyRange.bound(['todo', TaskState.Todo.value], ['todo', TaskState.Todo.value, date], false, false)
        const req = index.openCursor(key)
        const todos = []
        req.onsuccess = (e) => {
          if (req.result === null) {
            resolve(todos)
          } else {
            const cursor = req.result
            todos.push(new Todo(cursor.value.id, cursor.value))
            cursor.continue()
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  getTodaysInProgress (userId, date) {
    // TODO:
    return new Promise((resolve, reject) => resolve([]))
  }

  getTodaysDone (userId, date) {
    // TODO:
    return new Promise((resolve, reject) => resolve([]))
  }

  getHabits (userId, date) {
    // TODO:
    return new Promise((resolve, reject) => resolve([]))
  }

  add (listId, params, userId) {
    const todo = new Todo('', params)
    todo.id = Date.now().toString()
    todo.userId = userId
    todo.listId = listId
    const now = new Date()
    todo.createdAt = now
    todo.updatedAt = now

    const returnValues = {
      isSuccess: false,
      value: null
    }

    return new Promise((resolve, reject) => {
      const db = DB.getInstance()
      try {
        // TODO: todolsit, todoにトランザクションを設定
        const tx = db.transaction('todo', 'readwrite')
        tx.objectStore('todo').add(todo.getData())
        tx.oncomplete = (e) => {
          returnValues.isSuccess = true
          returnValues.value = todo
          resolve(returnValues)
        }
        tx.onerror = (e) => {
          reject(e)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  addHabits (todos) {
    // TODO:
    return new Promise((resolve, reject) => resolve(todos))
  }

  update (todo) {
    // TODO:
    return new Promise((resolve, reject) => resolve(true))
  }

  updateHabit (todo, habitRootId, habitCounter, lastActivityDate) {
    // TODO:
    return new Promise((resolve, reject) => resolve(true))
  }

  delete (id) {
    // TODO:
    return new Promise((resolve, reject) => resolve(true))
  }

  deleteTodos (todos, taskState) {
    // TODO:
    return new Promise((resolve, reject) => resolve(true))
  }
}

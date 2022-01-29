import { firestore, getServerTimestamp } from '@/plugins/firebase'
import { TodoDaoBase } from '@/dao/base/TodoDaoBase'
import { Todo } from '@/model/Todo'
import { TaskState } from '@/util/TaskState'

const todosRef = firestore.collection('todos')
const todolistsRef = firestore.collection('lists')
const habitsRef = firestore.collection('habits')

export class TodoDao extends TodoDaoBase {
  async getTodos (listId) {
    try {
      const querySnapshot = await todosRef.where('listId', '==', listId).get()
      const todos = querySnapshot.docs.map((doc) => {
        return this.convertToTodo(doc)
      })
      return todos
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /**
   * 今日が期間に入っている未実施のタスクを取得
   * @param {Number} date 今日の日付(YYYYMMDD)
   */
  async getTodaysTask (userId, date) {
    try {
      const todos = []

      const querySnapshotTodo = await todosRef.where('type', '==', 'todo')
        .where('userId', '==', userId)
        .where('state', '==', TaskState.Todo.value)
        .where('startdate', '<=', date)
        .get()
      todos.push(...querySnapshotTodo.docs.map((doc) => {
        return this.convertToTodo(doc)
      }))

      const querySnapshotInProgress = await todosRef.where('type', '==', 'todo')
        .where('userId', '==', userId)
        .where('state', '==', TaskState.InProgress.value)
        .where('startdate', '<=', date)
        .get()
      todos.push(...querySnapshotInProgress.docs.map((doc) => {
        return this.convertToTodo(doc)
      }))

      return todos
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getTaskInProgress (userId, date) {
    try {
      const todos = []

      const querySnapshotTodo = await todosRef.where('type', '==', 'todo')
        .where('userId', '==', userId)
        .where('state', '==', TaskState.InProgress.value)
        .get()
      todos.push(...querySnapshotTodo.docs.map((doc) => {
        return this.convertToTodo(doc)
      }))

      const querySnapshotHabit = await todosRef.where('type', '==', 'habit')
        .where('userId', '==', userId)
        .where('startdate', '==', date)
        .where('state', '==', TaskState.InProgress.value)
        .get()
      todos.push(...querySnapshotHabit.docs.map((doc) => {
        return this.convertToTodo(doc)
      }))

      return todos
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /**
   * 今日完了したタスクを取得
   * @param {Number} date 今日の日付(YYYYMMDD)
   */
  async getTodaysDone (userId, date) {
    try {
      const querySnapshot = await todosRef.where('type', '==', 'todo')
        .where('userId', '==', userId)
        .where('state', '==', TaskState.Done.value)
        .where('stateChangeDate', '==', date)
        .get()
      const todos = querySnapshot.docs.map((doc) => {
        return this.convertToTodo(doc)
      })
      return todos
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getHabits (userId, date) {
    try {
      const querySnapshot = await todosRef.where('type', '==', 'habit')
        .where('userId', '==', userId)
        .where('startdate', '==', date)
        .get()
      const todos = querySnapshot.docs.map((doc) => {
        return this.convertToTodo(doc)
      })
      return todos
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async add (listId, params, userId) {
    const todo = new Todo('', params)
    todo.userId = userId
    todo.listId = listId
    todo.createdAt = getServerTimestamp()
    todo.updatedAt = getServerTimestamp()

    const listDocRef = todolistsRef.doc(listId)
    const newTodoDocRef = todosRef.doc()

    const returnValues = {
      isSuccess: false,
      value: null
    }

    try {
      await firestore.runTransaction((transaction) => {
        return transaction.get(listDocRef).then((listDoc) => {
          if (!listDoc.exists) {
            throw Object.assingn(new Error('list does not exist.'))
          }

          const newMaxIndex = listDoc.data().maxIndex + 1

          transaction.update(listDocRef, {
            maxIndex: newMaxIndex,
            updatedAt: getServerTimestamp()
          })

          todo.orderIndex = newMaxIndex * 1000
          transaction.set(newTodoDocRef, todo.getData())
        })
      })

      todo.id = newTodoDocRef.id
      returnValues.isSuccess = true
      returnValues.value = todo
      return returnValues
    } catch (error) {
      console.error(error)
      returnValues.isSuccess = false
      return returnValues
    }
  }

  addHabits (todos) {
    const promisses = []
    for (const todo of todos) {
      const p = new Promise((resolve, reject) => {
        try {
          todo.createdAt = getServerTimestamp()
          todo.updatedAt = getServerTimestamp()
          todosRef.add(todo.getData())
            .then((docRef) => {
              todo.id = docRef.id
              resolve(todo)
            })
        } catch (error) {
          console.error(error)
          reject(error)
        }
      })
      promisses.push(p)
    }
    return Promise.all(promisses)
  }

  async update (todo) {
    try {
      await todosRef.doc(todo.id).update({
        title: todo.title,
        state: todo.state,
        detail: todo.detail,
        startdate: todo.startdate,
        enddate: todo.enddate,
        isDone: todo.isDone,
        stateChangeDate: todo.stateChangeDate,
        listId: todo.listId,
        orderIndex: todo.orderIndex,
        subTasks: todo.subTasks.map((t) => {
          return {
            title: t.title,
            isDone: t.isDone
          }
        }),
        updatedAt: getServerTimestamp()
      })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async updateHabit (todo, habit, habitCounter) {
    // habitsRef
    const habitDocRef = habitsRef.doc(habit.rootId).collection('habits').doc(todo.listId)
    const todoDocRef = todosRef.doc(todo.id)

    try {
      await firestore.runTransaction((transaction) => {
        return transaction.get(habitDocRef).then((habitDoc) => {
          if (!habitDoc.exists) {
            throw Object.assingn(new Error('habit does not exist.'))
          }

          // 最新の物を反映
          const latestHabit = habitDoc.data()
          habit.totalActivityCount = latestHabit.totalActivityCount + habitCounter
          habit.duration = latestHabit.duration + habitCounter

          transaction.update(habitDocRef, {
            result: habit.result, // 実績
            lastActivityDate: habit.lastActivityDate, // 最終実行日
            totalActivityCount: habit.totalActivityCount,
            duration: habit.duration,
            updatedAt: getServerTimestamp()
          })

          transaction.set(todoDocRef, todo.getData())
        })
      })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async delete (id) {
    try {
      await todosRef.doc(id).delete()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async deleteTodos (todos, taskState) {
    // NOTE: 最大500件まで
    const batch = firestore.batch()
    todos.forEach((v) => {
      if (v.state === taskState.value) {
        const docRef = todosRef.doc(v.id)
        batch.delete(docRef)
      }
    })

    try {
      await batch.commit()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  /**
   * @param {firestore.DocumentData} doc
   * @returns {Todo}
   */
  convertToTodo (doc) {
    const data = doc.data()
    const todo = new Todo(doc.id, data)
    // timestampをDateに変換
    todo.createdAt = data.createdAt ? data.createdAt.toDate() : ''
    todo.updatedAt = data.updatedAt ? data.updatedAt.toDate() : ''
    return todo
  }
}

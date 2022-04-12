import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch, runTransaction, serverTimestamp } from 'firebase/firestore'
import { firestore } from '@/plugins/firebase'
import { TodoDaoBase } from '@/dao/base/TodoDaoBase'
import { Todo } from '@/model/Todo'
import { TaskState } from '@/util/TaskState'

const todosRef = collection(firestore, 'todos')
const todolistsRef = collection(firestore, 'lists')

export class TodoDao extends TodoDaoBase {
  async getTodos (listId) {
    try {
      const q = query(todosRef
        , where('listId', '==', listId))
      const querySnapshot = await getDocs(q)
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

      const q = (state) => {
        return query(todosRef
          , where('type', '==', 'todo')
          , where('userId', '==', userId)
          , where('state', '==', state)
          , where('startdate', '<=', date)
        )
      }
      const querySnapshotTodo = await getDocs(q(TaskState.Todo.value))
      todos.push(...querySnapshotTodo.docs.map((doc) => {
        return this.convertToTodo(doc)
      }))

      const querySnapshotInProgress = await getDocs(q(TaskState.InProgress.value))
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

      const qTodo = query(todosRef
        , where('type', '==', 'todo')
        , where('userId', '==', userId)
        , where('state', '==', TaskState.InProgress.value)
      )
      const querySnapshotTodo = await getDocs(qTodo)
      todos.push(...querySnapshotTodo.docs.map((doc) => {
        return this.convertToTodo(doc)
      }))

      const qHabit = query(todosRef
        , where('type', '==', 'todo')
        , where('userId', '==', userId)
        , where('startdate', '==', date)
        , where('state', '==', TaskState.InProgress.value)
      )
      const querySnapshotHabit = await getDocs(qHabit)
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
      const q = query(todosRef
        , where('type', '==', 'todo')
        , where('userId', '==', userId)
        , where('state', '==', TaskState.Done.value)
        , where('stateChangeDate', '==', date)
      )
      const querySnapshot = await getDocs(q)
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
      const q = query(todosRef
        , where('type', '==', 'habit')
        , where('userId', '==', userId)
        , where('startdate', '==', date)
      )
      const querySnapshot = await getDocs(q)
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
    todo.createdAt = serverTimestamp()
    todo.updatedAt = serverTimestamp()

    const listDocRef = doc(todolistsRef, listId)
    const newTodoDocRef = doc(todosRef)

    const returnValues = {
      isSuccess: false,
      value: null
    }

    try {
      await runTransaction(firestore, async (transaction) => {
        const listDoc = await transaction.get(listDocRef)
        if (!listDoc.exists()) {
          throw Object.assingn(new Error('list does not exist.'))
        }

        const newMaxIndex = listDoc.data().maxIndex + 1

        transaction.update(listDocRef, {
          maxIndex: newMaxIndex,
          updatedAt: serverTimestamp()
        })

        todo.orderIndex = newMaxIndex * 1000
        transaction.set(newTodoDocRef, todo.getData())
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

  async addHabits (todos) {
    const batch = writeBatch(firestore)
    for (const todo of todos) {
      todo.createdAt = serverTimestamp()
      todo.updatedAt = serverTimestamp()
      const newDocRef = doc(todosRef)
      batch.set(newDocRef, todo.getData())
      todo.id = newDocRef.id
    }

    try {
      await batch.commit()
      return todos
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async update (todo) {
    try {
      const docRef = doc(todosRef, todo.id)
      await updateDoc(docRef,
        {
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
          updatedAt: serverTimestamp()
        })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async updateHabit (todo, habit, habitCounter) {
    // habitsRef
    const habitSubRef = collection(firestore, 'habits', habit.rootId, 'habits')
    const habitDocRef = doc(habitSubRef, todo.listId)

    const todoDocRef = doc(todosRef, todo.id)

    try {
      await runTransaction(firestore, async (transaction) => {
        const habitDoc = await transaction.get(habitDocRef)
        if (!habitDoc.exists()) {
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
          updatedAt: serverTimestamp()
        })

        transaction.set(todoDocRef, todo.getData())
      })

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async delete (id) {
    try {
      const docRef = doc(todosRef, id)
      await deleteDoc(docRef)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async deleteTodos (todos, taskState) {
    // NOTE: 最大500件まで
    const batch = writeBatch(firestore)
    todos.forEach((v) => {
      if (v.state === taskState.value) {
        const docRef = doc(todosRef, v.id)
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

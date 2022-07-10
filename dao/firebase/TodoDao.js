import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch, runTransaction, serverTimestamp } from 'firebase/firestore/lite'
import { firestore } from '@/plugins/firebase'
import { TodoDaoBase } from '@/dao/base/TodoDaoBase'
import { Todo } from '@/model/Todo'
import { TaskState } from '@/util/TaskState'

const todosRef = collection(firestore, 'todos')
const todolistsRef = collection(firestore, 'lists')

export class TodoDao extends TodoDaoBase {
  async getTodos (listId) {
    const q = query(todosRef
      , where('listId', '==', listId))
    const querySnapshot = await getDocs(q)
    const todos = querySnapshot.docs.map((doc) => {
      return this.convertToTodo(doc)
    })
    return todos
  }

  /**
   * 今日が期間に入っている未実施のタスクを取得
   * @param {Number} date 今日の日付(YYYYMMDD)
   */
  async getTodaysTask (userId, date) {
    const todos = []

    const q = (state) => {
      return query(todosRef
        , where('type', '==', Todo.TYPE.TODO)
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
  }

  async getTaskInProgress (userId, date) {
    const todos = []

    const qTodo = query(todosRef
      , where('type', '==', Todo.TYPE.TODO)
      , where('userId', '==', userId)
      , where('state', '==', TaskState.InProgress.value)
    )
    const querySnapshotTodo = await getDocs(qTodo)
    todos.push(...querySnapshotTodo.docs.map((doc) => {
      return this.convertToTodo(doc)
    }))

    const qHabit = query(todosRef
      , where('type', '==', Todo.TYPE.HABIT)
      , where('userId', '==', userId)
      , where('startdate', '==', date)
      , where('state', '==', TaskState.InProgress.value)
    )
    const querySnapshotHabit = await getDocs(qHabit)
    todos.push(...querySnapshotHabit.docs.map((doc) => {
      return this.convertToTodo(doc)
    }))

    return todos
  }

  /**
   * 今日完了したタスクを取得
   * @param {Number} date 今日の日付(YYYYMMDD)
   */
  async getTodaysDone (userId, date) {
    const q = query(todosRef
      , where('type', '==', Todo.TYPE.TODO)
      , where('userId', '==', userId)
      , where('state', '==', TaskState.Done.value)
      , where('stateChangeDate', '==', date)
    )
    const querySnapshot = await getDocs(q)
    const todos = querySnapshot.docs.map((doc) => {
      return this.convertToTodo(doc)
    })
    return todos
  }

  async getHabits (userId, date) {
    const q = query(todosRef
      , where('type', '==', Todo.TYPE.HABIT)
      , where('userId', '==', userId)
      , where('startdate', '==', date)
    )
    const querySnapshot = await getDocs(q)
    const todos = querySnapshot.docs.map((doc) => {
      return this.convertToTodo(doc)
    })
    return todos
  }

  async add (listId, params, userId) {
    const todo = new Todo('', params)
    todo.userId = userId
    todo.listId = listId
    todo.createdAt = serverTimestamp()
    todo.updatedAt = serverTimestamp()

    const listDocRef = doc(todolistsRef, listId)
    const newTodoDocRef = doc(todosRef)

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
    return todo
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

    await batch.commit()
    return todos
  }

  async update (todo) {
    const docRef = doc(todosRef, todo.id)
    await updateDoc(docRef, this.getUpdateData(todo))
    return true
  }

  async updateList (todos) {
    const batch = writeBatch(firestore)
    for (const todo of todos) {
      const todoDocRef = doc(todosRef, todo.id)
      batch.update(todoDocRef, this.getUpdateData(todo))
    }

    await batch.commit()
    return true
  }

  /**
   * 期間の変更
   * @param {Array<{id: String, startdate: Number, enddate: Number}>} targets
   */
  async updateDeadlines (targets) {
    const batch = writeBatch(firestore)
    for (const todo of targets) {
      const todoDocRef = doc(todosRef, todo.id)
      batch.update(todoDocRef, {
        startdate: todo.startdate,
        enddate: todo.enddate,
        updatedAt: serverTimestamp()
      })
    }

    await batch.commit()
    return true
  }

  async updateHabit (todo, habit, habitCounter) {
    // habitsRef
    const habitSubRef = collection(firestore, 'habits', habit.rootId, 'habits')
    const habitDocRef = doc(habitSubRef, todo.listId)

    const todoDocRef = doc(todosRef, todo.id)

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
  }

  async delete (id) {
    const docRef = doc(todosRef, id)
    await deleteDoc(docRef)
    return true
  }

  /**
   * @param {array<String>} ids 削除対象のid
   * @returns Boolean
   */
  async deleteTodos (ids) {
    // NOTE: 最大500件まで
    const batch = writeBatch(firestore)
    ids.forEach((id) => {
      const docRef = doc(todosRef, id)
      batch.delete(docRef)
    })

    await batch.commit()
    return true
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

  getUpdateData (param) {
    const todo = Todo.valueOf(param)

    return {
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
    }
  }
}

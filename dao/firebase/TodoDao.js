import { firestore, getServerTimestamp } from '@/plugins/firebase'
import { TodoDaoBase } from '@/dao/base/TodoDaoBase'
import { Todo } from '@/model/Todo'

const todosRef = firestore.collection('todos')
const todolistsRef = firestore.collection('lists')

export class TodoDao extends TodoDaoBase {
  async getTodos (listId) {
    try {
      const querySnapshot = await todosRef.where('listId', '==', listId).get()
      const todos = querySnapshot.docs.map((doc) => {
        return new Todo(doc.id, doc.data())
      })
      return todos
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async add (listId, params, userId) {
    const todo = new Todo('', {})
    todo.userId = userId
    todo.comment = params.comment
    todo.deadline = params.deadline
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

  async update (todo) {
    try {
      await todosRef.doc(todo.id).update({
        comment: todo.comment,
        state: todo.state,
        note: todo.note,
        orderIndex: todo.orderIndex,
        updatedAt: getServerTimestamp()
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
}

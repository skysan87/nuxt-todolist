import { firestore, getServerTimestamp } from '@/plugins/firebase'
import { Todolist } from '@/model/Todolist'
import { TodolistDaoBase } from '@/dao/base/TodolistDaoBase'

const todosRef = firestore.collection('todos')
const todolistsRef = firestore.collection('lists')

export class TodolistDao extends TodolistDaoBase {
  async getLists (userId) {
    try {
      const querySnapshot = await todolistsRef
        .where('userId', '==', userId)
        .get()
      const lists = querySnapshot.docs.map((doc) => {
        return new Todolist(doc.id, doc.data())
      })
      return lists
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async add (params, orderIndex, userId) {
    const list = new Todolist('', params)
    list.userId = userId
    list.orderIndex = orderIndex
    list.createdAt = getServerTimestamp()
    list.updatedAt = getServerTimestamp()

    try {
      const returnValues = {
        isSuccess: false,
        value: null
      }
      const docRef = await todolistsRef.add(list.getData())
      list.id = docRef.id
      returnValues.isSuccess = true
      returnValues.value = list
      return returnValues
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async update (list) {
    try {
      await todolistsRef.doc(list.id).update({
        title: list.title,
        detail: list.detail,
        orderIndex: list.orderIndex,
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
      await todolistsRef.doc(id).delete()

      const querySnapshot = await todosRef.where('listId', '==', id).get()
      const todoIds = querySnapshot.docs.map(doc => doc.id)

      const batch = firestore.batch()
      todoIds.forEach((id) => {
        const docRef = todosRef.doc(id)
        batch.delete(docRef)
      })
      await batch.commit()

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}

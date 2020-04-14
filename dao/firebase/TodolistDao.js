import { firestore, getServerTimestamp } from '@/plugins/firebase'
import { Todolist } from '@/model/Todolist'
import { TodolistDaoBase } from '@/dao/base/TodolistDaoBase'

const todolistsRef = firestore.collection('lists')

export class TodolistDao extends TodolistDaoBase {
  async getLists (userId) {
    try {
      const querySnapshot = await todolistsRef
        .where('deleteFlag', '==', false)
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

  async add (title, orderIndex, userId) {
    const list = new Todolist('', {})
    list.title = title
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
      await todolistsRef.doc(id).update({
        deleteFlag: true,
        updatedAt: getServerTimestamp()
      })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}

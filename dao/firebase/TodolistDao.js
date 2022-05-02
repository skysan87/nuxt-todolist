import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore/lite'
import { firestore } from '@/plugins/firebase'
import { Todolist } from '@/model/Todolist'
import { TodolistDaoBase } from '@/dao/base/TodolistDaoBase'

const todosRef = collection(firestore, 'todos')
const todolistsRef = collection(firestore, 'lists')

export class TodolistDao extends TodolistDaoBase {
  async getLists (userId) {
    const q = query(todolistsRef
      , where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    const lists = querySnapshot.docs.map((doc) => {
      return new Todolist(doc.id, doc.data())
    })
    return lists
  }

  async add (params, orderIndex, userId) {
    const list = new Todolist('', params)
    list.userId = userId
    list.orderIndex = orderIndex
    list.createdAt = serverTimestamp()
    list.updatedAt = serverTimestamp()

    const docRef = await addDoc(todolistsRef, list.getData())
    list.id = docRef.id
    return list
  }

  async update (list) {
    const docRef = doc(todolistsRef, list.id)
    await updateDoc(docRef,
      {
        title: list.title,
        detail: list.detail,
        orderIndex: list.orderIndex,
        updatedAt: serverTimestamp()
      }
    )

    return true
  }

  async delete (listId) {
    // lists
    const docRef = doc(todolistsRef, listId)
    await deleteDoc(docRef)

    // todos
    const q = query(todosRef, where('listId', '==', listId))
    const querySnapshot = await getDocs(q)
    const todoIds = querySnapshot.docs.map(doc => doc.id)

    const batch = writeBatch(firestore)
    todoIds.forEach((todoId) => {
      const docRef = doc(todosRef, todoId)
      batch.delete(docRef)
    })
    await batch.commit()

    return true
  }
}

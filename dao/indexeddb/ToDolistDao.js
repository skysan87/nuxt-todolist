import DB from '@/plugins/DB'
import { Todolist } from '@/model/Todolist'
import { TodolistDaoBase } from '@/dao/base/TodolistDaoBase'

export class TodolistDao extends TodolistDaoBase {
  getLists (userId) {
    return new Promise((resolve, reject) => {
      const db = DB.getInstance()
      try {
        const tx = db.transaction('todolist', 'readonly')
        const store = tx.objectStore('todolist')
        const req = store.getAll()
        const lists = []
        req.onsuccess = (e) => {
          const rows = e.target.result
          for (const row of rows) {
            lists.push(new Todolist(row.id, row))
          }
          resolve(lists)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  add (title, orderIndex, userId) {
    const list = new Todolist('', {})
    list.id = Date.now().toString()
    list.title = title
    list.userId = userId || ''
    list.orderIndex = orderIndex
    const now = new Date()
    list.createdAt = now
    list.updatedAt = now

    const returnValues = {
      isSuccess: false,
      value: null
    }

    return new Promise((resolve, reject) => {
      const db = DB.getInstance()
      try {
        const tx = db.transaction('todolist', 'readwrite')
        tx.objectStore('todolist').add(list.getData())
        tx.oncomplete = (e) => {
          returnValues.isSuccess = true
          returnValues.value = list
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

  update (list) {
    // try {
    //   await todolistsRef.doc(list.id).update({
    //     title: list.title,
    //     updatedAt: getServerTimestamp()
    //   })
    //   return true
    // } catch (error) {
    //   console.error(error)
    //   return false
    // }
    // TODO:
    return new Promise((resolve, reject) => resolve(true))
  }

  delete (id) {
    // try {
    //   await todolistsRef.doc(id).update({
    //     deleteFlag: true,
    //     updatedAt: getServerTimestamp()
    //   })
    //   return true
    // } catch (error) {
    //   console.error(error)
    //   return false
    // }
    // TODO:
    return new Promise((resolve, reject) => resolve(true))
  }
}

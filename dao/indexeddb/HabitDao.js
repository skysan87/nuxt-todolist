import DB from '@/plugins/DB'
import { HabitDaoBase } from '@/dao/base/HabitDaoBase'
import { Habit } from '@/model/Habit'
import { Habitlist } from '@/model/Habitlist'

const habitlistId = '_habit_id'

export class HabitDao extends HabitDaoBase {
  /**
   * get Habitlist
   */
  getInfo (userId) {
    // try {
    //   const querySnapshot = await habitsRef.where('userId', '==', userId).limit(1).get()
    //   const list = querySnapshot.docs.map((doc) => {
    //     return new Habitlist(doc.id, doc.data())
    //   })
    //   return list
    // } catch (error) {
    //   console.error(error)
    //   throw error
    // }
    return new Promise((resolve, reject) => {
      const db = DB.getInstance()
      try {
        const tx = db.transaction('habitlist', 'readonly')
        const store = tx.objectStore('habitlist')
        const req = store.get(habitlistId)
        req.onsuccess = (e) => {
          const row = e.target.result
          if (!row) {
            resolve([])
          } else {
            resolve([new Habitlist(row.id, row)])
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * add Habitlist
   */
  addInfo (userId) {
    const list = new Habitlist('', {})
    list.id = habitlistId
    list.userId = userId || ''
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
        const tx = db.transaction('habitlist', 'readwrite')
        tx.objectStore('habitlist').add(list.getData())
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

  get (rootId, userId) {
    return new Promise((resolve, reject) => {
      const db = DB.getInstance()
      try {
        const tx = db.transaction('habit', 'readonly')
        const store = tx.objectStore('habit')
        const req = store.getAll()
        const lists = []
        req.onsuccess = (e) => {
          const rows = e.target.result
          for (const row of rows) {
            lists.push(new Habit(row.id, row))
          }
          resolve(lists)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  add (params, userId) {
    const habit = new Habit('', params)
    habit.id = Date.now().toString()
    habit.userId = userId || ''
    const now = new Date()
    habit.createdAt = now
    habit.updatedAt = now

    const returnValues = {
      isSuccess: false,
      value: null
    }

    // const rootDocDef = habitsRef.doc(habit.rootId)
    // const newHabitDocDef = rootDocDef.collection('habits').doc()

    // try {
    //   await firestore.runTransaction((transaction) => {
    //     return transaction.get(rootDocDef).then((rootDoc) => {
    //       if (!rootDoc.exists) {
    //         throw Object.assign(new Error('habit does not exist.'))
    //       }

    //       const newMaxIndex = rootDoc.data().maxIndex + 1

    //       transaction.update(rootDocDef, {
    //         maxIndex: newMaxIndex,
    //         updatedAt: getServerTimestamp()
    //       })

    //       habit.orderIndex = newMaxIndex * 1000
    //       transaction.set(newHabitDocDef, habit.getData())
    //     })
    //   })

    //   habit.id = newHabitDocDef.id
    //   returnValues.isSuccess = true
    //   returnValues.value = habit
    //   return returnValues
    // } catch (error) {
    //   console.error(error)
    //   returnValues.isSuccess = false
    //   return returnValues
    // }
    return new Promise((resolve, reject) => {
      const db = DB.getInstance()
      try {
        // TODO: todolsit, todoにトランザクションを設定
        const tx = db.transaction('habit', 'readwrite')
        tx.objectStore('habit').add(habit.getData())
        tx.oncomplete = (e) => {
          returnValues.isSuccess = true
          returnValues.value = habit
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

  update (habit) {
    // try {
    //   await habitsRef.doc(habit.rootId).collection('habits').doc(habit.id)
    //     .update({
    //       title: habit.title,
    //       detail: habit.detail,
    //       isActive: habit.isActive,
    //       frequency: habit.frequency,
    //       weekdays: habit.weekdays,
    //       orderIndex: habit.orderIndex,
    //       updatedAt: getServerTimestamp()
    //     })
    //   return true
    // } catch (error) {
    //   console.error(error)
    //   return false
    // }
    // TODO:
    return new Promise((resolve, reject) => resolve(true))
  }

  updateSummary (habits) {
    // const batch = firestore.batch()
    // habits.forEach((v) => {
    //   if (v.needServerUpdate) {
    //     const doc = habitsRef.doc(v.rootId).collection('habits').doc(v.id)
    //     const param = v.getSummary()
    //     param.updatedAt = getServerTimestamp()
    //     batch.update(doc, param)
    //   }
    // })

    // try {
    //   await batch.commit()
    //   return true
    // } catch (error) {
    //   console.error(error)
    //   return false
    // }
    // TODO:
    return new Promise((resolve, reject) => resolve(true))
  }

  delete (habit) {
    // try {
    //   await habitsRef.doc(habit.rootId).collection('habits').doc(habit.id).delete()
    //   return true
    // } catch (error) {
    //   console.error(error)
    //   return false
    // }
    // TODO:
    return new Promise((resolve, reject) => resolve(true))
  }
}

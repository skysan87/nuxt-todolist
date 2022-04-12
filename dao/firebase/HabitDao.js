import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch, limit, runTransaction, serverTimestamp } from 'firebase/firestore'
import { firestore } from '@/plugins/firebase'
import { HabitDaoBase } from '@/dao/base/HabitDaoBase'
import { Habit } from '@/model/Habit'
import { Habitlist } from '@/model/Habitlist'

const habitsRef = collection(firestore, 'habits')

export class HabitDao extends HabitDaoBase {
  async getInfo (userId) {
    try {
      const q = query(habitsRef
        , where('userId', '==', userId)
        , limit(1))
      const querySnapshot = await getDocs(q)
      const list = querySnapshot.docs.map((doc) => {
        return new Habitlist(doc.id, doc.data())
      })
      return list
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async addInfo (userId) {
    const list = new Habitlist('', {})
    list.userId = userId
    list.createdAt = serverTimestamp()
    list.updatedAt = serverTimestamp()

    const returnValues = {
      isSuccess: false,
      value: null
    }

    try {
      const docRef = await addDoc(habitsRef, list.getData())
      list.id = docRef.id
      returnValues.isSuccess = true
      returnValues.value = list
      return returnValues
    } catch (error) {
      console.error(error)
      returnValues.isSuccess = false
      return returnValues
    }
  }

  async get (rootId, userId) {
    try {
      const q = query(
        collection(firestore, 'habits', rootId, 'habits')
        , where('userId', '==', userId)
      )
      const querySnapshot = await getDocs(q)
      const habits = querySnapshot.docs.map((doc) => {
        return new Habit(doc.id, doc.data())
      })
      return habits
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async add (params, userId) {
    const habit = new Habit('', params)
    habit.userId = userId
    habit.createdAt = serverTimestamp()
    habit.updatedAt = serverTimestamp()

    const returnValues = {
      isSuccess: false,
      value: null
    }

    const rootDocRef = doc(habitsRef, habit.rootId)
    const habitSubRef = collection(firestore, 'habits', habit.rootId, 'habits')
    const newHabitDocDef = doc(habitSubRef)

    try {
      await runTransaction(firestore, async (transaction) => {
        const rootDoc = await transaction.get(rootDocRef)
        if (!rootDoc.exists()) {
          throw Object.assign(new Error('habit does not exist.'))
        }

        const newMaxIndex = rootDoc.data().maxIndex + 1

        transaction.update(rootDocRef, {
          maxIndex: newMaxIndex,
          updatedAt: serverTimestamp()
        })

        habit.orderIndex = newMaxIndex * 1000
        transaction.set(newHabitDocDef, habit.getData())
      })

      habit.id = newHabitDocDef.id
      returnValues.isSuccess = true
      returnValues.value = habit
      return returnValues
    } catch (error) {
      console.error(error)
      returnValues.isSuccess = false
      return returnValues
    }
  }

  async update (habit) {
    try {
      const docRef = doc(firestore, 'habits', habit.rootId, 'habits', habit.id)
      await updateDoc(docRef,
        {
          title: habit.title,
          detail: habit.detail,
          isActive: habit.isActive,
          frequency: habit.frequency,
          weekdays: habit.weekdays,
          monthlyType: habit.monthlyType,
          planDays: habit.planDays,
          planWeek: habit.planWeek,
          orderIndex: habit.orderIndex,
          updatedAt: serverTimestamp()
        })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async updateSummary (habits) {
    const batch = writeBatch(firestore)
    habits.forEach((v) => {
      if (v.needServerUpdate) {
        const docRef = doc(firestore, 'habits', v.rootId, 'habits', v.id)
        const param = v.getSummary()
        param.updatedAt = serverTimestamp()
        batch.update(docRef, param)
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

  async delete (habit) {
    try {
      const docRef = doc(firestore, 'habits', habit.rootId, 'habits', habit.id)
      await deleteDoc(docRef)

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}

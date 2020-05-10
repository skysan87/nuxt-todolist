import { firestore, getServerTimestamp } from '@/plugins/firebase'
import { HabitDaoBase } from '@/dao/base/HabitDaoBase'
import { Habit } from '@/model/Habit'
import { Habitlist } from '@/model/Habitlist'

const habitsRef = firestore.collection('habits')

export class HabitDao extends HabitDaoBase {
  async getInfo (userId) {
    try {
      const querySnapshot = await habitsRef.where('userId', '==', userId).limit(1).get()
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
    list.createdAt = getServerTimestamp()
    list.updatedAt = getServerTimestamp()

    const returnValues = {
      isSuccess: false,
      value: null
    }

    try {
      const docRef = await habitsRef.add(list.getData())
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
      const querySnapshot = await habitsRef.doc(rootId).collection('habits')
        .where('userId', '==', userId)
        .get()
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
    habit.createdAt = getServerTimestamp()
    habit.updatedAt = getServerTimestamp()

    const returnValues = {
      isSuccess: false,
      value: null
    }

    const rootDocDef = habitsRef.doc(habit.rootId)
    const newHabitDocDef = rootDocDef.collection('habits').doc()

    try {
      await firestore.runTransaction((transaction) => {
        return transaction.get(rootDocDef).then((rootDoc) => {
          if (!rootDoc.exists) {
            throw Object.assign(new Error('habit does not exist.'))
          }

          const newMaxIndex = rootDoc.data().maxIndex + 1

          transaction.update(rootDocDef, {
            maxIndex: newMaxIndex,
            updatedAt: getServerTimestamp()
          })

          habit.orderIndex = newMaxIndex * 1000
          transaction.set(newHabitDocDef, habit.getData())
        })
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
      await habitsRef.doc(habit.rootId).collection('habits').doc(habit.id)
        .update({
          title: habit.title,
          detail: habit.detail,
          isActive: habit.isActive,
          frequency: habit.frequency,
          weekdays: habit.weekdays,
          orderIndex: habit.orderIndex,
          updatedAt: getServerTimestamp()
        })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async delete (habit) {
    try {
      await habitsRef.doc(habit.rootId).collection('habits').doc(habit.id).delete()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}

import orderBy from 'lodash/orderBy'
import moment from 'moment'
import { CreateHabitDao } from '@/dao'
import { HabitFilter } from '@/util/HabitFilter'

const dao = CreateHabitDao()

export default {
  namespaced: true,
  state () {
    return {
      habits: [],
      rootId: '',
      filterId: HabitFilter.Today.value
    }
  },

  getters: {
    getList: (state) => {
      let fileteredArray = []
      if (state.filterId === HabitFilter.Today.value) {
        fileteredArray = state.habits.filter(h => HabitFilter.Today.filter(h, moment().weekday()))
      } else if (state.filterId === HabitFilter.OnlyActive.value) {
        fileteredArray = state.habits.filter(h => HabitFilter.OnlyActive.filter(h))
      } else {
        fileteredArray = state.habits
      }
      return orderBy(fileteredArray, 'orderIndex')
    },

    getTodayList: (state) => {
      return orderBy(
        state.habits.filter(h => HabitFilter.Today.filter(h, moment().weekday()))
        , 'orderIndex')
    },

    getOrderdList: (state) => {
      return orderBy(state.habits, 'orderIndex')
    },

    getById: state => (id) => {
      const index = state.habits.findIndex(v => v.id === id)
      return state.habits[index]
    },

    getCurrentFilter: (state) => {
      return state.filterId
    },

    getRootId: (state) => {
      return state.rootId
    }
  },

  mutations: {
    init (state, params) {
      state.rootId = params.rootId
      state.habits = params.habits
    },

    add (state, habit) {
      state.habits.push(habit)
    },

    update (state, habit) {
      const index = state.habits.findIndex(v => v.id === habit.id)
      Object.assign(state.habits[index], habit)
    },

    delete (state, id) {
      const index = state.habits.findIndex(v => v.id === id)
      state.habits.splice(index, 1)
    },

    changeFilter (state, filterId) {
      state.filterId = filterId
    }
  },

  actions: {
    async init ({ commit, rootGetters }) {
      const userId = rootGetters['user/userId']
      const info = await dao.getInfo(userId)

      if (info.length > 0) {
        const habitlist = info[0]
        const habits = await dao.get(habitlist.id, userId)
        habits.forEach((h) => {
          h.updateSummary()
        })
        // TODO: firebase.バッチ更新
        commit('init',
          {
            habits,
            rootId: habitlist.id
          })
      } else {
        // Add First List
        const result = await dao.addInfo(userId)
        if (result.isSuccess) {
          commit('init', {
            habits: [],
            rootId: result.value.id
          })
        }
      }
    },

    async add ({ commit, rootGetters }, params) {
      const userId = rootGetters['user/userId']
      const result = await dao.add(params, userId)
      if (result.isSuccess) {
        commit('add', result.value)
      }
    },

    async update ({ commit }, habit) {
      if (await dao.update(habit)) {
        commit('update', habit)
      }
    },

    async delete ({ commit }, habit) {
      if (await dao.delete(habit)) {
        commit('delete', habit.id)
      }
    },

    changeFilter ({ commit }, filterId) {
      commit('changeFilter', filterId)
    },

    async changeOrder ({ commit, getters }, params) {
      const filtered = getters.getList
      const src = filtered[params.oldIndex]
      const dest = filtered[params.newIndex]

      const sorted = getters.getOrderdList
      const actualNewIndex = sorted.findIndex(v => v.id === dest.id)

      let prevOrderIndex, nextOrderIndex
      if (params.oldIndex > params.newIndex) {
        // 上へ移動
        // newIndexにあったアイテムは下に移動する
        if (actualNewIndex > 0) {
          prevOrderIndex = sorted[actualNewIndex - 1].orderIndex
        } else {
          prevOrderIndex = 1
        }
        nextOrderIndex = dest.orderIndex
      } else {
        // 下へ移動
        // newIndexにあったアイテムは上に移動する
        prevOrderIndex = dest.orderIndex
        if (filtered.length - 1 > actualNewIndex) {
          nextOrderIndex = sorted[actualNewIndex + 1].orderIndex
        } else {
          nextOrderIndex = Math.ceil(dest.orderIndex) + 1
        }
      }

      // NOTE: 並び替えは前後のorderから算出
      //  firebaseで複雑なsortができないため
      const newOrderIndex = (prevOrderIndex + nextOrderIndex) / 2

      if (newOrderIndex !== dest.orderIndex) {
        src.orderIndex = newOrderIndex
        if (await dao.update(src)) {
          commit('update', src)
        }
      }
    }
  }
}

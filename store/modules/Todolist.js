import orderBy from 'lodash/orderBy'
import { CreateTodolistDao } from '@/dao'

const dao = CreateTodolistDao()

export default {
  namespaced: true,
  listId: null,
  state () {
    return {
      maxIndex: 0,
      lists: []
    }
  },

  getters: {
    getLists: (state) => {
      return orderBy(state.lists, 'orderIndex')
    },

    getListName: state => (id) => {
      const index = state.lists.findIndex(v => v.id === id)
      return index >= 0 ? state.lists[index].title : ''
    },

    getListById: state => (id) => {
      const index = state.lists.findIndex(v => v.id === id)
      return state.lists[index]
    }
  },

  mutations: {
    init (state, payload) {
      state.lists = payload
      if (payload !== null && payload.length > 0) {
        // リストはそれほど増えないので、毎回計算する
        state.maxIndex = Math.max.apply(
          null,
          payload.map(e => e.orderIndex)
        )
      }
    },

    add (state, payload) {
      state.lists.push(payload)
      state.maxIndex += 1
    },

    update (state, payload) {
      const index = state.lists.findIndex(v => v.id === payload.id)
      state.lists[index] = payload
    },

    delete (state, payload) {
      const index = state.lists.findIndex(v => v.id === payload.id)
      state.lists.splice(index, 1)
    }
  },

  actions: {
    async init ({ commit, dispatch, rootGetters }) {
      const userId = rootGetters['user/userId']
      const lists = await dao.getLists(userId)

      if (lists.length > 0) {
        commit('init', lists)
        dispatch('todo/init', lists[0].id, { root: true })
      } else {
        // Add First List
        const result = await dao.add('inbox', 1, userId)
        if (result.isSuccess) {
          commit('init', [result.value])
          dispatch('todo/init', result.value.id, { root: true })
        }
      }
    },

    async add ({ commit, dispatch, state, rootGetters }, title) {
      const userId = rootGetters['user/userId']
      const result = await dao.add(title, state.maxIndex + 1, userId)
      if (result.isSuccess) {
        commit('add', result.value)
        dispatch('todo/initNewList', result.value.id, { root: true })
      }
    },

    async update ({ commit }, payload) {
      const isSuccess = await dao.update(payload)
      if (isSuccess) {
        commit('update', payload)
      }
    },

    async delete ({ commit, dispatch, state }, id) {
      if (state.lists.length <= 1) {
        console.warn('At least one List must be left.')
        return
      }

      if (await dao.delete(id)) {
        commit('delete', id)
        dispatch('todo/init', state.lists[0].id, { root: true })
      }
    }
  }
}

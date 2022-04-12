import orderBy from 'lodash/orderBy'
import { CreateTodolistDao } from '@/dao'
import { Todolist } from '@/model/Todolist'

const dao = CreateTodolistDao()

const MAX_SIZE = process.env.MAX_SIZE_TODOLIST || 5

export const state = () => ({
  maxIndex: 0,
  lists: []
})

export const getters = {
  getLists: (state) => {
    return orderBy(state.lists, 'orderIndex')
  },

  getFistListId: (state) => {
    return orderBy(state.lists, 'orderIndex')[0].id
  },

  getListName: state => (id) => {
    const index = state.lists.findIndex(v => v.id === id)
    return index >= 0 ? state.lists[index].title : ''
  },

  getListById: state => (id) => {
    const index = state.lists.findIndex(v => v.id === id)
    return state.lists[index]
  },

  size: (state) => {
    return state.lists.length
  }
}

export const mutations = {
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
    Object.assign(state.lists[index], payload)
  },

  delete (state, id) {
    const index = state.lists.findIndex(v => v.id === id)
    state.lists.splice(index, 1)
  }
}

export const actions = {
  async init ({ commit, rootGetters }) {
    const userId = rootGetters['User/userId']
    const lists = await dao.getLists(userId)

    if (lists.length > 0) {
      commit('init', lists)
    } else {
      // Add First List
      const list = new Todolist('', { title: 'inbox' })
      const result = await dao.add(list.getData(), 1, userId)
      if (result.isSuccess) {
        commit('init', [result.value])
      }
    }
    console.log('todolist init')
  },

  add ({ commit, dispatch, state, rootGetters, getters }, params) {
    return new Promise((resolve, reject) => {
      if (getters.size + 1 > MAX_SIZE) {
        reject(new Error('これ以上登録できません'))
        return
      }
      const userId = rootGetters['User/userId']

      dao.add(params, state.maxIndex + 1, userId).then((result) => {
        if (result.isSuccess) {
          commit('add', result.value)
          dispatch('Todo/initNewList', result.value.id, { root: true })
          resolve()
        } else {
          reject(new Error('登録に失敗しました'))
        }
      })
    })
  },

  async update ({ commit }, list) {
    const isSuccess = await dao.update(list)
    if (isSuccess) {
      commit('update', list)
    }
  },

  async changeOrder ({ commit, getters }, params) {
    const sorted = getters.getLists
    const srcTodolist = sorted[params.oldIndex]
    const destTodolist = sorted[params.newIndex]

    const actualNewIndex = sorted.findIndex(v => v.id === destTodolist.id)

    let prevOrderIndex, nextOrderIndex
    if (params.oldIndex > params.newIndex) {
      // 上へ移動
      // newIndexにあったアイテムは下に移動する
      if (actualNewIndex > 0) {
        prevOrderIndex = sorted[actualNewIndex - 1].orderIndex
      } else {
        prevOrderIndex = 1
      }
      nextOrderIndex = destTodolist.orderIndex
    } else {
      // 下へ移動
      // newIndexにあったアイテムは上に移動する
      prevOrderIndex = destTodolist.orderIndex
      if (sorted.length - 1 > actualNewIndex) {
        nextOrderIndex = sorted[actualNewIndex + 1].orderIndex
      } else {
        nextOrderIndex = Math.ceil(destTodolist.orderIndex) + 1
      }
    }

    // NOTE: 並び替えは前後のorderから算出
    //  firebaseで複雑なsortができないため
    const newOrderIndex = (prevOrderIndex + nextOrderIndex) / 2

    if (newOrderIndex !== destTodolist.orderIndex) {
      srcTodolist.orderIndex = newOrderIndex
      if (await dao.update(srcTodolist)) {
        commit('update', srcTodolist)
      }
    }
  },

  delete ({ commit, state }, id) {
    return new Promise((resolve, reject) => {
      if (state.lists.length <= 1) {
        reject(new Error('これ以上削除できません'))
        return
      }

      if (dao.delete(id)) {
        commit('delete', id)
        resolve()
      } else {
        reject(new Error('削除できませんでした'))
      }
    })
  }
}

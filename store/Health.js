import { CreateHealthDao } from '@/dao'

const dao = CreateHealthDao()

export const state = () => ({
  latest: {}
})

export const getters = {
  getLatest: state => state.latest
}

export const mutations = {
  updateLatest (state, latest) {
    state.latest = latest
  }
}

export const actions = {
  async init ({ commit, rootGetters }) {
    const userId = rootGetters['User/userId']
    let list = await dao.getList(userId)

    if (!list) {
      list = await dao.createList(userId)
    }
    commit('updateLatest', list.latest)

    console.log('health init')
  },

  async add ({ commit, rootGetters }, params) {
    const userId = rootGetters['User/userId']
    const latest = await dao.addAndUpdateLatest(params, userId)

    commit('updateLatest', latest)
  }
}

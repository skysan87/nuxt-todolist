import { CreateUserDao } from '@/dao'

const dao = CreateUserDao()

export default {
  namespaced: true,
  state () {
    return {
      id: '',
      email: '',
      displayName: ''
    }
  },

  getters: {
    isLogin: (state) => {
      return !!state.email
    },

    displayName: (state) => {
      return state.displayName
    },

    userId: (state) => {
      return state.id
    }
  },

  mutations: {
    setUser (state, user) {
      state.id = user.uid
      state.email = user.email
      state.displayName = user.displayName
    },

    resetUser (state) {
      state.id = ''
      state.email = ''
      state.displayName = ''
    }
  },

  actions: {
    init () {
      dao.init()
    },

    stateChanged ({ commit }, user) {
      if (user !== null) {
        // login
        commit('setUser', user)
      } else {
        // logout
        commit('resetUser')
      }
    },

    async login () {
      await dao.login()
    },

    async logout ({ commit }) {
      await dao.logout()
      commit('resetUser')
    }
  }
}

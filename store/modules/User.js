import { CreateUserDao } from '@/dao'

const dao = CreateUserDao()

export default {
  namespaced: true,
  state () {
    return {
      id: '',
      email: '',
      displayName: '',
      isGuest: true
    }
  },

  getters: {
    isLogin: (state) => {
      return !!state.id
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
      if (user.isAnonymous !== undefined) {
        state.isGuest = user.isAnonymous
      }
      state.id = user.uid
      state.email = user.email
      state.displayName = user.displayName
    },

    resetUser (state) {
      state.isGuest = true
      state.id = ''
      state.email = ''
      state.displayName = ''
    }
  },

  actions: {
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
      return await dao.login()
    },

    async logout ({ commit }) {
      await dao.logout()
      commit('resetUser')
    }
  }
}

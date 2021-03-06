import { CreateConfigDao } from '@/dao'
import { Config } from '@/model/Config'

const dao = CreateConfigDao()

export default {
  namespaced: true,
  state () {
    return {
      config: new Config('', {})
    }
  },

  getters: {
    getConfig: (state) => {
      return state.config
    }
  },

  mutations: {
    init (state, config) {
      Object.assign(state.config, config)
    },

    update (state, config) {
      Object.assign(state.config, config)
    }
  },

  actions: {
    async init ({ commit, rootGetters }) {
      const userId = rootGetters['user/userId']
      const configList = await dao.getByUserId(userId)

      let config

      if (configList.length > 0) {
        config = configList[0]
      } else {
        const result = await dao.add(userId)
        if (result.isSuccess) {
          config = result.value
        }
      }

      commit('init', config)

      console.log('config init')
    },

    async updateMessage ({ state, commit }, message) {
      const config = { ...state.config } // copy
      config.globalMessage = message

      if (await dao.update(config)) {
        commit('update', config)
      }
    }
  }
}

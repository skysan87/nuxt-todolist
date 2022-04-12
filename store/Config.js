import { CreateConfigDao } from '@/dao'
import { Config } from '@/model/Config'

const dao = CreateConfigDao()

export const state = () => ({
  config: new Config('', {})
})

export const getters = {
  getConfig: (state) => {
    return state.config
  }
}

export const mutations = {
  init (state, config) {
    Object.assign(state.config, config)
  },

  update (state, config) {
    Object.assign(state.config, config)
  }
}

export const actions = {
  async init ({ commit, rootGetters }) {
    const userId = rootGetters['User/userId']
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

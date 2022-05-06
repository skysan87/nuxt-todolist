export const state = () => ({
  isMenuExpanded: false,
  subPanelName: ''
})

export const getters = {
  isMenuExpanded: (state) => {
    return state.isMenuExpanded
  },

  subPanelName: (state) => {
    return state.subPanelName
  }
}

export const mutations = {
  isMenuExpanded (state, value) {
    state.isMenuExpanded = value
  },

  subPanelName (state, componentName) {
    state.subPanelName = componentName
  }
}

export const actions = {
  isMenuExpanded ({ commit }, value) {
    commit('isMenuExpanded', value)
  },

  subPanelName ({ commit }, componentName) {
    commit('subPanelName', componentName)
  }
}

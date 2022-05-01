export const state = () => ({
  isMenuExpanded: false
})

export const getters = {
  isMenuExpanded: (state) => {
    return state.isMenuExpanded
  }
}

export const mutations = {
  isMenuExpanded (state, value) {
    state.isMenuExpanded = value
  }
}

export const actions = {
  isMenuExpanded ({ commit }, value) {
    commit('isMenuExpanded', value)
  }
}

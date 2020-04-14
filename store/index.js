/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'
import todo from '@/store/modules/Todo'
import todolist from '@/store/modules/Todolist'
import user from '@/store/modules/User'

Vue.use(Vuex)

// NOTE: モジュールモード?
export default() => new Vuex.Store({
  modules: {
    todo,
    todolist,
    user
  }
})

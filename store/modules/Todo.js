import orderBy from 'lodash/orderBy'
import { TaskState } from '@/util/TaskState'
import { TodayFilter } from '@/util/TodayFilter'
import { CreateTodoDao } from '@/dao'
import { getDateNumber } from '@/util/MomentEx'
import { Todo } from '@/model/Todo'

const dao = CreateTodoDao()

function getFilteredArray (array, option, isAllSelected) {
  if (isAllSelected === false) {
    return array.filter((el) => {
      return option.includes(el.state)
    })
  } else {
    // new array
    return array.concat()
  }
}

export default {
  namespaced: true,
  state () {
    return {
      todos: [],
      selectedState: [TaskState.Todo.value, TaskState.InProgress.value],
      canRemove: false,
      listId: ''
    }
  },

  getters: {
    // NOTE:引数あり=メソッドスタイルアクセスの場合、キャッシュされない
    getFilteredTodos: (state) => {
      const selectedCount = state.selectedState.length
      const selectAll = Object.values(TaskState).length === selectedCount
      const filterd = getFilteredArray(
        state.todos,
        state.selectedState,
        selectAll
      )
      return orderBy(filterd, ['type', 'listId', 'orderIndex'])
    },

    getOrderdTodos: (state) => {
      return orderBy(state.todos, ['type', 'listId', 'orderIndex'])
    },

    getTodoById: state => (id) => {
      const index = state.todos.findIndex(v => v.id === id)
      return state.todos[index]
    },

    getTaskCount: state => (taskState) => {
      return state.todos.filter((el) => {
        return taskState === -1 ? true : el.state === taskState
      }).length
    },

    canRemove: (state) => {
      return state.canRemove
    },

    getSelectedState: (state) => {
      return state.selectedState
    },

    getCurrentListId: (state) => {
      return state.listId
    }
  },

  // 状態の更新
  mutations: {
    init (state, payload) {
      state.selectedState = [TaskState.Todo.value, TaskState.InProgress.value]
      state.listId = payload.listId
      state.todos = payload.data
    },

    initToday (state, payload) {
      state.selectedState = payload.selectedState
      state.listId = ''
      state.todos = payload.data
    },

    add (state, payload) {
      state.todos.push(payload)
    },

    delete (state, id) {
      const index = state.todos.findIndex(v => v.id === id)
      state.todos.splice(index, 1)
    },

    update (state, payload) {
      const index = state.todos.findIndex(v => v.id === payload.id)
      Object.assign(state.todos[index], payload)
    },

    deleteDone (state) {
      const options = [TaskState.Todo.value, TaskState.InProgress.value]
      state.todos = getFilteredArray(state.todos, options, false)
    },

    changeFilter (state, payload) {
      state.selectedState = payload.data
    },

    switchEdit (state) {
      state.canRemove = !state.canRemove
    }
  },

  // データの加工、非同期処理
  actions: {
    async init ({ commit }, listId) {
      commit('init', { data: await dao.getTodos(listId), listId })
    },

    initNewList ({ commit }, listId) {
      commit('init', { data: [], listId })
    },

    async initTodaylist ({ commit, rootGetters }, todayFilterValue) {
      const userId = rootGetters['user/userId']
      const today = getDateNumber() // YYYYMMDD
      // 1. 今日の習慣をメモリgettersで取得
      const todaysHabits = rootGetters['habit/getTodayList']
      // 2. 習慣のToDoをサーバーから取得
      const habitTodo = await dao.getHabits(userId, today)
      // 3. 1と2を比較して、2が存在しないものは、追加する
      const missinglist = todaysHabits.reduce((pre, _habit) => {
        // Habit.id === Todo.listId
        if (habitTodo.findIndex(v => v.listId === _habit.id) < 0) {
          const todo = new Todo('', {})
          todo.type = 'habit'
          todo.listId = _habit.id // habitsのサブコレクションのId
          todo.userId = _habit.userId
          todo.title = _habit.title
          todo.detail = _habit.detail
          todo.startdate = today
          todo.enddate = today
          todo.orderIndex = _habit.orderIndex
          pre.push(todo)
        }
        return pre
      }, [])
      // 4. 追加
      if (missinglist.length > 0) {
        const newhabitToDo = await dao.addHabits(missinglist)
        habitTodo.push(...newhabitToDo)
      }

      const selectedState = []
      const todos = [...habitTodo]
      switch (todayFilterValue) {
        case TodayFilter.Remain.value:
          // 今日の残タスク
          selectedState.push(TaskState.Todo.value)
          todos.push(...await dao.getTodaysToDo(userId, today))
          break
        case TodayFilter.InProgress.value:
          // 作業中
          selectedState.push(TaskState.InProgress.value)
          todos.push(...await dao.getTodaysInProgress(userId, today))
          break
        case TodayFilter.Done.value:
          // 今日完了したタスク
          selectedState.push(TaskState.Done.value)
          todos.push(...await dao.getTodaysDone(userId, today))
          break
        default:
          break
      }
      commit('initToday', { data: todos, selectedState })
    },

    async changeOrder ({ commit, getters }, params) {
      const filtered = getters.getFilteredTodos
      const srcTodo = filtered[params.oldIndex]
      const destTodo = filtered[params.newIndex]

      const sorted = getters.getOrderdTodos
      const actualNewIndex = sorted.findIndex(v => v.id === destTodo.id)

      let prevOrderIndex, nextOrderIndex
      if (params.oldIndex > params.newIndex) {
        // 上へ移動
        // newIndexにあったアイテムは下に移動する
        if (actualNewIndex > 0) {
          prevOrderIndex = sorted[actualNewIndex - 1].orderIndex
        } else {
          prevOrderIndex = 1
        }
        nextOrderIndex = destTodo.orderIndex
      } else {
        // 下へ移動
        // newIndexにあったアイテムは上に移動する
        prevOrderIndex = destTodo.orderIndex
        if (filtered.length - 1 > actualNewIndex) {
          nextOrderIndex = sorted[actualNewIndex + 1].orderIndex
        } else {
          nextOrderIndex = Math.ceil(destTodo.orderIndex) + 1
        }
      }

      // NOTE: 並び替えは前後のorderから算出
      //  firebaseで複雑なsortができないため
      const newOrderIndex = (prevOrderIndex + nextOrderIndex) / 2

      if (newOrderIndex !== destTodo.orderIndex) {
        srcTodo.orderIndex = newOrderIndex
        if (await dao.update(srcTodo)) {
          commit('update', srcTodo)
        }
      }
    },

    async deleteDone ({ commit, state }) {
      if (await dao.deleteTodos(state.todos, TaskState.Done)) {
        commit('deleteDone')
      }
    },

    changeFilter ({ commit }, options) {
      commit('changeFilter', { data: options })
    },

    switchEdit ({ commit }) {
      commit('switchEdit')
    },

    async add ({ commit, state, rootGetters }, params) {
      const userId = rootGetters['user/userId']
      params.stateChangeDate = getDateNumber()
      const result = await dao.add(state.listId, params, userId)
      if (result.isSuccess) {
        commit('add', result.value)
      }
    },

    async delete ({ commit }, id) {
      if (await dao.delete(id)) {
        commit('delete', id)
      }
    },

    async update ({ commit, getters }, payload) {
      const lastTodo = getters.getTodoById(payload.id)
      if (lastTodo.state !== payload.state) {
        payload.stateChangeDate = getDateNumber()
      }

      if (await dao.update(payload)) {
        commit('update', payload)
      }
    },

    async changeState ({ commit, state, rootGetters }, id) {
      const index = state.todos.findIndex(v => v.id === id)
      if (index < 0) {
        return
      }

      const item = state.todos[index]
      let habitCounter = 0
      switch (item.state) {
        case TaskState.Todo.value:
          item.state = TaskState.InProgress.value
          break
        case TaskState.InProgress.value:
          habitCounter += 1
          item.state = TaskState.Done.value
          break
        case TaskState.Done.value:
          habitCounter -= 1
          item.state = TaskState.Todo.value
          break
      }
      item.stateChangeDate = getDateNumber()

      if (item.type === 'habit' && habitCounter !== 0) {
        const habitRootId = rootGetters['habit/getRootId']
        if (await dao.updateHabit(item, habitRootId, habitCounter)) {
          commit('update', item)
        }
      } else {
        if (await dao.update(item)) {
          commit('update', item)
        }
      }
    }
  }
}

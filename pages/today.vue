<template>
  <div class="flex flex-col bg-white overflow-hidden">
    <header class="border-b flex-none">
      <div class="px-6 py-2 flex flex-row">
        <div class="inline-block flex-1">
          <span>{{ dateString }}：表示中の件数 ( {{ filteredTodos.length }} )</span>
        </div>
      </div>
    </header>

    <main class="pt-2 pb-4 flex-1 overflow-y-scroll">
      <div v-if="filteredTodos.length > 0" class="ml-2 flex-grow overflow-x-hidden">
        <div class="list-group">
          <todo-item
            v-for="item in filteredTodos"
            :key="item.id"
            :todo="item"
            :option="{showPointer: false, showEdit: false}"
            class="list-group-item list-style"
            @edit="editTodo"
          />
        </div>
      </div>
      <no-data v-else />
    </main>
  </div>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import TodoItem from '@/components/TodoItem.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import NoData from '@/components/NoData.vue'
import { getStateColor } from '@/util/StateColor'
import { TaskState } from '@/util/TaskState'

const DialogController = Vue.extend(ModalDialog)

export default {
  layout: 'board',
  name: 'TodoList',
  components: {
    TodoItem,
    NoData
  },
  data () {
    moment.locale('ja')
    return {
      dialog: null,
      dateString: moment().format('YYYY年M月D日(ddd)')
    }
  },
  computed: {
    filteredTodos: {
      get () {
        return this.$store.getters['todo/getFilteredTodos']
      }
    }
  },
  methods: {
    /**
     * コメント編集
     */
    editTodo (id) {
      delete this.dialog

      const todo = this.$store.getters['todo/getTodoById'](id)
      todo.listName = this.$store.getters['todolist/getListName'](todo.listId)

      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: todo,
          isCreateMode: false
        }
      })
      this.dialog.$on('update', (todo) => {
        this.$store.dispatch('todo/update', todo)
      })
      this.dialog.$on('delete', (todoId) => {
        this.$store.dispatch('todo/delete', todoId)
      })
      this.dialog.$mount()
    },
    /**
     * 各ステータスのタスク数
     */
    todoCounts (state) {
      return this.$store.getters['todo/getTaskCount'](state)
    },
    /**
     * ステータスの色
     */
    badgeColor (state) {
      return getStateColor(state)
    }
  }
}
</script>

<style scoped>
.list-style {
  padding: 0.25rem 0.5rem;
  background-color: #faf9f9;
}

.list-group {
  padding: 0;
}

.list-group-item:first-child {
  border-top: 1px solid #979797;
}

.list-group-item {
  border-left: 1px solid #979797;
  border-right: 1px solid #979797;
  border-bottom: 1px solid #979797;
}

/* ステータスラベル */
.status-label {
  margin: 0 5px;
}
</style>

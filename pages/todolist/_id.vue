<template>
  <div class="flex flex-col bg-white h-full">
    <header class="border-b flex-none">
      <header-view />
    </header>
    <main class="pt-2 pb-4 flex-1 overflow-y-scroll">
      <div v-if="filteredTodos.length > 0" class="mx-2 overflow-x-hidden flex-grow">
        <div class="list-group">
          <draggable
            v-model="filteredTodos"
            handle=".move-icon"
            @end="onDragEnd"
          >
            <todo-item
              v-for="item in filteredTodos"
              :key="item.id"
              :todo="item"
              :option="{showPointer: editMode, showEdit: editMode}"
              class="list-group-item list-style"
              @edit="editTodo"
            />
          </draggable>
        </div>
      </div>
      <no-data v-else />
    </main>
    <footer class="px-2 py-2 bg-gray-500 flex-none">
      <input-task />
    </footer>
  </div>
</template>

<script>
import Vue from 'vue'
import draggable from 'vuedraggable'
import HeaderView from '@/components/HeaderView.vue'
import TodoItem from '@/components/TodoItem.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import InputTask from '@/components/InputTask.vue'
import NoData from '@/components/NoData.vue'
import { Todo } from '@/model/Todo'

const DialogController = Vue.extend(ModalDialog)

export default {
  name: 'TodoList',
  components: {
    draggable,
    TodoItem,
    HeaderView,
    InputTask,
    NoData
  },
  layout: ctx => ctx.$device.isMobile ? 'board_mobile' : 'board',
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    filteredTodos: {
      get () {
        return this.$store.getters['Todo/getFilteredTodos']
      },
      // eslint-disable-next-line
      set(value) {
        // vuedraggable用
      }
    },
    editMode: {
      get () {
        return this.$store.getters['Todo/canRemove']
      }
    }
  },
  mounted () {
    this.$store.dispatch('Todo/init', this.$route.params.id)
  },
  methods: {
    /**
     * コメント編集
     */
    editTodo (id) {
      delete this.dialog

      const todo = this.$store.getters['Todo/getTodoById'](id)
      const list = this.$store.getters['Todolist/getLists']

      if (todo.type === Todo.TYPE.HABIT) {
        const habit = this.$store.getters['Habit/getById'](todo.listId)
        if (!habit) {
          console.error('対象の習慣はすでに削除されています')
          this.$toast.error('更新できません')
          return
        }
      }

      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: todo,
          isCreateMode: false,
          projectList: list
        }
      })
      this.dialog.$on('update', (todo) => {
        this.$store.dispatch('Todo/update', todo)
          .then(() => {
            this.$toast.success('更新しました')
          })
          .catch((error) => {
            this.$toast.error(error.message)
          })
      })
      this.dialog.$on('delete', (todoId) => {
        this.$store.dispatch('Todo/delete', todoId)
      })
      this.dialog.$mount()
    },
    /**
     * ドラッグ終了時
     */
    onDragEnd (ev) {
      if (!this.editMode) {
        return
      }
      // filteredTodosはすでに並び替えられている
      if (ev.oldIndex === ev.newIndex) {
        return
      }
      const params = {
        oldIndex: ev.oldIndex,
        newIndex: ev.newIndex
      }
      this.$store.dispatch('Todo/changeOrder', params)
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

/* ドラッグするアイテム */
.sortable-chosen {
  opacity: 0.3;
}

.sortable-ghost {
  background-color: #979797;
}

/* ステータスラベル */
.status-label {
  margin: 0 5px;
}
</style>

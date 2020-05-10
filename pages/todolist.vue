<template>
  <div class="flex-1 flex flex-col bg-white">
    <header class="border-b flex-none">
      <!-- TODO: リスト名 -->
      <header-view />
    </header>
    <main class="flex-1 pt-2 overflow-y-scroll">
      <div class="h-full flex flex-col ml-6">
        <div class="flex-grow overflow-x-hidden">
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
                class="list-group-item list-style"
                @edit="editComment"
              />
            </draggable>
          </div>
        </div>
      </div>
    </main>
    <footer class="px-2 py-2 flex-none bg-gray-500">
      <input-task />
    </footer>
    <modal-dialog v-show="isModal" ref="dialog" @close="closeModal" />
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import HeaderView from '@/components/HeaderView.vue'
import TodoItem from '@/components/TodoItem.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import InputTask from '@/components/InputTask.vue'
import { getStateColor } from '@/util/StateColor'
import { TaskState } from '@/util/TaskState'

export default {
  layout: 'board',
  name: 'TodoList',
  components: {
    draggable,
    TodoItem,
    HeaderView,
    ModalDialog,
    InputTask
  },
  data () {
    return {
      isModal: false
    }
  },
  computed: {
    filteredTodos: {
      get () {
        return this.$store.getters['todo/getFilteredTodos']
      },
      // eslint-disable-next-line
      set(value) {
        // vuedraggable用
      }
    }
  },
  methods: {
    /**
     * コメント編集
     */
    editComment (id) {
      this.isModal = true
      this.$refs.dialog.open(id)
    },
    closeModal () {
      this.isModal = false
    },
    /**
     * ドラッグ終了時
     */
    onDragEnd (ev) {
      // filteredTodosはすでに並び替えられている
      if (ev.oldIndex === ev.newIndex) {
        return
      }
      const params = {
        oldIndex: ev.oldIndex,
        newIndex: ev.newIndex
      }
      this.$store.dispatch('todo/changeOrder', params)
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
.container {
  @apply min-h-screen mx-auto;
}

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

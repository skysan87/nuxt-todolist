<template>
  <div class="flex-1 flex flex-col bg-white">
    <header class="border-b flex px-6 py-2 items-center flex-none">
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
    <footer class="px-4 py-2 flex-none">
      <div class="flex rounded-lg border-2 border-grey overflow-hidden">
        <form class="w-full" @submit.prevent="doAdd">
          <input id="comment" ref="comment" type="text" class="input-comment" placeholder="Add New Task...">
        </form>
      </div>
    </footer>
    <modal-dialog v-show="isModal" ref="dialog" @close="closeModal" />
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import HeaderView from '@/components/HeaderView.vue'
import TodoItem from '@/components/TodoItem.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { getStateColor } from '@/util/StateColor'
import { TaskState } from '@/util/TaskState'

export default {
  layout: 'board',
  name: 'TodoList',
  components: {
    draggable,
    TodoItem,
    HeaderView,
    ModalDialog
  },
  data () {
    return {
      options: Object.values(TaskState),
      isAllSelected: false,
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
  created () {
    // TODO: 動作確認用 あとで消す
    this.$store.dispatch('todolist/init')
  },
  methods: {
    /**
     * todoを追加する
     */
    // eslint-disable-next-line
    doAdd: function (event, value) {
      const comment = this.$refs.comment
      if (!comment.value.length) { return }

      this.$store.dispatch('todo/add', comment.value)

      comment.value = ''
    },
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

.fix-top {
  top: 0;
  left: 0;
  position: fixed;
  width: 100%;
  height: 120px;
}

.list-style {
  padding: 0.25rem 0.5rem;
  background-color: #faf9f9;
}

.main-content {
  padding-top: 120px;
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

.input-comment {
  @apply px-2 py-1 !important;
  @apply shadow appearance-none border w-full mr-1 outline-none;
}
</style>

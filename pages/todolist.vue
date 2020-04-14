<template>
  <div class="container">
    <header-View class="fix-top" />

    <div class="main-content">
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

    <!-- <modal-dialog ref="dialog"></modal-dialog> -->
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import HeaderView from '@/components/HeaderView.vue'
import TodoItem from '@/components/TodoItem.vue'
// import ModalDialog from '@/components/ModalDialog.vue'
import { getStateColor } from '@/util/StateColor'
import { TaskState } from '@/util/TaskState'

export default {
  // layout: 'todolist',
  name: 'TodoList',
  components: {
    draggable,
    TodoItem,
    HeaderView
    // ModalDialog
  },
  data () {
    return {
      options: Object.values(TaskState),
      isAllSelected: false,
      editingItem: null
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
     * コメント編集
     */
    editComment (id) {
      this.$refs.dialog.open(id)
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
  height: 100px;
}

.list-style {
  padding: 0.25rem 0.5rem;
  background-color: #faf9f9;
}

.main-content {
  padding-top: 100px;
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

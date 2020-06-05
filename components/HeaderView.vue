<template>
  <div class="w-full flex items-center justify-center h-10">
    <label>
      <input v-model="isAllSelected" type="checkbox" @click="selectAll">
      <span class="p-1 align-middle">All</span>
      <span class="badge" :class="badgeColor(-1)">
        {{ todoCounts(-1) }}
      </span>
    </label>
    <label v-for="viewOp in options" :key="viewOp.value">
      <input v-model="filterOption" class="ml-2" type="checkbox" :value="viewOp.value" @change="filterChanged">
      <span class="p-1 align-middle">{{ viewOp.label }}</span>
      <span class="badge" :class="badgeColor(viewOp.value)">
        {{ todoCounts(viewOp.value) }}
      </span>
    </label>
    <button
      class="btn btn-outline btn-clear-done ml-2"
      @click="deleteDone"
    >
      Clear Done
    </button>
    <button
      class="btn btn-outline btn-switch-edit ml-2"
      :class="{'switch-on': canRemove}"
      @click="switchRemoveButton"
    >
      Edit
    </button>
  </div>
</template>

<script>
import { TaskState } from '@/util/TaskState'
import { getStateColor } from '@/util/StateColor'

export default {
  name: 'HeaderView',
  data () {
    return {
      options: Object.values(TaskState),
      filterOption: this.$store.getters['todo/getSelectedState'],
      isAllSelected: false
    }
  },
  computed: {
    canRemove () {
      return this.$store.getters['todo/canRemove']
    }
  },
  methods: {
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
    },
    /**
     * すべて表示
     */
    selectAll () {
      // イベント発生時,値は更新されていない
      if (this.isAllSelected === false) {
        this.filterOption = []
        this.options.forEach(op => this.filterOption.push(op.value))
      } else {
        this.filterOption = []
      }
      this.$store.dispatch('todo/changeFilter', this.filterOption)
    },
    filterChanged () {
      this.isAllSelected = this.options.length === this.filterOption.length
      this.$store.dispatch('todo/changeFilter', this.filterOption)
    },
    /**
     * 完了済みのタスクを削除
     */
    deleteDone () {
      this.$store.dispatch('todo/deleteDone')
    },
    switchRemoveButton () {
      this.$store.dispatch('todo/switchEdit')
    }
  }
}
</script>

<style scoped>
.input-form {
  display: flex;
  width: 100%;
  padding: 15px 15px 5px 15px;
  max-width: 720px;
  margin: 0 auto;
}

.badge {
  display: inline-block;
  padding: 2px 5px;
  text-align: center;
  border-radius: .25rem;
  vertical-align: baseline;
  font-size: 75%;
  white-space: nowrap;
  font-weight: bold;
}

.btn-switch-edit {
  @apply text-green-500 border border-green-500 outline-none;
}

.btn-switch-edit:hover {
  @apply bg-green-500 text-white border-transparent;
}

.switch-on {
  @apply bg-green-500 text-white border-transparent;
}

.btn-clear-done {
  @apply text-red-500 border border-red-500 outline-none;
}

.btn-clear-done:hover {
  @apply bg-red-500 text-white border-transparent;
}
</style>

<template>
  <div class="header-container">
    <!-- 登録フォーム -->
    <form class="input-form" @submit.prevent="doAdd">
      <label class="form-label" for="comment">Todo</label>
      <input id="comment" ref="comment" class="input-comment flex-grow-1" type="text">
      <button type="submit" class="btn-regular">
        OK
      </button>
    </form>

    <div class="status-boxes">
      <label>
        <input v-model="isAllSelected" type="checkbox" @click="selectAll">
        <span class="status-label">All</span>
        <span class="badge" :class="badgeColor(-1)">
          {{ todoCounts(-1) }}
        </span>
      </label>
      <label v-for="viewOp in options" :key="viewOp.value">
        <input v-model="filterOption" type="checkbox" :value="viewOp.value" @change="filterChanged">
        <span class="status-label">{{ viewOp.label }}</span>
        <span class="badge" :class="badgeColor(viewOp.value)">
          {{ todoCounts(viewOp.value) }}
        </span>
      </label>
      <button
        class="btn-clear-done"
        @click="deleteDone"
      >
        Clear Done
      </button>
      <button class="modal-btn btn-switch-green" :class="{'switch-on': canRemove}" @click="switchRemoveButton">
        Edit
      </button>
    </div>
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
      filterOption: this.$store.getters.getSelectedState,
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
      if (this.isAllSelected) {
        this.filterOption = []
        this.options.forEach(op => this.filterOption.push(op.value))
      } else {
        this.filterOption = []
      }
      this.$store.dispatch('changeFilter', this.filterOption)
    },
    filterChanged () {
      this.isAllSelected = this.options.length === this.filterOption.length
      this.$store.dispatch('changeFilter', this.filterOption)
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

<style>
@import '@/assets/css/common.css';

.header-container {
  padding: 0 15px;
  text-align: center;
  background: white;
}

.input-form {
  display: flex;
  width: 100%;
  padding: 15px 15px 5px 15px;
  max-width: 720px;
  margin: 0 auto;
}

.form-label {
  display: flex;
  font-size: 1rem;
  border: 1px solid #979797;
  background: #faf9f9;
  line-height: 1.5;
  padding: .25rem .5rem;
  text-align: center;
  vertical-align: baseline;
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

.status-boxes {
  display: flex;
  justify-content: center;
}

.status-boxes label {
  padding: .5rem;
}

/* ステータスラベル */
.status-label {
  margin: 0 5px;
}

.btn-switch-green {
  margin: .25rem;
  @apply bg-transparent;
  @apply text-green-500;
  @apply font-semibold;
  @apply py-2 px-2;
  @apply border border-green-500;
}

.switch-on {
  @apply bg-green-500 text-white border-transparent;
}

.btn-clear-done {
  margin: .25rem;
  @apply bg-transparent;
  @apply text-red-500;
  @apply font-semibold;
  @apply py-2 px-2;
  @apply border border-red-500;
}
.btn-clear-done:hover {
  @apply bg-red-500 text-white border-transparent;
}
</style>

<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container max-w-2xl">
        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />

        <div class="modal-body">
          <label class="input-label">タイトル</label>
          <input
            ref="refTitle"
            v-model="habit.title"
            class="input-text"
            :class="{'border border-red-500': errorMsg.title !== ''}"
            type="text"
          >
          <p class="text-red-500 text-xs italic">
            <span>{{ errorMsg.title }}</span>
          </p>
        </div>

        <div class="modal-body">
          <label class="input-label">説明</label>
          <textarea v-model="habit.detail" class="input-textarea resize-none" maxlength="1000" rows="6" />
        </div>

        <div class="modal-body">
          <label class="input-label">頻度</label>
          <div>
            <label>
              <input v-model="habit.frequency" name="frequency" type="radio" :value="FREQ_DAILY">
              <span>毎日</span>
            </label>
          </div>
          <div>
            <label>
              <input v-model="habit.frequency" name="frequency" type="radio" :value="FREQ_WEEKLY">
              <span>毎週</span>
            </label>
            <label v-for="(label, id) in weekdays" v-show="habit.frequency === FREQ_WEEKLY" :key="id" class="mx-1">
              <input v-model="habit.weekdays" type="checkbox" :value="id">
              <span class="p-1 align-middle">{{ label }}</span>
            </label>
          </div>
          <p class="text-red-500 text-xs italic">
            <span>{{ errorMsg.frequency }}</span>
          </p>
        </div>

        <div class="modal-body">
          <label class="input-label">有効</label>
          <input v-model="habit.isActive" type="checkbox">
        </div>

        <div class="flex flex-row-reverse">
          <button class="btn btn-regular mx-1" @click="update">
            OK
          </button>
          <button class="btn btn-outline mx-1" @click="cancel">
            Cancel
          </button>
          <button v-if="!isCreateMode" class="btn btn-red-outline mx-1" @click="deleteHabit">
            Delete
          </button>
        </div>

        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import { TaskState } from '@/util/TaskState'
import { Habit } from '@/model/Habit'

export default {
  name: 'HabitDialog',
  props: {
    parent: {
      type: Element,
      require: true
    },
    target: {
      type: Habit,
      require: true
    },
    isCreateMode: {
      type: Boolean,
      require: true
    }
  },
  data () {
    return {
      habit: new Habit('', {}),
      errorMsg: { title: '', frequency: '' },
      weekdays: Habit.WEEKDAYS,
      FREQ_DAILY: Habit.FREQ_DAILY,
      FREQ_WEEKLY: Habit.FREQ_WEEKLY
    }
  },
  mounted () {
    this.parent.appendChild(this.$el)
    this.$nextTick(() => {
      this.$el.focus()
      this.init()
      this.$refs.refTitle.focus()
      document.addEventListener('focusin', this.checkFocus, false)
    })
  },
  destroyed () {
    document.removeEventListener('focusin', this.checkFocus, false)
    this.$el.remove()
  },
  methods: {
    init () {
      Object.assign(this.habit, this.target)
      this.errorMsg = { title: '', frequency: '' }
    },
    update () {
      if (this.habit.frequency === Habit.FREQ_DAILY) {
        this.habit.weekdays = []
      }
      if (!this.validate()) {
        return
      }
      if (this.isCreateMode) {
        this.$emit('add', this.habit)
      } else {
        this.$emit('update', this.habit)
      }
      this.$destroy()
    },
    cancel () {
      this.$destroy()
    },
    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.refTitle.focus()
      }
    },
    deleteHabit () {
      this.$emit('delete', this.habit)
      this.$destroy()
    },
    validate () {
      let valid = true
      this.errorMsg = { title: '', frequency: '' }

      if (isEmpty(this.habit.title)) {
        valid = false
        this.errorMsg.title = '必須項目です'
      }
      if (this.habit.frequency === Habit.FREQ_WEEKLY &&
        this.habit.weekdays.length === 0) {
        valid = false
        this.errorMsg.frequency = '1つ以上選択してください'
      }
      return valid
    }
  }
}
</script>

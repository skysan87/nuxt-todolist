<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container max-w-2xl">
          <!-- フォーカスアウト防止 -->
          <div v-focusin="checkFocus" tabindex="0" class="dummy" />

          <div class="modal-body">
            <label class="input-label">タイトル</label>
            <input
              ref="refTitle"
              v-model="title"
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
            <textarea v-model="detail" class="input-textarea resize-none" maxlength="1000" rows="6" />
          </div>

          <div class="modal-body">
            <label class="input-label">頻度</label>
            <div>
              <label>
                <input v-model="frequency" name="frequency" type="radio" :value="FREQ_DAILY">
                <span>毎日</span>
              </label>
            </div>
            <div>
              <label>
                <input v-model="frequency" name="frequency" type="radio" :value="FREQ_WEEKLY">
                <span>毎週</span>
              </label>
              <label v-for="(label, id) in weekdays" v-show="frequency === FREQ_WEEKLY" :key="id" class="mx-1">
                <input v-model="selectedWeekDays" type="checkbox" :value="id">
                <span class="p-1 align-middle">{{ label }}</span>
              </label>
            </div>
            <p class="text-red-500 text-xs italic">
              <span>{{ errorMsg.frequency }}</span>
            </p>
          </div>

          <div class="modal-body">
            <label class="input-label">有効</label>
            <input v-model="isActive" type="checkbox">
          </div>

          <div class="flex flex-row-reverse">
            <button class="btn btn-regular mx-1" @click="update">
              OK
            </button>
            <button class="btn btn-outline mx-1" @click="cancel">
              Cancel
            </button>
            <button v-if="!isCreateMode" class="btn btn-outline mx-1" @click="deleteHabit">
              Delete
            </button>
          </div>

          <!-- フォーカスアウト防止 -->
          <div v-focusin="checkFocus" tabindex="0" class="dummy" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import { TaskState } from '@/util/TaskState'
import { Habit } from '@/model/Habit'

export default {
  name: 'HabitDialog',
  data () {
    return {
      habit: null,
      title: '',
      detail: '',
      isActive: true,
      errorMsg: { title: '', frequency: '' },
      weekdays: Habit.WEEKDAYS,
      selectedWeekDays: [],
      frequency: Habit.FREQ_DAILY,
      isCreateMode: false,
      FREQ_DAILY: Habit.FREQ_DAILY,
      FREQ_WEEKLY: Habit.FREQ_WEEKLY
    }
  },
  methods: {
    open (id = null) {
      this.isCreateMode = isEmpty(id)

      if (this.isCreateMode) {
        this.habit = new Habit('', {})
      } else {
        this.habit = this.$store.getters['habit/getById'](id)
      }

      this.title = this.habit.title
      this.detail = this.habit.detail
      this.isActive = this.habit.isActive
      this.selectedWeekDays = this.habit.weekdays
      this.frequency = this.habit.frequency
      this.errorMsg = { title: '', frequency: '' }

      this.$nextTick(() => {
        this.$refs.refTitle.focus()
      })
    },
    update () {
      if (!this.validate()) {
        return
      }
      this.habit.title = this.title
      this.habit.detail = this.detail
      this.habit.frequency = this.frequency
      this.habit.weekdays = this.frequency === Habit.FREQ_WEEKLY ? this.selectedWeekDays : []
      this.habit.isActive = this.isActive
      this.habit.rootId = this.$store.getters['habit/getRootId']

      if (this.isCreateMode) {
        this.$store.dispatch('habit/add', this.habit)
      } else {
        this.$store.dispatch('habit/update', this.habit)
      }
      this.$emit('close')
    },
    cancel () {
      this.$emit('close')
    },
    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.refTitle.focus()
      }
    },
    deleteHabit () {
      this.$store.dispatch('habit/delete', this.habit)
      this.$emit('close')
    },
    validate () {
      let valid = true
      this.errorMsg = { title: '', frequency: '' }

      if (isEmpty(this.title)) {
        valid = false
        this.errorMsg.title = '必須項目です'
      }

      if (this.frequency === Habit.FREQ_WEEKLY &&
        this.selectedWeekDays.length === 0) {
        this.errorMsg.frequency = '1つ以上選択してください'
      }
      return valid
    }
  }
}
</script>

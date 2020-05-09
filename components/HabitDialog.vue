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
            <label class="input-label">期限</label>
            <div class="flex">
              <v-date-picker
                v-model="deadline"
                :popover="{ placement: 'bottom', visibility: 'click' }"
              >
                <input
                  slot-scope="{ inputProps, inputEvents }"
                  class="input-text"
                  :class="{'border border-red-500': errorMsg.deadline !== ''}"
                  v-bind="inputProps"
                  v-on="inputEvents"
                >
              </v-date-picker>
              <button type="button" class="btn btn-outline" @click="deadline = null">
                Clear
              </button>
            </div>
            <p class="text-red-500 text-xs italic">
              <span>{{ errorMsg.deadline }}</span>
            </p>
          </div>

          <div class="modal-body">
            <label class="input-label">頻度</label>
            <div>
              <label>
                <input v-model="frequency" name="frequency" type="radio" value="daily">
                <span>毎日</span>
              </label>
            </div>
            <div>
              <label>
                <input v-model="frequency" name="frequency" type="radio" value="weekly">
                <span>毎週</span>
              </label>
              <label v-for="(label, id) in weekdays" v-show="frequency === 'weekly'" :key="id" class="mx-1">
                <input v-model="selectedWeekDays" type="checkbox" :value="id">
                <span class="p-1 align-middle">{{ label }}</span>
              </label>
            </div>
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
            <!-- <button class="btn btn-outline mx-1" @click="deleteTodo">
              Delete
            </button> -->
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
import { TaskState } from '@/util/TaskState'

export default {
  name: 'HabitDialog',
  data () {
    return {
      target: null,
      title: '',
      detail: '',
      deadline: null,
      isActive: true,
      errorMsg: { title: '', deadline: '' },
      weekdays: { 0: '日', 1: '月', 2: '火', 3: '水', 4: '木', 5: '金', 6: '土' },
      selectedWeekDays: [],
      frequency: 'daily'
    }
  },
  methods: {
    open () {
      this.title = ''
      this.detail = ''
      this.deadline = null
      this.isActive = true
      this.errorMsg = { title: '', deadline: '' }
      this.$nextTick(() => {
        this.$refs.refTitle.focus()
      })
    },
    update () {
      this.errorMsg = { title: '', deadline: '' }
      if (this.validate()) {
        // this.target.title = this.title
        // this.target.detail = this.detail
        // if (this.deadline !== null || this.deadline !== '') {
        //   this.target.deadline = moment(this.deadline).endOf('days').toJSON()
        // }
        // this.$store.dispatch('todo/update', this.target)
        this.$emit('close')
      }
    },
    cancel () {
      this.$emit('close')
    },
    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.refTitle.focus()
      }
    },
    deleteTodo () {
      // this.$store.dispatch('todo/delete', this.target.id)
      this.$emit('close')
    },
    validate () {
      let valid = true

      if (this.title === '') {
        valid = false
        this.errorMsg.title = '必須項目です'
      }

      const today = moment()
      if (this.deadline !== null &&
        moment(this.deadline).isBefore(today, 'day')) {
        valid = false
        this.errorMsg.deadline = '日付が本日より過去です'
      }
      return valid
    }
  }
}
</script>

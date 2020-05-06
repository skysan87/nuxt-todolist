<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container max-w-2xl">
          <!-- フォーカスアウト防止 -->
          <div v-focusin="checkFocus" tabindex="0" class="dummy" />

          <div class="modal-body">
            <label class="input-label">ステータス</label>
            <div class="flex justify-evenly">
              <label v-for="viewOp in options" :key="viewOp.value">
                <input v-model="state" type="radio" :value="viewOp.value">
                <span class="ml-2 align-middle">{{ viewOp.label }}</span>
              </label>
            </div>
          </div>

          <div class="modal-body">
            <label class="input-label">タイトル</label>
            <input
              ref="modalComment"
              v-model="comment"
              class="input-text"
              :class="{'border border-red-500': errorMsg !== ''}"
              type="text"
            >
            <p v-show="(errorMsg !== '')" class="text-red-500 text-xs italic">
              {{ errorMsg }}
            </p>
          </div>
          <div class="modal-body">
            <label class="input-label">説明</label>
            <textarea v-model="note" class="input-textarea resize-none" maxlength="1000" rows="6" />
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
                  v-bind="inputProps"
                  v-on="inputEvents"
                >
              </v-date-picker>
              <button type="button" class="btn btn-outline" @click="deadline = null">
                Clear
              </button>
            </div>
          </div>

          <div class="flex flex-row-reverse">
            <button class="btn btn-regular mx-1" @click="update">
              OK
            </button>
            <button class="btn btn-outline mx-1" @click="cancel">
              Cancel
            </button>
            <button class="btn btn-outline mx-1" @click="deleteTodo">
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
import { TaskState } from '@/util/TaskState'

export default {
  name: 'ModalDialog',
  data () {
    return {
      target: null,
      comment: '',
      note: '',
      state: '',
      options: Object.values(TaskState),
      deadline: null,
      errorMsg: ''
    }
  },
  methods: {
    open (id) {
      this.target = this.$store.getters['todo/getTodoById'](id)

      if (this.target !== null) {
        this.comment = this.target.comment
        this.note = this.target.note
        this.state = this.target.state
        this.deadline = moment(this.target.deadline).toDate()
      } else {
        this.comment = ''
        this.note = ''
        this.state = TaskState.Todo.value
        this.deadline = null
      }

      this.errorMsg = ''
      this.$nextTick(() => {
        this.$refs.modalComment.focus()
      })
    },
    update () {
      if (this.comment !== '') {
        this.errorMsg = ''
        this.target.comment = this.comment
        this.target.note = this.note
        this.target.state = this.state
        this.target.deadline = moment(this.deadline).endOf('days').toJSON()
        this.$store.dispatch('todo/update', this.target)
        this.$emit('close')
      } else {
        this.errorMsg = '必須項目です'
      }
    },
    cancel () {
      this.$emit('close')
    },
    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.modalComment.focus()
      }
    },
    deleteTodo () {
      this.$store.dispatch('todo/delete', this.target.id)
      this.$emit('close')
    }
  }
}
</script>

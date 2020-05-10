<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container max-w-2xl">
        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />

        <div class="modal-body">
          <label class="input-label">ステータス</label>
          <div class="flex justify-evenly">
            <label v-for="viewOp in options" :key="viewOp.value">
              <input v-model="todo.state" type="radio" :value="viewOp.value">
              <span class="ml-2 align-middle">{{ viewOp.label }}</span>
            </label>
          </div>
        </div>

        <div class="modal-body">
          <label class="input-label">タイトル</label>
          <input
            ref="modalComment"
            v-model="todo.comment"
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
          <textarea v-model="todo.note" class="input-textarea resize-none" maxlength="1000" rows="6" />
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
          <button class="btn btn-red-outline mx-1" @click="deleteTodo" v-if="!isCreateMode">
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
import { Todo } from '@/model/Todo'

export default {
  name: 'ModalDialog',
  props: {
    parent: {
      type: Element,
      require: true
    },
    target: {
      type: Todo,
      require: true
    },
    isCreateMode: {
      type: Boolean,
      require: true
    }
  },
  data () {
    return {
      todo: new Todo('', {}),
      deadline: null,
      options: Object.values(TaskState),
      errorMsg: ''
    }
  },
  mounted () {
    this.parent.appendChild(this.$el)
    this.$nextTick(() => {
      this.$el.focus()
      this.init()
      document.addEventListener('focusin', this.checkFocus, false)
    })
  },
  destroyed () {
    document.removeEventListener('focusin', this.checkFocus, false)
    this.$el.remove()
  },
  methods: {
    init () {
      if (this.target !== null) {
        Object.assign(this.todo, this.target)
      }
      this.deadline = moment(this.target.deadline).toDate()
      this.$refs.modalComment.focus()
    },
    update () {
      this.errorMsg = ''
      if (isEmpty(this.todo.comment)) {
        this.errorMsg = '必須項目です'
      } else {
        this.todo.deadline = moment(this.deadline).endOf('days').toJSON()
        if (this.isCreateMode) {
          this.$emit('add', this.todo)
        } else {
          this.$emit('update', this.todo)
        }
        this.$destroy()
      }
    },
    cancel () {
      this.$destroy()
    },
    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.modalComment.focus()
      }
    },
    deleteTodo () {
      this.$emit('delete', this.todo.id)
      this.$destroy()
    }
  }
}
</script>

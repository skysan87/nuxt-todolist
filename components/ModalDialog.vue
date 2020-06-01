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
            ref="title"
            v-model="todo.title"
            class="input-text"
            :class="{'border border-red-500': errorMsg !== '', 'btn-disabled': forbid.title}"
            type="text"
            :disabled="forbid.title"
          >
          <p v-show="(errorMsg !== '')" class="text-red-500 text-xs italic">
            {{ errorMsg }}
          </p>
        </div>
        <div class="modal-body">
          <label class="input-label">説明</label>
          <textarea
            v-model="todo.detail"
            class="input-textarea resize-none"
            maxlength="1000"
            rows="6"
            :class="{'btn-disabled': forbid.detail}"
            :disabled="forbid.detail"
          />
        </div>
        <div class="modal-body">
          <label class="input-label">期間</label>
          <div class="flex">
            <v-date-picker
              v-model="range"
              mode="range"
              class="flex-1"
              :popover="{ placement: 'top', visibility: 'click' }"
              :disabled="forbid.range"
            >
              <input
                slot-scope="{ inputProps, inputEvents }"
                class="input-text"
                v-bind="inputProps"
                :class="{'btn-disabled': forbid.range}"
                :disabled="forbid.range"
                v-on="inputEvents"
              >
            </v-date-picker>
            <button
              type="button"
              class="btn btn-outline flex-none"
              tabindex="-1"
              :disabled="forbid.range"
              :class="{'btn-disabled': forbid.range}"
              @click="range = null"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="flex flex-row-reverse">
          <button class="btn btn-regular ml-2" @click="update">
            OK
          </button>
          <button class="btn btn-outline ml-2" @click="cancel">
            Cancel
          </button>
          <button
            v-if="!isCreateMode"
            class="btn btn-red-outline ml-2"
            :disabled="forbid.delete"
            :class="{'btn-disabled': forbid.delete}"
            @click="deleteTodo"
          >
            Delete
          </button>
          <span class="text-sm text-gray-600 flex-1">{{ footerMsg }}</span>
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
import { getDateNumber } from '@/util/MomentEx'

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
      range: { start: null, end: null },
      options: Object.values(TaskState),
      errorMsg: '',
      forbid: {
        title: false,
        detail: false,
        range: false,
        delete: false
      },
      footerMsg: ''
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
      this.range = {
        start: this.todo.startdate !== null ? moment(this.todo.startdate.toString()).toDate() : null,
        end: this.todo.enddate !== null ? moment(this.todo.enddate.toString()).toDate() : null
      }

      // 編集の禁止
      if (this.todo.type === 'habit') {
        this.forbid.title = true
        this.forbid.detail = true
        this.forbid.range = true
        this.forbid.delete = true
        this.footerMsg = '習慣の内容は編集出来ません。'
      }

      this.$refs.title.focus()
    },
    update () {
      this.errorMsg = ''
      if (isEmpty(this.todo.title)) {
        this.errorMsg = '必須項目です'
      } else {
        if (this.range === null || this.range.start === null || this.range.end === null) {
          this.todo.startdate = null
          this.todo.enddate = null
        } else {
          this.todo.startdate = getDateNumber(moment(this.range.start))
          this.todo.enddate = getDateNumber(moment(this.range.end))
        }
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
        this.$refs.title.focus()
      }
    },
    deleteTodo () {
      this.$emit('delete', this.todo.id)
      this.$destroy()
    }
  }
}
</script>

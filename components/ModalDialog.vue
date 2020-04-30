<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <!-- フォーカスアウト防止 -->
          <div tabindex="0" class="dummy" v-focusin="checkFocus" />

          <div class="modal-body">
            <div class="status-labels">
              <label v-for="viewOp in options" :key="viewOp.value" class="status-label">
                <input v-model="state" type="radio" :value="viewOp.value">
                <span class="">{{ viewOp.label }}</span>
              </label>
            </div>
          </div>

          <div class="modal-body">
            <input ref="modalComment" v-model="comment" class="input-text" type="text">
          </div>
          <div class="modal-body">
            <textarea v-model="note" class="detail" maxlength="1000" rows="6" />
          </div>

          <div class="modal-footer">
            <button class="btn-regular modal-default-button" @click="update">
              OK
            </button>
            <button class="btn-default modal-default-button" @click="cancel">
              Cancel
            </button>
            <button class="btn-default modal-default-button" @click="deleteTodo">
              Delete
            </button>
          </div>

          <!-- フォーカスアウト防止 -->
          <div tabindex="0" class="dummy" v-focusin="checkFocus" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { TaskState } from '@/util/TaskState'

export default {
  name: 'ModalDialog',
  data () {
    return {
      target: null,
      comment: '',
      note: '',
      state: '',
      options: Object.values(TaskState)
    }
  },
  methods: {
    open (id) {
      this.target = this.$store.getters['todo/getTodoById'](id)

      if (this.target !== null) {
        this.comment = this.target.comment
        this.note = this.target.note
        this.state = this.target.state
      }
    },
    update () {
      this.target.comment = this.comment
      this.target.note = this.note
      this.target.state = this.state
      this.$store.dispatch('todo/update', this.target)
      this.$emit('close')
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

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.1s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 80%;
  min-height: 300px;
  margin: 0 auto;
  padding: 10px 10px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-body {
  margin: 10px 0;
}

.modal-footer {
  margin: 5px 0;
  height: 20px;
}

.input-text {
  width: 100%;
  line-height: 1.5;
  border: 2px solid #0a0;
  font-size: 14px;
}

.detail {
  width: 100%;
  resize: none;
  padding: 5px 5px;
  font-size: 14px;
  line-height: 1.5;
  border: 2px solid #0a0;
}

.modal-default-button {
  margin-left: 10px;
  float: right;
}

.status-label span {
  margin: 0 5px;
}

.status-labels {
  display: flex;
  justify-content: space-evenly;
}

/* transition="modal"に適用される */
.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>

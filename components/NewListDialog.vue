<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <!-- フォーカスアウト防止 -->
          <div v-focusin="checkFocus" tabindex="0" class="dummy" />

          <div class="modal-body">
            <input
              ref="inputField"
              v-model="inputText"
              class="input-text"
              :class="{'border border-red-500': errorMsg !== ''}"
              type="text"
              placeholder="Add New List Title..."
            >
            <p v-show="(errorMsg !== '')" class="text-red-500 text-xs italic">
              {{ errorMsg }}
            </p>
          </div>

          <div class="modal-footer">
            <button class="btn-regular modal-default-button" @click="update">
              OK
            </button>
            <button class="btn-default modal-default-button" @click="cancel">
              Cancel
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
export default {
  name: 'NewListDialog',
  props: {
    title: String
  },
  data () {
    return {
      inputText: '',
      errorMsg: ''
    }
  },
  methods: {
    open (id) {
      this.inputText = ''
      this.errorMsg = ''
    },
    update () {
      // TODO: バリデーション
      if (this.inputText !== '') {
        this.errorMsg = ''
        this.$store.dispatch('todolist/add', this.inputText)
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
        this.$refs.inputField.focus()
      }
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

.modal-default-button {
  margin-left: 10px;
  float: right;
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

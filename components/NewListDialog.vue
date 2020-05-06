<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container max-w-sm">
          <!-- フォーカスアウト防止 -->
          <div v-focusin="checkFocus" tabindex="0" class="dummy" />

          <div class="mx-2 mb-6">
            <label class="input-label">List Name</label>
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

          <div class="flex flex-row-reverse mx-2">
            <button class="btn btn-regular mx-1" @click="update">
              OK
            </button>
            <button class="btn btn-outline mx-1" @click="cancel">
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
      this.$nextTick(() => {
        this.$refs.inputField.focus()
      })
    },
    update () {
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

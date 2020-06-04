<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container max-w-sm">
        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />

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
        <div tabindex="0" class="dummy" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewListDialog',
  props: {
    parent: {
      type: Element,
      require: true
    },
    title: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      inputText: this.title || '',
      errorMsg: ''
    }
  },
  mounted () {
    this.parent.appendChild(this.$el)
    this.$nextTick(() => {
      this.$el.focus()
      this.$refs.inputField.focus()
      document.addEventListener('focusin', this.checkFocus, false)
    })
  },
  destroyed () {
    document.removeEventListener('focusin', this.checkFocus, false)
    this.$el.remove()
  },
  methods: {
    update () {
      if (this.inputText !== '') {
        this.errorMsg = ''
        this.$emit('add', this.inputText)
        this.$destroy()
      } else {
        this.errorMsg = '必須項目です'
      }
    },
    cancel () {
      this.$destroy()
    },
    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.inputField.focus()
      }
    }
  }
}
</script>

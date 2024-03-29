<template>
  <div class="inline-block p-1">
    <div class="flex flex-row">
      <input
        v-model="newInputValue"
        :type="inputType"
        class="flex-1 border p-1 bg-gray-200"
        :class="{ 'btn-disabled': disabled }"
        :disabled="disabled"
      >
      <button
        class="p-1 ml-2"
        :class="[disabled ? 'btn-disabled' : '', buttonClass]"
        :disabled="disabled"
        @click.stop="clickHandler"
      >
        <fa :icon="['fas', 'floppy-disk']" />
      </button>
    </div>
    <div class="w-full p-0 m-0 leading-none">
      <span class="text-xs text-red-500">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommandableInput',
  props: {
    // inputのtype: 想定はtext, date, number
    inputType: {
      type: String,
      require: true,
      default: 'text'
    },
    // 初期値
    value: {
      type: [String, Number, Date],
      require: true,
      default: null
    },
    // 更新処理をするコールバック
    update: {
      type: Function,
      require: true,
      default: null
    },
    // ボタンのstyle
    buttonClass: {
      type: String,
      require: false,
      default: 'btn btn-regular'
    }
  },
  data () {
    return {
      disabled: false,
      errorMessage: '',
      newInputValue: this.value
    }
  },
  methods: {
    async clickHandler () {
      this.disabled = true
      this.errorMessage = ''
      let hasError = false

      try {
        if (this.update) {
          // NOTE: バリデーションはcallbackで実行し、エラーの場合は例外を投げる
          const result = await this.update(this.newInputValue)
          // NOTE: callback内の非同期処理の例外はキャッチできないので、戻り値で判定
          if (!result) {
            console.info('callback action failed')
            hasError = true
          }
        }
      } catch (err) {
        console.error(err)
        hasError = true
        this.errorMessage = err.message
      } finally {
        if (hasError) {
          this.newInputValue = this.value
        }
        this.disabled = false
      }
    }
  }
}
</script>

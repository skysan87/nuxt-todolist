<template>
  <div class="inline-block p-1">
    <div class="flex flex-row">
      <input v-model="newInputValue" :type="inputType" class="flex-1 border p-1 bg-gray-200" :class="{ 'btn-disabled': disabled }" :disabled="disabled">
      <button class="p-1 ml-2" :class="[ disabled ? 'btn-disabled' : '', buttonClass ]" :disabled="disabled" @click.stop="clickHandler">
        <fa :icon="['fas', 'floppy-disk']" />
      </button>
    </div>
    <div class="w-full p-0 m-0">
      <span class="text-xs">{{ errorMessage }}</span>
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

      try {
        if (this.update) {
          await this.update(this.newInputValue)
        }
      } catch (err) {
        this.errorMessage = err
        throw err
      } finally {
        this.disabled = false
      }
    }
  }
}
</script>

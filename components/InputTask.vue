<template>
  <div class="flex overflow-hidden">
    <form class="w-full" @submit.prevent="doAdd">
      <input
        ref="comment"
        type="text"
        class="input-text appearance-none outline-none"
        placeholder="Add New Task..."
      >
      <div class="mt-1 flex flex-row">
        <div class="flex-none inline-block">
          <span class="px-2 align-middle font-bold">期限</span>
        </div>
        <div class="flex-1 inline-block">
          <label v-for="dl in deadlines" :key="dl.value" class="ml-2">
            <input v-model="checkedDeadline" type="radio" name="deadline" :value="dl.value">
            <span class="align-middle">{{ dl.label }}</span>
          </label>
        </div>
        <div class="flex-none inline-block">
          <button class="btn btn-regular focus:outline-none" @click.left="doAdd">
            Add
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'InputTask',
  data () {
    return {
      checkedDeadline: 'later',
      deadlines: [
        { label: '今日', value: 'today' },
        { label: '明日', value: 'tomorrow' },
        { label: 'あとで', value: 'later' }
      ]
    }
  },
  methods: {
    /**
     * todoを追加する
     */
    // eslint-disable-next-line
    doAdd: function(event, value) {
      const comment = this.$refs.comment
      if (!comment.value.length) {
        return
      }
      const params = {}
      params.comment = comment.value

      switch (this.checkedDeadline) {
        case 'today':
          params.deadline = moment(new Date()).endOf('days').toJSON()
          break
        case 'tomorrow':
          params.deadline = moment(new Date()).add(1, 'days').endOf('days').toJSON()
          break
        default:
          params.deadline = null
          break
      }

      this.$store.dispatch('todo/add', params)
      comment.value = ''
    }
  }
}
</script>

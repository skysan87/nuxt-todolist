<template>
  <div class="flex overflow-hidden">
    <form class="w-full" @submit.prevent="doAdd">
      <input
        id="comment"
        ref="comment"
        type="text"
        class="input-comment"
        placeholder="Add New Task..."
      />
      <div class="mt-1">
        <div class="inline-block">
          <span class="px-2 align-middle font-bold">期限</span>
        </div>
        <div class="inline-block">
          <label class="ml-2" v-for="dl in deadlines" :key="dl.value">
            <input v-model="checkedDeadline" type="radio" name="deadline" :value="dl.value" />
            <span class="align-middle">{{ dl.label }}</span>
          </label>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'InputTask',
  data () {
    return {
      checkedDeadline: 'later',
      deadlines: [
        { label: '今日', value: 'today' },
        { label: '明日', value: 'tomorrow' },
        { label: '今週末', value: 'thisweekend' },
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
      // TODO: 日時指定
      this.$store.dispatch('todo/add', comment.value)
      comment.value = ''
    }
  }
}
</script>

<style>
.input-comment {
  @apply px-2 py-1 !important;
  @apply appearance-none border w-full mr-1 outline-none;
}
</style>

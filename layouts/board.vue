<template>
  <div class="flex h-screen overflow-hidden">
    <div class="w-56 flex flex-col flex-none bg-gray-800 text-white pt-3 px-4">
      <div class="flex justify-between items-center">
        <h1 class="font-semibold text-xl leading-tight">To-Do List</h1>
        <fa :icon="['far', 'bell']" />
      </div>
      <div class="flex-none">User@Name</div>
      <div class="flex-1 py-4 overflow-y-scroll scrollable-container">
        <div class="mt-5 flex justify-between items-center">
          <div class="font-bold opacity-50 text-lg">今日の予定</div>
        </div>
        <div class="mt-5 flex justify-between items-center">
          <div class="font-bold opacity-50 text-lg">プロジェクト</div>
          <fa :icon="['far', 'plus-square']" class="opacity-50" />
        </div>
        <div
          class="opacity-50 mt-1"
          v-for="channel in channels"
          :key="channel.id"
        ># {{ channel.channel_name }}
        </div>
        <div class="mt-5 flex justify-between items-center">
          <div class="font-bold opacity-50 text-lg">習慣</div>
        </div>
        <div class="opacity-50 mt-1">日 - Daily -</div>
        <div class="opacity-50 mt-1">週 - Weekly -</div>
        <div class="opacity-50 mt-1">月 - Monthly -</div>
        <div class="opacity-50 mt-1">その他 - Others -</div>
      </div>
    </div>
    <div class="flex-auto flex">
      <nuxt />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      channels: [
        { id: 1, channel_name: 'リスト1' },
        { id: 2, channel_name: 'リスト2' },
        { id: 3, channel_name: 'リスト3' },
        { id: 2, channel_name: 'リスト4' },
        { id: 2, channel_name: 'リスト5' },
        { id: 2, channel_name: 'リスト6' },
        { id: 2, channel_name: 'リスト7' },
        { id: 2, channel_name: 'リスト8' }
      ]
    }
  }
}
</script>

<style scoped>
.scrollable-container {
  /* IE, Edge */
  -ms-overflow-style: none;
  /* Firefox */
  scrollbar-width: none;
}

.scrollable-container::-webkit-scrollbar {
  /* Chrome, Safari */
  display: none;
}
</style>

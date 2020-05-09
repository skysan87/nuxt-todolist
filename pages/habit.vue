<template>
  <div class="flex-1 flex flex-col bg-white relative">
    <header class="border-b flex-none">
      <!-- TODO: 開いてるチャンネル名 -->
      習慣
    </header>
    <main class="flex-1 pt-2 overflow-y-scroll">
      <div class="h-full flex flex-col ml-6">
        <div class="flex-grow overflow-x-hidden">
          <div class="list-group">
            test
          </div>
        </div>
      </div>
    </main>
    <button
      type="button"
      class="absolute bottom-0 right-0 add-button focus:outline-none"
      @click.left="showModal"
    >
      <fa :icon="['fas', 'plus']" size="lg" />
    </button>

    <habit-dialog v-show="isModal" ref="dialog" @close="closeModal" />
  </div>
</template>

<script>
import HabitDialog from '@/components/HabitDialog.vue'

export default {
  layout: 'board',
  components: {
    HabitDialog
  },
  data () {
    return {
      isModal: false
    }
  },
  methods: {
    showModal () {
      this.isModal = true
      this.$refs.dialog.open()
    },
    closeModal () {
      this.isModal = false
    }
  }
}
</script>

<style scoped>
.add-button {
  @apply bg-blue-500 text-white mr-8 mb-4 p-2 px-4 shadow-md;
}
.add-button:hover {
  @apply bg-blue-700;
}
</style>

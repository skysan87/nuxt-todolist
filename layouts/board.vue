<template>
  <div class="flex h-screen overflow-hidden">
    <div class="w-56 flex flex-col flex-none bg-gray-800 text-white pt-3">
      <div class="flex justify-between items-center px-4">
        <h1 class="font-semibold text-xl leading-tight">
          To-Do List
        </h1>
        <fa :icon="['far', 'bell']" />
      </div>
      <div class="flex-none px-4">
        User@Name
      </div>
      <div class="flex-1 py-4 overflow-y-scroll scrollable-container">
        <!-- <div class="mt-5 px-4 flex justify-between items-center">
          <div class="font-bold opacity-50 text-lg">
            今日の予定
          </div>
        </div> -->
        <div class="mt-5 px-4 flex justify-between items-center">
          <div class="font-bold opacity-50 text-lg">
            プロジェクト
          </div>
          <fa :icon="['far', 'plus-square']" class="opacity-50 cursor-pointer" @click.left="openListDialog" />
        </div>
        <div
          v-for="todolist in todolists"
          :key="todolist.id"
          class="opacity-50 mt-1 px-4 cursor-pointer"
          :class="{'bg-blue-600' : currentListId == todolist.id}"
          @click.left="onSelectList(todolist.id)"
        >
          # {{ todolist.title }}
        </div>
        <!-- <div class="mt-5 px-4 flex justify-between items-center">
          <div class="font-bold opacity-50 text-lg">
            習慣
          </div>
        </div>
        <div class="opacity-50 mt-1 px-4">
          日 - Daily -
        </div>
        <div class="opacity-50 mt-1 px-4">
          週 - Weekly -
        </div>
        <div class="opacity-50 mt-1 px-4">
          月 - Monthly -
        </div>
        <div class="opacity-50 mt-1 px-4">
          その他 - Others -
        </div> -->
      </div>
    </div>
    <div class="flex-auto flex">
      <nuxt />
    </div>
    <new-list-dialog v-show="isModal" ref="listDialog" @close="closeModal" />
  </div>
</template>

<script>
import NewListDialog from '@/components/NewListDialog'

export default {
  components: {
    NewListDialog
  },
  data () {
    return {
      isModal: false
    }
  },
  computed: {
    todolists: {
      get () {
        return this.$store.getters['todolist/getLists']
      },
      // eslint-disable-next-line
      set(value) {
        // vuedraggable用
      }
    },
    currentListId: {
      get () {
        return this.$store.getters['todo/getCurrentListId']
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.$store.dispatch('todolist/init')
    },
    onSelectList (id) {
      this.$store.dispatch('todo/init', id)
    },
    openListDialog () {
      this.isModal = true
      this.$refs.listDialog.open()
    },
    closeModal () {
      this.isModal = false
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

<template>
  <div class="flex-1 flex flex-col bg-white relative">
    <header class="border-b flex-none">
      <div class="px-6 py-2">
        フィルター：{{ currentFilterName }} ( {{ habitsCount }} )
      </div>
    </header>
    <main class="flex-1 pt-2 overflow-y-scroll">
      <div class="h-full flex flex-col ml-6">
        <div class="flex-grow overflow-x-hidden">
          <div class="list-group">
            <draggable
              v-model="habits"
              handle=".move-icon"
              @end="onDragEnd"
            >
              <habit-item
                v-for="item in habits"
                :key="item.id"
                :habit="item"
                class="list-group-item list-style"
                @edit="editHabit"
              />
            </draggable>
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
import draggable from 'vuedraggable'
import HabitDialog from '@/components/HabitDialog.vue'
import HabitItem from '@/components/HabitItem.vue'
import { HabitFilter } from '@/util/HabitFilter'

export default {
  layout: 'board',
  components: {
    draggable,
    HabitDialog,
    HabitItem
  },
  data () {
    return {
      isModal: false
    }
  },
  computed: {
    habits: {
      get () {
        return this.$store.getters['habit/getList']
      },
      // eslint-disable-next-line
      set (value) {
        // vuedraggable用
      }
    },
    currentFilterId: {
      get () {
        return this.$store.getters['habit/getCurrentFilter']
      }
    },
    currentFilterName () {
      let name = ''
      Object.values(HabitFilter).forEach((e) => {
        if (e.value === this.currentFilterId) {
          name = e.label
        }
      })
      return name
    },
    habitsCount () {
      return this.habits.length
    }
  },
  methods: {
    showModal () {
      this.isModal = true
      this.$refs.dialog.open()
    },
    onDragEnd (ev) {
      if (ev.oldIndex === ev.newIndex) {
        return
      }
      const params = {
        oldIndex: ev.oldIndex,
        newIndex: ev.newIndex
      }
      this.$store.dispatch('habit/changeOrder', params)
    },
    editHabit (id) {
      this.isModal = true
      this.$refs.dialog.open(id)
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

.list-style {
  padding: 0.25rem 0.5rem;
  background-color: #faf9f9;
}

.list-group {
  padding: 0;
}

.list-group-item:first-child {
  border-top: 1px solid #979797;
}

.list-group-item {
  border-left: 1px solid #979797;
  border-right: 1px solid #979797;
  border-bottom: 1px solid #979797;
}
</style>

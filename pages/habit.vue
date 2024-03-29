<template>
  <div class="flex flex-col bg-white h-full">
    <header class="border-b flex-none">
      <div class="px-6 py-2 flex flex-row">
        <div class="inline-block flex-1 m-auto">
          <span>フィルター：{{ currentFilterName }} ( {{ habitsCount }} )</span>
        </div>
        <button
          type="button"
          class="flex-none add-button focus:outline-none"
          @click.left="addHabit"
        >
          <fa :icon="['fas', 'plus']" size="lg" />
        </button>
      </div>
    </header>
    <main class="pt-2 pb-4 flex-1 overflow-y-scroll">
      <div v-if="habits.length > 0" class="mx-2 overflow-x-hidden">
        <div class="list-group">
          <habit-item
            v-for="item in habits"
            :key="item.id"
            :habit="item"
            class="list-group-item list-style"
            @edit="editHabit"
          />
        </div>
      </div>
      <no-data v-else />
    </main>
  </div>
</template>

<script>
import Vue from 'vue'
import HabitDialog from '@/components/HabitDialog.vue'
import HabitItem from '@/components/HabitItem.vue'
import NoData from '@/components/NoData.vue'
import { Habit } from '@/model/Habit'
import { HabitFilter } from '@/util/HabitFilter'

const DialogController = Vue.extend(HabitDialog)

export default {
  components: {
    HabitItem,
    NoData
  },
  layout: ctx => ctx.$device.isMobile ? 'board_mobile' : 'board',
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    habits: {
      get () {
        return this.$store.getters['Habit/getList']
      }
    },
    currentFilterId: {
      get () {
        return this.$store.getters['Habit/getCurrentFilter']
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
    addHabit () {
      delete this.dialog
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: new Habit('', {
            rootId: this.$store.getters['Habit/getRootId']
          }),
          isCreateMode: true
        }
      })
      this.dialog.$on('add', (habit) => {
        this.$store.dispatch('Habit/add', habit)
          .then(() => this.$toast.success('登録しました'))
          .catch((error) => {
            console.error(error)
            this.$toast.error('登録に失敗しました')
          })
      })
      this.dialog.$mount()
    },
    editHabit (id) {
      delete this.dialog
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: this.$store.getters['Habit/getById'](id),
          isCreateMode: false
        }
      })
      this.dialog.$on('update', (habit) => {
        this.$store.dispatch('Habit/update', habit)
          .then(() => {
            this.$toast.success('更新しました')
          })
          .catch((error) => {
            console.error(error)
            this.$toast.error('更新に失敗しました')
          })
      })
      this.dialog.$on('delete', (habit) => {
        this.$store.dispatch('Habit/delete', habit)
          .catch((error) => {
            console.error(error)
            this.$toast.error('削除に失敗しました')
          })
      })
      this.dialog.$mount()
    }
  }
}
</script>

<style scoped>
.add-button {
  @apply bg-blue-500 text-white p-2 px-4 shadow-md;
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

/* ドラッグするアイテム */
.sortable-chosen {
  opacity: 0.3;
}

.sortable-ghost {
  background-color: #979797;
}
</style>

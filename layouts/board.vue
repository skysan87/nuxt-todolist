<template>
  <transition name="layout" mode="out-in">
    <div class="flex h-screen overflow-hidden">
      <div class="w-56 flex flex-col flex-none bg-gray-800 text-white pt-3">
        <div
          class="flex justify-between items-center px-4 cursor-pointer"
          @click.left="(isMenuExpanded = !isMenuExpanded)"
        >
          <h1 class="font-semibold text-xl leading-tight">
            To-Do List
          </h1>
          <fa :icon="['fas', 'caret-down']" :class="{'fa-rotate-180': isMenuExpanded}" />
        </div>
        <div v-show="isMenuExpanded" class="flex-none mt-2">
          <a class="block px-6 text-sm hover:bg-blue-600 cursor-pointer" @click.left="logout">
            ログアウト
          </a>
        </div>
        <div class="flex-none px-4">
          {{ userName }}
        </div>
        <div class="flex-1 py-4 overflow-y-scroll scrollable-container">
          <div class="mt-5 px-4 flex items-center">
            <div class="font-bold opacity-50 text-lg">
              今日の予定
            </div>
          </div>
          <nuxt-link to="/today">
            <div
              v-for="filter in todayFilters"
              :key="filter.value"
              class="opacity-50 mt-1 px-5 cursor-pointer"
              :class="{'bg-blue-600' : (selectedType === viewType.Today && selectedTodayFilter === filter.value)}"
              @click.left="onSelectToday(filter.value)"
            >
              # {{ filter.label }}
            </div>
          </nuxt-link>
          <div class="mt-5 px-4 flex justify-between items-center">
            <div class="font-bold opacity-50 text-lg">
              プロジェクト
            </div>
            <fa :icon="['far', 'plus-square']" class="opacity-50 cursor-pointer" @click.left="openListDialog" />
          </div>
          <nuxt-link to="/todolist">
            <div
              v-for="todolist in todolists"
              :key="todolist.id"
              class="opacity-50 mt-1 px-5 cursor-pointer"
              :class="{'bg-blue-600' : (selectedType === viewType.Todo && currentListId == todolist.id)}"
              @click.left="onSelectList(todolist.id)"
            >
              # {{ todolist.title }}
            </div>
          </nuxt-link>
          <div class="mt-5 px-4 flex justify-between items-center">
            <div class="font-bold opacity-50 text-lg">
              習慣
            </div>
          </div>
          <nuxt-link to="/habit">
            <div
              v-for="habitfilter in habitFilters"
              :key="habitfilter.value"
              class="opacity-50 mt-1 px-5 cursor-pointer"
              :class="{'bg-blue-600' : (selectedType === viewType.Habit && currentFilter === habitfilter.value)}"
              @click.left="onSelectHabit(habitfilter.value)"
            >
              # {{ habitfilter.label }}
            </div>
          </nuxt-link>
        </div>
      </div>
      <div class="flex-auto flex">
        <nuxt />
      </div>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import NewListDialog from '@/components/NewListDialog'
import { HabitFilter } from '@/util/HabitFilter'
import { TodayFilter } from '@/util/TodayFilter'

const DialogController = Vue.extend(NewListDialog)

export default {
  data () {
    return {
      userName: this.$store.getters['user/displayName'],
      isMenuExpanded: false,
      habitFilters: Object.values(HabitFilter),
      todayFilters: Object.values(TodayFilter),
      viewType: { Todo: 0, Habit: 1, Today: 2 },
      selectedType: 0,
      selectedTodayFilter: TodayFilter.Remain.value,
      dialog: null
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
    },
    currentFilter: {
      get () {
        return this.$store.getters['habit/getCurrentFilter']
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.$store.dispatch('todolist/init')
      this.$store.dispatch('habit/init')
    },
    onSelectToday (filter) {
      this.selectedType = this.viewType.Today
      this.selectedTodayFilter = filter
      this.$store.dispatch('todo/initTodaylist', filter)
    },
    onSelectList (id) {
      this.selectedType = this.viewType.Todo
      this.$store.dispatch('todo/init', id)
    },
    onSelectHabit (filter) {
      this.selectedType = this.viewType.Habit
      this.$store.dispatch('habit/changeFilter', filter)
    },
    openListDialog () {
      this.dialog = null
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el
        }
      })
      this.dialog.$on('add', this.addList)
      this.dialog.$mount()
    },
    addList (title) {
      this.$store.dispatch('todolist/add', title)
      // 新規作成画面に遷移
      this.selectedType = this.viewType.Todo
      this.$router.push('/todolist')
    },
    logout () {
      this.$store
        .dispatch('user/logout')
        .then(() => {
          console.log('logout')
          this.$router.push('/login')
        })
        .catch(err => console.error(err))
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

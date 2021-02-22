<template>
  <transition name="layout" mode="out-in">
    <div>
      <!-- header -->
      <div class="bg-gray-800 z-30">
        <header class="container mx-auto text-white">
          <div
            class="flex justify-between items-center fixed w-full left-0 bg-gray-800 px-2 h-16"
          >
            <h1 class="font-semibold text-xl leading-tight">
              To-Do List
            </h1>
            <button class="outline-none" @click.left="(isMenuExpanded = !isMenuExpanded)">
              <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path
                  v-show="!isMenuExpanded"
                  d="M24 6h-24v-4h24v4zm0 4h-24v4h24v-4zm0 8h-24v4h24v-4z"
                />
                <path
                  v-show="isMenuExpanded"
                  d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"
                />
              </svg>
            </button>
          </div>

          <div v-show="isMenuExpanded" class="fixed left-0 mt-16 w-full bg-gray-800 h-full overflow-y-scroll">
            <div class="pb-24">
              <div class="flex-none px-4">
                {{ userName }}
              </div>
              <div class="flex-none mt-2">
                <a class="block px-4 text-sm" @click.left="logout">
                  ログアウト
                </a>
              </div>
              <div class="flex-1 py-4">
                <div class="mt-5 px-4 flex items-center">
                  <div class="font-bold text-lg">
                    今日の予定
                  </div>
                </div>
                <div
                  v-for="filter in todayFilters"
                  :key="filter.value"
                  class="py-1 px-5 "
                  :class="{'bg-blue-700' : (selectedType === viewType.Today && selectedTodayFilter === filter.value)}"
                  @click.left="onSelectToday(filter.value)"
                >
                  # {{ filter.label }}
                </div>
                <div class="mt-5 px-4 flex justify-between items-center">
                  <div class="font-bold text-lg">
                    プロジェクト
                  </div>
                  <fa :icon="['far', 'plus-square']" class="" @click.left="openListDialog" />
                </div>
                <div
                  v-for="todolist in todolists"
                  :key="todolist.id"
                  class="py-1 flex justify-between items-center"
                  :class="{'bg-blue-700' : (selectedType === viewType.Todo && currentListId == todolist.id)}"
                  @mouseover="activeItemId = todolist.id"
                  @mouseout="activeItemId = ''"
                >
                  <div
                    class="px-5 flex-1 "
                    @click.left="onSelectList(todolist.id)"
                  >
                    # {{ todolist.title }}
                  </div>
                </div>
                <div class="mt-5 px-4 flex justify-between items-center">
                  <div class="font-bold text-lg">
                    習慣
                  </div>
                </div>
                <nuxt-link to="/habit">
                  <div
                    v-for="habitfilter in habitFilters"
                    :key="habitfilter.value"
                    class="py-1 px-5 "
                    :class="{'bg-blue-700' : (selectedType === viewType.Habit && currentFilter === habitfilter.value)}"
                    @click.left="onSelectHabit(habitfilter.value)"
                  >
                    # {{ habitfilter.label }}
                  </div>
                </nuxt-link>
              </div>
            </div>
          </div>
        </header>
      </div>

      <!-- contents -->
      <div class="container mx-auto pt-16 h-screen overflow-hidden">
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
const viewType = { Todo: 0, Habit: 1, Today: 2 }
const activeGoogleAuth = process.env.GOOGLE_AUTH === '1'

export default {
  data () {
    const defaultMsg = !activeGoogleAuth ? 'このアプリはデモサイトです。タブを閉じるとは再ログインできません。' : ''
    return {
      userName: this.$store.getters['user/displayName'],
      isMenuExpanded: false,
      habitFilters: Object.values(HabitFilter),
      todayFilters: Object.values(TodayFilter),
      viewType,
      selectedTodayFilter: TodayFilter.Remain.value,
      activeItemId: '',
      globalMessage: defaultMsg,
      dialog: null,
      currentListId: ''
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
    currentFilter: {
      get () {
        return this.$store.getters['habit/getCurrentFilter']
      }
    },
    selectedType: {
      get () {
        if (this.$route.name.startsWith('todolist')) {
          return viewType.Todo
        } else if (this.$route.name.startsWith('habit')) {
          return viewType.Habit
        } else {
          return viewType.Today
        }
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
    onSelectToday (filter) {
      this.isMenuExpanded = false
      this.selectedTodayFilter = filter
      this.$router.push(`/today/${filter}`)
    },
    onSelectList (id) {
      this.isMenuExpanded = false
      this.currentListId = id
      this.$router.push(`/todolist/${id}`)
    },
    onSelectHabit (filter) {
      this.isMenuExpanded = false
      this.$store.dispatch('habit/changeFilter', filter)
    },
    openListDialog () {
      delete this.dialog
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el
        }
      })
      this.dialog.$on('add', this.addList)
      this.dialog.$mount()
    },
    addList (todolist) {
      this.$store.dispatch('todolist/add', todolist.getData())
        .then(() => {
          this.isMenuExpanded = false
          this.$toast.success('新しいプロジェクトを登録しました')
          // 新規作成画面に遷移
          const listId = this.$store.getters['todo/getCurrentListId']
          this.currentListId = listId
          this.$router.push(`/todolist/${listId}`)
        })
        .catch((error) => {
          this.$toast.error(error.message)
        })
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

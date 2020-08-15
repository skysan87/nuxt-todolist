<template>
  <transition name="layout" mode="out-in">
    <div class="app-container">
      <div class="app-top_nav bg-red-300 text-center">
        {{ globalMessage }}
      </div>
      <div class="app-workspace-layout">
        <div class="app-workspace__sidebar">
          <div class="app-workspace__task_sidebar flex flex-col flex-none bg-gray-800 pt-3 text-gray-500">
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
              <a class="block px-6 text-sm hover:bg-blue-800 hover:opacity-75 cursor-pointer" @click.left="logout">
                ログアウト
              </a>
            </div>
            <div class="flex-none px-4">
              {{ userName }}
            </div>
            <div class="flex-1 py-4 overflow-y-scroll scrollable-container">
              <div class="mt-5 px-4 flex items-center">
                <div class="font-bold text-lg">
                  今日の予定
                </div>
              </div>
              <nuxt-link to="/today">
                <div
                  v-for="filter in todayFilters"
                  :key="filter.value"
                  class="py-1 px-5 cursor-pointer hover:bg-blue-700 hover:opacity-75"
                  :class="{'bg-blue-700' : (selectedType === viewType.Today && selectedTodayFilter === filter.value)}"
                  @click.left="onSelectToday(filter.value)"
                >
                  # {{ filter.label }}
                </div>
              </nuxt-link>
              <div class="mt-5 px-4 flex justify-between items-center">
                <div class="font-bold text-lg">
                  プロジェクト
                </div>
                <fa :icon="['far', 'plus-square']" class="cursor-pointer" @click.left="openListDialog" />
              </div>
              <nuxt-link to="/todolist">
                <div
                  v-for="todolist in todolists"
                  :key="todolist.id"
                  class="py-1 flex justify-between items-center hover:bg-blue-700 hover:opacity-75"
                  :class="{'bg-blue-700' : (selectedType === viewType.Todo && currentListId == todolist.id)}"
                  @mouseover="activeItemId = todolist.id"
                  @mouseout="activeItemId = ''"
                >
                  <div
                    class="px-5 flex-1 cursor-pointer"
                    @click.left.prevent="onSelectList(todolist.id)"
                  >
                    # {{ todolist.title }}
                  </div>
                  <div
                    class="flex-none m-0 pr-4 opacity-0"
                    :class="{'opacity-100': activeItemId === todolist.id}"
                    @click.left.prevent="editTodolist(todolist.id)"
                  >
                    <fa :icon="['fas', 'edit']" size="xs" class="cursor-pointer" />
                  </div>
                </div>
              </nuxt-link>
              <div class="mt-5 px-4 flex justify-between items-center">
                <div class="font-bold text-lg">
                  習慣
                </div>
              </div>
              <nuxt-link to="/habit">
                <div
                  v-for="habitfilter in habitFilters"
                  :key="habitfilter.value"
                  class="py-1 px-5 cursor-pointer  hover:bg-blue-700 hover:opacity-75"
                  :class="{'bg-blue-700' : (selectedType === viewType.Habit && currentFilter === habitfilter.value)}"
                  @click.left="onSelectHabit(habitfilter.value)"
                >
                  # {{ habitfilter.label }}
                </div>
              </nuxt-link>
            </div>
          </div>
        </div>
        <div class="app-workspace__view">
          <nuxt class="app-workspace__view_contents" />
        </div>
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
    },
    selectedType: {
      get () {
        switch (this.$route.name) {
          case 'todolist':
            return viewType.Todo
          case 'habit':
            return viewType.Habit
          default:
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
      this.$store.dispatch('habit/init')
    },
    onSelectToday (filter) {
      this.selectedTodayFilter = filter
      this.$store.dispatch('todo/initTodaylist', filter)
    },
    onSelectList (id) {
      this.$store.dispatch('todo/init', id)
    },
    onSelectHabit (filter) {
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
    editTodolist (listId) {
      delete this.dialog
      const todolist = this.$store.getters['todolist/getListById'](listId)
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          title: todolist.title
        }
      })
      this.dialog.$on('add', (title) => {
        todolist.title = title
        this.$store.dispatch('todolist/update', todolist)
      })
      this.dialog.$mount()
    },
    addList (title) {
      this.$store.dispatch('todolist/add', title)
        .then(() => {
          this.$toast.success('新しいプロジェクトを登録しました')
          // 新規作成画面に遷移
          this.$router.push('/todolist')
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

.app-container {
  display: grid;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  grid-template-rows: min-content auto;
  grid-template-areas:
    "app-container__top-nav"
    "app-container__workspace";
}

.app-top_nav {
  grid-area: app-container__top-nav;
}

.app-workspace-layout {
  grid-area: app-container__workspace;
  display: grid;
  overflow: hidden;
  grid-template-columns: 230px auto;
  grid-template-rows: 100%;
  grid-template-areas:
    "app-workspace__sidebar app-workspace__view";
}

.app-workspace__sidebar {
  grid-area: app-workspace__sidebar;

  display: grid;
  grid-template-columns: auto;
  grid-template-areas:
    "app-workspace__task_sidebar";
  grid-template-rows: auto;
  overflow: hidden;
}

.app-workspace__task_sidebar {
  grid-area: app-workspace__task_sidebar;
  width: 100%;
  min-height: 0;
  height: auto;
}

.app-workspace__view {
  grid-area: app-workspace__view;
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: auto;
  grid-template-areas: "app-workspace__view_contents";
}

.app-workspace__view_contents {
  grid-area: app-workspace__view_contents;
}

</style>

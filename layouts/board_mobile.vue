<template>
  <transition name="layout" mode="out-in">
    <div>
      <!-- header -->
      <div class="bg-gray-800 z-30">
        <header class="container mx-auto text-white">
          <div
            class="flex justify-between items-center fixed w-full left-0 bg-gray-800 px-2 h-10"
          >
            <a @click.left="(showGlobalMessage = !showGlobalMessage)">
              <h1 class="font-semibold text-xl leading-tight">
                <span class="font-mono">{{ currentDate }}</span>
                <fa :icon="['fas', 'caret-down']" :class="{'fa-rotate-180': showGlobalMessage}" />
              </h1>
            </a>
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

          <div v-show="showGlobalMessage" class="fixed left-0 mt-10 w-full bg-green-400 text-center">
            {{ globalMessage }}
          </div>

          <div v-show="isMenuExpanded" class="fixed left-0 mt-10 w-full bg-gray-800 h-full overflow-y-scroll">
            <div class="pb-24">
              <div class="flex-none px-4">
                Ver.{{ appVersion }}
              </div>
              <div class="flex-none px-4">
                {{ userName }}
              </div>
              <div class="flex-none mt-2">
                <a class="block px-4 text-sm" @click.left="reload">
                  <fa :icon="['fas', 'sync-alt']" size="lg" />
                  <span class="pl-1">リロード</span>
                </a>
              </div>
              <div class="flex-none mt-2">
                <a class="block px-4 text-sm" @click.left="logout">
                  <fa :icon="['fas', 'sign-out-alt']" size="lg" />
                  <span class="pl-1">ログアウト</span>
                </a>
              </div>
              <div class="flex-1 py-4">
                <div class="mt-5 px-4 flex items-center">
                  <div class="font-bold text-lg">
                    サマリ
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
                <div class="mt-5 px-4 flex justify-between items-center">
                  <div class="font-bold text-lg">
                    設定
                  </div>
                </div>
                <div
                  class="py-1 px-5 text-sm"
                  @click.left="updateHeaderText"
                >
                  ヘッダーメッセージ
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <!-- contents -->
      <div class="container mx-auto pt-10 h-screen overflow-hidden">
        <nuxt />
      </div>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import NewListDialog from '@/components/NewListDialog'
import InputDialog from '@/components/InputDialog'
import { HabitFilter } from '@/util/HabitFilter'
import { TodayFilter } from '@/util/TodayFilter'
import { dateFactory } from '@/util/DateFactory'

const DialogController = Vue.extend(NewListDialog)
const InputDialogController = Vue.extend(InputDialog)
const viewType = { Todo: 0, Habit: 1, Today: 2 }

export default {
  data () {
    return {
      userName: this.$store.getters['User/displayName'],
      habitFilters: Object.values(HabitFilter),
      todayFilters: Object.values(TodayFilter),
      viewType,
      selectedTodayFilter: TodayFilter.List.value,
      activeItemId: '',
      dialog: null,
      currentListId: '',
      showGlobalMessage: false,
      appVersion: process.env.app_version,
      currentDate: dateFactory().format('YYYY.M.D(ddd)')
    }
  },
  computed: {
    todolists: {
      get () {
        return this.$store.getters['Todolist/getLists']
      },
      // eslint-disable-next-line
      set(value) {
        // vuedraggable用
      }
    },
    currentFilter: {
      get () {
        return this.$store.getters['Habit/getCurrentFilter']
      }
    },
    globalMessage: {
      get () {
        const config = this.$store.getters['Config/getConfig']
        return config !== null ? config.globalMessage : ''
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
    },
    isMenuExpanded: {
      get () {
        return this.$store.getters['View/isMenuExpanded']
      },
      set (value) {
        this.$store.dispatch('View/isMenuExpanded', value)
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    async init () {
      try {
        await this.$store.dispatch('Todolist/init')
        await this.$store.dispatch('Config/init')
      } catch (error) {
        console.log(error)
        this.$toast.error('初期化に失敗しました')
      }
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
      this.$store.dispatch('Habit/changeFilter', filter)
        .catch((error) => {
          console.log(error)
          this.$toast.error('System Error')
        })
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
      this.$store.dispatch('Todolist/add', todolist.getData())
        .then(() => {
          this.isMenuExpanded = false
          this.$toast.success('新しいプロジェクトを登録しました')
          // 新規作成画面に遷移
          const listId = this.$store.getters['Todo/getCurrentListId']
          this.currentListId = listId
          this.$router.push(`/todolist/${listId}`)
        })
        .catch((error) => {
          console.log(error)
          this.$toast.error('登録に失敗しました')
        })
    },
    updateHeaderText () {
      delete this.inputDialog
      this.inputDialog = new InputDialogController({
        propsData: {
          parent: this.$root.$el,
          title: 'ヘッダーメッセージを変更',
          message: this.globalMessage
        }
      })
      this.inputDialog.$on('update', (message) => {
        this.$store.dispatch('Config/updateMessage', message)
          .then(() => {
            this.$toast.success('更新しました')
          })
          .catch((error) => {
            console.log(error)
            this.$toast.error('更新に失敗しました')
          })
      })
      this.inputDialog.$mount()
    },
    logout () {
      this.$store
        .dispatch('User/logout')
        .then(() => {
          console.log('logout')
          this.$router.push('/login')
        })
        .catch((error) => {
          console.error(error)
          this.$toast.error('ログアウトに失敗しました')
        })
    },
    reload () {
      this.init()
      if (this.selectedType === viewType.Todo) {
        const updatedLists = this.$store.getters['Todolist/getLists']
        if (updatedLists.some(v => v.id === this.currentListId)) {
          this.goToFirstList()
        }
      }
    },
    goToFirstList () {
      const firstListId = this.$store.getters['Todolist/getFistListId']
      this.currentListId = firstListId
      this.$router.push(`/todolist/${firstListId}`)
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

.top_nav {
  height: min-content;
}

.hide-container {
  z-index: -1;
}
</style>

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
          <!--
          <div class="mt-5 px-4 flex justify-between items-center">
            <div class="font-bold opacity-50 text-lg">
              今日の予定
            </div>
          </div>
          -->
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
              class="opacity-50 mt-1 px-4 cursor-pointer"
              :class="{'bg-blue-600' : (selectedType === 'todo' && currentListId == todolist.id)}"
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
              v-for="(val, name) in habits"
              :key="name"
              class="opacity-50 mt-1 px-4 cursor-pointer"
              :class="{'bg-blue-600' : (selectedType === 'habit' && selectedHabit === name)}"
              @click.left="onSelectHabit(name)"
            >
              # {{ val }}
            </div>
          </nuxt-link>
        </div>
      </div>
      <div class="flex-auto flex">
        <nuxt />
      </div>
      <new-list-dialog v-show="isModal" ref="listDialog" @close="closeModal" />
    </div>
  </transition>
</template>

<script>
import NewListDialog from '@/components/NewListDialog'

export default {
  components: {
    NewListDialog
  },
  data () {
    return {
      isModal: false,
      userName: this.$store.getters['user/displayName'],
      isMenuExpanded: false,
      habits: { today: '今日', enable: '有効', all: '全て' },
      selectedType: 'todo', // todo, habit
      selectedHabit: ''
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
      this.selectedType = 'todo'
      this.$store.dispatch('todo/init', id)
    },
    onSelectHabit (habit) {
      // TODO:$store
      this.selectedType = 'habit'
      this.selectedHabit = habit
    },
    openListDialog () {
      this.isModal = true
      this.$refs.listDialog.open()
    },
    closeModal () {
      this.isModal = false
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

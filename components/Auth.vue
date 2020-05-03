<template>
  <div class="container mx-auto px-4 h-full">
    <div v-if="!isLogin && isMounted" class="flex content-center items-center justify-center h-full">
      <div class="w-full px-4 pt-32">
        <div
          class="flex flex-col w-full shadow-lg rounded bg-gray-300 border-0"
        >
          <div class="rounded-t mb-0 px-6 py-6">
            <div class="text-center mb-3">
              <h6 class="text-gray-600 text-sm font-bold">
                Sign in with
              </h6>
            </div>
            <div class="text-center">
              <button
                class="bg-white text-gray-800 px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 shadow hover:shadow-md inline-flex items-center font-bold text-sm"
                type="button"
                @click="doLogin"
              >
                <fa :icon="['fab', 'google']" size="2x" class="mr-2 text-red-500" />Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isMounted" class="w-full h-full fixed block top-0 left-0 opacity-75 z-50 bg-blue-100">
      <span class="text-green-500 mx-auto block relative w-0 h-0" style="top: 50%;">
        <fa :icon="['fas', 'circle-notch']" size="5x" class="fa-spin" />
      </span>
    </div>
  </div>
</template>

<script>
import { auth } from '@/plugins/firebase'
import { authMock } from '@/plugins/mock'

const isDebug = process.env.DATABASE_MODE === 'local'

export default {
  data () {
    return {
      isMounted: false
    }
  },
  computed: {
    isLogin () {
      return this.$store.getters['user/isLogin']
    },

    displayName () {
      return this.$store.getters['user/dispalyName']
    }
  },
  async mounted () {
    if (!isDebug) {
      // ログイン後リダイレクト時
      const user = await new Promise((resolve, reject) => {
        auth.onAuthStateChanged((user) => {
          resolve(user)
        })
      })
      this.$store.dispatch('user/stateChanged', user)
      if (user) {
        this.$router.push('/todolist')
      }
    }
    this.isMounted = true
  },
  methods: {
    doLogin () {
      if (isDebug) {
        authMock.onAuthStateChanged((user) => {
          console.log(user)
          this.$store.dispatch('user/stateChanged', user)
          if (user) {
            this.$router.push('/todolist')
          }
        })
      }
      this.$store.dispatch('user/login')
    }
  }
}
</script>
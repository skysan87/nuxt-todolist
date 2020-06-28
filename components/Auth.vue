<template>
  <div class="login-container mx-auto px-4 h-full">
    <div v-if="!isLogin && isMounted" class="flex content-center items-center justify-center h-full">
      <div class="w-full px-4 pt-32">
        <div
          class="flex flex-col w-full bg-gray-300 border-0"
        >
          <div class="px-6 py-6">
            <div class="text-center mb-3">
              <h6 class="text-gray-600 text-base font-bold">
                Sign in with
              </h6>
            </div>
            <div class="text-center login-btn-box">
              <div v-if="isClicked" class="py-2">
                <fa :icon="['fas', 'circle-notch']" size="2x" class="fa-spin" />
              </div>
              <button
                v-else
                class="login-button"
                type="button"
                @click.once="doLogin"
              >
                <!-- <fa :icon="['fab', 'google']" size="2x" class="mr-2 text-red-500" />Google -->
                Guest User
              </button>
              <div class="text-center pt-4 text-sm">
                ※タブを閉じるとで再ログイン出来ません。
              </div>
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
      isMounted: false,
      isClicked: false
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
        this.$router.push('/today')
      }
    }
    this.isMounted = true
  },
  methods: {
    doLogin () {
      this.isClicked = true
      this.$store.dispatch('user/login')
        .then((user) => {
          this.$store.dispatch('user/stateChanged', user)
          if (user) {
            this.$router.push('/today')
          }
        })
        .catch(() => {
          this.$toast.error('ログインに失敗しました')
        })
    }
  }
}
</script>

<style scoped>
.login-container {
  max-width: 480px;
}
.login-btn-box {
  min-height: 60px;
}
.login-button {
  @apply bg-white text-gray-800 px-8 py-2 outline-none shadow  inline-flex items-center font-bold justify-center;
}
.login-button:focus {
  @apply outline-none;
}
.login-button:active {
  @apply bg-gray-500;
}
.login-button__disabled {
  @apply bg-gray-500 !important;
}
</style>

<template>
  <div :style="styles">
    <slot name="activator" :open="open" />
    <transition name="menu">
      <div v-show="show" class="menu px-4">
        <div>
          <button class="btn btn-outline" @click="show = false">
            閉じる
          </button>
        </div>
        <div class="mt-2">
          <slot name="content" :close="close" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'DropdownMenu',
  data () {
    return {
      show: false
    }
  },
  computed: {
    styles () {
      return {
        '--width': this.$device.isMobile ? '100%' : '30%'
      }
    }
  },
  methods: {
    open () {
      this.show = true
    },
    close () {
      this.show = false
    }
  }
}
</script>

<style lang="scss" scoped>

@keyframes right-to-left {
  0% {
    transform: translateX(var(--width));
  }
  100% {
    transform: translateX(0);
  }
}

.menu {
  background-color: rgb(197, 197, 197);
  z-index: 30;
  padding: 10px;
  position: fixed;
  height: 80rem;
  width: var(--width);
  top: 0;
  right: 0;

  &-enter-active {
    animation: right-to-left .4s;
  }

  &-leave-active {
    animation: right-to-left .4s reverse;
  }
}
</style>

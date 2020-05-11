<template>
  <div>
    <div class="flex w-full">
      <div class="move-icon p-1">
        <fa :icon="['fas', 'ellipsis-v']" />
      </div>
      <div class="p-1" @click="changeEventHandler">
        <span
          :class="badgeColor(todo.state)"
          class="circle-button cursor-pointer"
        />
      </div>
      <div :title="todo.title" class="flex-1 no-wrap text-left p-1">
        {{ todo.title }}
      </div>
      <div class="p-1" @click.stop="editEventHandler">
        <fa :icon="['fas', 'edit']" size="xs" class="cursor-pointer" />
      </div>
      <transition name="slide-fade">
        <div
          v-show="canRemove"
          class="todo-x-pointer p-1"
          @click="removeEventHandler"
        >
          <span class="cursor-pointer">×</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { getStateColor } from '@/util/StateColor'

export default {
  name: 'TodoItem',
  props: {
    todo: Object
  },
  data () {
    return {}
  },
  computed: {
    canRemove () {
      return this.$store.getters['todo/canRemove']
    }
  },
  methods: {
    changeEventHandler () {
      this.$store.dispatch('todo/changeState', this.todo.id)
    },
    badgeColor (state) {
      return getStateColor(state)
    },
    editEventHandler () {
      this.$emit('edit', this.todo.id)
    },
    removeEventHandler () {
      this.$store.dispatch('todo/delete', this.todo.id)
    }
  }
}
</script>

<style scoped>
.move-icon {
  cursor: move;
}

.no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* transition:slide-face */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>

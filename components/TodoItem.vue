<template>
  <div>
    <div class="flex-container">
      <div class="move-icon">
        <fa :icon="['fas', 'ellipsis-v']" />
      </div>
      <div @click="changeEventHandler">
        <span
          :class="badgeColor(todo.state)"
          class="circle-button pointer"
        />
      </div>
      <div :title="todo.comment" class="flex-grow-1 no-wrap todo-text">
        {{ todo.comment }}
      </div>
      <div @click.stop="editEventHandler">
        <fa :icon="['fas', 'edit']" size="xs" class="pointer" />
      </div>
      <transition name="slide-fade">
        <div
          v-show="canRemove"
          class="todo-x-pointer"
          @click="removeEventHandler"
        >
          <span class="pointer">×</span>
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
@import '@/assets/css/common.css';

.flex-container {
  width: 100%;
  display: flex;
}

.flex-container div {
  padding: 0.25rem;
}

.move-icon {
  cursor: move;
}

.todo-text {
  text-align: left;
}

.pointer {
  cursor: pointer;
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

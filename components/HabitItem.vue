<template>
  <div>
    <div class="flex items-center w-full">
      <div :title="habit.title" class="flex-1 no-wrap text-left p-1">
        {{ habit.title }}
      </div>
      <icon-button @click.stop.native="editEventHandler">
        <fa :icon="['fas', 'edit']" size="xs" />
      </icon-button>
    </div>
  </div>
</template>

<script>
import IconButton from '@/components/parts/IconButton'

export default {
  name: 'TodoItem',
  components: {
    IconButton
  },
  props: {
    habit: Object
  },
  data () {
    return {}
  },
  methods: {
    editEventHandler () {
      this.$emit('edit', this.habit.id)
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

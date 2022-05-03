<template>
  <div
    class="flex items-center w-full box"
    @click.stop="handleSelect"
  >
    <fa
      v-if="option.showPointer"
      :icon="['fas', 'ellipsis-v']"
      class="move-icon px-1"
    />
    <div
      v-show="option.showEdit == false"
      class="px-1"
      @click.stop="changeEventHandler"
    >
      <span
        :style="badgeColor(todo.state)"
        class="circle-button cursor-pointer"
      />
    </div>
    <div class="flex-1 no-wrap text-left p-1">
      {{ todo.title }}
    </div>
    <fa
      v-show="option.showEdit == false"
      title="編集"
      :icon="['fas', 'edit']"
      size="xs"
      class="cursor-pointer px-1"
      @click.stop="editEventHandler"
    />
    <fa
      v-show="option.showEdit && isSelected"
      :icon="['fas', 'circle-check']"
    />
  </div>
</template>

<script>
import { getStateColor } from '@/util/StateColor'
import { Todo } from '@/model/Todo'

export default {
  name: 'TodoItem',
  props: {
    todo: {
      type: Object,
      required: true,
      default () {
        return new Todo('', {})
      }
    },
    option: {
      type: Object,
      default () {
        return {
          showPointer: true,
          showEdit: true
        }
      }
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {}
  },
  computed: {
    editMode () {
      return this.$store.getters['Todo/editMode']
    }
  },
  methods: {
    changeEventHandler () {
      this.$store.dispatch('Todo/changeState', this.todo.id)
        .catch((error) => {
          console.log(error)
          this.$toast.error('更新に失敗しました')
        })
    },
    badgeColor (state) {
      return getStateColor(state)
    },
    editEventHandler () {
      this.$emit('edit', this.todo.id)
    },
    handleSelect () {
      this.$emit('select', this.todo.id)
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

.box:active {
  opacity: 0.4;
}
</style>

<template>
  <div class="py-1">
    <div v-if="!editMode" class="flex items-center">
      <div class="flex-1">
        <label>
          <input type="checkbox" class="pl-1" :checked="subTask.isDone" @change="updateState">
          <span class="w-full no-wrap text-left px-1">{{ subTask.title }}</span>
        </label>
      </div>
      <div class="px-1" @click.left.stop="onEditMode">
        <fa :icon="['fas', 'edit']" size="xs" class="cursor-pointer" />
      </div>
      <div class="todo-x-pointer px-1" @click.left.stop="deleteData">
        <span class="cursor-pointer">×</span>
      </div>
    </div>

    <div v-if="editMode" class="flex items-center">
      <input type="checkbox" class="px-1" :checked="subTask.isDone" disabled>
      <div class="w-full px-1">
        <form @submit.prevent="update">
          <input
            v-model="subTask.title"
            type="text"
            class="input-text flex-1 apperance-none outline-none"
            placeholder="Add New Sub-Task..."
          >
        </form>
      </div>
      <div class="px-1">
        <button class="text-blue-500" @click.left.stop="update">
          O
        </button>
      </div>
      <div class="px-1">
        <button class="text-pink-500" @click.left.stop="cancel">
          X
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { SubTask } from '@/model/SubTask'

export default {
  name: 'SubTask',
  props: {
    inputdata: {
      type: Object,
      required: false,
      default () {
        return new SubTask({})
      }
    },
    isCreateMode: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      subTask: new SubTask(this.inputdata),
      editMode: this.isCreateMode
    }
  },
  methods: {
    onEditMode () {
      this.editMode = true
    },
    cancel () {
      this.editMode = false
      this.subTask = new SubTask(this.inputdata)
      this.$emit('cancel')
    },
    updateState () {
      this.subTask.isDone = !this.subTask.isDone
      this.$emit('update', this.subTask)
    },
    update () {
      this.editMode = false
      if (this.isCreateMode) {
        this.$emit('add', this.subTask)
      } else {
        this.$emit('update', this.subTask)
      }
    },
    deleteData () {
      this.$emit('delete', this.subTask)
    }
  }
}
</script>

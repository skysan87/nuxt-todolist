<template>
  <div class="flex overflow-hidden">
    <div class="w-full">
      <form  @submit.prevent="doAdd">
        <input
          v-model="todo.title"
          type="text"
          class="input-text appearance-none outline-none"
          placeholder="Add New Task..."
        >
      </form>
      <div class="mt-1 flex flex-row">
        <div class="flex-none inline-block">
          <span class="px-2 align-middle font-bold">期限</span>
        </div>
        <div class="flex-1 inline-block">
          <label v-for="dl in deadlines" :key="dl.value" class="ml-2">
            <input v-model="checkedDeadline" type="radio" name="deadline" :value="dl.value">
            <span class="align-middle">{{ dl.label }}</span>
          </label>
        </div>
        <div class="flex-none inline-block">
          <button class="btn btn-outline focus:outline-none" @click.left="addDetail">
            詳細
          </button>
          <button class="btn btn-regular focus:outline-none" @click.left="doAdd">
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import ModalDialog from '@/components/ModalDialog.vue'
import { Todo } from '@/model/Todo'

const DialogController = Vue.extend(ModalDialog)

export default {
  name: 'InputTask',
  data () {
    return {
      todo: new Todo('', {}),
      dialog: null,
      checkedDeadline: 'later',
      deadlines: [
        { label: '今日', value: 'today' },
        { label: '明日', value: 'tomorrow' },
        { label: 'あとで', value: 'later' }
      ]
    }
  },
  methods: {
    /**
     * todoを追加する
     */
    // eslint-disable-next-line
    doAdd () {
      if (isEmpty(this.todo.title)) {
        return
      }
      this.todo.startdate = this.todo.deadline = this.checkDeadline()
      this.$store.dispatch('todo/add', this.todo.getData())
      this.todo.title = ''
    },
    addDetail () {
      this.todo.startdate = this.todo.deadline = this.checkDeadline()

      this.dialog = null
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: this.todo,
          isCreateMode: true
        }
      })
      this.dialog.$on('add', (todo) => {
        this.$store.dispatch('todo/add', todo.getData())
        this.todo.title = ''
      })
      this.dialog.$mount()
    },
    checkDeadline () {
      let deadline = null
      switch (this.checkedDeadline) {
        case 'today':
          deadline = moment(new Date()).endOf('days').toJSON()
          break
        case 'tomorrow':
          deadline = moment(new Date()).add(1, 'days').endOf('days').toJSON()
          break
        default:
          deadline = null
          break
      }
      return deadline
    }
  }
}
</script>

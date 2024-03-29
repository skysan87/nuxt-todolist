<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container max-w-2xl">
        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />

        <div class="modal-body">
          <label class="input-label">タイトル</label>
          <input
            ref="refTitle"
            v-model="habit.title"
            class="input-text"
            :class="{'border border-red-500': errorMsg.title !== ''}"
            type="text"
          >
          <p class="text-red-500 text-xs italic">
            <span>{{ errorMsg.title }}</span>
          </p>
        </div>

        <div class="modal-body">
          <label class="input-label">説明</label>
          <textarea v-model="habit.detail" class="input-textarea resize-none" maxlength="1000" rows="6" />
        </div>

        <div class="modal-body">
          <label class="input-label">繰り返し設定</label>
          <div>
            <label>
              <input v-model="habit.frequency" name="frequency" type="radio" :value="FREQ_DAILY">
              <span>毎日</span>
            </label>
          </div>
          <div>
            <label>
              <input v-model="habit.frequency" name="frequency" type="radio" :value="FREQ_WEEKLY">
              <span>毎週</span>
            </label>
            <label v-for="(label, id) in weekdays" v-show="habit.frequency === FREQ_WEEKLY" :key="id" class="mx-1">
              <input v-model="habit.weekdays" type="checkbox" :value="id">
              <span class="p-1 align-middle">{{ label }}</span>
            </label>
          </div>
          <div>
            <label>
              <input v-model="habit.frequency" name="frequency" type="radio" :value="FREQ_MONTHLY">
              <span>毎月</span>
            </label>
            <span v-show="habit.frequency === FREQ_MONTHLY" class="flex flex-col">
              <div>
                <label class="ml-4 my-1">
                  <input v-model="monthlyType" type="radio" :value="MONTHLY_TYPE.DAY">
                  <span>日付で指定</span>
                </label>
                <!-- TODO: 複数日対応 -->
                <select v-model="planDays" class="ml-4 px-1 bg-gray-200">
                  <option v-for="day of 31" :key="day" :value="day">{{ day }}</option>
                </select>
              </div>
              <div>
                <label class="ml-4 my-1">
                  <input v-model="monthlyType" type="radio" :value="MONTHLY_TYPE.WEEK">
                  <span>週と曜日</span>
                </label>
                <div class="inline-block ml-4">
                  <span>第</span>
                  <select v-model="planWeek.index" class="px-1 bg-gray-200">
                    <option v-for="id of 4" :key="id" :value="id">{{ id }}</option>
                  </select>
                  <select v-model="planWeek.day" class="px-1 bg-gray-200">
                    <option v-for="(label, id) of weekdays" :key="id" :value="id">{{ label }}</option>
                  </select>
                  <span>曜日</span>
                </div>
              </div>
              <div>
                <label class="ml-4 my-1">
                  <input v-model="monthlyType" type="radio" :value="MONTHLY_TYPE.END">
                  <span>月末</span>
                </label>
              </div>
            </span>
          </div>
          <p class="text-red-500 text-xs italic">
            <span>{{ errorMsg.frequency }}</span>
          </p>
        </div>

        <div class="modal-body">
          <label class="input-label">有効</label>
          <input v-model="habit.isActive" type="checkbox">
        </div>

        <div v-if="!isCreateMode" class="modal-body">
          <label class="input-label">実績</label>
          <div>
            <v-calendar is-expanded :attributes="calenderAttributes" @update:from-page="updateCalendar" />
          </div>
          <div>
            <span class="pr-4">継続期間 {{ habit.duration }}</span>
            <span class="pr-4">最大継続期間 {{ habit.maxduration }}</span>
            <span class="pr-4">通算 {{ habit.totalActivityCount }}</span>
            <span class="pr-4">実行率 {{ activityRate }}％</span>
          </div>
        </div>

        <div class="flex flex-row-reverse">
          <button class="btn btn-regular ml-2" @click="update">
            OK
          </button>
          <button class="btn btn-outline ml-2" @click="cancel">
            Cancel
          </button>
          <button
            v-if="!isCreateMode"
            class="btn btn-red-outline ml-2"
            @click="deleteHabit"
          >
            Delete
          </button>
          <span v-if="!isCreateMode" class="text-xs text-gray-600 flex-1">
            変更や削除は明日以降のタスクに反映されます。
          </span>
        </div>

        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />
      </div>
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import { Habit } from '@/model/Habit'

export default {
  name: 'HabitDialog',
  props: {
    parent: {
      type: Element,
      require: true,
      default: null
    },
    target: {
      type: Object,
      require: true,
      default: () => new Habit('', {})
    },
    isCreateMode: {
      type: Boolean,
      require: true
    }
  },
  data () {
    const clone = Habit.valueOf(this.target)
    return {
      habit: clone,
      errorMsg: { title: '', frequency: '' },
      weekdays: Habit.WEEKDAYS,
      FREQ_DAILY: Habit.FREQ_DAILY,
      FREQ_WEEKLY: Habit.FREQ_WEEKLY,
      FREQ_MONTHLY: Habit.FREQ_MONTHLY,
      calenderAttributes: [],
      MONTHLY_TYPE: { ...Habit.MONTHLY_TYPE },
      monthlyType: clone.monthlyType || Habit.MONTHLY_TYPE.DAY,
      // TODO: 複数日対応
      planDays: clone.planDays.length > 0 ? clone.planDays[0] : 1,
      planWeek: clone.planWeek || { index: 1, day: 0 }
    }
  },
  computed: {
    activityRate () {
      return Math.floor(this.habit.totalActivityCount / this.habit.totalCount * 100)
    }
  },
  mounted () {
    this.parent.appendChild(this.$el)
    this.$nextTick(() => {
      this.$el.focus()
      this.init()
      this.$refs.refTitle.focus()
      document.addEventListener('focusin', this.checkFocus, false)
    })
  },
  destroyed () {
    document.removeEventListener('focusin', this.checkFocus, false)
    this.$el.remove()
  },
  methods: {
    init () {
      this.errorMsg = { title: '', frequency: '' }
      this.initCalendar()
    },

    update () {
      if (!this.validate()) {
        return
      }

      this.setFrequencyOptions()

      if (this.isCreateMode) {
        this.$emit('add', this.habit)
      } else {
        this.$emit('update', this.habit)
      }
      this.$destroy()
    },

    setFrequencyOptions () {
      switch (this.habit.frequency) {
        case Habit.FREQ_DAILY:
          this.habit.weekdays = []
          this.habit.monthlyType = null
          this.habit.planDays = []
          this.habit.planWeek = null
          break
        case Habit.FREQ_WEEKLY:
          this.habit.monthlyType = null
          this.habit.planDays = []
          this.habit.planWeek = null
          break
        case Habit.FREQ_MONTHLY:
          this.habit.weekdays = []
          this.habit.monthlyType = this.monthlyType
          switch (this.habit.monthlyType) {
            case Habit.MONTHLY_TYPE.DAY:
              // TODO: 複数日対応
              this.habit.planDays = [this.planDays]
              this.habit.planWeek = null
              break
            case Habit.MONTHLY_TYPE.WEEK:
              this.habit.planDays = []
              this.habit.planWeek = {
                index: parseInt(this.planWeek.index),
                day: parseInt(this.planWeek.day)
              }
              break
            case Habit.MONTHLY_TYPE.END:
            default:
              this.habit.planDays = []
              this.habit.planWeek = null
              break
          }
          break
        default:
          break
      }
    },

    cancel () {
      this.$destroy()
    },

    deleteHabit () {
      if (!confirm('この習慣を削除しますか？')) {
        return
      }
      this.$emit('delete', this.habit)
      this.$destroy()
    },

    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.refTitle.focus()
      }
    },
    validate () {
      let valid = true
      this.errorMsg = { title: '', frequency: '' }

      if (isEmpty(this.habit.title)) {
        valid = false
        this.errorMsg.title = '必須項目です'
      }
      if (this.habit.frequency === Habit.FREQ_WEEKLY &&
        this.habit.weekdays.length === 0) {
        valid = false
        this.errorMsg.frequency = '1つ以上選択してください'
      }
      return valid
    },
    initCalendar () {
      const today = new Date()
      this.setCalendar(today.getFullYear(), today.getMonth())
    },
    updateCalendar (page) {
      this.setCalendar(page.year, page.month - 1)
    },
    /**
     * カレンダーの表示情報を設定
     * @param {Number} year 年(西暦)
     * @param {Number} month 月(0-11)
     */
    setCalendar (year, month) {
      this.calenderAttributes = [
        {
          key: 'plan', // 実施予定
          dot: 'blue',
          dates: this.habit.getPlanDaysOfMonth(year, month)
        },
        {
          key: 'result', // 実績
          highlight: { color: 'blue', fillMode: 'light' },
          dates: this.habit.getResultDaysOfMonth(year, month)
        }
      ]
    }
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="h-12 p-2 flex items-center">
      <h1 class="text-xl font-bold">
        ガントチャート
      </h1>
    </div>

    <div ref="calendar" class="flex-1 overflow-auto w-full select-none">
      <div class="top-0 flex z-20 sticky" :style="`width: ${viewWidth}px;`">
        <div
          class="border-b border-black bg-green-100 flex sticky left-0 top-0"
          :style="`min-width: ${taskWidth}px;`"
        >
          <div class="py-2 h-full px-2 border-r border-black text-sm" style="width: 120px">
            タスク
          </div>
          <div class="py-2 h-full text-center border-r border-black text-sm" style="width: 90px">
            開始日
          </div>
          <div class="py-2 h-full text-center border-r border-black text-sm" style="width: 90px">
            期限日
          </div>
        </div>

        <div v-for="month of calendars" :key="month.title" class="border-b border-black bg-white" :style="`min-width: ${blockWidth * month.days}px;`">
          <!-- 年月 -->
          <div class="border-b border-r border-black px-2">
            {{ month.title }}
          </div>
          <!-- 日付 -->
          <div class="flex">
            <div
              v-for="day of month.days"
              :key="day.date"
              class="border-r border-black text-xs text-center"
              :class="weekendColor(day.dayOfWeek)"
              :style="`min-width: ${blockWidth}px;`"
            >
              {{ day.date }}
            </div>
          </div>
          <!-- 曜日 -->
          <div class="flex">
            <div
              v-for="day of month.days"
              :key="day.date"
              class="border-r border-black text-xs text-center"
              :class="weekendColor(day.dayOfWeek)"
              :style="`min-width: ${blockWidth}px;`"
            >
              {{ day.dayOfWeek }}
            </div>
          </div>
        </div>
      </div>

      <div class="relative" :style="`width: ${viewWidth}px;`">
        <!-- timeline -->
        <div
          v-for="i of totalDays"
          :key="`line-${i}`"
          class="absolute bg-gray-200 h-full w-px"
          :style="`left: ${i * blockWidth + taskWidth - 1}px;`"
        />
        <!-- today -->
        <div
          v-if="todayPosition >= 0"
          class="absolute bg-red-300 h-full"
          :style="`width: ${blockWidth - 1}px; left: ${todayPosition}px;`"
        />
        <!-- contents -->
        <div v-for="task of taskRows" :key="`task-${task.id}`" class="h-10 border-b border-black flex">
          <div class="bg-green-100 z-10 flex sticky left-0" :style="`min-width: ${taskWidth}px;`">
            <div class="py-2 h-full px-2 border-r border-black text-sm" style="width: 120px">
              {{ task.name }}
            </div>
            <div class="py-2 h-full text-center border-r border-black text-sm" style="width: 90px">
              {{ task.startDate }}
            </div>
            <div class="py-2 h-full text-center border-r border-black text-sm" style="width: 90px">
              {{ task.endDate }}
            </div>
          </div>
          <div
            :style="task.style"
            class="h-10 flex py-2 will-change-transform"
            @mousedown="onMouseDown_MoveStart($event, task)"
          >
            <div
              class="w-2 bg-yellow-200 rounded-l-lg cursor-col-resize"
              @mousedown.stop="onMouseDown_ResizeStart($event, task, 'left')"
            />
            <div class="flex-1 bg-yellow-200 pointer-events-none" />
            <div
              class="w-2 bg-yellow-200 rounded-r-lg cursor-col-resize"
              @mousedown.stop="onMouseDown_ResizeStart($event, task, 'right')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

const BLOCK_SIZE = 20
const TASK_WIDTH = 300

export default {
  name: 'Gantt',

  layout: 'board', // PC only

  data () {
    const _today = dayjs()

    return {
      dragging: false,
      leftResizing: false,
      rightResizing: false,
      target: {
        pageX: 0,
        element: null,
        task: null
      },
      blockWidth: BLOCK_SIZE,
      taskWidth: TASK_WIDTH,
      viewWidth: 0,
      contentWidth: 0,
      totalDays: 0,
      startMonth: _today.add(0, 'month').format('YYYY-MM'),
      endMonth: _today.add(1, 'month').format('YYYY-MM'),
      calendars: [],
      tasks: []
    }
  },

  computed: {
    // filteredTodos: {
    //   get () {
    //     return this.$store.getters['Todo/getFilteredTodos']
    //   }
    // },

    taskRows () {
      const startMonth = dayjs(this.startMonth)
      const endMonth = dayjs(this.endMonth)

      return this.tasks.map((task) => {
        const dateFrom = dayjs(task.startDate)
        const dateTo = dayjs(task.endDate)
        const between = dateTo.diff(dateFrom, 'day') + 1
        const start = dateFrom.diff(startMonth, 'day')
        const end = endMonth.diff(dateTo, 'day') + endMonth.daysInMonth()

        const pos = {
          x: start * BLOCK_SIZE,
          width: BLOCK_SIZE * between
        }

        const style = {
          width: `${pos.width}px`,
          transform: `translateX(${pos.x}px)`
        }

        // 表示範囲外の日付を含む場合は表示しない
        const isHidden = !(start >= 0 && end > 0)
        if (isHidden) {
          style.display = 'none'
        }

        return {
          style,
          pos,
          isHidden,
          ...task
        }
      })
    },

    todayPosition () {
      const today = dayjs()
      const startDate = dayjs(this.startMonth)
      const endDate = dayjs(this.endMonth)
      const diffFuture = today.diff(startDate, 'day')
      const diffPast = endDate.diff(today, 'day') + endDate.daysInMonth()
      return (diffFuture >= 0 && diffPast > 0)
        ? diffFuture * BLOCK_SIZE + TASK_WIDTH
        : -1
    }
  },

  mounted () {
    this.initView()
    this.makeTestData()
    document.addEventListener('mousemove', this.onMouseDown_Moving)
    document.addEventListener('mouseup', this.onMouseDown_MoveStop)
    document.addEventListener('mousemove', this.onMouseDown_Resizing)
    document.addEventListener('mouseup', this.onMouseDown_ResizeStop)
  },

  destroyed () {
    document.removeEventListener('mousemove', this.onMouseDown_Moving)
    document.removeEventListener('mouseup', this.onMouseDown_MoveStop)
    document.removeEventListener('mousemove', this.onMouseDown_Resizing)
    document.removeEventListener('mouseup', this.onMouseDown_ResizeStop)
  },

  methods: {
    initView () {
      this.serCalendar()
      this.totalDays = this.calendars.reduce((p, c) => p + c.days.length, 0)
      this.contentWidth = this.totalDays * this.blockWidth
      this.viewWidth = this.taskWidth + this.contentWidth
      this.$nextTick(() => {
        this.$refs.calendar.scrollLeft = this.todayPosition - TASK_WIDTH
      })
    },

    getDays (startMonth) {
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土']

      const days = []
      for (let i = 0; i < startMonth.daysInMonth(); i++) {
        const targetDate = startMonth.add(i, 'day')
        days.push({
          date: targetDate.date(),
          dayOfWeek: dayOfWeek[targetDate.day()]
        })
      }
      return days
    },

    serCalendar () {
      const startMonth = dayjs(this.startMonth)
      const endMonth = dayjs(this.endMonth)
      const betweenMonth = endMonth.diff(startMonth, 'month')
      for (let i = 0; i <= betweenMonth; i++) {
        const targetMonth = startMonth.add(i, 'month')
        this.calendars.push({
          title: targetMonth.format('YYYY-MM'),
          days: this.getDays(targetMonth)
        })
      }
    },

    onMouseDown_MoveStart (e, task) {
      this.dragging = true
      this.target.pageX = e.pageX
      this.target.element = e.target
      this.target.task = task
    },

    onMouseDown_Moving (e) {
      if (!this.dragging) { return }

      const realX = this.calcMovePositionX(e.pageX)
      this.target.element.style.transform = `translateX(${realX}px)`
    },

    onMouseDown_MoveStop (e) {
      if (!this.dragging) { return }
      const realX = this.calcMovePositionX(e.pageX)
      // 日付線にフィットさせる
      const days = Math.round((this.target.task.pos.x - realX) / BLOCK_SIZE)

      if (days !== 0) {
        const task = this.tasks.find(task => task.id === this.target.task.id)
        task['startDate'] = dayjs(task.startDate).add(-days, 'day').format('YYYY-MM-DD')
        task['endDate'] = dayjs(task.endDate).add(-days, 'day').format('YYYY-MM-DD')
      } else {
        this.target.element.style.transform = `translateX(${this.target.task.pos.x}px)`
      }

      this.dragging = false
      this.target.element = null
      this.target.task = null
      this.target.pageX = 0
    },

    onMouseDown_ResizeStart (e, task, direction) {
      if (direction === 'left') {
        this.leftResizing = true
      } else {
        this.rightResizing = true
      }
      this.target.pageX = e.pageX
      this.target.element = e.target.parentElement
      this.target.task = task
    },

    onMouseDown_Resizing (e) {
      if (this.leftResizing) {
        const realX = this.calcResizePositionX(e.pageX)
        const realWidth = this.calcLeftResizeWidth(e.pageX)
        this.target.element.style.transform = `translateX(${realX}px)`
        this.target.element.style.width = `${realWidth}px`
      }

      if (this.rightResizing) {
        const realWidth = this.calcRightResizeWidth(e.pageX)
        this.target.element.style.width = `${realWidth}px`
      }
    },

    onMouseDown_ResizeStop (e) {
      if (this.leftResizing) {
        const realX = this.calcResizePositionX(e.pageX)
        // 日付線にフィットさせる
        const days = Math.round((this.target.task.pos.x - realX) / BLOCK_SIZE)

        if (days !== 0) {
          const task = this.tasks.find(task => task.id === this.target.task.id)
          task['startDate'] = dayjs(task.startDate).add(-days, 'day').format('YYYY-MM-DD')
        } else {
          this.target.element.style.transform = `translateX(${this.target.task.pos.x}px)`
          this.target.element.style.width = `${this.target.task.pos.width}px`
        }
      }

      if (this.rightResizing) {
        const realWidth = this.calcRightResizeWidth(e.pageX)
        // 日付線にフィットさせる
        const days = Math.round((this.target.task.pos.width - realWidth) / BLOCK_SIZE)

        if (days !== 0) {
          const task = this.tasks.find(task => task.id === this.target.task.id)
          task['endDate'] = dayjs(task.endDate).add(-days, 'day').format('YYYY-MM-DD')
        } else {
          this.target.element.style.width = `${this.target.task.pos.width}px`
        }
      }

      this.leftResizing = false
      this.rightResizing = false
      this.target.element = null
      this.target.task = null
      this.target.pageX = 0
    },

    calcMovePositionX (currentPageX) {
      const diff = this.target.pageX - currentPageX

      return this.keepThreshold(
        this.target.task.pos.x - diff
        , 0
        , this.contentWidth - this.target.task.pos.width
      )
    },

    calcResizePositionX (currentPageX) {
      const diff = this.target.pageX - currentPageX

      return this.keepThreshold(
        this.target.task.pos.x - diff
        , 0
        , this.target.task.pos.x + this.target.task.pos.width - BLOCK_SIZE
      )
    },

    calcLeftResizeWidth (currentPageX) {
      const diff = this.target.pageX - currentPageX

      return this.keepThreshold(
        this.target.task.pos.width + diff
        , BLOCK_SIZE
        , this.target.task.pos.width + this.target.task.pos.x
      )
    },

    calcRightResizeWidth (currentPageX) {
      const diff = this.target.pageX - currentPageX

      return this.keepThreshold(
        this.target.task.pos.width - diff
        , BLOCK_SIZE
        , this.contentWidth - this.target.task.pos.x
      )
    },

    keepThreshold (value, min, max) {
      if (value <= min) { return min }
      if (value >= max) { return max }
      return value
    },

    weekendColor (dayOfWeek) {
      switch (dayOfWeek) {
        case '土':
          return 'bg-blue-100'
        case '日':
          return 'bg-red-100'
        default:
          return ''
      }
    },

    dragTask (dragTask) {
      this.task = dragTask
    },

    dragTaskOver (overTask) {
      let deleteIndex
      let addIndex
      if (overTask.id !== this.task.id) {
        this.tasks.forEach((task, index) => { if (task.id === this.task.id) { deleteIndex = index } })
        this.tasks.forEach((task, index) => { if (task.id === overTask.id) { addIndex = index } })
        this.tasks.splice(deleteIndex, 1)
        this.tasks.splice(addIndex, 0, this.task)
      }
    },

    // debug
    makeTestData () {
      const today = dayjs()
      for (let i = 1; i <= 30; i++) {
        this.tasks.push({
          id: i,
          name: `テスト${i}`,
          startDate: today.format('YYYY-MM-DD'),
          endDate: today.add(Math.floor(Math.random() * 5), 'day').format('YYYY-MM-DD')
        })
      }
    }
  }
}
</script>

<style scoped>
.sticky {
  position: sticky;
  position: -webkit-sticky;
}
.will-change-transform {
  will-change: transform;
}
.cursor-col-resize {
  cursor: col-resize;
}
</style>

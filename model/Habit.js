import moment from 'moment'
import { forDayEach, forDayReverseEach, getDateNumber } from '@/util/MomentEx.js'

export class Habit {
  static FREQ_DAILY = 'daily'
  static FREQ_WEEKLY = 'weekly'
  static WEEKDAYS = { 0: '日', 1: '月', 2: '火', 3: '水', 4: '木', 5: '金', 6: '土' }

  constructor (id, params) {
    this.id = id
    this.rootId = params.rootId
    this.title = params.title || null
    this.detail = params.detail || null
    this.isActive = (params.isActive !== undefined) ? params.isActive : true
    this.frequency = params.frequency || Habit.FREQ_DAILY // 繰り返し設定
    this.weekdays = params.weekdays || [] // 実施する曜日
    this.orderIndex = params.orderIndex || 0
    this.userId = params.userId || ''
    this.lastActivityDate = params.lastActivityDate || null // 前回実施日
    this.totalCount = params.totalCount || 0 // 通算対象回数(分母)
    this.totalActivityCount = params.totalActivityCount || 0 // 通算実施回数(分子)
    this.duration = params.duration || 0 // 継続期間
    this.maxduration = params.maxduration || 0 // 最長継続期間
    this.frequencyChangeDate = this.frequencyChangeDate || null // 繰り返し設定変更日
    this.summaryUpdatedAt = this.summaryUpdatedAt || null // 実績更新日
    // 実施予定日
    if (!params.plan) {
      this.plan = {}
      this.plan[`${new Date().getFullYear()}`] = Array.from({ length: 12 }, () => '0')
    } else {
      this.plan = params.plan
    }
    this.isPlanDay = false
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
    this.lastActivityDate_bk = this.lastActivityDate // 元に戻す時のバックアップ
  }

  getData () {
    const params = {
      title: this.title,
      rootId: this.rootId,
      detail: this.detail,
      isActive: this.isActive,
      frequency: this.frequency,
      weekdays: this.weekdays,
      orderIndex: this.orderIndex,
      userId: this.userId,
      lastActivityDate: this.lastActivityDate,
      totalCount: this.totalCount,
      duration: this.duration,
      maxduration: this.maxduration,
      totalActivityCount: this.totalActivityCount,
      frequencyChangeDate: this.frequencyChangeDate,
      summaryUpdatedAt: this.summaryUpdatedAt,
      plan: this.plan,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
    return params
  }

  /**
   * 実績の更新
   */
  updateSummary () {
    if (this.isActive === false) {
      return
    }
    if (this.summaryUpdatedAt === null || this.summaryUpdatedAt < getDateNumber()) {
      this.calcSummary()
      this.summaryUpdatedAt = getDateNumber()
    }
  }

  /**
   * 実績情報を計算
   */
  calcSummary () {
    // 初期化
    const today = new Date()
    const years = Object.keys(this.plan).sort()
    const firstYear = years.length > 0 ? years[0] : today.getFullYear()
    const unzipPlan = {}
    const firstCalc = this.summaryUpdatedAt === null

    // 非圧縮
    for (let y = firstYear; y <= today.getFullYear(); y++) {
      unzipPlan[y] = []
      this.plan[y].forEach((monthPlan) => {
        unzipPlan[y].push(this.unzip(monthPlan))
      })
    }

    // 実施予定日を計算
    if (!firstCalc) {
      const lastUpdate = moment(this.summaryUpdatedAt, 'YYYYMMDD').add(1, 'days').toDate()
      // 最終更新日の翌日から今日まで
      forDayEach(lastUpdate, today, (targetDate) => {
        if (this.calcPlanFlag(unzipPlan, targetDate)) {
          this.totalCount++ // 通算対象回数
        }
      })
    } else {
      if (this.calcPlanFlag(unzipPlan, today)) {
        this.totalCount++ // 通算対象回数
      }
    }

    // 前回実施予定日
    let lastPlanDate = null
    if (!firstCalc) {
      const firstday = new Date(firstYear, 0, 1)
      forDayReverseEach(firstday, today, (targetDate) => {
        const _y = targetDate.getFullYear()
        const _m = targetDate.getMonth()
        const _d = targetDate.getDate()
        if (unzipPlan[_y][_m][_d] === '1') {
          lastPlanDate = parseInt(`${_y}${_m}${_d}`)
          return true // 終了
        }
      })
    }

    // 今日が実施日か
    const _y = today.getFullYear()
    const _m = today.getMonth()
    const _d = today.getDate()
    if (unzipPlan[_y][_m][_d] === '1') {
      this.isPlanDay = true
    }

    // 圧縮
    // 実施予定日: 実績更新日から本日までの期間の実施予定日を更新
    for (let y = firstYear; y <= today.getFullYear(); y++) {
      unzipPlan[y].forEach((monthPlan, index) => {
        this.plan[y][index] = this.zip(monthPlan)
      })
    }

    // 最大継続数
    if (this.maxduration < this.duration) {
      this.maxduration = this.duration
    }

    // 継続数をリセット
    if (lastPlanDate !== null && this.lastActivityDate !== null &&
      lastPlanDate > this.lastActivityDate) {
      this.duration = 0
    }
  }

  /**
   * 非圧縮
   * @param {String} monthPlanHex 月間実行予定(16進数)
   * @returns {String[]} 月間の実施予定リスト(2進数)
   */
  unzip (monthPlanHex) {
    if (monthPlanHex !== '0') {
      // 16進数 -> 2進数の配列
      return parseInt(monthPlanHex, 16).toString(2).split('')
    } else {
      const arr = Array.from({ length: 32 }, () => '0')
      arr[0] = '1' // 32桁を維持するため、先頭は埋める
      return arr
    }
  }

  /**
   * 圧縮
   * @param {String[]} monthPlanBinaryArray 月間の実施予定リスト(2進数)
   * @returns {String} 16進数に変換した文字列
   */
  zip (monthPlanBinaryArray) {
    // 2進数の配列 -> 16進数
    return parseInt(monthPlanBinaryArray.join(''), 2).toString(16)
  }

  calcPlanFlag (unzipPlan, _date) {
    const _y = _date.getFullYear()
    const _m = _date.getMonth()
    const _d = _date.getDate()
    const _dw = _date.getDay().toString()
    if (this.frequency === Habit.FREQ_DAILY) {
      unzipPlan[_y][_m][_d] = '1'
      return true
    } else {
      // 実施日ならフラグを立てる
      if (this.weekdays.includes(_dw)) {
        unzipPlan[_y][_m][_d] = '1'
        return true
      }
    }
    return false
  }
}

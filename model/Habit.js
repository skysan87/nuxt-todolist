export class Habit {
  static FREQ_DAILY = 'daily'
  static FREQ_WEEKLY = 'weekly'
  static WEEKDAYS = { 0: '日', 1: '月', 2: '火', 3: '水', 4: '木', 5: '金', 6: '土' }

  constructor (id, params) {
    this.id = id
    this.rootId = params.rootId
    this.title = params.title || null
    this.detail = params.detail || null
    this.isActive = (params.isActive !== null || params.isActive !== undefined) ? params.isActive : true
    this.frequency = params.frequency || Habit.FREQ_DAILY // 頻度
    this.weekdays = params.weekdays || [] // 実施する曜日
    this.orderIndex = params.orderIndex || 0
    this.userId = params.userId || ''
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
    return params
  }
}

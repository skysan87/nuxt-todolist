export class Todolist {
  constructor (id, params) {
    this.id = id
    this.title = params.title || ''
    this.userId = params.userId || ''
    this.maxIndex = params.maxIndex || 0
    this.orderIndex = params.orderIndex || 0
    this.createdAt = params.createdAt
    this.updatedAt = params.updatedAt
  }

  getData () {
    const params = {
      id: this.id,
      title: this.title,
      deleteFlag: false,
      orderIndex: this.orderIndex,
      userId: this.userId,
      maxIndex: this.maxIndex,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
    return params
  }
}

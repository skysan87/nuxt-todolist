export class Todo {
  constructor (id, params) {
    this.id = id
    this.comment = params.comment || null
    this.state = params.state || 0
    this.note = params.note || null
    this.orderIndex = params.orderIndex || 0
    this.listId = params.listId || ''
    this.userId = params.userId || ''
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
  }

  getData () {
    const params = {
      comment: this.comment,
      state: this.state,
      note: this.note,
      orderIndex: this.orderIndex,
      listId: this.listId,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
    return params
  }
}

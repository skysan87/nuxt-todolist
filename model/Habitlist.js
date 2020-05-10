export class Habitlist {
  constructor (id, params) {
    this.id = id
    this.userId = params.userId || ''
    this.maxIndex = params.maxIndex || 0
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
  }

  getData () {
    const params = {
      userId: this.userId,
      maxIndex: this.maxIndex,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
    return params
  }
}

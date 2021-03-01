export class Config {
  constructor (id, params) {
    this.id = id
    this.userId = params.userId
    this.globalMessage = params.globalMessage || ''
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
  }

  getData () {
    return {
      userId: this.userId,
      globalMessage: this.globalMessage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

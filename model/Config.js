export class Config {
  constructor (id, params) {
    this.id = id
    this.userId = params.userId
    this.globalMessage = params.globalMessage || ''
  }
}

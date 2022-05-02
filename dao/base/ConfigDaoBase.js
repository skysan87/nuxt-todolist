/* eslint-disable */
import { Config } from '@/model/Config'

export class ConfigDaoBase {

  constructor() {
  }

  async getByUserId(userId) {
    const config = new Config('', {})
    config.id = Date.now().toString()
    config.userId = userId
    config.globalMessage = 'this is demo message.'
    return [ config ]
  }

  async add (userId) {
    const config = new Config('', { userId })
    config.id = Date.now().toString()

    return config
  }

  async update(config) {
    return true
  }
}

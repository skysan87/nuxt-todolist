/* eslint-disable */
import User from '@/model/User'

export class UserDaoBase {

  init() {
    console.log('init')
  }

  async login() {
    return true
  }

  async logout() {
    return true
  }

  async auth() {
    const user = new User()
    user.id = 'dummy_user_id'
    user.email = 'user1@dummy.local'
    user.displayName = 'user1'
    return user
  }
}

import { authMock } from '@/plugins/mock'

export class UserDaoBase {
  async login () {
    await authMock.login()
    return true
  }

  async logout () {
    await authMock.logout()
    return true
  }
}

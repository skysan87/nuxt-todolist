import { authMock } from '@/plugins/mock'

export class UserDaoBase {
  async login () {
    return await authMock.login()
  }

  async logout () {
    await authMock.logout()
    return true
  }
}

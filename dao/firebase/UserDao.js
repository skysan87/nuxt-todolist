import { auth, authProvider } from '@/plugins/firebase'
import { UserDaoBase } from '@/dao/base/UserDaoBase'
// import store from '@/store'

export class UserDao extends UserDaoBase {
  async login () {
    try {
      await auth.signInWithRedirect(authProvider)
      return true
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async logout () {
    try {
      await auth.signOut()
      return true
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  init () {}
}

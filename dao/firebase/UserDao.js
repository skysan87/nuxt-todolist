// import { auth, authProvider } from '@/plugins/firebase'
import { auth } from '@/plugins/firebase'
import { UserDaoBase } from '@/dao/base/UserDaoBase'

export class UserDao extends UserDaoBase {
  login () {
    return new Promise((resolve, reject) => {
      auth.signInAnonymously()
      // auth.signInWithPopup(authProvider)
        .then((result) => {
          resolve(result.user)
        })
        .catch((error) => {
          reject(error)
        })
    })
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
}

import { auth, authProvider } from '@/plugins/firebase'
import { UserDaoBase } from '@/dao/base/UserDaoBase'

const activeGoogleAuth = process.env.GOOGLE_AUTH === '1'

export class UserDao extends UserDaoBase {
  login () {
    return new Promise((resolve, reject) => {
      if (activeGoogleAuth) {
        // リダイレクト
        auth.signInWithRedirect(authProvider)
          .then((result) => {
            resolve(result.user)
          })
          .catch((error) => {
            reject(error)
          })
      } else {
        auth.signInAnonymously()
          .then((result) => {
            resolve(result.user)
          })
          .catch((error) => {
            reject(error)
          })
      }
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

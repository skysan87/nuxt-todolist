import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDERID,
  appId: process.env.FIREBASE_APP_ID
}

const firebaseApp = firebase.initializeApp(config)

export const firestore = firebaseApp.firestore()

// 認証状態の永続性
// SESSION: タブが表示している間のみログイン情報を保持
// LOCAL: ログアウトしない限りログイン状態
firebaseApp.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)

export const auth = firebaseApp.auth()

export const authProvider = new firebase.auth.GoogleAuthProvider()

export function getServerTimestamp () {
  return firebase.firestore.FieldValue.serverTimestamp()
}

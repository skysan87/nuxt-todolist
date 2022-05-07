import { collection, query, where, getDocs, limit, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore/lite'
import { firestore } from '@/plugins/firebase'
import { ConfigDaoBase } from '@/dao/base/ConfigDaoBase'
import { Config } from '@/model/Config'

const configsRef = collection(firestore, 'configs')

export class ConfigDao extends ConfigDaoBase {
  async getByUserId (userId) {
    const q = query(configsRef
      , where('userId', '==', userId)
      , limit(1))
    const querySnapshot = await getDocs(q)
    const list = querySnapshot.docs.map((doc) => {
      return new Config(doc.id, doc.data())
    })
    return list
  }

  async add (userId) {
    const config = new Config('', {})
    config.userId = userId
    config.createdAt = serverTimestamp()
    config.updatedAt = serverTimestamp()

    const docRef = await addDoc(configsRef, config.getData())
    config.id = docRef.id
    return config
  }

  async update (config) {
    const docRef = doc(configsRef, config.id)
    await updateDoc(docRef,
      {
        globalMessage: config.globalMessage,
        updatedAt: serverTimestamp()
      })
    return true
  }
}

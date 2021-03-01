import { firestore, getServerTimestamp } from '@/plugins/firebase'
import { ConfigDaoBase } from '@/dao/base/ConfigDaoBase'
import { Config } from '@/model/Config'

const configsRef = firestore.collection('configs')

export class ConfigDao extends ConfigDaoBase {
  async getByUserId (userId) {
    try {
      const querySnapshot = await configsRef.where('userId', '==', userId).limit(1).get()
      const list = querySnapshot.docs.map((doc) => {
        return new Config(doc.id, doc.data())
      })
      return list
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async add (userId) {
    const config = new Config('', {})
    config.userId = userId
    config.createdAt = getServerTimestamp()
    config.updatedAt = getServerTimestamp()

    const returnValues = {
      isSuccess: false,
      value: null
    }

    try {
      const docRef = await configsRef.add(config.getData())
      config.id = docRef.id
      returnValues.isSuccess = true
      returnValues.value = config
      return returnValues
    } catch (error) {
      console.error(error)
      returnValues.isSuccess = false
      return returnValues
    }
  }

  async update (config) {
    try {
      await configsRef.doc(config.id)
        .update({
          globalMessage: config.globalMessage,
          updatedAt: getServerTimestamp()
        })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}

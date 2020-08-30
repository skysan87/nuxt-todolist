import StoreDefine from '@/plugins/StoreDefine'

class DB {
  constructor () {
    this._db = null
    this._dbName = 'what_to_do_today'
    this.init()
  }

  async init () {
    await this.connect()
  }

  getInstance () {
    return this._db
  }

  connect () {
    return new Promise((resolve, reject) => {
      const req = window.indexedDB.open(this._dbName, 1)

      req.onsuccess = (event) => {
        this._db = event.target.result
        resolve('DB connected')
      }

      req.onerror = () => {
        reject(req.error)
      }

      // DBのバージョン更新時
      req.onupgradeneeded = (event) => {
        const db = event.target.result
        this.createStore(db)
      }
    })
  }

  createStore (db) {
    for (const storeDef of StoreDefine) {
      if (!db.objectStoreNames.contains(storeDef.name)) {
        const store = db.createObjectStore(storeDef.name, { keyPath: 'id' })
        // 検索に使用するindexを設定
        for (const index of storeDef.indexes) {
          store.createIndex(index.name, index.key, index.option)
        }
      }
    }
  }
}

// Singleton
export default new DB()

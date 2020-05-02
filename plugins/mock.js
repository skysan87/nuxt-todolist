class AuthObserver {
  constructor () {
    this.callback = null
  }

  sleep (msec) {
    return new Promise(resolve => setTimeout(resolve, msec))
  }

  async login () {
    const user = {
      id: 'dummyId',
      email: 'dummy@mail.com',
      displayName: 'dummy user'
    }
    if (this.callback !== null) {
      await this.sleep(800)
      this.callback(user)
    }
  }

  async logout () {
    const user = {
      id: '',
      email: '',
      displayName: ''
    }
    if (this.callback !== null) {
      await this.sleep(800)
      this.callback(user)
    }
  }

  onAuthStateChanged = (_callback) => {
    this.callback = _callback
  }
}

export const authMock = new AuthObserver()

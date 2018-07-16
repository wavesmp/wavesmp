const gInit = require('./googleInit')


class Google {
  constructor(authOpts) {
    this.gInit = gInit(authOpts)
  }

  async getAuthInstance() {
    await this.gInit
    return gapi.auth2.getAuthInstance()
  }

  async signIn() {
    const gAuth = await this.getAuthInstance()
    return gAuth.signIn()
  }

  async signOut() {
    const gAuth = await this.getAuthInstance()
    return gAuth.signOut()
  }

  /* If the user is already logged in, return the token.
   * Otherwise, return null */
  async tryAutoLogin() {
    const gAuth = await this.getAuthInstance()
    if (!gAuth.isSignedIn.get()) {
      return null
    }
    const gUser = gAuth.currentUser.get()
    const gAuthResp = gUser.getAuthResponse()
    const token = gAuthResp.id_token
    return {token}
  }
}

module.exports = Google

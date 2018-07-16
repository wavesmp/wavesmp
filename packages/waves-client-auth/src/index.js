const google = require('./google')

const idpClasses = {
  google
}

class Auth {
  constructor(idps) {
    this.idps = {}
    for (const idp in idps) {
      const idpArgs = idps[idp]
      const idpClass = idpClasses[idp]

      this.idps[idp] = new idpClass(idpArgs)
    }
  }

  async signIn(idp) {
    return await this.idps[idp].signIn()
  }

  async signOut(idp) {
    return await this.idps[idp].signOut()
  }

  /* If the user is already logged in, return the token.
   * Otherwise, return null */
  async tryAutoLogin(idp) {
    return await this.idps[idp].tryAutoLogin()
  }
}

module.exports = Auth

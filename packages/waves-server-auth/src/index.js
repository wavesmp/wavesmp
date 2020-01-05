const google = require('./google')

const idpClasses = {
  google
}

class Auth {
  constructor(idps) {
    this.idps = {}
    for (const idp in idps) {
      const idpArgs = idps[idp]
      const IdpClass = idpClasses[idp]

      this.idps[idp] = new IdpClass(idpArgs)
    }
  }

  async login(idp, token) {
    const idpAuth = this.idps[idp]
    if (!idpAuth) {
      throw new Error(`Invalid identity provider: ${idp}`)
    }
    return idpAuth.login(token)
  }
}

module.exports = Auth

const { OAuth2Client } = require('google-auth-library')

class Auth {
  constructor({ clientIds }) {
    this.clientIds = clientIds
    this.client = new OAuth2Client()
  }

  async login(token) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: this.clientIds
    })
    const payload = ticket.getPayload()
    const { email, name, sub } = payload
    return { idp: 'google', idpId: sub, name, email }
  }
}

module.exports = Auth

const rp = require('request-promise')

const log = require('waves-server-logger')

const LOGIN_URL = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='
const IDP = 'google'

class Auth {
  constructor({clientIds}) {
    this.clientIds = clientIds
  }

  async login(token) {
    let authResp
    try {
      authResp = await rp({
        uri: LOGIN_URL + token,
        json: true // Parse the JSON string in the response
      })
    } catch (err) {
      const errMsg = `Unable to authenticate user: ${err}`
      log.error(errMsg)
      throw new Error(errMsg)
    }

    // sub - idp id
    // aud - client id
    const { aud, email, name, sub } = authResp
    if (this.clientIds.indexOf(aud) < 0) {
      const errMsg = `Invalid client id ${aud} found for user ${name} (${email})`
      log.error(errMsg)
      throw new Error(errMsg)
    }

    return {idp: IDP, idpId: sub, name, email}
  }
}

module.exports = Auth

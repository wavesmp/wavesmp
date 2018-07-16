const Promise = require('bluebird')

function googleInit(authOpts) {
  return new Promise((resolve, reject) => {
    gapi.load('auth2', () => {
      gapi.auth2.init(authOpts).then(() => { resolve() })
    })
  })
}

module.exports = googleInit

function googleInit(authOpts) {
  return new Promise(resolve => {
    gapi.load('auth2', () => {
      gapi.auth2.init(authOpts).then(() => {
        resolve()
      })
    })
  })
}

module.exports = googleInit

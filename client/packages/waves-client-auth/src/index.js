const google = require("./google");

const idpClasses = {
  google,
};

class Auth {
  constructor(idps) {
    this.idps = {};
    for (const idp in idps) {
      const idpArgs = idps[idp];
      const IdpClass = idpClasses[idp];

      this.idps[idp] = new IdpClass(idpArgs);
    }
  }

  async signIn(idp) {
    return this.idps[idp].signIn();
  }

  renderButton(idp, element, onSignIn) {
    this.idps[idp].renderButton(element, onSignIn);
  }

  async signOut(idp) {
    return this.idps[idp].signOut();
  }

  /* If the user is already logged in, return the token.
   * Otherwise, return null */
  async tryAutoLogin(idp) {
    return this.idps[idp].tryAutoLogin();
  }
}

module.exports = Auth;

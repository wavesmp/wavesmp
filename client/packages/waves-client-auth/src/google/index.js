/* ID tokens last an hour. Re-prompt a little before that */
const TOKEN_LIFETIME_MS = 55 * 60 * 1000;

/* Google Identity Services does not refresh tokens. An expired token is
 * replaced by prompting again, and auto_select signs returning users in
 * without a click */
class Google {
  constructor(authOpts) {
    google.accounts.id.initialize({
      auto_select: true,
      use_fedcm_for_prompt: true,
      ...authOpts,
      callback: ({ credential }) => {
        this.token = credential;
        this.expiresAt = Date.now() + TOKEN_LIFETIME_MS;
        const onToken = this.onPromptToken || this.onSignIn;
        if (onToken) {
          onToken(credential);
        }
      },
    });
  }

  renderButton(element, onSignIn) {
    this.onSignIn = onSignIn;
    google.accounts.id.renderButton(element, { size: "large" });
  }

  async signIn() {
    const token = await this.tryAutoLogin();
    if (!token) {
      throw new Error("Google sign in was cancelled");
    }
    return token;
  }

  async signOut() {
    this.token = null;
    google.accounts.id.disableAutoSelect();
  }

  /* If the user is already logged in, return the token.
   * Otherwise, return null */
  async tryAutoLogin() {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }
    this.prompt =
      this.prompt ||
      new Promise((resolve) => {
        this.onPromptToken = resolve;
        google.accounts.id.prompt((n) => {
          if (
            n.isSkippedMoment() ||
            (n.isDismissedMoment() &&
              n.getDismissedReason() !== "credential_returned")
          ) {
            resolve(null);
          }
        });
      }).finally(() => {
        this.prompt = null;
        this.onPromptToken = null;
      });
    return this.prompt;
  }
}

module.exports = Google;

import type { GoogleAuthOpts } from "src/config/configTypes";

/* ID tokens last an hour. Re-prompt a little before that */
const TOKEN_LIFETIME_MS = 55 * 60 * 1000;

type OnToken = (token: string) => void;

/* Google Identity Services does not refresh tokens. An expired token is
 * replaced by prompting again, and auto_select signs returning users in
 * without a click */
class Google {
  token: string | null;
  expiresAt: number;
  onSignIn: OnToken | null;
  onPromptToken: ((token: string | null) => void) | null;
  prompt: Promise<string | null> | null;

  constructor(authOpts: GoogleAuthOpts) {
    this.token = null;
    this.expiresAt = 0;
    this.onSignIn = null;
    this.onPromptToken = null;
    this.prompt = null;
    google.accounts.id.initialize({
      auto_select: true,
      use_fedcm_for_prompt: true,
      ...authOpts,
      callback: ({ credential }) => {
        this.token = credential;
        this.expiresAt = Date.now() + TOKEN_LIFETIME_MS;
        const onToken = this.onPromptToken ?? this.onSignIn;
        if (onToken) {
          onToken(credential);
        }
      },
    });
  }

  renderButton(element: HTMLElement, onSignIn: OnToken): void {
    this.onSignIn = onSignIn;
    google.accounts.id.renderButton(element, { size: "large" });
  }

  async signIn(): Promise<string> {
    const token = await this.tryAutoLogin();
    if (!token) {
      throw new Error("Google sign in was cancelled");
    }
    return token;
  }

  async signOut(): Promise<void> {
    this.token = null;
    google.accounts.id.disableAutoSelect();
    return Promise.resolve();
  }

  /* If the user is already logged in, return the token.
   * Otherwise, return null */
  async tryAutoLogin(): Promise<string | null> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }
    this.prompt ??= new Promise<string | null>((resolve) => {
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

export { Google };

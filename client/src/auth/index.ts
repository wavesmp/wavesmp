import type { GoogleAuthOpts } from "src/config/configTypes";

import { Google } from "./google";

/* Identity providers and their options */
interface AuthOpts {
  google?: GoogleAuthOpts;
}

type Idp = keyof AuthOpts;

class Auth {
  idps: Partial<Record<Idp, Google>>;

  constructor(authOpts: AuthOpts) {
    this.idps = {};
    if (authOpts.google) {
      this.idps.google = new Google(authOpts.google);
    }
  }

  getIdp(idp: string): Google {
    const provider = idp in this.idps ? this.idps[idp as Idp] : undefined;
    if (!provider) {
      throw new Error(`Unknown identity provider: ${idp}`);
    }
    return provider;
  }

  async signIn(idp: string): Promise<string> {
    return this.getIdp(idp).signIn();
  }

  renderButton(
    idp: string,
    element: HTMLElement,
    onSignIn: (token: string) => void,
  ): void {
    this.getIdp(idp).renderButton(element, onSignIn);
  }

  async signOut(idp: string): Promise<void> {
    await this.getIdp(idp).signOut();
  }

  /* If the user is already logged in, return the token.
   * Otherwise, return null */
  async tryAutoLogin(idp: string): Promise<string | null> {
    return this.getIdp(idp).tryAutoLogin();
  }
}

export { Auth };
export type { AuthOpts };

import type { JSX } from "react";
import { memo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

import type { BoundActions } from "src/providers/dispatcher";

import { getFrom } from "../routes/routeState";

// import { UserInput } from "./userInput";

interface SignInProps {
  actions: BoundActions;
}

/* Google sign in errors have an error field */
function getErrMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "error" in err) {
    const { error } = err;
    if (typeof error === "string" && error) {
      return error;
    }
  }
  return String(err);
}

const SignIn = memo(function SignIn({ actions }: SignInProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  async function signIn(): Promise<void> {
    try {
      const idp = "google";
      await actions.signIn(idp);
      void actions.retryLoginOnConnect(idp);
      await navigate(getFrom(location));
    } catch (err) {
      actions.toastErr(getErrMessage(err));
      console.log("Error signing in");
      console.log(err);
    }
  }

  /* The sign in button is rendered once, so give it a stable callback
   * that calls the latest signIn (with the latest props) */
  const signInRef = useRef(signIn);
  useEffect(() => {
    signInRef.current = signIn;
  });
  useEffect(() => {
    const button = googleButtonRef.current;
    if (!button) {
      return;
    }
    actions.renderSignInButton("google", button, () => {
      void signInRef.current();
    });
  }, [actions]);

  // Custom user/pass not supported
  // <UserInput iconClass='fa-user-plus' placeholder='Email Address'/>
  // <UserInput iconClass='fa-key' placeholder='Password'/>
  // <label className='btn btn-ok site-create-account-button' onClick={onUnsupportedClick}>Create Account</label>
  // <div className='site-idp-separator'/>
  // <p className='site-idp-separator-words'><strong>OR</strong></p>
  // <div className='site-idp-separator'/>

  return (
    <div className="site-main-left">
      <h1>
        <strong>Waves Music Player</strong>
      </h1>
      <h2>Your Music</h2>
      <h2>On Any Device</h2>
      <h2>On Any Platform</h2>
      <div className="site-login-separator" />
      <h3>Start playing now</h3>
      <div className="site-google-button" ref={googleButtonRef} />
    </div>
  );
});

export { SignIn };

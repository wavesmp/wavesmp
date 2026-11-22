import { memo, useEffect, useRef } from "react";

import { routes } from "src/constants";

// import { UserInput } from "./userInput";

const SignIn = memo(function SignIn({ actions, history, location }) {
  const googleButtonRef = useRef(null);

  async function signIn() {
    try {
      const idp = "google";
      await actions.signIn(idp);
      actions.retryLoginOnConnect(idp);
      const from = (location.state && location.state.from) || {
        pathname: routes.defaultRoute,
      };
      history.push(from);
    } catch (err) {
      actions.toastErr(err.error || `${err}`);
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
    actions.renderSignInButton("google", googleButtonRef.current, () =>
      signInRef.current(),
    );
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

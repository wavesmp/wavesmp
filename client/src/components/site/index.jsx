import { memo } from "react";

import { useActions, useWavesSelector } from "src/providers/hooks";

import "./index.css";

import { Boundary } from "../boundary";
import { MenuBar } from "../menubar/site";
import { Toasts } from "../toasts";
import { Preview } from "./preview";
import { SignIn } from "./signin";

const Site = memo(function Site(ownProps) {
  const actions = useActions();
  const stateProps = useWavesSelector((state) =>
    selectStateProps(state, ownProps),
  );
  const props = { ...ownProps, ...stateProps, actions };

  const { err, location, history, theme, toasts } = props;
  return (
    <Boundary err={err}>
      <>
        <MenuBar />
        <SignIn actions={actions} location={location} history={history} />
        <Preview theme={theme} />
        <Toasts actions={actions} toasts={toasts} />
      </>
    </Boundary>
  );
});

function selectStateProps(state) {
  return {
    err: state.err,
    theme: state.account.theme,
    toasts: state.toasts,
  };
}

export { Site };

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as WavesActions from "src/actions";

import "./index.css";

import { Boundary } from "../boundary";
import { MenuBar } from "../menubar/site";
import { Toasts } from "../toasts";
import { Preview } from "./preview";
import { SignIn } from "./signin";

class SiteComponent extends React.PureComponent {
  render() {
    const { actions, err, location, history, theme, toasts } = this.props;
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
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    err: state.err,
    theme: state.account.theme,
    toasts: state.toasts,
  };
}

const Site = connect(mapStateToProps, mapDispatchToProps)(SiteComponent);

export { Site };

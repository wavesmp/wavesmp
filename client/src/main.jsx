import "./polyfills";

import { createBrowserHistory } from "history";
import { render } from "react-dom";
import { Router } from "react-router";
import { Switch } from "react-router-dom";

import { Auth } from "src/auth";
import { LocalState } from "src/localState";
import { Player } from "src/player";
import { Provider } from "src/providers/provider";
import { WavesSocket } from "src/socket";

import "./styles";

import { MainApp } from "./components/main";
import { PrivateRoute, PublicRoute } from "./components/routes";
import { Site } from "./components/site";

import { config } from "./config/config";

const { googleAuthOpts, s3Opts, server, defaultTrackSource } = config;

const history = createBrowserHistory();
const ws = new WavesSocket(() => new WebSocket(server));
const auth = new Auth({ google: googleAuthOpts });
const player = new Player({ s3: s3Opts, file: undefined, defaultTrackSource });
const localState = new LocalState(localStorage);

/* Side effect objects, passed to actions */
const extraArgument = { localState, player, ws, auth };

render(
  <Provider extraArgument={extraArgument} history={history}>
    <Router history={history}>
      <Switch>
        <PublicRoute path="/" exact component={Site} />
        <PrivateRoute path="/" component={MainApp} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById("app"),
);

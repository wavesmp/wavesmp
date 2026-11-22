import "./polyfills";

import { createBrowserHistory } from "history";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { Switch } from "react-router-dom";
import { applyMiddleware, createStore } from "redux";
import ReduxThunk from "redux-thunk";

import { Auth } from "src/auth";
import { LocalState } from "src/localState";
import { Player } from "src/player";
import { rootReducer } from "src/reducer";
import { WavesSocket } from "src/socket";

import "./styles";

import { MainApp } from "./components/main";
import { PrivateRoute, PublicRoute } from "./components/routes";
import { Site } from "./components/site";

import { config } from "./config/config";
import { storeListener } from "./listener";

const { googleAuthOpts, s3Opts, server, defaultTrackSource } = config;

const history = createBrowserHistory();
const ws = new WavesSocket(() => new WebSocket(server));
const auth = new Auth({ google: googleAuthOpts });
const player = new Player({ s3: s3Opts, file: undefined, defaultTrackSource });
const localState = new LocalState(localStorage);

const reduxMiddleware = applyMiddleware(
  /* Include extra args for side effects */
  ReduxThunk.withExtraArgument({ localState, player, ws, auth }),
);
const store = createStore(rootReducer, reduxMiddleware);

render(
  <Provider store={store}>
    <Router history={history}>
      <Switch>
        <PublicRoute path="/" exact component={Site} />
        <PrivateRoute path="/" component={MainApp} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById("app"),
);

/* Objects need store access for dispatching on events
 * e.g. When player track ends, storage is available, location change.
 * Independent from component lifecycle */
storeListener(store, ws, player, localState, history);

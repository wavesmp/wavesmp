import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { Auth } from "src/auth";
import { LocalState } from "src/localState";
import { Player } from "src/player";
import { Provider } from "src/providers/provider";
import { RouterListener } from "src/providers/routerListener";
import { WavesSocket } from "src/socket";
import type { ExtraArgument } from "src/types/actionTypes";

import "./styles";

import { MainApp } from "./components/main";
import { PrivateRoute, PublicRoute } from "./components/routes";
import { Site } from "./components/site";

import { config } from "./config/config";

const { googleAuthOpts, s3Opts, server, defaultTrackSource } = config;

const ws = new WavesSocket(() => new WebSocket(server));
const auth = new Auth({ google: googleAuthOpts });
const player = new Player({ s3: s3Opts, file: undefined, defaultTrackSource });
const localState = new LocalState(localStorage);

/* Side effect objects, passed to actions */
const extraArgument: ExtraArgument = { localState, player, ws, auth };

const app = document.getElementById("app");
if (!app) {
  throw new Error("Missing #app element");
}

createRoot(app).render(
  <Provider extraArgument={extraArgument}>
    <BrowserRouter>
      <RouterListener />
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Site />
            </PublicRoute>
          }
        />
        <Route
          path="*"
          element={
            <PrivateRoute>
              <MainApp />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </Provider>,
);

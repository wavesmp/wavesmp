import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import { applyMiddleware, createStore } from 'redux'
import ReduxThunk from 'redux-thunk'

import * as WavesActions from 'waves-client-actions'
import Auth from 'waves-client-auth'
import LocalState from 'waves-client-local-state'
import rootReducer from 'waves-client-reducer'
import Player from 'waves-client-player'
import WavesSocket from 'waves-socket'

import './styles'

import MainApp from './components/main'
import Site from './components/site'
import { PublicRoute, PrivateRoute } from './components/routes'

import { googleAuthOpts, s3Opts, server } from './config.json'
import storeListener from './listener'

const ws = new WavesSocket(new WebSocket(server))
const auth = new Auth({google: googleAuthOpts})
const player = new Player({s3: s3Opts, file: undefined})
const localState = new LocalState(localStorage)

const reduxMiddleware = applyMiddleware(
  /* Include extra args for side effects */
  ReduxThunk.withExtraArgument({localState, player, ws, auth})
)
const store = createStore(rootReducer, reduxMiddleware)

render((
  <Provider store={store}>
    <Router>
      <Switch>
        <PublicRoute path='/' exact={true} component={Site}/>
        <PrivateRoute path='/' component={MainApp}/>
      </Switch>
    </Router>
  </Provider>
  ),
  document.getElementById('app'))

/* Objects need store access for dispatching on events
 * e.g. When player track ends, storage is available.
 * Independent from component lifecycle */
storeListener(store, ws, player, localState)

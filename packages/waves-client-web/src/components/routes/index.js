import React from 'react'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

import { routes } from 'waves-client-constants'

import './index.css'

/* Redirect to site if not authenticated */
class PrivateRoute extends React.PureComponent {
  renderRoute = routeProps => {
    const { account, component: Component } = this.props
    const { user } = account
    if (user) {
      return <Component {...routeProps} />
    }
    return (
      <Redirect
        to={{
          pathname: '/',
          state: { from: routeProps.location }
        }}
      />
    )
  }

  render() {
    const { path } = this.props
    return <Route path={path} render={this.renderRoute} />
  }
}

/* Redirect to app if authenticated */
class PublicRoute extends React.PureComponent {
  renderRoute = routeProps => {
    const { account, component: Component } = this.props
    const { fetchingUser, user } = account
    if (fetchingUser) {
      return (
        <div className='absolute-center'>
          <i className='fa fa-spinner fa-pulse routes-loading' />
        </div>
      )
    }
    if (user) {
      const defaultFrom = { from: { pathname: routes.defaultRoute } }
      const { from } = routeProps.location.state || defaultFrom
      return <Redirect to={from} />
    }
    return <Component {...routeProps} />
  }

  render() {
    const { path, exact } = this.props
    return <Route path={path} exact={exact} render={this.renderRoute} />
  }
}

function mapStateToProps(state) {
  return { account: state.account }
}

const ConnectedPrivateRoute = connect(mapStateToProps)(PrivateRoute)
const ConnectedPublicRoute = connect(mapStateToProps)(PublicRoute)

export {
  ConnectedPrivateRoute as PrivateRoute,
  ConnectedPublicRoute as PublicRoute
}

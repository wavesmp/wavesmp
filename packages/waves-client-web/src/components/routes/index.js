import React from 'react'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

import { routes } from 'waves-client-constants'

/* Redirect to main site if not authenticated */
class PrivateRoute extends React.PureComponent {
  render() {
    const { account, component: Component, ...rest } = this.props
    const { user } = account
    return (
      <Route
        {...rest}
        render={props =>
          user ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{
                pathname: '/',
                state: { from: props.location }
              }}
            />
          )
        }
      />
    )
  }
}

/* Redirect to main app if authenticated */
class PublicRoute extends React.PureComponent {
  render() {
    const { account, component: Component, ...rest } = this.props
    const { fetchingUser, user } = account
    return (
      <Route
        {...rest}
        render={props => {
          if (fetchingUser) {
            return (
              <div className='absolute-center'>
                <i
                  className='fa fa-spinner fa-pulse'
                  style={{ fontSize: '150px' }}
                />
              </div>
            )
          }
          if (user) {
            const defaultFrom = { from: { pathname: routes.defaultRoute } }
            const { from } = props.location.state || defaultFrom
            return <Redirect to={from} />
          }
          return <Component {...props} />
        }}
      />
    )
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

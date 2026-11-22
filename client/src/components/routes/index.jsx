import { memo, useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";

import { routes } from "src/constants";
import { useAccount } from "src/providers/hooks";

import "./index.css";

const LOADING_TIMEOUT = 4000;

function LoadingComponent() {
  return (
    <div className="absolute-center routes-loading">
      <i className="fa fa-spinner fa-pulse routes-loading-icon" />
      <h1>Taking longer than usual...</h1>
    </div>
  );
}

/* Whether fetching the user has taken longer than LOADING_TIMEOUT
 * since the route was mounted */
function useLoadingTimedOut() {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setTimedOut(true), LOADING_TIMEOUT);
    return () => clearTimeout(timeout);
  }, []);
  return timedOut;
}

/* Redirect to site if not authenticated */
const PrivateRoute = memo(function PrivateRoute({
  component: Component,
  path,
}) {
  const { fetchingUser, user } = useAccount();
  const loadingTimedOut = useLoadingTimedOut();

  function renderRoute(routeProps) {
    if (fetchingUser) {
      if (loadingTimedOut) {
        return <LoadingComponent />;
      }
      /* May want to display loading icon if this takes long */
      return null;
    }
    if (user) {
      return <Component {...routeProps} />;
    }
    return (
      <Redirect
        to={{
          pathname: "/",
          state: { from: routeProps.location },
        }}
      />
    );
  }

  return <Route path={path} render={renderRoute} />;
});

/* Redirect to app if authenticated */
const PublicRoute = memo(function PublicRoute({
  component: Component,
  path,
  exact,
}) {
  const { fetchingUser, user } = useAccount();
  const loadingTimedOut = useLoadingTimedOut();

  function renderRoute(routeProps) {
    if (fetchingUser) {
      if (loadingTimedOut) {
        return <LoadingComponent />;
      }
      return null;
    }
    if (user) {
      const defaultFrom = { from: { pathname: routes.defaultRoute } };
      const { from } = routeProps.location.state || defaultFrom;
      return <Redirect to={from} />;
    }
    return <Component {...routeProps} />;
  }

  return <Route path={path} exact={exact} render={renderRoute} />;
});

export { PrivateRoute, PublicRoute };

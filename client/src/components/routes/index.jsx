import { memo, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

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
const PrivateRoute = memo(function PrivateRoute({ children }) {
  const { fetchingUser, user } = useAccount();
  const loadingTimedOut = useLoadingTimedOut();
  const location = useLocation();

  if (fetchingUser) {
    if (loadingTimedOut) {
      return <LoadingComponent />;
    }
    /* May want to display loading icon if this takes long */
    return null;
  }
  if (user) {
    return children;
  }
  return <Navigate to="/" state={{ from: location }} replace />;
});

/* Redirect to app if authenticated */
const PublicRoute = memo(function PublicRoute({ children }) {
  const { fetchingUser, user } = useAccount();
  const loadingTimedOut = useLoadingTimedOut();
  const location = useLocation();

  if (fetchingUser) {
    if (loadingTimedOut) {
      return <LoadingComponent />;
    }
    return null;
  }
  if (user) {
    const defaultFrom = { from: { pathname: routes.defaultRoute } };
    const { from } = location.state || defaultFrom;
    return <Navigate to={from} replace />;
  }
  return children;
});

export { PrivateRoute, PublicRoute };

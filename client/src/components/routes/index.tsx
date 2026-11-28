import type { JSX, ReactNode } from "react";
import { memo, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

import { useAccount } from "src/providers/hooks";

import "./index.css";

import { getFrom } from "./routeState";

const LOADING_TIMEOUT = 4000;

interface RouteProps {
  children: ReactNode;
}

function LoadingComponent(): JSX.Element {
  return (
    <div className="absolute-center routes-loading">
      <i className="fa fa-spinner fa-pulse routes-loading-icon" />
      <h1>Taking longer than usual...</h1>
    </div>
  );
}

/* Whether fetching the user has taken longer than LOADING_TIMEOUT
 * since the route was mounted */
function useLoadingTimedOut(): boolean {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimedOut(true);
    }, LOADING_TIMEOUT);
    return (): void => {
      clearTimeout(timeout);
    };
  }, []);
  return timedOut;
}

/* Redirect to site if not authenticated */
const PrivateRoute = memo(function PrivateRoute({
  children,
}: RouteProps): ReactNode {
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
const PublicRoute = memo(function PublicRoute({
  children,
}: RouteProps): ReactNode {
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
    return <Navigate to={getFrom(location)} replace />;
  }
  return children;
});

export { PrivateRoute, PublicRoute };

import type { Location } from "react-router";

import { routes } from "src/constants";

/* Where to go after signing in. PrivateRoute stores it in the location
 * state when redirecting to the site */
function getFrom(location: Location): Partial<Location> {
  const state = location.state as { from?: Partial<Location> } | null;
  return state?.from ?? { pathname: routes.defaultRoute };
}

export { getFrom };

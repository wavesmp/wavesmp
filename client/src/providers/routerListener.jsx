import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { useActions } from "./hooks";

/*
 * Connects the router to the actions. Must be rendered inside the router:
 * - Applies each location (search, sort) to its playlist
 * - Handles keyboard shortcuts, which may navigate (e.g. to the next page)
 */
function RouterListener() {
  const actions = useActions();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    actions.routerChange(location);
  }, [actions, location]);

  useEffect(() => {
    /* The keyboard actions use a history-like object */
    const history = { location, push: (to) => navigate(to) };
    function onKeyDown(ev) {
      actions.tracksKeyDown(ev, history);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [actions, location, navigate]);

  return null;
}

export { RouterListener };

import { useEffect } from "react";

import { useLocation, useNavigate } from "react-router";
import type { KeyHistory } from "src/actions/tracks/keybindings";

import { useActions } from "./hooks";

/*
 * Connects the router to the actions. Must be rendered inside the router:
 * - Applies each location (search, sort) to its playlist
 * - Handles keyboard shortcuts, which may navigate (e.g. to the next page)
 */
function RouterListener(): null {
  const actions = useActions();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    actions.routerChange(location);
  }, [actions, location]);

  useEffect(() => {
    /* The keyboard actions use a history-like object */
    const history: KeyHistory = {
      location,
      push: (to): void => {
        void navigate(to);
      },
    };
    function onKeyDown(ev: KeyboardEvent): void {
      void actions.tracksKeyDown(ev, history);
    }
    document.addEventListener("keydown", onKeyDown);
    return (): void => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [actions, location, navigate]);

  return null;
}

export { RouterListener };

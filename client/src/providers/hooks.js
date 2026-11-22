/*
 * App-specific hooks for reading state and dispatching actions.
 *
 * Components use these instead of react-redux directly, so the store can
 * later be replaced (e.g. with React Context) by changing only this module.
 */
import { useMemo } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";

import * as WavesActions from "src/actions";

/* Action creators bound to dispatch. Stable across renders */
function useActions() {
  const dispatch = useDispatch();
  return useMemo(() => bindActionCreators(WavesActions, dispatch), [dispatch]);
}

/*
 * Select derived values from the whole state. The result is compared
 * shallowly, so a selector may return a new object of props on each call,
 * as connect's mapStateToProps did.
 */
function useWavesSelector(selector) {
  return useSelector(selector, shallowEqual);
}

/* State slices */

function useAccount() {
  return useSelector((state) => state.account);
}

function useErr() {
  return useSelector((state) => state.err);
}

function useLayout() {
  return useSelector((state) => state.layout);
}

function useMenu() {
  return useSelector((state) => state.menu);
}

function useMenubar() {
  return useSelector((state) => state.menubar);
}

function useModal() {
  return useSelector((state) => state.modal);
}

function useSidebar() {
  return useSelector((state) => state.sidebar);
}

function useToasts() {
  return useSelector((state) => state.toasts);
}

function useLibraries() {
  return useSelector((state) => state.tracks.libraries);
}

function usePlaying() {
  return useSelector((state) => state.tracks.playing);
}

function usePlaylists() {
  return useSelector((state) => state.tracks.playlists);
}

export {
  useAccount,
  useActions,
  useErr,
  useLayout,
  useLibraries,
  useMenu,
  useMenubar,
  useModal,
  usePlaying,
  usePlaylists,
  useSidebar,
  useToasts,
  useWavesSelector,
};

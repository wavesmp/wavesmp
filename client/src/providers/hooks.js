/*
 * Hooks for reading state and dispatching actions. Each slice hook reads its
 * own context, so a component only re-renders when a slice it reads changes.
 */
import { useContext, useMemo } from "react";

import {
  AccountContext,
  ActionsContext,
  ErrContext,
  LayoutContext,
  LibrariesContext,
  MenubarContext,
  MenuContext,
  ModalContext,
  PlayingContext,
  PlaylistsContext,
  SidebarContext,
  ToastsContext,
} from "./contexts";

/* Action creators bound to dispatch. Stable across renders */
function useActions() {
  return useContext(ActionsContext);
}

function useAccount() {
  return useContext(AccountContext);
}

function useErr() {
  return useContext(ErrContext);
}

function useLayout() {
  return useContext(LayoutContext);
}

function useMenu() {
  return useContext(MenuContext);
}

function useMenubar() {
  return useContext(MenubarContext);
}

function useModal() {
  return useContext(ModalContext);
}

function useSidebar() {
  return useContext(SidebarContext);
}

function useToasts() {
  return useContext(ToastsContext);
}

function useLibraries() {
  return useContext(LibrariesContext);
}

function usePlaying() {
  return useContext(PlayingContext);
}

function usePlaylists() {
  return useContext(PlaylistsContext);
}

/*
 * The part of the state read by the selectors in src/selectors:
 * { account, tracks: { libraries, playlists, playing } }
 */
function useSelectorState() {
  const account = useAccount();
  const libraries = useLibraries();
  const playlists = usePlaylists();
  const playing = usePlaying();
  return useMemo(
    () => ({ account, tracks: { libraries, playlists, playing } }),
    [account, libraries, playlists, playing],
  );
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
  useSelectorState,
  useSidebar,
  useToasts,
};

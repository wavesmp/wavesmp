/*
 * Hooks for reading state and dispatching actions. Each slice hook reads its
 * own context, so a component only re-renders when a slice it reads changes.
 */
import { useContext, useMemo } from "react";

import type { Playlists } from "src/types/playlistTypes";
import type {
  Account,
  Layout,
  Menu,
  Modal,
  Playing,
  SelectorState,
  Toast,
} from "src/types/stateTypes";
import type { Libraries } from "src/types/trackTypes";

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
import type { BoundActions } from "./dispatcher";

/* Action creators bound to dispatch. Stable across renders */
function useActions(): BoundActions {
  const actions = useContext(ActionsContext);
  if (!actions) {
    throw new Error("useActions must be used inside the Provider");
  }
  return actions;
}

function useAccount(): Account {
  return useContext(AccountContext);
}

function useErr(): unknown {
  return useContext(ErrContext);
}

function useLayout(): Layout {
  return useContext(LayoutContext);
}

function useMenu(): Menu[] {
  return useContext(MenuContext);
}

function useMenubar(): boolean {
  return useContext(MenubarContext);
}

function useModal(): Modal | null {
  return useContext(ModalContext);
}

function useSidebar(): boolean {
  return useContext(SidebarContext);
}

function useToasts(): Toast[] {
  return useContext(ToastsContext);
}

function useLibraries(): Libraries {
  return useContext(LibrariesContext);
}

function usePlaying(): Playing {
  return useContext(PlayingContext);
}

function usePlaylists(): Playlists {
  return useContext(PlaylistsContext);
}

/*
 * The part of the state read by the selectors in src/selectors:
 * { account, tracks: { libraries, playlists, playing } }
 */
function useSelectorState(): SelectorState & {
  account: Account;
  tracks: { libraries: Libraries; playlists: Playlists; playing: Playing };
} {
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

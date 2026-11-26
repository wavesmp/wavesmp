/*
 * One context per state slice, so a component only re-renders when a slice
 * it reads changes (see provider.tsx). Use the hooks in hooks.ts to read them.
 */
import { createContext } from "react";

import { rootReducer } from "src/reducer";
import type { State } from "src/types/stateTypes";

import type { BoundActions } from "./dispatcher";

/* Defaults, for rendering outside the provider (e.g. tests) */
const initialState: State = rootReducer(undefined, { type: "@@waves/INIT" });

const ActionsContext = createContext<BoundActions | null>(null);

const AccountContext = createContext(initialState.account);
const ErrContext = createContext(initialState.err);
const LayoutContext = createContext(initialState.layout);
const MenuContext = createContext(initialState.menu);
const MenubarContext = createContext(initialState.menubar);
const ModalContext = createContext(initialState.modal);
const SidebarContext = createContext(initialState.sidebar);
const ToastsContext = createContext(initialState.toasts);

const LibrariesContext = createContext(initialState.tracks.libraries);
const PlayingContext = createContext(initialState.tracks.playing);
const PlaylistsContext = createContext(initialState.tracks.playlists);

export {
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
};

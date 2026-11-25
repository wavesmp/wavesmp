/*
 * One context per state slice, so a component only re-renders when a slice
 * it reads changes (see provider.jsx). Use the hooks in hooks.js to read them.
 */
import { createContext } from "react";

const ActionsContext = createContext(null);

const AccountContext = createContext(null);
const ErrContext = createContext(null);
const LayoutContext = createContext(null);
const MenuContext = createContext(null);
const MenubarContext = createContext(null);
const ModalContext = createContext(null);
const SidebarContext = createContext(null);
const ToastsContext = createContext(null);

const LibrariesContext = createContext(null);
const PlayingContext = createContext(null);
const PlaylistsContext = createContext(null);

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

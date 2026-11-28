import type { JSX, ReactNode } from "react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import * as WavesActions from "src/actions";
import { rootReducer } from "src/reducer";
import type { ExtraArgument } from "src/types/actionTypes";
import type { State } from "src/types/stateTypes";

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
import { bindActionCreators, createDispatcher } from "./dispatcher";
import { storeListener } from "./listener";

/*
 * Holds the app state and provides it to components, one context per slice.
 *
 * extraArgument holds the side effect objects passed to thunks:
 * { localState, player, ws, auth }
 */
interface ProviderProps {
  children: ReactNode;
  extraArgument: ExtraArgument;
}
function Provider({ children, extraArgument }: ProviderProps): JSX.Element {
  const [dispatcher] = useState(() =>
    createDispatcher(rootReducer, extraArgument),
  );
  /* Re-renders on each new state. React's own subscription primitive, so no
   * update is missed, even one dispatched from a child's mount effect (child
   * effects run before this component's) */
  const state = useSyncExternalStore(dispatcher.subscribe, dispatcher.getState);
  const actions = useMemo(
    () => bindActionCreators(WavesActions, dispatcher.dispatch),
    [dispatcher],
  );

  /* Objects need state access for dispatching on events
   * e.g. When player track ends, storage is available, location change.
   * Runs once, for the lifetime of the app */
  useEffect(() => {
    const { ws, player, localState } = extraArgument;
    void storeListener(dispatcher, ws, player, localState);
  }, [dispatcher, extraArgument]);

  return (
    <StateProviders state={state} actions={actions}>
      {children}
    </StateProviders>
  );
}

/* Provides each state slice, and the bound actions, in its own context */
interface StateProvidersProps {
  state: State;
  actions: BoundActions;
  children: ReactNode;
}
function StateProviders({
  state,
  actions,
  children,
}: StateProvidersProps): JSX.Element {
  const { account, err, layout, menu, menubar, modal, sidebar, toasts } = state;
  const { libraries, playing, playlists } = state.tracks;
  return (
    <ActionsContext.Provider value={actions}>
      <AccountContext.Provider value={account}>
        <ErrContext.Provider value={err}>
          <LayoutContext.Provider value={layout}>
            <MenuContext.Provider value={menu}>
              <MenubarContext.Provider value={menubar}>
                <ModalContext.Provider value={modal}>
                  <SidebarContext.Provider value={sidebar}>
                    <ToastsContext.Provider value={toasts}>
                      <LibrariesContext.Provider value={libraries}>
                        <PlaylistsContext.Provider value={playlists}>
                          <PlayingContext.Provider value={playing}>
                            {children}
                          </PlayingContext.Provider>
                        </PlaylistsContext.Provider>
                      </LibrariesContext.Provider>
                    </ToastsContext.Provider>
                  </SidebarContext.Provider>
                </ModalContext.Provider>
              </MenubarContext.Provider>
            </MenuContext.Provider>
          </LayoutContext.Provider>
        </ErrContext.Provider>
      </AccountContext.Provider>
    </ActionsContext.Provider>
  );
}

export { Provider, StateProviders };

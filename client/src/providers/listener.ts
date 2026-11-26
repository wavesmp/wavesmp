import * as WavesActions from "src/actions";
import { LIBRARY_NAME, UPLOADS_NAME } from "src/constants";
import type { LocalState } from "src/localState";
import type { Player } from "src/player";
import type { WavesSocket } from "src/socket";
import type { Layout } from "src/types/stateTypes";

import type { Dispatcher } from "./dispatcher";

/* store is the dispatcher (see dispatcher.ts). Router changes are handled by
 * RouterListener (see routerListener.tsx) */
async function storeListener(
  store: Pick<Dispatcher, "dispatch">,
  ws: WavesSocket,
  player: Player,
  localState: LocalState,
): Promise<void> {
  /* When track ends, update the state */
  player.setOnTrackEnded(() => {
    void store.dispatch(WavesActions.trackEnded(URLSearchParams));
  });

  player.setOnUploadProgress((trackId, progress) => {
    store.dispatch(
      WavesActions.tracksLocalInfoUpdate(
        trackId,
        "uploadProgress",
        progress,
        UPLOADS_NAME,
      ),
    );
  });

  player.setOnToastErr((msg) => {
    store.dispatch(WavesActions.toastErr(msg));
  });

  /* Recieve data from server */
  ws.setOnLibraryUpdate((lib) => {
    store.dispatch(WavesActions.tracksAdd(lib, LIBRARY_NAME));
  });

  ws.setOnPlaylistsUpdate((playlists) => {
    store.dispatch(WavesActions.playlistsUpdate(playlists));
  });

  /* Listen for media queries to set layout state */
  const layout0Mql = window.matchMedia("only screen and (min-width: 516px)");
  const layout1Mql = window.matchMedia("only screen and (min-width: 768px)");
  let layout: Layout;

  function onLayout0(ev: MediaQueryListEvent): void {
    layout = ev.matches ? maxLayout(layout, 1) : 0;
    store.dispatch(WavesActions.layoutSet(layout));
  }
  function onLayout1(ev: MediaQueryListEvent): void {
    layout = ev.matches ? 2 : minLayout(layout, 1);
    store.dispatch(WavesActions.layoutSet(layout));
  }
  layout0Mql.addEventListener("change", onLayout0);
  layout1Mql.addEventListener("change", onLayout1);
  layout = getInitialLayout(layout0Mql, layout1Mql);
  store.dispatch(WavesActions.layoutSet(layout));

  /* When localStorage is loaded, update the state */
  const [columns, rowsPerPage, lastIdp, theme, volume] = await Promise.all([
    localState.getItem("columns"),
    localState.getItem("rowsPerPage"),
    localState.getItem("lastIdp"),
    localState.getItem("theme"),
    localState.getItem("volume"),
  ]);
  store.dispatch(
    WavesActions.accountSetSettings({
      columns: new Set(columns),
      rowsPerPage,
      theme,
    }),
  );
  player.setVolume(volume);
  if (lastIdp) {
    try {
      await store.dispatch(WavesActions.tryAutoLogin(lastIdp));
      void store.dispatch(WavesActions.retryLoginOnConnect(lastIdp));
    } catch (err) {
      store.dispatch(WavesActions.err(err));
      store.dispatch(WavesActions.accountSetFetchingUser(false));
    }
  } else {
    store.dispatch(WavesActions.accountSetFetchingUser(false));
  }
}

function getInitialLayout(
  layout0Mql: MediaQueryList,
  layout1Mql: MediaQueryList,
): Layout {
  if (layout1Mql.matches) {
    return 2;
  }
  if (layout0Mql.matches) {
    return 1;
  }
  return 0;
}

function maxLayout(a: Layout, b: Layout): Layout {
  return a > b ? a : b;
}

function minLayout(a: Layout, b: Layout): Layout {
  return a < b ? a : b;
}

export { storeListener };

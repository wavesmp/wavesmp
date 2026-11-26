import type { JSX, MouseEvent } from "react";
import { memo } from "react";
import { Route, Routes, useLocation } from "react-router";

import {
  MENU_DATA_VALUE,
  MODAL_DATA_VALUE,
  routes,
  TOGGLE_DATA_KEY,
} from "src/constants";
import {
  useActions,
  useErr,
  useLayout,
  useMenu,
  useMenubar,
  useModal,
  useSelectorState,
  useSidebar,
  useToasts,
} from "src/providers/hooks";
import { getPlaylistSearch, getPlaylistSelectors } from "src/selectors";
import type { Selection } from "src/types/playlistTypes";
import { filterSelection, getPlaylistNameFromRoute } from "src/utils";

import { Boundary } from "../boundary";
import { Library } from "../library";
import { Menu } from "../menu";
import { MenuBar } from "../menubar/main";
import { Modal } from "../modal";
import { NowPlaying } from "../nowplaying";
import { Playlist } from "../playlist";
import { Settings } from "../settings";
import { SideBar } from "../sidebar";
import { Toasts } from "../toasts";
import { Upload } from "../upload";

/* Whether node or an ancestor element has the attribute key set to val */
function ancestorHasAttribute(
  node: EventTarget | null,
  key: string,
  val: string,
): boolean {
  let element = node instanceof Element ? node : null;
  while (element) {
    if (element.getAttribute(key) === val) {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}

const MainApp = memo(function MainApp(): JSX.Element {
  const location = useLocation();
  const actions = useActions();
  const selectorState = useSelectorState();
  const menubar = useMenubar();
  const sidebar = useSidebar();
  const menu = useMenu();
  const err = useErr();
  const layout = useLayout();
  const modal = useModal();
  const toasts = useToasts();
  const { playlists, playing } = selectorState.tracks;

  /* Add top-level click handler to dismiss overlay (e.g. modal or menu) */
  const onClick = (ev: MouseEvent): void => {
    const { target } = ev;

    if (
      menu.length &&
      !ancestorHasAttribute(target, TOGGLE_DATA_KEY, MENU_DATA_VALUE)
    ) {
      actions.menuReset();
    }

    if (
      modal &&
      !ancestorHasAttribute(target, TOGGLE_DATA_KEY, MODAL_DATA_VALUE)
    ) {
      actions.modalSet(null);
    }
  };

  const { filteredSelection, index, playlistName } = selectMenubarProps(
    selectorState,
    menubar,
    location.pathname,
  );
  return (
    <Boundary err={err}>
      <div onClick={onClick}>
        <Routes>
          <Route path={routes.nowplaying} element={<NowPlaying />} />
          <Route path={routes.library} element={<Library />} />
          <Route path={routes.upload} element={<Upload />} />
          <Route path={routes.playlist} element={<Playlist />} />
          <Route path={routes.settings} element={<Settings />} />
          {/* Other paths (e.g. while redirecting) render no page */}
          <Route path="*" element={null} />
        </Routes>
        <SideBar
          actions={actions}
          sidebar={sidebar}
          playlists={playlists}
          playing={playing}
          pathname={location.pathname}
        />
        <MenuBar
          actions={actions}
          layout={layout}
          menubar={menubar}
          filteredSelection={filteredSelection}
          index={index}
          playlistName={playlistName}
          playing={playing}
        />
        <Menu menu={menu} />
        <Modal modal={modal} />
        <Toasts actions={actions} toasts={toasts} />
      </div>
    </Boundary>
  );
});

const NO_SELECTION: Selection = new Map();

interface MenubarProps {
  filteredSelection: Selection;
  index: number | null;
  playlistName: string | null;
}

/* The selection of the current playlist, for the track options menubar */
function selectMenubarProps(
  state: ReturnType<typeof useSelectorState>,
  menubar: boolean,
  pathname: string,
): MenubarProps {
  const props: MenubarProps = {
    filteredSelection: NO_SELECTION,
    index: null,
    playlistName: null,
  };
  if (!menubar) {
    return props;
  }
  const playlistName = getPlaylistNameFromRoute(pathname);
  if (!playlistName) {
    return props;
  }
  const playlistSelectors = getPlaylistSelectors(playlistName);
  if (!playlistSelectors) {
    return props;
  }
  const search = getPlaylistSearch(state, playlistName);
  const playlistProps = playlistSelectors.getPlaylistProps(state, search);
  if (!playlistProps.loaded) {
    return props;
  }
  const { index, selection, displayItems } = playlistProps;
  return {
    playlistName,
    index,
    filteredSelection: filterSelection(displayItems, selection),
  };
}

export { MainApp };

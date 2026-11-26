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

const MainApp = memo(function MainApp(ownProps) {
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
  const stateProps = selectStateProps(
    { ...selectorState, menubar, sidebar, menu, err, layout, modal, toasts },
    { location },
  );
  const props = { ...ownProps, ...stateProps, actions };

  function ancestorHasAttribute(node, key, val) {
    /* document object does not have parent node.
     * Can't just check for node here, since document
     * does not have getAttribute method */
    while (node.parentNode) {
      if (node.getAttribute(key) === val) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  /* Add top-level click handler to dismiss overlay (e.g. modal or menu) */
  const onClick = (ev) => {
    const { actions, menu, modal } = props;
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

  const { filteredSelection, index, playlistName, playlists, playing } = props;
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

function selectStateProps(state, route) {
  const { menubar } = state;
  const { location } = route;
  const { pathname } = location;
  const props = {
    playlists: state.tracks.playlists,
    playing: state.tracks.playing,
    sidebar: state.sidebar,
    menu: state.menu,
    err: state.err,
    layout: state.layout,
    menubar,
    modal: state.modal,
    toasts: state.toasts,
  };
  if (menubar) {
    const playlistName = getPlaylistNameFromRoute(pathname);
    if (playlistName) {
      const search = getPlaylistSearch(state, playlistName);
      const { getPlaylistProps } = getPlaylistSelectors(playlistName);
      const { index, selection, displayItems } = getPlaylistProps(
        state,
        search,
      );
      const filteredSelection = filterSelection(displayItems, selection);

      props.playlistName = playlistName;
      props.index = index;
      props.filteredSelection = filteredSelection;
    }
  }
  return props;
}

export { MainApp };

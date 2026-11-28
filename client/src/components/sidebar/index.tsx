import type { JSX } from "react";
import { memo } from "react";

import type { BoundActions } from "src/providers/dispatcher";
import type { Playlists } from "src/types/playlistTypes";
import type { Playing } from "src/types/stateTypes";

import "./index.css";

import { MainBar } from "./main";
import { PlaylistBar } from "./playlist";

interface SideBarProps {
  actions: BoundActions;
  playing: Playing;
  playlists: Playlists;
  sidebar: boolean;
  pathname: string;
}

/* Shows the main bar or the playlists bar. Both stay mounted, so switching
 * animates the shown bar out, then the other bar in (see index.css) */
const SideBar = memo(function SideBar(props: SideBarProps): JSX.Element {
  const { actions, playing, playlists, sidebar, pathname } = props;
  const isSliderVisible = playing.track != null;
  return (
    <span>
      <MainBar
        hidden={sidebar}
        actions={actions}
        isSliderVisible={isSliderVisible}
        playlists={playlists}
        pathname={pathname}
      />
      <PlaylistBar
        hidden={!sidebar}
        isSliderVisible={isSliderVisible}
        actions={actions}
        playlists={playlists}
      />
    </span>
  );
});

export { SideBar };

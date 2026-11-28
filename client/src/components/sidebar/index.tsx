import type { JSX } from "react";
import { memo } from "react";

import { CSSTransitionGroup } from "src/components/transitions";
import { SIDEBAR_ENTER_TIMEOUT, SIDEBAR_LEAVE_TIMEOUT } from "src/constants";
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

const SideBar = memo(function SideBar(props: SideBarProps): JSX.Element {
  const { actions, playing, playlists, sidebar, pathname } = props;
  const isSliderVisible = playing.track != null;
  let playlistBar = null;
  let mainBar = null;
  if (sidebar) {
    playlistBar = (
      <PlaylistBar
        key={0}
        isSliderVisible={isSliderVisible}
        actions={actions}
        playlists={playlists}
      />
    );
  } else {
    mainBar = (
      <MainBar
        key={0}
        actions={actions}
        isSliderVisible={isSliderVisible}
        playlists={playlists}
        pathname={pathname}
      />
    );
  }
  return (
    <span>
      <CSSTransitionGroup
        transitionName="mainbartransition"
        transitionEnterTimeout={SIDEBAR_ENTER_TIMEOUT}
        transitionLeaveTimeout={SIDEBAR_LEAVE_TIMEOUT}
      >
        {mainBar}
      </CSSTransitionGroup>
      <CSSTransitionGroup
        transitionName="playlistbartransition"
        transitionEnterTimeout={SIDEBAR_ENTER_TIMEOUT}
        transitionLeaveTimeout={SIDEBAR_LEAVE_TIMEOUT}
      >
        {playlistBar}
      </CSSTransitionGroup>
    </span>
  );
});

export { SideBar };

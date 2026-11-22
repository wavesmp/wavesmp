import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CSSTransitionGroup } from "react-transition-group";

import { menuTypes, routes } from "src/constants";

import "./index.css";

import LogoSvg from "../common/logo-wide.svg?react";
import { TrackPlayer } from "./trackplayer";
import { TrackSlider } from "./trackslider";

const MenuBar = memo(function MenuBar({
  actions,
  playing,
  layout,
  menubar,
  filteredSelection,
  index,
  playlistName,
  history,
}) {
  const isSliderVisible = playing.track != null;
  const isPlayerVisible = isSliderVisible || menubar;

  /* Whether the player was visible as of the last committed update. Lags
   * isPlayerVisible by one tick, so the transition can be disabled for the
   * first render after the player becomes visible (see below) */
  const [prevPlayerVisible, setPrevPlayerVisible] = useState(false);
  useEffect(() => {
    if (prevPlayerVisible === isPlayerVisible) {
      return undefined;
    }
    const timeout = setTimeout(() => setPrevPlayerVisible(isPlayerVisible), 0);
    return () => clearTimeout(timeout);
  }, [isPlayerVisible, prevPlayerVisible]);

  function onNotificationsClick(ev) {
    actions.menuSetElem({ ev, type: menuTypes.NOTIFICATIONS });
  }

  function onUserSettingsClick(ev) {
    actions.menuSetElem({
      ev,
      type: menuTypes.USER_SETTINGS,
      props: { history },
    });
  }

  let trackSlider = null;
  let trackPlayer = null;
  let logoClassName = "menubar-main-logo";
  let logoNameClassName = "menubar-main-logo-name";
  if (isPlayerVisible) {
    /* Usually, transitions are enabled when the player is visible.
     * However, disable the transition when player is becoming visible
     * and the user is on a small screen. Adding a new transition
     * for this case would conflict with the current one, so handle
     * it programmatically (no pure-CSS solution available AFAIK). */
    if (prevPlayerVisible || layout !== 0) {
      logoClassName += " menubar-transition";
      logoNameClassName += " menubar-transition";
    }

    logoClassName += " menubar-player-visible";
    logoNameClassName += " menubar-player-visible";
    trackPlayer = (
      <TrackPlayer
        key={0}
        actions={actions}
        menubar={menubar}
        index={index}
        filteredSelection={filteredSelection}
        playlistName={playlistName}
        playing={playing}
      />
    );
  }

  if (isSliderVisible) {
    trackSlider = <TrackSlider key={0} actions={actions} playing={playing} />;
  }

  return (
    <header className="menubar-main-header">
      <Link to={routes.defaultRoute}>
        <LogoSvg className={logoClassName} />
        <span className={logoNameClassName}>WAVES</span>
      </Link>
      <CSSTransitionGroup
        transitionName="fade"
        transitionEnterTimeout={800}
        transitionLeaveTimeout={300}
      >
        {trackPlayer}
      </CSSTransitionGroup>
      <i
        className="fa fa-lg fa-globe menu-bar-icon"
        onClick={onNotificationsClick}
      />
      <i
        className="fa fa-lg fa-user menu-bar-icon"
        onClick={onUserSettingsClick}
      />
      <CSSTransitionGroup
        component="div"
        transitionName="fade"
        transitionEnterTimeout={800}
        transitionLeaveTimeout={300}
      >
        {trackSlider}
      </CSSTransitionGroup>
    </header>
  );
});

export { MenuBar };

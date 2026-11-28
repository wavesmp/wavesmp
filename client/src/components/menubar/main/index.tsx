import type { JSX, MouseEvent } from "react";
import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { useLastVisible } from "src/components/transitions";

import { menuTypes, routes } from "src/constants";
import type { BoundActions } from "src/providers/dispatcher";
import type { Selection } from "src/types/playlistTypes";
import type { Layout, Playing } from "src/types/stateTypes";

import "./index.css";

import LogoSvg from "../common/logo-wide.svg?react";
import { TrackPlayer } from "./trackplayer";
import { TrackSlider } from "./trackslider";

interface MenuBarProps {
  actions: BoundActions;
  playing: Playing;
  layout: Layout;
  menubar: boolean;
  filteredSelection: Selection;
  index: number | null;
  playlistName: string | null;
}

const MenuBar = memo(function MenuBar({
  actions,
  playing,
  layout,
  menubar,
  filteredSelection,
  index,
  playlistName,
}: MenuBarProps): JSX.Element {
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
    const timeout = setTimeout(() => {
      setPrevPlayerVisible(isPlayerVisible);
    }, 0);
    return (): void => {
      clearTimeout(timeout);
    };
  }, [isPlayerVisible, prevPlayerVisible]);

  function onNotificationsClick(ev: MouseEvent<HTMLElement>): void {
    actions.menuSetElem({ ev, type: menuTypes.NOTIFICATIONS });
  }

  function onUserSettingsClick(ev: MouseEvent<HTMLElement>): void {
    actions.menuSetElem({
      ev,
      type: menuTypes.USER_SETTINGS,
    });
  }

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
  }

  /* The player and slider stay mounted, so they can fade out. While
   * fading out, they show their last content */
  const playerProps = useMemo(
    () => ({ menubar, index, filteredSelection, playlistName, playing }),
    [menubar, index, filteredSelection, playlistName, playing],
  );
  const shownPlayerProps = useLastVisible(playerProps, isPlayerVisible);
  const sliderTrack = useLastVisible(playing.track, isSliderVisible);

  return (
    <header className="menubar-main-header">
      <Link to={routes.defaultRoute}>
        <LogoSvg className={logoClassName} />
        <span className={logoNameClassName}>WAVES</span>
      </Link>
      <span className={isPlayerVisible ? "fade" : "fade fade-hidden"}>
        <TrackPlayer actions={actions} {...shownPlayerProps} />
      </span>
      <i
        className="fa fa-lg fa-globe menu-bar-icon"
        onClick={onNotificationsClick}
      />
      <i
        className="fa fa-lg fa-user menu-bar-icon"
        onClick={onUserSettingsClick}
      />
      <div className={isSliderVisible ? "fade" : "fade fade-hidden"}>
        {sliderTrack && <TrackSlider actions={actions} track={sliderTrack} />}
      </div>
    </header>
  );
});

export { MenuBar };

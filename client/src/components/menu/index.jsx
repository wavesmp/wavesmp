import { memo } from "react";

import { MENU_DATA_VALUE, menuTypes } from "src/constants";

import { Notifications } from "./notifications";
import { Track } from "./track";
import { PlaylistAdd } from "./track/playlistAdd";
import { UserSettings } from "./usersettings";

import "./index.css";

const MENUS = {
  [menuTypes.TRACK]: Track,
  [menuTypes.PLAYLIST_ADD]: PlaylistAdd,
  [menuTypes.NOTIFICATIONS]: Notifications,
  [menuTypes.USER_SETTINGS]: UserSettings,
};

const EMPTY_MENU = <menu className="menu" />;

const Menu = memo(function Menu({ menu }) {
  function onContextMenu(ev) {
    ev.preventDefault();
  }

  const numMenus = menu.length;
  if (numMenus === 0) {
    return EMPTY_MENU;
  }

  const { type, props: menuProps, transform } = menu[numMenus - 1];
  const Component = MENUS[type];
  const style = { transform };

  return (
    <menu
      className="menu menu-active"
      data-toggle={MENU_DATA_VALUE}
      style={style}
      onContextMenu={onContextMenu}
    >
      <Component {...menuProps} />
    </menu>
  );
});

export { Menu };

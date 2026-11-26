import type { ComponentType, JSX, MouseEvent } from "react";
import { memo } from "react";

import { MENU_DATA_VALUE, menuTypes } from "src/constants";
import type {
  MenuProps,
  Menu as MenuState,
  MenuType,
} from "src/types/stateTypes";

import { Notifications } from "./notifications";
import { Track } from "./track";
import { PlaylistAdd } from "./track/playlistAdd";
import { UserSettings } from "./usersettings";

import "./index.css";

const MENUS: Record<MenuType, ComponentType<MenuProps>> = {
  [menuTypes.TRACK]: Track,
  [menuTypes.PLAYLIST_ADD]: PlaylistAdd,
  [menuTypes.NOTIFICATIONS]: Notifications,
  [menuTypes.USER_SETTINGS]: UserSettings,
};

const EMPTY_MENU = <menu className="menu" />;

interface MenuComponentProps {
  menu: MenuState[];
}

const Menu = memo(function Menu({ menu }: MenuComponentProps): JSX.Element {
  function onContextMenu(ev: MouseEvent): void {
    ev.preventDefault();
  }

  const lastMenu = menu.at(-1);
  if (!lastMenu) {
    return EMPTY_MENU;
  }

  const { type, props: menuProps, transform } = lastMenu;
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

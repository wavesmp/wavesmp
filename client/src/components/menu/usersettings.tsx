import type { JSX } from "react";
import { memo } from "react";
import { Link, useNavigate } from "react-router";

import { routes } from "src/constants";
import { useAccount, useActions } from "src/providers/hooks";

const UserSettings = memo(function UserSettings(): JSX.Element {
  const navigate = useNavigate();
  const actions = useActions();
  const { user } = useAccount();
  const userName = user?.name;

  const signOut = (): void => {
    void actions.signOut();
    actions.menuReset();
    void navigate("/");
  };

  const onSettingsClick = (): void => {
    actions.menuReset();
  };

  return (
    <ul className="menu-bar">
      <li className="menu-bar-header">
        {userName}
        <i className="fa fa-user menu-bar-item-icon" />
      </li>
      <li className="menu-bar-divider" />
      <li>
        <Link
          className="menu-bar-item"
          to={routes.settings}
          onClick={onSettingsClick}
        >
          Account Settings
          <i className="fa fa-cog menu-bar-item-icon" />
        </Link>
      </li>
      <li>
        <div className="menu-bar-item" onClick={signOut}>
          Sign Out
          <i className="fa fa-sign-out menu-bar-item-icon" />
        </div>
      </li>
    </ul>
  );
});

export { UserSettings };

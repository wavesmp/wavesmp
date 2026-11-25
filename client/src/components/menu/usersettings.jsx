import { memo } from "react";
import { Link } from "react-router-dom";

import { routes } from "src/constants";
import { useAccount, useActions } from "src/providers/hooks";

const UserSettings = memo(function UserSettings(ownProps) {
  const actions = useActions();
  const { user } = useAccount();
  const props = { ...ownProps, userName: user && user.name, actions };

  const signOut = () => {
    const { actions, history } = props;
    actions.signOut();
    actions.menuReset();
    history.push("/");
  };

  const { userName } = props;
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
          onClick={actions.menuReset}
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

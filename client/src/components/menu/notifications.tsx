import type { JSX } from "react";
import { memo } from "react";

import { useActions } from "src/providers/hooks";

const Notifications = memo(function Notifications(): JSX.Element {
  const actions = useActions();

  const onUnsupportedClick = (): void => {
    actions.toastErr("Feature Unavailable");
  };

  return (
    <ul className="menu-bar">
      <li className="menu-bar-header">
        Notifications
        <i className="fa fa-globe menu-bar-item-icon" />
      </li>
      <li className="menu-bar-divider" />
      <li>
        <div className="menu-bar-item" onClick={onUnsupportedClick}>
          File name mismatches
          <i className="fa fa-file-text menu-bar-item-icon" />
        </div>
      </li>
      <li>
        <div className="menu-bar-item" onClick={onUnsupportedClick}>
          Missing metadata
          <i className="fa fa-tags menu-bar-item-icon" />
        </div>
      </li>
      <li>
        <div className="menu-bar-item" onClick={onUnsupportedClick}>
          Missing files
          <i className="fa fa-file-o menu-bar-item-icon" />
        </div>
      </li>
    </ul>
  );
});

export { Notifications };

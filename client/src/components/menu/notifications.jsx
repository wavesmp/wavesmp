import { memo } from "react";

import { useActions, useWavesSelector } from "src/providers/hooks";

const Notifications = memo(function Notifications(ownProps) {
  const actions = useActions();
  const stateProps = useWavesSelector((state) =>
    selectStateProps(state, ownProps),
  );
  const props = { ...ownProps, ...stateProps, actions };

  const onUnsupportedClick = () => {
    const { actions } = props;
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

function selectStateProps() {
  return {};
}

export { Notifications };

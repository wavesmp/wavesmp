import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as WavesActions from "waves-client-actions";

class Notifications extends React.PureComponent {
  onUnsupportedClick = () => {
    const { actions } = this.props;
    actions.toastErr("Feature Unavailable");
  };

  render() {
    return (
      <ul className="menu-bar">
        <li className="menu-bar-header">
          Notifications
          <i className="fa fa-globe menu-bar-item-icon" />
        </li>
        <li className="menu-bar-divider" />
        <li>
          <div className="menu-bar-item" onClick={this.onUnsupportedClick}>
            File name mismatches
            <i className="fa fa-file-text menu-bar-item-icon" />
          </div>
        </li>
        <li>
          <div className="menu-bar-item" onClick={this.onUnsupportedClick}>
            Missing metadata
            <i className="fa fa-tags menu-bar-item-icon" />
          </div>
        </li>
        <li>
          <div className="menu-bar-item" onClick={this.onUnsupportedClick}>
            Missing files
            <i className="fa fa-file-o menu-bar-item-icon" />
          </div>
        </li>
      </ul>
    );
  }
}

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);

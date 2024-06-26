import React from "react";

import "./index.css";

export default class TableBar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { searchValue: props.routerSearchString };
  }

  onChange = (ev) => {
    this.setState({ searchValue: ev.currentTarget.value });
  };

  onKeyDown = (ev) => {
    const { key } = ev;
    if (key !== "Enter") {
      return;
    }
    this.applySearchFilter(ev.currentTarget.value);
  };

  onSearchReset = () => {
    this.setState({ searchValue: "" });
    this.applySearchFilter("");
  };

  applySearchFilter(searchString) {
    const { history, pathname } = this.props;
    let { qp } = this.props;
    qp = new URLSearchParams(qp);
    qp.set("page", 0);
    qp.set("search", searchString);
    history.push({ pathname, search: `${qp}` });
  }

  render() {
    const { buttons, onSettingsClick } = this.props;
    let settingsComponent = null;
    if (onSettingsClick) {
      settingsComponent = (
        <i
          className="fa fa-lg fa-cog tablebar-cog-icon"
          onClick={onSettingsClick}
        />
      );
    }
    const { searchValue } = this.state;

    return (
      <div className="tablebar">
        <div>{buttons}</div>
        <div className="tablebar-search-box">
          {settingsComponent}
          <i className="fa fa-lg fa-search tablebar-search-icon" />
          <input
            className="tablebar-input"
            type="text"
            value={searchValue}
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
          />
          {searchValue && (
            <i
              className="fa fa-lg fa-times tablebar-reset-icon"
              onClick={this.onSearchReset}
            />
          )}
        </div>
      </div>
    );
  }
}

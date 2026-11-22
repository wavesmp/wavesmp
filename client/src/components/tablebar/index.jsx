import { memo, useState } from "react";

import "./index.css";

const TableBar = memo(function TableBar({
  buttons,
  onSettingsClick,
  history,
  pathname,
  qp,
  routerSearchString,
}) {
  /* Initialized from the router once. Typing does not update the router
   * until the search is applied */
  const [searchValue, setSearchValue] = useState(routerSearchString);

  function applySearchFilter(searchString) {
    const newQp = new URLSearchParams(qp);
    newQp.set("page", 0);
    newQp.set("search", searchString);
    history.push({ pathname, search: `${newQp}` });
  }

  function onChange(ev) {
    setSearchValue(ev.currentTarget.value);
  }

  function onKeyDown(ev) {
    if (ev.key !== "Enter") {
      return;
    }
    applySearchFilter(ev.currentTarget.value);
  }

  function onSearchReset() {
    setSearchValue("");
    applySearchFilter("");
  }

  let settingsComponent = null;
  if (onSettingsClick) {
    settingsComponent = (
      <i
        className="fa fa-lg fa-cog tablebar-cog-icon"
        onClick={onSettingsClick}
      />
    );
  }

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
          onKeyDown={onKeyDown}
          onChange={onChange}
        />
        {searchValue && (
          <i
            className="fa fa-lg fa-times tablebar-reset-icon"
            onClick={onSearchReset}
          />
        )}
      </div>
    </div>
  );
});

export { TableBar };

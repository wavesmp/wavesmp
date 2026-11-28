import type { ChangeEvent, JSX, KeyboardEvent, ReactNode } from "react";
import { memo, useState } from "react";
import { useNavigate } from "react-router";

import "./index.css";

interface TableBarProps {
  buttons?: ReactNode;
  onSettingsClick?: () => void;
  pathname: string;
  qp: URLSearchParams;
  routerSearchString: string;
}

const TableBar = memo(function TableBar({
  buttons,
  onSettingsClick,
  pathname,
  qp,
  routerSearchString,
}: TableBarProps): JSX.Element {
  const navigate = useNavigate();

  /* Initialized from the router once. Typing does not update the router
   * until the search is applied */
  const [searchValue, setSearchValue] = useState(routerSearchString);

  function applySearchFilter(searchString: string): void {
    const newQp = new URLSearchParams(qp);
    newQp.set("page", "0");
    newQp.set("search", searchString);
    void navigate({ pathname, search: newQp.toString() });
  }

  function onChange(ev: ChangeEvent<HTMLInputElement>): void {
    setSearchValue(ev.currentTarget.value);
  }

  function onKeyDown(ev: KeyboardEvent<HTMLInputElement>): void {
    if (ev.key !== "Enter") {
      return;
    }
    applySearchFilter(ev.currentTarget.value);
  }

  function onSearchReset(): void {
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

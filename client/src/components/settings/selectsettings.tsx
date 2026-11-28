import type { ChangeEvent, JSX } from "react";
import { memo } from "react";
import { useNavigate } from "react-router";

import type { BoundActions } from "src/providers/dispatcher";

import type { Column } from "../table/tableTypes";

interface SelectSettingsProps {
  actions: BoundActions;
  rowsPerPage: number | null;
  theme: string;
  libraryColumns: Column[];
  librarySortKey: string;
  libraryAscending: boolean;
}

const SelectSettings = memo(function SelectSettings(
  props: SelectSettingsProps,
): JSX.Element {
  const navigate = useNavigate();
  const onOrderChange = (): void => {
    const { actions, librarySortKey, libraryAscending } = props;
    actions.playlistSort(librarySortKey, !libraryAscending);
  };

  const onSortKeyChange = (ev: ChangeEvent<HTMLSelectElement>): void => {
    const { actions, libraryAscending } = props;
    const librarySortKey = ev.target.value;
    actions.playlistSort(librarySortKey, libraryAscending);
  };

  const onRowsPerPageChange = (ev: ChangeEvent<HTMLSelectElement>): void => {
    const { actions } = props;
    const rowsPerPage = parseInt(ev.target.value, 10);
    actions.accountSetSettings({ rowsPerPage });
  };

  const onThemeChange = (ev: ChangeEvent<HTMLSelectElement>): void => {
    const { actions } = props;
    const theme = ev.target.value;
    actions.accountSetSettings({ theme });
  };

  const onSignOut = (): void => {
    const { actions } = props;
    void actions.signOut();
    void navigate("/");
  };

  const {
    theme,
    rowsPerPage,
    libraryColumns,
    librarySortKey,
    libraryAscending,
  } = props;
  return (
    <>
      <div className="settings-columns">
        <div className="settings-column">
          <label>Theme</label>
          <div className="settings-select-width">
            <select
              value={theme}
              onChange={onThemeChange}
              className="form-input"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        <div className="settings-column">
          <label>Rows Per Page</label>
          <div className="settings-select-width">
            <select
              value={rowsPerPage ?? undefined}
              onChange={onRowsPerPageChange}
              className="form-input"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
      <div className="settings-columns">
        <div className="settings-column">
          <label>Library Sort Key</label>
          <div className="settings-select-width">
            <select
              className="form-input"
              value={librarySortKey}
              onChange={onSortKeyChange}
            >
              {libraryColumns.map((column) => (
                <option value={column.attribute} key={column.attribute}>
                  {column.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="settings-column">
          <label>Library Sort Order</label>
          <button
            type="button"
            className="btn btn-dropdown"
            onClick={onOrderChange}
          >
            {libraryAscending ? (
              <span>
                <i className="fa fa-lg fa-arrow-up" /> Ascending
              </span>
            ) : (
              <span>
                <i className="fa fa-lg fa-arrow-down" /> Descending
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="settings-columns">
        <div className="settings-column">
          <label>Actions</label>
          <button
            type="button"
            className="btn btn-dropdown"
            onClick={onSignOut}
          >
            <i className="fa fa-lg fa-sign-out" /> Sign Out
          </button>
        </div>
        <div className="settings-column">Version: 1.0.58</div>
      </div>
    </>
  );
});

export { SelectSettings };

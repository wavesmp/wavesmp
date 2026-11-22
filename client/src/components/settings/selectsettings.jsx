import { memo } from "react";

const SelectSettings = memo(function SelectSettings(props) {
  const onOrderChange = () => {
    const { actions, librarySortKey, libraryAscending } = props;
    actions.playlistSort(librarySortKey, !libraryAscending);
  };

  const onSortKeyChange = (ev) => {
    const { actions, libraryAscending } = props;
    const librarySortKey = ev.target.value;
    actions.playlistSort(librarySortKey, libraryAscending);
  };

  const onRowsPerPageChange = (ev) => {
    const { actions } = props;
    const rowsPerPage = parseInt(ev.target.value, 10);
    actions.accountSetSettings({ rowsPerPage });
  };

  const onThemeChange = (ev) => {
    const { actions } = props;
    const theme = ev.target.value;
    actions.accountSetSettings({ theme });
  };

  const onSignOut = () => {
    const { actions, history } = props;
    actions.signOut();
    history.push("/");
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
              value={rowsPerPage}
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

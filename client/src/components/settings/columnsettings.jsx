import { memo } from "react";

import { ALL_COLUMNS } from "src/constants";

const COLUMN_NAME_ATTR = "data-columnname";

const ColumnSettings = memo(function ColumnSettings(props) {
  const addColumn = (ev) => {
    const { actions } = props;
    const columns = new Set(props.columns);
    const colToAdd = ev.currentTarget.getAttribute(COLUMN_NAME_ATTR);
    columns.add(colToAdd);
    actions.accountSetSettings({ columns });
  };

  const removeColumn = (ev) => {
    const { actions } = props;
    const columns = new Set(props.columns);
    const colToDelete = ev.currentTarget.getAttribute(COLUMN_NAME_ATTR);
    columns.delete(colToDelete);
    actions.accountSetSettings({ columns });
  };

  const { columns } = props;
  const hiddenColumns = ALL_COLUMNS.filter((x) => !columns.has(x));
  const activeColumns = ALL_COLUMNS.filter((x) => columns.has(x));

  return (
    <div className="settings-columns">
      <div className="settings-column">
        <label className="settings-column-label">Hidden Columns</label>
        {hiddenColumns.map((sample) => (
          <div
            key={sample}
            className="settings-column-item"
            data-columnname={sample}
            onClick={addColumn}
          >
            <i className="fa fa-lg fa-plus settings-add-icon" />
            &nbsp;&nbsp;{sample}
          </div>
        ))}
      </div>
      <div className="settings-column">
        <label className="settings-column-label">Active Columns</label>
        {activeColumns.map((sample) => (
          <div
            key={sample}
            className="settings-column-item"
            data-columnname={sample}
            onClick={removeColumn}
          >
            <i className="fa fa-lg fa-times settings-del-icon" />
            &nbsp;&nbsp;{sample}
          </div>
        ))}
      </div>
    </div>
  );
});

export { ColumnSettings };

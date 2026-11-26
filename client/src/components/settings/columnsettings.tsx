import type { JSX, MouseEvent } from "react";
import { memo } from "react";

import { ALL_COLUMNS } from "src/constants";
import type { BoundActions } from "src/providers/dispatcher";

const COLUMN_NAME_ATTR = "data-columnname";

interface ColumnSettingsProps {
  actions: BoundActions;
  columns: Set<string>;
}

function getColumnName(ev: MouseEvent<HTMLElement>): string {
  const name = ev.currentTarget.getAttribute(COLUMN_NAME_ATTR);
  if (name === null) {
    throw new Error("Column item without a column name");
  }
  return name;
}

const ColumnSettings = memo(function ColumnSettings(
  props: ColumnSettingsProps,
): JSX.Element {
  const addColumn = (ev: MouseEvent<HTMLElement>): void => {
    const { actions } = props;
    const columns = new Set(props.columns);
    columns.add(getColumnName(ev));
    actions.accountSetSettings({ columns });
  };

  const removeColumn = (ev: MouseEvent<HTMLElement>): void => {
    const { actions } = props;
    const columns = new Set(props.columns);
    columns.delete(getColumnName(ev));
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

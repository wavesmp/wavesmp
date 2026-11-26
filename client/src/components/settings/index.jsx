import { memo } from "react";

import { LIBRARY_NAME } from "src/constants";
import { useActions, useSelectorState } from "src/providers/hooks";
import {
  getLibraryPlaylistSearch,
  getOrCreatePlaylistSelectors,
} from "src/selectors";

import { ContentPage } from "../contentpage";
import { libraryColumns } from "../table/columns";
import { ColumnSettings } from "./columnsettings";
import { SelectSettings } from "./selectsettings";
import { VolumeSlider } from "./volumeslider";

import "./index.css";

const Settings = memo(function Settings(ownProps) {
  const actions = useActions();
  const selectorState = useSelectorState();
  const stateProps = selectStateProps(selectorState, ownProps);
  const props = { ...ownProps, ...stateProps, actions };

  const {
    columns,
    rowsPerPage,
    theme,
    libraryColumns,
    librarySortKey,
    libraryAscending,
  } = props;
  return (
    <ContentPage title="Settings">
      <div>
        <VolumeSlider actions={actions} />
        <ColumnSettings actions={actions} columns={columns} />
        <SelectSettings
          actions={actions}
          rowsPerPage={rowsPerPage}
          theme={theme}
          libraryColumns={libraryColumns}
          librarySortKey={librarySortKey}
          libraryAscending={libraryAscending}
        />
      </div>
    </ContentPage>
  );
});

function selectStateProps(state) {
  const { account } = state;
  const { columns, rowsPerPage, theme } = account;
  const { getRouterAscending, getRouterSortKey } = getOrCreatePlaylistSelectors(
    LIBRARY_NAME,
    URLSearchParams,
    LIBRARY_NAME,
  );
  const search = getLibraryPlaylistSearch(state);
  const sortKey = getRouterSortKey(state, search);
  const ascending = getRouterAscending(state, search);
  return {
    columns,
    rowsPerPage,
    theme,
    libraryColumns: libraryColumns.filter((c) => c.sortable),
    librarySortKey: sortKey,
    libraryAscending: ascending,
  };
}

export { Settings };

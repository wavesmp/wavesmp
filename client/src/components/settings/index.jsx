import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as WavesActions from "src/actions";
import { LIBRARY_NAME } from "src/constants";
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

class SettingsComponent extends React.PureComponent {
  render() {
    const {
      actions,
      history,
      columns,
      rowsPerPage,
      theme,
      libraryColumns,
      librarySortKey,
      libraryAscending,
    } = this.props;
    return (
      <ContentPage title="Settings">
        <div>
          <VolumeSlider actions={actions} />
          <ColumnSettings actions={actions} columns={columns} />
          <SelectSettings
            actions={actions}
            rowsPerPage={rowsPerPage}
            theme={theme}
            history={history}
            libraryColumns={libraryColumns}
            librarySortKey={librarySortKey}
            libraryAscending={libraryAscending}
          />
        </div>
      </ContentPage>
    );
  }
}

function mapStateToProps(state) {
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

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch),
  };
}

const Settings = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsComponent);

export { Settings };

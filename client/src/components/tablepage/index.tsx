import type { JSX, ReactNode } from "react";
import { memo } from "react";

import type { PlaylistProps } from "src/selectors";

import { ContentPage } from "../contentpage";
import type { TableProps } from "../table";
import { Table } from "../table";
import { TableBar } from "../tablebar";

import "./index.css";

/* Table props that come from the loaded playlist */
type PlaylistTableProps =
  | "index"
  | "selection"
  | "sortKey"
  | "ascending"
  | "currentPage"
  | "lastPage"
  | "displayItems";

type TablePageDataProps = Omit<TableProps, PlaylistTableProps> & {
  noDataMsg: string;
  buttons: ReactNode;
  routerSearchString: string;
  onSettingsClick?: () => void;
} & PlaylistProps;

type TablePageProps = TablePageDataProps & {
  title: string;
};

const TablePage = memo(function TablePage(props: TablePageProps): JSX.Element {
  const { title, ...other } = props;
  return (
    <ContentPage title={title}>
      <TablePageData {...other} />
    </ContentPage>
  );
});

function renderShelf(): JSX.Element {
  const numRows = 8;
  const rows = [];
  for (let i = 0; i < numRows; i += 1) {
    rows.push(
      <div key={i} className="shelf-row">
        <div className="shelf shelf-cell shelf-cell-lg" />
        <div className="shelf shelf-cell" />
        <div className="shelf shelf-cell" />
      </div>,
    );
  }
  return (
    <div>
      <div className="tablebar">
        <div>
          <div className="shelf shelf-btn" />
          <div className="shelf shelf-btn" />
        </div>
        <div className="shelf shelf-search-box" />
      </div>
      <div className="table">{rows}</div>
    </div>
  );
}

const TablePageData = memo(function TablePageData(
  props: TablePageDataProps,
): JSX.Element {
  if (!props.loaded) {
    return renderShelf();
  }
  const {
    noDataMsg,
    buttons,
    pathname,
    qp,
    routerSearchString,
    onSettingsClick,
    numItems,
    ...other
  } = props;

  if (numItems === 0) {
    if (routerSearchString) {
      return (
        <div>
          <TableBar
            buttons={buttons}
            pathname={pathname}
            qp={qp}
            routerSearchString={routerSearchString}
            onSettingsClick={onSettingsClick}
          />
          <h3 className="tablepage-msg">No data</h3>
        </div>
      );
    }
    return <h3 className="tablepage-msg">{noDataMsg}</h3>;
  }
  return (
    <>
      <TableBar
        buttons={buttons}
        pathname={pathname}
        qp={qp}
        routerSearchString={routerSearchString}
        onSettingsClick={onSettingsClick}
      />
      <Table {...other} pathname={pathname} qp={qp} />
    </>
  );
});

export { TablePage };
export type { TablePageProps };

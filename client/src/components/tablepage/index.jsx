import { memo } from "react";

import { ContentPage } from "../contentpage";
import { Table } from "../table";
import { TableBar } from "../tablebar";

import "./index.css";

const TablePage = memo(function TablePage(props) {
  const { title, ...other } = props;
  return (
    <ContentPage title={title}>
      <TablePageData {...other} />
    </ContentPage>
  );
});

const TablePageData = memo(function TablePageData(props) {
  const {
    noDataMsg,
    buttons,
    pathname,
    qp,
    routerSearchString,
    onSettingsClick,
    history,
    loaded,
    numItems,
    ...other
  } = props;

  if (!loaded) {
    const numRows = 8;
    const rows = Array(numRows);
    for (let i = 0; i < numRows; i += 1) {
      rows[i] = (
        <div key={i} className="shelf-row">
          <div className="shelf shelf-cell shelf-cell-lg" />
          <div className="shelf shelf-cell" />
          <div className="shelf shelf-cell" />
        </div>
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
            history={history}
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
        history={history}
      />
      <Table {...other} pathname={pathname} qp={qp} numItems={numItems} />
    </>
  );
});

export { TablePage };

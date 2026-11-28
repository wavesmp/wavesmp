import type { JSX } from "react";
import { memo } from "react";
import { Link } from "react-router";

import type { Column as ColumnDef } from "./tableTypes";

interface ColumnProps {
  column: ColumnDef;
  sortKey?: string;
  ascending?: boolean;
  pathname: string;
  qp: URLSearchParams;
}

const Column = memo(function Column({
  column,
  sortKey,
  ascending,
  pathname,
  qp: baseQp,
}: ColumnProps): JSX.Element {
  const { sortable, title, attribute } = column;
  if (!sortable || attribute === undefined) {
    return <th>{title}</th>;
  }

  const qp = new URLSearchParams(baseQp);
  qp.set("page", "0");

  let iconClass;
  if (sortKey === attribute) {
    if (ascending) {
      qp.set("order", "desc");
      iconClass = "fa fa-sort-asc table-sortable-icon";
    } else {
      qp.set("order", "asc");
      iconClass = "fa fa-sort-desc table-sortable-icon";
    }
  } else {
    qp.set("sortKey", attribute);
    iconClass = "fa fa-sort table-sortable-icon";
  }

  return (
    <th>
      <Link className="table-sortable" to={{ pathname, search: qp.toString() }}>
        {title}
        <i className={iconClass} />
      </Link>
    </th>
  );
});

export { Column };

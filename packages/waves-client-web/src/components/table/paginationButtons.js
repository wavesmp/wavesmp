import React from "react";
import { Link } from "react-router-dom";

import "./paginationButtons.css";

/* Should be an odd integer */
const MAX_PAGINATION_BUTTONS = 5;
const HALF_MAX_PAGINATION_BUTTONS = 2;

export default class PaginationButtons extends React.PureComponent {
  render() {
    const { currentPage, lastPage, pathname } = this.props;
    let { qp } = this.props;
    let paginationStartIndex = currentPage - HALF_MAX_PAGINATION_BUTTONS;

    /* Handle the case where there are less than HALF_MAX_PAGINATION_BUTTONS
     * to the right of the current page */
    if (lastPage - currentPage < HALF_MAX_PAGINATION_BUTTONS) {
      paginationStartIndex -=
        HALF_MAX_PAGINATION_BUTTONS - (lastPage - currentPage);
    }

    /* Handle the cases where we are at the start of the pagination, or
     * there are less than MAX_PAGINATION_BUTTONS available */
    paginationStartIndex = Math.max(0, paginationStartIndex);

    qp = new URLSearchParams(qp);
    const paginationButtons = [];
    for (let i = 0; i < MAX_PAGINATION_BUTTONS; i += 1) {
      const pageNum = paginationStartIndex + i;
      if (pageNum > lastPage) {
        break;
      }
      let className = "";
      if (pageNum === currentPage) {
        className = "active";
      }
      qp.set("page", pageNum);
      paginationButtons.push({
        className,
        search: `${qp}`,
        pageNum,
      });
    }
    if (paginationButtons.length <= 1) {
      return null;
    }

    const previousPageClass = currentPage === 0 ? "disabled" : "";
    const nextPageClass = currentPage === lastPage ? "disabled" : "";
    qp.set("page", currentPage - 1);
    const prevSearch = `${qp}`;
    qp.set("page", currentPage + 1);
    const nextSearch = `${qp}`;
    return (
      <div className="text-center">
        <ul className="pagination">
          <li>
            <Link
              to={{ pathname, search: prevSearch }}
              className={previousPageClass}
            >
              <i className="fa fa-chevron-left" />
            </Link>
          </li>
          {paginationButtons.map((sample) => (
            <li key={sample.pageNum}>
              <Link
                to={{ pathname, search: sample.search }}
                className={sample.className}
              >
                {sample.pageNum}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to={{ pathname, search: nextSearch }}
              className={nextPageClass}
            >
              <i className="fa fa-chevron-right" />
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}

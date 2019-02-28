import React from 'react'
import { Link } from 'react-router-dom'

export default class Column extends React.Component {
  // TODO want to make column title click-able, but bootstrap a class
  // gets in the way
  getSortIcon() {
    const { column, sortKey, ascending, location } = this.props
    const { pathname, search } = location
    const { sortable, attribute } = column
    if (!sortable) {
      return null
    }

    const qp = new URLSearchParams(search)
    qp.set('page', 0)

    let iconClass
    if (sortKey === attribute) {
      if (ascending) {
        qp.set('order', 'desc')
        iconClass = 'fa fa-sort-asc table-sortable'
      } else {
        qp.set('order', 'asc')
        iconClass = 'fa fa-sort-desc table-sortable'
      }
    } else {
      qp.set('sortKey', attribute)
      iconClass = 'fa fa-sort table-sortable'
    }

    return (
      <Link to={{ pathname, search: `${qp}` }}>
        <i className={iconClass} />
      </Link>
    )
  }

  render() {
    const { column } = this.props
    const { title } = column
    const sortIcon = this.getSortIcon()
    return (
      <th>
        {title}
        {sortIcon}
      </th>
    )
  }
}

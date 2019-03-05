import React from 'react'
import { Link } from 'react-router-dom'

export default class Column extends React.PureComponent {
  render() {
    const { column, sortKey, ascending, location } = this.props
    const { sortable, title, attribute } = column
    const { pathname, search } = location
    if (!sortable) {
      return <th>{title}</th>
    }

    const qp = new URLSearchParams(search)
    qp.set('page', 0)

    let iconClass
    if (sortKey === attribute) {
      if (ascending) {
        qp.set('order', 'desc')
        iconClass = 'fa fa-sort-asc table-sortable-icon'
      } else {
        qp.set('order', 'asc')
        iconClass = 'fa fa-sort-desc table-sortable-icon'
      }
    } else {
      qp.set('sortKey', attribute)
      iconClass = 'fa fa-sort table-sortable-icon'
    }

    return (
      <th>
        <Link className='table-sortable' to={{ pathname, search: `${qp}` }}>
          {title}
          <i className={iconClass} />
        </Link>
      </th>
    )
  }
}

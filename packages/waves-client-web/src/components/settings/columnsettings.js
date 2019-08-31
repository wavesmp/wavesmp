import React from 'react'

import { ALL_COLUMNS } from 'waves-client-constants'

const COLUMN_NAME_ATTR = 'data-columnname'

export default class ColumnSettings extends React.PureComponent {
  addColumn = ev => {
    const { actions } = this.props
    const columns = new Set(this.props.columns)
    const colToAdd = ev.currentTarget.getAttribute(COLUMN_NAME_ATTR)
    columns.add(colToAdd)
    actions.accountSetSettings({ columns })
  }

  removeColumn = ev => {
    const { actions } = this.props
    const columns = new Set(this.props.columns)
    const colToDelete = ev.currentTarget.getAttribute(COLUMN_NAME_ATTR)
    columns.delete(colToDelete)
    actions.accountSetSettings({ columns })
  }

  render() {
    const { columns } = this.props
    const hiddenColumns = ALL_COLUMNS.filter(x => !columns.has(x))
    const activeColumns = ALL_COLUMNS.filter(x => columns.has(x))

    return (
      <div className='settings-columns'>
        <div className='settings-column'>
          <label className='settings-column-label'>Hidden Columns</label>
          {hiddenColumns.map((sample, index) => (
            <div
              key={sample}
              className='settings-column-item'
              data-columnname={sample}
              onClick={this.addColumn}
            >
              <i className='fa fa-lg fa-plus settings-add-icon' />
              &nbsp;&nbsp;{sample}
            </div>
          ))}
        </div>
        <div className='settings-column'>
          <label className='settings-column-label'>Active Columns</label>
          {activeColumns.map((sample, index) => (
            <div
              key={sample}
              className='settings-column-item'
              data-columnname={sample}
              onClick={this.removeColumn}
            >
              <i className='fa fa-lg fa-times settings-del-icon' />
              &nbsp;&nbsp;{sample}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

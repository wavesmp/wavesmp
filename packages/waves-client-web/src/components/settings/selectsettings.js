import React from 'react'

export default class SelectSettings extends React.PureComponent {
  onRowsPerPageChange = ev => {
    const { actions } = this.props
    const rowsPerPage = parseInt(ev.target.value)
    actions.accountSetSettings({ rowsPerPage })
  }

  onThemeChange = ev => {
    const { actions } = this.props
    const theme = ev.target.value
    actions.accountSetSettings({ theme })
  }

  render() {
    const { theme, rowsPerPage } = this.props
    return (
      <div className='settings-columns'>
        <div className='settings-column'>
          <label>Theme</label>
          <div className='settings-select-width'>
            <select
              value={theme}
              onChange={this.onThemeChange}
              className='form-input'
            >
              <option value='light'>Light</option>
              <option value='dark'>Dark</option>
            </select>
          </div>
        </div>
        <div className='settings-column'>
          <label>Rows Per Page</label>
          <div className='settings-select-width'>
            <select
              value={rowsPerPage}
              onChange={this.onRowsPerPageChange}
              className='form-input'
            >
              <option value='10'>10</option>
              <option value='25'>25</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
            </select>
          </div>
        </div>
      </div>
    )
  }
}

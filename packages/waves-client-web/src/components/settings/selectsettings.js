import React from 'react'

export default class SelectSettings extends React.PureComponent {
  onAscending = ev => {
    const { actions, librarySortKey } = this.props
    actions.playlistSort(librarySortKey, true)
  }

  onDescending = ev => {
    const { actions, librarySortKey } = this.props
    actions.playlistSort(librarySortKey, false)
  }

  onSortKeyChange = ev => {
    const { actions, libraryAscending } = this.props
    const librarySortKey = ev.target.value
    actions.playlistSort(librarySortKey, libraryAscending)
  }

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

  onSignOut = () => {
    const { actions, history } = this.props
    actions.signOut()
    history.push('/')
  }

  render() {
    const {
      theme,
      rowsPerPage,
      libraryColumns,
      librarySortKey,
      libraryAscending
    } = this.props
    return (
      <React.Fragment>
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
        <div className='settings-columns'>
          <div className='settings-column'>
            <label>Library Sort Key</label>
            <div className='settings-select-width'>
              <select
                className='form-input'
                value={librarySortKey}
                onChange={this.onSortKeyChange}
              >
                {libraryColumns.map(column => (
                  <option value={column.attribute} key={column.attribute}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='settings-column'>
            <label>
              <input
                type='radio'
                checked={libraryAscending}
                onChange={this.onAscending}
              />
              Ascending
            </label>
            <label>
              <input
                type='radio'
                checked={!libraryAscending}
                onChange={this.onDescending}
              />
              Descending
            </label>
          </div>
        </div>
        <div className='settings-columns'>
          <div className='settings-column'>
            <label>Actions</label>
            <button
              type='button'
              className='btn btn-dropdown pull-left'
              onClick={this.onSignOut}
            >
              <i className='fa fa-lg fa-sign-out' /> Sign Out
            </button>
          </div>
          <div className='settings-column' />
        </div>
      </React.Fragment>
    )
  }
}
